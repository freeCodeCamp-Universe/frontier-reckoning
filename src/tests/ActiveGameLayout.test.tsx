import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveGameLayout } from '@components/ActiveGameLayout';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

vi.mock('@components/PhaserGame', () => ({
  PhaserGame: () => <div data-testid="phaser-game" />,
}));

describe('ActiveGameLayout', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  it('renders the active game dashboard shell', async () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
        onSettings={() => undefined}
      />,
    );

    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Frontier Expedition');
    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Trail Map' })).toBeInTheDocument();
    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
  });

  it('calls onSettings from the status bar settings button', () => {
    const onSettings = vi.fn();

    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
        onSettings={onSettings}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(onSettings).toHaveBeenCalledTimes(1);
  });
});
