export type TrailProgressInput = {
  distanceTraveled: number;
  totalDistance: number;
  startX: number;
  endX: number;
};

export function clampProgress(distanceTraveled: number, totalDistance: number) {
  if (totalDistance <= 0) {
    return 0;
  }

  return Math.min(Math.max(distanceTraveled / totalDistance, 0), 1);
}

export function calculateTrailMapX({
  distanceTraveled,
  totalDistance,
  startX,
  endX,
}: TrailProgressInput) {
  return startX + (endX - startX) * clampProgress(distanceTraveled, totalDistance);
}
