import { describe, expect, it } from 'vitest';
import { calculateTrailMapX, clampProgress } from '@game/systems/mapProgress';

describe('mapProgress', () => {
  it('calculates trail map position from travel progress', () => {
    expect(
      calculateTrailMapX({
        distanceTraveled: 500,
        totalDistance: 2000,
        startX: 100,
        endX: 900,
      }),
    ).toBe(300);
  });

  it('clamps progress between zero and one', () => {
    expect(clampProgress(-10, 2000)).toBe(0);
    expect(clampProgress(2500, 2000)).toBe(1);
  });
});
