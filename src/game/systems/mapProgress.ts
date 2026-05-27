export type TrailProgressInput = {
  distanceTraveled: number;
  totalDistance: number;
  startX: number;
  endX: number;
};

export type WagonPositionInput = TrailProgressInput & {
  trailY: number;
  wagonYOffset: number;
};

export type TrailPoint = {
  x: number;
  y: number;
};

export type LandmarkKind = 'town' | 'river' | 'danger' | 'destination';

export type LandmarkState = 'completed' | 'current' | 'upcoming' | 'unknown';

export type LandmarkStateInput = {
  id: string;
  distance: number;
  kind: LandmarkKind;
  distanceTraveled: number;
  visitedTownIds?: string[];
  crossedRiverIds?: string[];
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

export function calculateWagonPosition({
  trailY,
  wagonYOffset,
  ...progressInput
}: WagonPositionInput) {
  return {
    x: calculateTrailMapX(progressInput),
    y: trailY + wagonYOffset,
  };
}

export function calculateCurvedTrailPosition({
  distanceTraveled,
  totalDistance,
  pathPoints,
}: {
  distanceTraveled: number;
  totalDistance: number;
  pathPoints: TrailPoint[];
}) {
  if (pathPoints.length === 0) {
    return { x: 0, y: 0 };
  }

  if (pathPoints.length === 1) {
    return pathPoints[0];
  }

  const progress = clampProgress(distanceTraveled, totalDistance);
  const targetDistance = getPathLength(pathPoints) * progress;
  let traveledDistance = 0;

  for (let index = 1; index < pathPoints.length; index += 1) {
    const previousPoint = pathPoints[index - 1];
    const nextPoint = pathPoints[index];
    const segmentLength = getDistance(previousPoint, nextPoint);

    if (traveledDistance + segmentLength >= targetDistance) {
      const segmentProgress =
        segmentLength === 0 ? 0 : (targetDistance - traveledDistance) / segmentLength;

      return {
        x: previousPoint.x + (nextPoint.x - previousPoint.x) * segmentProgress,
        y: previousPoint.y + (nextPoint.y - previousPoint.y) * segmentProgress,
      };
    }

    traveledDistance += segmentLength;
  }

  return pathPoints[pathPoints.length - 1];
}

export function getLandmarkState({
  id,
  distance,
  kind,
  distanceTraveled,
  visitedTownIds = [],
  crossedRiverIds = [],
}: LandmarkStateInput): LandmarkState {
  if (kind === 'town' && visitedTownIds.includes(id)) {
    return 'completed';
  }

  if (kind === 'river' && crossedRiverIds.includes(id)) {
    return 'completed';
  }

  if (kind === 'destination' && distanceTraveled >= distance) {
    return 'completed';
  }

  if (distanceTraveled >= distance) {
    return 'current';
  }

  return distance - distanceTraveled <= 220 ? 'upcoming' : 'unknown';
}

export function shouldAnimateWagon(prefersReducedMotion: boolean) {
  return !prefersReducedMotion;
}

function getPathLength(pathPoints: TrailPoint[]) {
  return pathPoints.reduce((total, point, index) => {
    if (index === 0) {
      return total;
    }

    return total + getDistance(pathPoints[index - 1], point);
  }, 0);
}

function getDistance(start: TrailPoint, end: TrailPoint) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}
