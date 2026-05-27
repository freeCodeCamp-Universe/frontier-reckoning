import { beforeEach, describe, expect, it, vi } from 'vitest';
import { riverCrossings } from '@game/data/riverCrossings';
import {
  calculateRiverRisk,
  crossRiver,
  getPendingRiverCrossing,
  getRiverOptionAvailability,
  waitForBetterRiverConditions,
} from '@game/systems/riverSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';
import { createSeededRng } from '@utils/rng';

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
      visitedTownIds: ['ash-hollow'],
    });

    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().gameStatus).toBe('river');
    expect(useExpeditionStore.getState().currentRiver?.name).toBe('Blackwater Crossing');
    expect(
      getPendingRiverCrossing(useExpeditionStore.getState(), riverCrossings)?.name,
    ).toBe('Blackwater Crossing');
  });

  it('each crossing option has correct requirements', () => {
    const options = riverCrossings[0].options;

    expect(options.find((option) => option.id === 'ford')?.requirements).toBeUndefined();
    expect(options.find((option) => option.id === 'caulk')?.requirements).toEqual({
      minimumWagonParts: 1,
    });
    expect(options.find((option) => option.id === 'raft')?.requirements).toEqual({
      minimumWagonParts: 2,
    });
    expect(options.find((option) => option.id === 'wait')?.costPreview).toEqual({
      food: 4,
      days: 1,
    });
    expect(options.find((option) => option.id === 'bridge')?.requirements).toEqual({
      requiresBridge: true,
    });
  });

  it('ferry requires money and availability', () => {
    const state = {
      ...createStartingGameState(),
      money: 10,
    };
    const ferry = riverCrossings[0].options.find((option) => option.id === 'ferry')!;

    expect(getRiverOptionAvailability(state, ferry, riverCrossings[0]).reasons).toContain(
      'Requires at least $35.',
    );
    expect(
      getRiverOptionAvailability(createStartingGameState(), ferry, riverCrossings[2])
        .reasons,
    ).toContain('No ferry is operating at this river.');
  });

  it('waiting changes conditions and costs a day', () => {
    const state = createStartingGameState();
    const calmerRiver = waitForBetterRiverConditions(riverCrossings[0]);
    const result = crossRiver(state, riverCrossings[0], 'wait', () => 0.99);

    expect(calmerRiver.depth).toBeLessThan(riverCrossings[0].depth);
    expect(calmerRiver.currentStrength).toBeLessThan(riverCrossings[0].currentStrength);
    expect(result.state.currentDay).toBe(state.currentDay + 1);
    expect(result.succeeded).toBe(true);
  });

  it('bad wagon condition increases risk', () => {
    const healthyWagon = createStartingGameState();
    const badWagon = {
      ...healthyWagon,
      wagonCondition: 20,
    };
    const ford = riverCrossings[1].options.find((option) => option.id === 'ford')!;

    expect(calculateRiverRisk(badWagon, riverCrossings[1], ford)).toBeGreaterThan(
      calculateRiverRisk(healthyWagon, riverCrossings[1], ford),
    );
  });

  it('seeded outcomes are deterministic', () => {
    const state = {
      ...createStartingGameState(),
      wagonCondition: 35,
    };
    const firstResult = crossRiver(
      state,
      riverCrossings[2],
      'ford',
      createSeededRng('river-seed'),
    );
    const secondResult = crossRiver(
      state,
      riverCrossings[2],
      'ford',
      createSeededRng('river-seed'),
    );

    expect(firstResult.succeeded).toBe(secondResult.succeeded);
    expect(firstResult.outcomes).toEqual(secondResult.outcomes);
    expect(firstResult.state.food).toBe(secondResult.state.food);
    expect(firstResult.state.wagonCondition).toBe(secondResult.state.wagonCondition);
  });
});
