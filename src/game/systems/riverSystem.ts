import type { Character } from '@game/types/character';
import type { RiverCrossing, RiverCrossingOption } from '@game/types/river';
import type { LegacyEventEffects } from '@game/types/event';
import type { FrontierReckoningData, ResourceName } from '@stores/expeditionStore';
import type { Rng } from '@utils/rng';

export type RiverCrossingResult = {
  state: FrontierReckoningData;
  outcomeText: string;
  succeeded: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

const resourceUpperLimit = (resourceName: ResourceName) =>
  resourceName === 'morale' || resourceName === 'health' ? 100 : Number.POSITIVE_INFINITY;

export function getPendingRiverCrossing(
  state: FrontierReckoningData,
  rivers: RiverCrossing[],
) {
  return rivers.find(
    (river) =>
      state.distanceTraveled >= river.distance &&
      !state.crossedRiverIds.includes(river.id),
  );
}

export function getRiverOptionAvailability(
  state: FrontierReckoningData,
  option: RiverCrossingOption,
) {
  const reasons: string[] = [];

  if (
    option.requirements?.minimumMoney !== undefined &&
    state.money < option.requirements.minimumMoney
  ) {
    reasons.push(`Requires at least $${option.requirements.minimumMoney}.`);
  }

  if (
    option.requirements?.minimumWagonParts !== undefined &&
    state.wagonParts < option.requirements.minimumWagonParts
  ) {
    reasons.push(
      `Requires at least ${option.requirements.minimumWagonParts} wagon part.`,
    );
  }

  return {
    available: reasons.length === 0,
    reasons,
  };
}

function applyRiverEffects(
  state: FrontierReckoningData,
  effects: LegacyEventEffects,
): FrontierReckoningData {
  const nextState = { ...state };

  if (effects.resources) {
    for (const [resourceName, amount] of Object.entries(effects.resources) as Array<
      [ResourceName, number]
    >) {
      nextState[resourceName] = clamp(
        nextState[resourceName] + amount,
        0,
        resourceUpperLimit(resourceName),
      );
    }
  }

  nextState.morale = clamp(nextState.morale + (effects.morale ?? 0), 0, 100);
  nextState.health = clamp(nextState.health + (effects.health ?? 0), 0, 100);
  nextState.wagonParts = Math.max(0, nextState.wagonParts + (effects.wagonParts ?? 0));
  nextState.wagonCondition = clamp(
    nextState.wagonCondition + (effects.wagonCondition ?? 0),
    0,
    100,
  );
  nextState.distanceTraveled = clamp(
    nextState.distanceTraveled + (effects.distance ?? 0),
    0,
    nextState.totalDistance,
  );
  nextState.currentDay += effects.delayDays ?? 0;

  if (effects.characterHealth !== undefined || effects.characterStatus !== undefined) {
    const target = livingCharacters(nextState.party)[0];

    if (target) {
      nextState.party = nextState.party.map((character) => {
        if (character.id !== target.id) {
          return character;
        }

        const health = clamp(character.health + (effects.characterHealth ?? 0), 0, 100);

        return {
          ...character,
          health,
          status: health === 0 ? 'dead' : (effects.characterStatus ?? character.status),
        };
      });
    }
  }

  return nextState;
}

export function crossRiver(
  state: FrontierReckoningData,
  river: RiverCrossing,
  optionId: RiverCrossingOption['id'],
  rng: Rng = Math.random,
): RiverCrossingResult {
  const option = river.options.find((riverOption) => riverOption.id === optionId);

  if (!option) {
    throw new Error(`River option "${optionId}" does not exist for "${river.id}".`);
  }

  const availability = getRiverOptionAvailability(state, option);

  if (!availability.available) {
    return {
      state,
      outcomeText: availability.reasons.join(' '),
      succeeded: false,
    };
  }

  const failed = rng() < option.failureChance;
  const nextState = applyRiverEffects(
    state,
    failed ? option.failureEffects : option.successEffects,
  );

  return {
    state: {
      ...nextState,
      crossedRiverIds: [...nextState.crossedRiverIds, river.id],
      currentRiver: river,
      riverResolved: true,
      gameStatus: 'river',
    },
    outcomeText: failed ? option.failureText : option.successText,
    succeeded: !failed,
  };
}
