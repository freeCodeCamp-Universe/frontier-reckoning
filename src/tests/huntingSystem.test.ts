import { describe, expect, it } from 'vitest';
import { huntAtCamp, calculateHuntingScore } from '@game/systems/huntingSystem';
import { createStartingGameState } from '@stores/expeditionStore';

describe('huntingSystem', () => {
  it('consumes ammo while hunting', () => {
    const state = createStartingGameState();
    const result = huntAtCamp(state, 3, 0.6);

    expect(result.state.ammo).toBe(state.ammo - 3);
  });

  it('cannot hunt without enough ammo', () => {
    const state = {
      ...createStartingGameState(),
      ammo: 0,
    };
    const result = huntAtCamp(state, 1, 0.6);

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

    expect(calculateHuntingScore(state, 3, 0.4)).toBeGreaterThan(
      calculateHuntingScore(withoutHunter, 3, 0.4),
    );
  });

  it('predator outcome can injure a character', () => {
    const state = createStartingGameState();
    const result = huntAtCamp(state, 1, 0.01);

    expect(result.outcome).toBe('predator_injury');
    expect(result.state.party[0]).toMatchObject({
      health: 82,
      status: 'injured',
    });
  });
});
