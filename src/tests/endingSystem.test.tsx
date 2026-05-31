import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EndingScreen } from '@components/EndingScreen';
import { calculateScore } from '@game/systems/endingSystem';
import { createStartingGameState, initialGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('endingSystem', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('calculates score from survivors, resources, days, morale, and wagon condition', () => {
    const state = {
      ...createStartingGameState(),
      currentDay: 11,
      food: 20,
      ammo: 10,
      medicine: 2,
      wagonParts: 1,
      money: 50,
      morale: 60,
      wagonCondition: 80,
    };

    expect(calculateScore(state)).toBe(1358);
  });

  it('renders the victory screen', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'victory',
      distanceTraveled: 1999.99999999997,
      money: 104.80000000000008,
    });

    render(<EndingScreen />);

    expect(screen.getByRole('heading', { name: 'Victory' })).toBeInTheDocument();
    expect(screen.getByText('Reputation')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('$105')).toBeInTheDocument();
    expect(screen.getByText('2000 / 2000 mi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restart' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('104.80000000000008');
  });

  it('renders the game over screen', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'game_over',
      gameOverReason: 'wagon_destroyed',
    });

    render(<EndingScreen />);

    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    expect(screen.getByText('The wagon was destroyed.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
    expect(screen.queryByText('Restart')).not.toBeInTheDocument();
  });

  it('new game resets state', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'victory',
      distanceTraveled: 2000,
    });

    render(<EndingScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'New Game' }));

    expect(useExpeditionStore.getState()).toMatchObject(initialGameState);
  });
});
