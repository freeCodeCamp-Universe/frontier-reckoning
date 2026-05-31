import type { HuntingAnimalType } from '@game/systems/huntingSystem';

type HuntingSpriteProfile = {
  hitRadius: number;
  movement: 'quick-hop' | 'graceful-run' | 'heavy-lope' | 'predator-prowl';
  hasAntlers: boolean;
};

export const huntingSpriteProfiles: Record<HuntingAnimalType, HuntingSpriteProfile> = {
  rabbit: {
    hitRadius: 25,
    movement: 'quick-hop',
    hasAntlers: false,
  },
  deer: {
    hitRadius: 34,
    movement: 'graceful-run',
    hasAntlers: true,
  },
  elk: {
    hitRadius: 44,
    movement: 'heavy-lope',
    hasAntlers: true,
  },
  wolf: {
    hitRadius: 30,
    movement: 'predator-prowl',
    hasAntlers: false,
  },
};

export function getHuntingAnimalHitRadius(type: HuntingAnimalType) {
  return huntingSpriteProfiles[type].hitRadius;
}
