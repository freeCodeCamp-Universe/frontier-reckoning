import { riverCrossings } from '@game/data/riverCrossings';
import { towns } from '@game/data/towns';
import type { LandmarkKind } from '@game/systems/mapProgress';

export type MapLandmark = {
  id: string;
  name: string;
  distance: number;
  kind: LandmarkKind;
  description: string;
};

export const dangerZones: MapLandmark[] = [
  {
    id: 'bleached-flats',
    name: 'Bleached Flats',
    distance: 610,
    kind: 'danger',
    description: 'Heat and broken ground punish low supplies.',
  },
  {
    id: 'wolf-ridge',
    name: 'Wolf Ridge',
    distance: 1390,
    kind: 'danger',
    description: 'A narrow ridge where bad weather turns mean quickly.',
  },
  {
    id: 'deadfall-pass',
    name: 'Deadfall Pass',
    distance: 1880,
    kind: 'danger',
    description: 'The last pass is steep, cold, and short on mercy.',
  },
];

export function getTrailMapLandmarks(totalDistance: number): MapLandmark[] {
  const baseLandmarks: MapLandmark[] = [
    ...towns.map((town) => ({
      id: town.id,
      name: town.name,
      distance: town.distance,
      kind: 'town' as const,
      description: town.description,
    })),
    ...riverCrossings.map((river) => ({
      id: river.id,
      name: river.name,
      distance: river.distance,
      kind: 'river' as const,
      description: river.description,
    })),
    ...dangerZones,
  ];
  const hasLastLanternLandmark = baseLandmarks.some(
    (landmark) => landmark.name === 'Last Lantern',
  );

  return [
    ...baseLandmarks,
    ...(hasLastLanternLandmark
      ? []
      : [
          {
            id: 'destination',
            name: 'Last Lantern',
            distance: totalDistance,
            kind: 'destination' as const,
            description: 'The far end of the frontier trail.',
          },
        ]),
  ].sort((left, right) => left.distance - right.distance);
}
