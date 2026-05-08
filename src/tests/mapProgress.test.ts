import { describe, expect, it } from 'vitest';
import {
  calculateTrailMapX,
  calculateWagonPosition,
  clampProgress,
  shouldAnimateWagon,
} from '@game/systems/mapProgress';

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

  it('calculates wagon position from trail progress and y offset', () => {
    expect(
      calculateWagonPosition({
        distanceTraveled: 1000,
        totalDistance: 2000,
        startX: 80,
        endX: 880,
        trailY: 280,
        wagonYOffset: -34,
      }),
    ).toEqual({
      x: 480,
      y: 246,
    });
  });

  it('disables wagon animation when reduced motion is preferred', () => {
    expect(shouldAnimateWagon(true)).toBe(false);
    expect(shouldAnimateWagon(false)).toBe(true);
  });
});
