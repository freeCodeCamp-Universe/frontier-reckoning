import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '@app/App';

vi.mock('@components/PhaserGame', () => ({
  PhaserGame: () => <div data-testid="phaser-game" />,
}));

describe('App', () => {
  it('renders the title and start button', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Expedition' }),
    ).toBeInTheDocument();
  });
});
