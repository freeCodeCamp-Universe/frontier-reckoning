import type { Character } from '@game/types/character';
import type {
  EventChoice,
  EventEffect,
  EventEffects,
  GameEvent,
  LegacyEventEffects,
  TemporaryModifier,
} from '@game/types/event';
import type { FrontierReckoningData, ResourceName } from '@stores/expeditionStore';
import { weightedChoice, type Rng } from '@utils/rng';
import { getDifficultyConfig } from '@game/data/difficulties';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const resourceUpperLimit = (resourceName: ResourceName) =>
  resourceName === 'morale' || resourceName === 'health' ? 100 : Number.POSITIVE_INFINITY;

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

const findTargetCharacterId = (party: Character[], targetCharacterId?: string) =>
  targetCharacterId ?? livingCharacters(party)[0]?.id;

const scaleSeverity = (state: FrontierReckoningData, amount: number) => {
  if (amount >= 0) {
    return amount;
  }

  return Math.round(
    amount * getDifficultyConfig(state.difficulty).eventSeverityMultiplier,
  );
};

export function pickWeightedEvent(
  events: GameEvent[],
  rng: Rng = Math.random,
  state?: FrontierReckoningData,
): GameEvent {
  return weightedChoice(events, (event) => getModifiedEventWeight(event, state), rng);
}

export function getModifiedEventWeight(event: GameEvent, state?: FrontierReckoningData) {
  if (!state?.temporaryModifiers?.length) {
    return event.weight;
  }

  return state.temporaryModifiers.reduce((weight, modifier) => {
    const categoryMultiplier = event.categories.reduce(
      (multiplier, category) =>
        multiplier * (modifier.eventWeightModifiers?.[category] ?? 1),
      1,
    );

    return weight * categoryMultiplier;
  }, event.weight);
}

export function legacyEffectsToEventEffects(effects: LegacyEventEffects): EventEffects {
  const nextEffects: EventEffects = [];

  for (const [resource, amount] of Object.entries(effects.resources ?? {}) as Array<
    [ResourceName, number]
  >) {
    nextEffects.push({ type: 'change_resource', resource, amount });
  }

  if (effects.morale) {
    nextEffects.push({ type: 'change_party_morale', amount: effects.morale });
  }

  if (effects.health) {
    nextEffects.push({ type: 'change_party_health', amount: effects.health });
  }

  if (effects.wagonParts) {
    nextEffects.push({
      type: 'change_resource',
      resource: 'wagonParts',
      amount: effects.wagonParts,
    });
  }

  if (effects.wagonCondition) {
    nextEffects.push({
      type: 'change_wagon_condition',
      amount: effects.wagonCondition,
    });
  }

  if (effects.distance) {
    nextEffects.push({ type: 'change_distance', amount: effects.distance });
  }

  if (effects.delayDays) {
    nextEffects.push({ type: 'advance_days', days: effects.delayDays });
  }

  if (effects.characterHealth) {
    nextEffects.push({
      type: 'change_single_character_health',
      targetCharacterId: effects.targetCharacterId,
      amount: effects.characterHealth,
    });
  }

  if (effects.characterMorale) {
    nextEffects.push({
      type: 'change_single_character_morale',
      targetCharacterId: effects.targetCharacterId,
      amount: effects.characterMorale,
    });
  }

  if (effects.characterStatus) {
    nextEffects.push({
      type: 'change_single_character_status',
      targetCharacterId: effects.targetCharacterId,
      status: effects.characterStatus,
    });
  }

  return nextEffects;
}

export function applyEventEffects(
  state: FrontierReckoningData,
  effects: EventEffects | LegacyEventEffects,
): FrontierReckoningData {
  const normalizedEffects = Array.isArray(effects)
    ? effects
    : legacyEffectsToEventEffects(effects);

  return normalizedEffects.reduce(applyEventEffect, state);
}

export function applyEventEffect(
  state: FrontierReckoningData,
  effect: EventEffect,
): FrontierReckoningData {
  try {
    switch (effect.type) {
      case 'change_resource':
        return applyResourceChange(state, effect.resource, effect.amount);
      case 'change_party_health':
        return applyPartyHealthChange(state, effect.amount);
      case 'change_party_morale':
        return applyPartyMoraleChange(state, effect.amount);
      case 'change_single_character_health':
        return applyCharacterChange(state, effect.targetCharacterId, {
          health: effect.amount,
        });
      case 'change_single_character_morale':
        return applyCharacterChange(state, effect.targetCharacterId, {
          morale: effect.amount,
        });
      case 'change_single_character_status':
        return applyCharacterChange(state, effect.targetCharacterId, {
          status: effect.status,
        });
      case 'change_wagon_condition':
        return {
          ...state,
          wagonCondition: clamp(
            state.wagonCondition + scaleSeverity(state, effect.amount),
            0,
            100,
          ),
        };
      case 'change_distance':
        return {
          ...state,
          distanceTraveled: clamp(
            state.distanceTraveled + effect.amount,
            0,
            state.totalDistance,
          ),
        };
      case 'add_game_log':
        return { ...state, gameLog: [effect.message, ...state.gameLog].slice(0, 20) };
      case 'advance_days':
        return { ...state, currentDay: state.currentDay + Math.max(0, effect.days) };
      case 'trigger_followup_event':
        return {
          ...state,
          currentEvent: effect.event,
          eventResolved: false,
          gameStatus: 'event',
        };
      case 'start_subsystem':
        return {
          ...state,
          gameStatus: effect.subsystem === 'hunting' ? 'camp' : effect.subsystem,
        };
      case 'add_temporary_modifier':
        return {
          ...state,
          temporaryModifiers: upsertTemporaryModifier(
            state.temporaryModifiers,
            effect.modifier,
          ),
        };
      case 'remove_temporary_modifier':
        return {
          ...state,
          temporaryModifiers: state.temporaryModifiers.filter(
            (modifier) => modifier.id !== effect.modifierId,
          ),
        };
      case 'faction_reputation_change':
        return {
          ...state,
          gameLog: [
            `Faction reputation placeholder: ${effect.factionId} ${effect.amount}.`,
            ...state.gameLog,
          ].slice(0, 20),
        };
      default:
        return state;
    }
  } catch {
    return state;
  }
}

function applyResourceChange(
  state: FrontierReckoningData,
  resourceName: ResourceName,
  amount: number,
) {
  if (!(resourceName in state) || typeof state[resourceName] !== 'number') {
    return state;
  }

  return {
    ...state,
    [resourceName]: clamp(
      state[resourceName] + scaleSeverity(state, amount),
      0,
      resourceUpperLimit(resourceName),
    ),
  };
}

function applyPartyHealthChange(state: FrontierReckoningData, amount: number) {
  const healthDelta = scaleSeverity(state, amount);
  const party: Character[] = state.party.map((character) => {
    if (character.status === 'dead') {
      return character;
    }

    const health = clamp(character.health + healthDelta, 0, 100);

    return {
      ...character,
      health,
      status: health === 0 ? 'dead' : character.status,
    };
  });

  return finishPartyHealthState({
    ...state,
    health: clamp(state.health + healthDelta, 0, 100),
    party,
  });
}

function applyPartyMoraleChange(state: FrontierReckoningData, amount: number) {
  const moraleDelta = scaleSeverity(state, amount);

  return {
    ...state,
    morale: clamp(state.morale + moraleDelta, 0, 100),
    party: state.party.map((character) =>
      character.status === 'dead'
        ? character
        : {
            ...character,
            morale: clamp(character.morale + moraleDelta, 0, 100),
          },
    ),
  };
}

function applyCharacterChange(
  state: FrontierReckoningData,
  targetCharacterId: string | undefined,
  change: {
    health?: number;
    morale?: number;
    status?: Character['status'];
  },
) {
  const resolvedTargetCharacterId = findTargetCharacterId(state.party, targetCharacterId);

  if (!resolvedTargetCharacterId) {
    return state;
  }

  const party = state.party.map((character) => {
    if (character.id !== resolvedTargetCharacterId || character.status === 'dead') {
      return character;
    }

    const health =
      change.health === undefined
        ? character.health
        : clamp(character.health + scaleSeverity(state, change.health), 0, 100);

    return {
      ...character,
      health,
      morale:
        change.morale === undefined
          ? character.morale
          : clamp(character.morale + scaleSeverity(state, change.morale), 0, 100),
      status: health === 0 ? 'dead' : (change.status ?? character.status),
    };
  });

  return finishPartyHealthState({ ...state, party });
}

function finishPartyHealthState(state: FrontierReckoningData) {
  if (
    state.party.length > 0 &&
    state.party.every(
      (character) => character.status === 'dead' || character.health === 0,
    )
  ) {
    return { ...state, gameStatus: 'game_over' as const };
  }

  return state;
}

function upsertTemporaryModifier(
  modifiers: TemporaryModifier[],
  modifier: TemporaryModifier,
) {
  return [
    ...modifiers.filter((currentModifier) => currentModifier.id !== modifier.id),
    modifier,
  ];
}

export function tickTemporaryModifiers(state: FrontierReckoningData) {
  if (!state.temporaryModifiers.length) {
    return state;
  }

  const moraleDelta = state.temporaryModifiers.reduce(
    (total, modifier) => total + (modifier.moraleDeltaPerDay ?? 0),
    0,
  );

  return {
    ...state,
    morale: clamp(state.morale + moraleDelta, 0, 100),
    temporaryModifiers: state.temporaryModifiers
      .map((modifier) => ({
        ...modifier,
        durationDays: modifier.durationDays - 1,
      }))
      .filter((modifier) => modifier.durationDays > 0),
  };
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
  rng: Rng = Math.random,
) {
  return (
    state.gameStatus === 'traveling' && state.daysSinceLastEvent >= 2 && rng() < 0.35
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
