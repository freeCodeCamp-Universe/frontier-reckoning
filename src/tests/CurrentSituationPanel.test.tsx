import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CurrentSituationPanel } from '@components/CurrentSituationPanel';
import { riverCrossings } from '@game/data/riverCrossings';
import { towns } from '@game/data/towns';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('CurrentSituationPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('shows travel actions while traveling', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(<CurrentSituationPanel />);

    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Make Camp' })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Camp' })).not.toBeInTheDocument();
  });

  it('shows camp content while in camp', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'camp',
      campOutcomeText: 'The caravan makes camp.',
    });

    render(<CurrentSituationPanel />);

    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Camp' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume travel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Travel One Day' })).not.toBeInTheDocument();
  });

  it('shows river content while a river crossing is active', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'river',
      currentRiver: riverCrossings[0],
    });

    render(<CurrentSituationPanel />);

    expect(
      screen.getByRole('heading', { name: 'Blackwater Crossing' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Make Camp' })).not.toBeInTheDocument();
  });

  it('shows town content while a town is active', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'town',
      currentTown: towns[0],
    });

    render(<CurrentSituationPanel />);

    expect(screen.getByRole('heading', { name: 'Ash Hollow' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume trail' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Travel One Day' })).not.toBeInTheDocument();
  });

  it('shows ending content for victory and game over states', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'victory',
    });

    const { unmount } = render(<CurrentSituationPanel />);

    expect(screen.getByRole('heading', { name: 'Victory' })).toBeInTheDocument();

    unmount();

    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'game_over',
      gameOverReason: 'health_collapsed',
    });
    render(<CurrentSituationPanel />);

    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
  });
});
