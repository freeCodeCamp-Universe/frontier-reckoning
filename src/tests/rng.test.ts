import { describe, expect, it } from 'vitest';
import { createSeededRng, randomFloat, randomInt, weightedChoice } from '@utils/rng';

describe('seeded rng utilities', () => {
  it('replays the same sequence for the same seed', () => {
    const firstRng = createSeededRng('frontier');
    const secondRng = createSeededRng('frontier');

    const firstSequence = Array.from({ length: 5 }, () => randomFloat(firstRng));
    const secondSequence = Array.from({ length: 5 }, () => randomFloat(secondRng));

    expect(firstSequence).toEqual(secondSequence);
  });

  it('produces different sequences for different seeds', () => {
    const firstRng = createSeededRng('frontier');
    const secondRng = createSeededRng('reckoning');

    const firstSequence = Array.from({ length: 5 }, () => randomFloat(firstRng));
    const secondSequence = Array.from({ length: 5 }, () => randomFloat(secondRng));

    expect(firstSequence).not.toEqual(secondSequence);
  });

  it('creates deterministic integers in an inclusive range', () => {
    const rng = createSeededRng(42);
    const value = randomInt(rng, 2, 5);

    expect(value).toBeGreaterThanOrEqual(2);
    expect(value).toBeLessThanOrEqual(5);
    expect(value).toBe(randomInt(createSeededRng(42), 2, 5));
  });

  it('makes weighted choices reproducible', () => {
    const options = [
      { id: 'low', weight: 1 },
      { id: 'middle', weight: 3 },
      { id: 'high', weight: 6 },
    ];
    const firstChoice = weightedChoice(
      options,
      (option) => option.weight,
      createSeededRng('weighted'),
    );
    const secondChoice = weightedChoice(
      options,
      (option) => option.weight,
      createSeededRng('weighted'),
    );

    expect(firstChoice).toEqual(secondChoice);
  });
});
