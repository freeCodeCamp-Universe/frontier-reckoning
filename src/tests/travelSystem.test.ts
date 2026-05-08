import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStartingGameState } from '@stores/expeditionStore';
import {
  applyDailyTravel,
  calculateDailyDistance,
  calculateFoodConsumption,
} from '@game/systems/travelSystem';

describe('travelSystem', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('advances the day', () => {
    const state = createStartingGameState();
    const nextState = applyDailyTravel(state);

    expect(nextState.currentDay).toBe(state.currentDay + 1);
  });

  it('scales food consumption with living characters', () => {
    const state = createStartingGameState();
    const partyWithOneDead = state.party.map((character) =>
      character.id === 'scout'
        ? { ...character, health: 0, morale: 0, status: 'dead' as const }
        : character,
    );

    expect(calculateFoodConsumption(state.party)).toBe(6);
    expect(calculateFoodConsumption(partyWithOneDead)).toBe(4.5);
  });

  it('increases distance', () => {
    const state = createStartingGameState();
    const nextState = applyDailyTravel(state);

    expect(calculateDailyDistance(state)).toBeGreaterThan(0);
    expect(nextState.distanceTraveled).toBeGreaterThan(state.distanceTraveled);
  });

  it('triggers victory at the destination', () => {
    const state = {
      ...createStartingGameState(),
      distanceTraveled: 1995,
      totalDistance: 2000,
    };
    const nextState = applyDailyTravel(state);

    expect(nextState.distanceTraveled).toBe(2000);
    expect(nextState.gameStatus).toBe('victory');
  });

  it('triggers game over when the party is dead', () => {
    const state = {
      ...createStartingGameState(),
      party: createStartingGameState().party.map((character) => ({
        ...character,
        health: 0,
        morale: 0,
        status: 'dead' as const,
      })),
    };
    const nextState = applyDailyTravel(state);

    expect(nextState.gameStatus).toBe('game_over');
  });
});
