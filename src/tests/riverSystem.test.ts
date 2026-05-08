import { beforeEach, describe, expect, it, vi } from 'vitest';
import { riverCrossings } from '@game/data/riverCrossings';
import {
  crossRiver,
  getPendingRiverCrossing,
  getRiverOptionAvailability,
} from '@game/systems/riverSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('riverSystem', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('triggers a river event at the expected distance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    useExpeditionStore.setState({
      ...createStartingGameState(),
      distanceTraveled: 440,
      gameStatus: 'traveling',
    });

    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().gameStatus).toBe('river');
    expect(useExpeditionStore.getState().currentRiver?.name).toBe(
      'Blackwater Crossing',
    );
    expect(
      getPendingRiverCrossing(useExpeditionStore.getState(), riverCrossings)?.name,
    ).toBe('Blackwater Crossing');
  });

  it('requires money to hire a ferry', () => {
    const state = {
      ...createStartingGameState(),
      money: 10,
    };
    const ferry = riverCrossings[0].options.find((option) => option.id === 'ferry');

    expect(ferry).toBeDefined();

    const availability = getRiverOptionAvailability(state, ferry!);

    expect(availability.available).toBe(false);
    expect(availability.reasons).toContain('Requires at least $35.');
  });

  it('waiting costs a day', () => {
    const state = createStartingGameState();
    const result = crossRiver(state, riverCrossings[0], 'wait', 0.99);

    expect(result.state.currentDay).toBe(state.currentDay + 1);
    expect(result.succeeded).toBe(true);
  });

  it('failed crossing can damage wagon or supplies', () => {
    const state = createStartingGameState();
    const result = crossRiver(state, riverCrossings[0], 'ford', 0);

    expect(result.succeeded).toBe(false);
    expect(result.state.food).toBeLessThan(state.food);
    expect(result.state.wagonCondition).toBeLessThan(state.wagonCondition);
  });
});
