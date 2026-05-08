import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@app/App';
import { useExpeditionStore } from '@stores/expeditionStore';

vi.mock('@components/PhaserGame', () => ({
  PhaserGame: () => <div data-testid="phaser-game" />,
}));

describe('App', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('renders the title and start button', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Expedition' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Travel One Day' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Make Camp' })).toBeDisabled();
  });
});
