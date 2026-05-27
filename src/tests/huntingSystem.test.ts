import { describe, expect, it } from 'vitest';
import {
  applyHuntingMiniGameResult,
  calculateHuntingScore,
  HUNTING_DURATION_SECONDS,
  huntAtCamp,
  isHuntingTimerExpired,
  resolveHuntingShot,
} from '@game/systems/huntingSystem';
import { createStartingGameState } from '@stores/expeditionStore';
import { createSeededRng } from '@utils/rng';

describe('huntingSystem', () => {
  it('consumes ammo while hunting', () => {
    const state = createStartingGameState();
    const result = huntAtCamp(state, 3, () => 0.6);

    expect(result.state.ammo).toBe(state.ammo - 3);
  });

  it('cannot hunt without enough ammo', () => {
    const state = {
      ...createStartingGameState(),
      ammo: 0,
    };
    const result = huntAtCamp(state, 1, () => 0.6);

    expect(result.state.ammo).toBe(0);
    expect(result.outcome).toBe('wasted_ammo');
    expect(result.outcomeText).toBe('There is not enough ammo to hunt.');
  });

  it('Hunter role improves success odds', () => {
    const state = createStartingGameState();
    const withoutHunter = {
      ...state,
      party: state.party.map((character) =>
        character.role === 'Hunter'
          ? { ...character, health: 0, status: 'dead' as const }
          : character,
      ),
    };

    expect(calculateHuntingScore(state, 3, () => 0.4)).toBeGreaterThan(
      calculateHuntingScore(withoutHunter, 3, () => 0.4),
    );
  });

  it('predator outcome can injure a character', () => {
    const state = createStartingGameState();
    const result = huntAtCamp(state, 1, () => 0.01);

    expect(result.outcome).toBe('predator_injury');
    expect(result.state.party[0]).toMatchObject({
      health: 82,
      status: 'injured',
    });
  });

  it('successful mini-game hit adds food and consumes ammo', () => {
    const state = createStartingGameState();
    const shot = resolveHuntingShot({
      animals: [{ id: 'deer-1', type: 'deer', x: 100, y: 100, size: 24 }],
      target: { x: 105, y: 100 },
      ammoRemaining: 3,
      state,
    });

    expect(shot.hitAnimal?.type).toBe('deer');
    expect(shot.foodGained).toBe(14);
    expect(shot.ammoSpent).toBe(1);
    expect(shot.ammoRemaining).toBe(2);
  });

  it('mini-game miss consumes ammo without food', () => {
    const state = createStartingGameState();
    const shot = resolveHuntingShot({
      animals: [{ id: 'rabbit-1', type: 'rabbit', x: 100, y: 100, size: 15 }],
      target: { x: 300, y: 100 },
      ammoRemaining: 2,
      state,
    });

    expect(shot.hitAnimal).toBeNull();
    expect(shot.foodGained).toBe(0);
    expect(shot.ammoSpent).toBe(1);
    expect(shot.ammoRemaining).toBe(1);
  });

  it('timer ends the hunting scene after 30 seconds', () => {
    expect(isHuntingTimerExpired(HUNTING_DURATION_SECONDS - 1)).toBe(false);
    expect(isHuntingTimerExpired(HUNTING_DURATION_SECONDS)).toBe(true);
  });

  it('mini-game predator result can injure a party member', () => {
    const state = createStartingGameState();
    const result = applyHuntingMiniGameResult(state, {
      ammoSpent: 1,
      foodGained: 2,
      hits: 1,
      misses: 0,
      predatorEncountered: true,
      injuredCharacterId: state.party[1].id,
    });

    expect(result.state.party[1]).toMatchObject({
      health: 84,
      status: 'injured',
    });
  });

  it('store-ready mini-game result updates food and ammo', () => {
    const state = createStartingGameState();
    const result = applyHuntingMiniGameResult(state, {
      ammoSpent: 3,
      foodGained: 18,
      hits: 2,
      misses: 1,
      predatorEncountered: false,
    });

    expect(result.state.ammo).toBe(state.ammo - 3);
    expect(result.state.food).toBe(state.food + 18);
    expect(result.outcomeText).toContain('18 food');
  });

  it('produces deterministic results with the same seed', () => {
    const state = createStartingGameState();
    const firstResult = huntAtCamp(state, 5, createSeededRng('hunt-seed'));
    const secondResult = huntAtCamp(state, 5, createSeededRng('hunt-seed'));

    expect(firstResult.outcome).toBe(secondResult.outcome);
    expect(firstResult.foodGained).toBe(secondResult.foodGained);
  });
});
