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
      distanceTraveled: 2000,
    });

    render(<EndingScreen />);

    expect(screen.getByRole('heading', { name: 'Victory' })).toBeInTheDocument();
    expect(screen.getByText('Reputation')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
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
  });

  it('restart resets state', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'victory',
      distanceTraveled: 2000,
    });

    render(<EndingScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(useExpeditionStore.getState()).toMatchObject(initialGameState);
  });
});
