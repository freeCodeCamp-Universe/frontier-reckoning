import type { Character } from '@game/types/character';
import type { EventChoice, EventEffects, GameEvent } from '@game/types/event';
import type { FrontierReckoningData, ResourceName } from '@stores/expeditionStore';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const resourceUpperLimit = (resourceName: ResourceName) =>
  resourceName === 'morale' || resourceName === 'health' ? 100 : Number.POSITIVE_INFINITY;

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

const findTargetCharacterId = (party: Character[], targetCharacterId?: string) => {
  if (targetCharacterId) {
    return targetCharacterId;
  }

  return livingCharacters(party)[0]?.id;
};

export function pickWeightedEvent(
  events: GameEvent[],
  randomValue = Math.random(),
): GameEvent {
  const totalWeight = events.reduce((total, event) => total + event.weight, 0);

  if (events.length === 0 || totalWeight <= 0) {
    throw new Error('Cannot pick an event without positive event weights.');
  }

  let threshold = randomValue * totalWeight;

  for (const event of events) {
    threshold -= event.weight;

    if (threshold <= 0) {
      return event;
    }
  }

  return events[events.length - 1];
}

export function applyEventEffects(
  state: FrontierReckoningData,
  effects: EventEffects,
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

  const targetCharacterId = findTargetCharacterId(
    nextState.party,
    effects.targetCharacterId,
  );

  if (
    targetCharacterId &&
    (effects.characterHealth !== undefined ||
      effects.characterMorale !== undefined ||
      effects.characterStatus !== undefined)
  ) {
    nextState.party = nextState.party.map((character) => {
      if (character.id !== targetCharacterId || character.status === 'dead') {
        return character;
      }

      const health = clamp(character.health + (effects.characterHealth ?? 0), 0, 100);
      const status =
        health === 0 ? 'dead' : (effects.characterStatus ?? character.status);

      return {
        ...character,
        health,
        morale: clamp(character.morale + (effects.characterMorale ?? 0), 0, 100),
        status,
      };
    });
  }

  if (
    nextState.party.length > 0 &&
    nextState.party.every(
      (character) => character.status === 'dead' || character.health === 0,
    )
  ) {
    nextState.gameStatus = 'game_over';
  }

  return nextState;
}

export function applyEventChoice(
  state: FrontierReckoningData,
  event: GameEvent,
  choiceId: string,
): FrontierReckoningData {
  const choice = event.choices?.find((eventChoice) => eventChoice.id === choiceId);

  if (!choice) {
    throw new Error(`Choice "${choiceId}" does not exist for event "${event.id}".`);
  }

  const availability = getChoiceAvailability(state, choice);

  if (!availability.available) {
    throw new Error(availability.reasons.join(' '));
  }

  return applyEventEffects(state, choice.effects);
}

export function shouldTriggerTravelEvent(
  state: FrontierReckoningData,
  randomValue = Math.random(),
) {
  return (
    state.gameStatus === 'traveling' &&
    state.daysSinceLastEvent >= 2 &&
    randomValue < 0.35
  );
}

export function getChoiceLabel(choice: EventChoice) {
  return choice.description ? `${choice.label}: ${choice.description}` : choice.label;
}

export function getChoiceAvailability(state: FrontierReckoningData, choice: EventChoice) {
  const reasons: string[] = [];
  const requirements = choice.requirements;

  if (!requirements) {
    return { available: true, reasons };
  }

  if (requirements.minimumFood !== undefined && state.food < requirements.minimumFood) {
    reasons.push(`Requires at least ${requirements.minimumFood} food.`);
  }

  if (requirements.minimumAmmo !== undefined && state.ammo < requirements.minimumAmmo) {
    reasons.push(`Requires at least ${requirements.minimumAmmo} ammo.`);
  }

  if (
    requirements.minimumMoney !== undefined &&
    state.money < requirements.minimumMoney
  ) {
    reasons.push(`Requires at least $${requirements.minimumMoney}.`);
  }

  if (
    requirements.minimumMorale !== undefined &&
    state.morale < requirements.minimumMorale
  ) {
    reasons.push(`Requires morale of at least ${requirements.minimumMorale}.`);
  }

  if (
    requirements.characterRolePresent &&
    !livingCharacters(state.party).some(
      (character) => character.role === requirements.characterRolePresent,
    )
  ) {
    reasons.push(`Requires a living ${requirements.characterRolePresent}.`);
  }

  return {
    available: reasons.length === 0,
    reasons,
  };
}
