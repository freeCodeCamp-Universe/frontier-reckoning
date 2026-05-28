import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameLogPanel } from '@components/GameLogPanel';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('GameLogPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('renders the five most recent log entries by default', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameLog: createLogEntries(7),
    });

    render(<GameLogPanel />);

    const log = screen.getByRole('region', { name: 'Game log' });
    const entryList = within(log).getByRole('list');

    expect(within(entryList).getByText('Trail entry 1')).toBeInTheDocument();
    expect(within(entryList).getByText('Trail entry 5')).toBeInTheDocument();
    expect(within(entryList).queryByText('Trail entry 6')).not.toBeInTheDocument();
    expect(within(log).getByText('2 older entries hidden')).toBeInTheDocument();
  });

  it('expands and collapses the in-page log entries', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameLog: createLogEntries(7),
    });

    render(<GameLogPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Show all' }));

    expect(screen.getByRole('button', { name: 'Show recent 5' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Trail entry 7')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show recent 5' }));

    expect(screen.getByRole('button', { name: 'Show all' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('Trail entry 7')).not.toBeInTheDocument();
  });

  it('keeps new actions visible when they append to the log', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().advanceDay();

    render(<GameLogPanel />);

    expect(screen.getAllByText('Traveled to day 2.')).toHaveLength(2);
    expect(
      screen.getByText('Frontier Expedition started on Trailwise.'),
    ).toBeInTheDocument();
  });
});

function createLogEntries(count: number) {
  return Array.from({ length: count }, (_, index) => `Trail entry ${index + 1}`);
}
