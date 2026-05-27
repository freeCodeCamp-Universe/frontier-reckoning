import { describe, expect, it } from 'vitest';
import {
  calculateCurvedTrailPosition,
  calculateTrailMapX,
  calculateWagonPosition,
  clampProgress,
  getLandmarkState,
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

  it('maps trail progress to wagon position along a curved path', () => {
    expect(
      calculateCurvedTrailPosition({
        distanceTraveled: 50,
        totalDistance: 100,
        pathPoints: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      }),
    ).toEqual({ x: 100, y: 0 });

    expect(
      calculateCurvedTrailPosition({
        distanceTraveled: 75,
        totalDistance: 100,
        pathPoints: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      }),
    ).toEqual({ x: 100, y: 50 });
  });

  it('updates landmark marker state from visited and upcoming progress', () => {
    expect(
      getLandmarkState({
        id: 'ash-hollow',
        kind: 'town',
        distance: 300,
        distanceTraveled: 500,
        visitedTownIds: ['ash-hollow'],
      }),
    ).toBe('completed');
    expect(
      getLandmarkState({
        id: 'blackwater-crossing',
        kind: 'river',
        distance: 450,
        distanceTraveled: 480,
        crossedRiverIds: [],
      }),
    ).toBe('current');
    expect(
      getLandmarkState({
        id: 'iron-post',
        kind: 'town',
        distance: 1250,
        distanceTraveled: 1100,
      }),
    ).toBe('upcoming');
    expect(
      getLandmarkState({
        id: 'last-lantern',
        kind: 'town',
        distance: 1750,
        distanceTraveled: 900,
      }),
    ).toBe('unknown');
  });

  it('disables wagon animation when reduced motion is preferred', () => {
    expect(shouldAnimateWagon(true)).toBe(false);
    expect(shouldAnimateWagon(false)).toBe(true);
  });
});
