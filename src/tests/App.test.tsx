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

function completeSetupPrerequisites(expeditionName = 'Cinder Ridge Crew') {
  fireEvent.change(screen.getByLabelText('Expedition name'), {
    target: { value: expeditionName },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Elias Reed, Scout' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

describe('App', () => {
  beforeEach(() => {
    phaserGameModuleLoadMock.mockClear();
    phaserGameRenderMock.mockClear();
    useExpeditionStore.getState().resetGame();
  });

  it('renders the homepage without the main menu label', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Main Menu')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Expedition' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();
  });

  it('user can start a custom expedition', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Greenhorn/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();

    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
    expect(phaserGameRenderMock).toHaveBeenCalledTimes(1);
  });

  it('cannot start without selecting required party members', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toHaveAccessibleDescription('Select exactly 4 party members before continuing.');
  });

  it('exposes important setup controls with accessible names', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(screen.getByLabelText('Expedition name')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('button', { name: 'Select Elias Reed, Scout' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Select Nell Carter, Child' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Select Elias Reed, Scout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }));
    expect(
      screen.getByRole('button', { name: 'Select Nell Carter, Child' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('radio', { name: /Greenhorn/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Trailwise/ })).not.toBeChecked();
  });
});
