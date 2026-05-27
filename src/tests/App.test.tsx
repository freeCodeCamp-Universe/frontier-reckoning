import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@app/App';
import { useExpeditionStore } from '@stores/expeditionStore';

const phaserGameModuleLoadMock = vi.hoisted(() => vi.fn());
const phaserGameRenderMock = vi.hoisted(() => vi.fn());

vi.mock('@components/PhaserGame', () => ({
  phaserGameModuleLoadMock: phaserGameModuleLoadMock(),
  PhaserGame: () => {
    phaserGameRenderMock();

    return <div data-testid="phaser-game" />;
  },
}));

describe('App', () => {
  beforeEach(() => {
    phaserGameModuleLoadMock.mockClear();
    phaserGameRenderMock.mockClear();
    useExpeditionStore.getState().resetGame();
  });

  it('renders the main menu', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Expedition' })).toBeInTheDocument();
    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();
  });

  it('user can start a custom expedition', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'New Expedition' }));
    fireEvent.change(screen.getByLabelText('Expedition name'), {
      target: { value: 'Cinder Ridge Crew' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /Greenhorn/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Custom Expedition' }));

    expect(screen.getByText(/Cinder Ridge Crew \/ Greenhorn/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Make Camp' })).toBeEnabled();
    expect(screen.getByText('Loading trail map...')).toBeInTheDocument();
    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
    expect(phaserGameModuleLoadMock).toHaveBeenCalledTimes(1);
    expect(phaserGameRenderMock).toHaveBeenCalledTimes(1);
  });

  it('lazy-loads Phaser only after the active game screen opens', async () => {
    render(<App />);

    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'New Expedition' }));
    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Start Custom Expedition' }));

    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
    expect(phaserGameRenderMock).toHaveBeenCalledTimes(1);
  });

  it('cannot start without selecting required party members', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'New Expedition' }));
    fireEvent.click(screen.getByRole('button', { name: /Elias Reed/ }));

    expect(
      screen.getByRole('button', { name: 'Start Custom Expedition' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Start Custom Expedition' }),
    ).toHaveAccessibleDescription('Select exactly 4 party members before starting.');
  });

  it('exposes important setup controls with accessible names', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'New Expedition' }));

    expect(screen.getByLabelText('Expedition name')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Greenhorn/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Trailwise/ })).toBeChecked();
    expect(
      screen.getByRole('button', { name: 'Remove Elias Reed, Scout' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Select Nell Carter, Child' }),
    ).toBeDisabled();
  });
});
