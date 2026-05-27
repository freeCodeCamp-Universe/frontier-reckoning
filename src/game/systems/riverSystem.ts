import type { Character } from '@game/types/character';
import type {
  RiverCostPreview,
  RiverCrossing,
  RiverCrossingOption,
  RiverOutcome,
} from '@game/types/river';
import type { FrontierReckoningData } from '@stores/expeditionStore';
import type { Rng } from '@utils/rng';

export type RiverCrossingResult = {
  state: FrontierReckoningData;
  outcomeText: string;
  succeeded: boolean;
  outcomes: RiverOutcome[];
  riskScore: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

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
  river?: RiverCrossing,
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
      `Requires at least ${option.requirements.minimumWagonParts} wagon part${option.requirements.minimumWagonParts === 1 ? '' : 's'}.`,
    );
  }

  if (option.requirements?.requiresFerry && river && !river.ferryAvailable) {
    reasons.push('No ferry is operating at this river.');
  }

  if (option.requirements?.requiresBridge && river && !river.bridgeAvailable) {
    reasons.push('No known bridge can be found from here.');
  }

  return {
    available: reasons.length === 0,
    reasons,
  };
}

export function getRiverCostPreview(option: RiverCrossingOption): RiverCostPreview {
  return option.costPreview ?? {};
}

export function calculateRiverRisk(
  state: FrontierReckoningData,
  river: RiverCrossing,
  option: RiverCrossingOption,
) {
  const carriedSupplies =
    state.food / 250 + state.ammo / 80 + state.medicine / 16 + state.wagonParts / 8;
  const supplyBurden = Math.min(0.16, carriedSupplies * 0.035);
  const wagonPenalty = state.wagonCondition < 50 ? (50 - state.wagonCondition) / 120 : 0;
  const partyHealthPenalty = state.health < 70 ? (70 - state.health) / 180 : 0;
  const baseRisk =
    river.dangerRating * 0.42 +
    river.currentStrength * 0.18 +
    river.depth * 0.018 +
    river.width * 0.00035 +
    river.weatherModifier +
    supplyBurden +
    wagonPenalty +
    partyHealthPenalty +
    option.strategyRiskModifier;

  return clamp(baseRisk, 0.03, 0.9);
}

export function waitForBetterRiverConditions(river: RiverCrossing): RiverCrossing {
  return {
    ...river,
    depth: Math.max(1, river.depth - 0.6),
    currentStrength: clamp(river.currentStrength - 0.12, 0, 1),
    weatherModifier: clamp(river.weatherModifier - 0.08, -0.1, 0.5),
    dangerRating: clamp(river.dangerRating - 0.08, 0, 1),
  };
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

  const availability = getRiverOptionAvailability(state, option, river);

  if (!availability.available) {
    return {
      state,
      outcomeText: availability.reasons.join(' '),
      succeeded: false,
      outcomes: [],
      riskScore: calculateRiverRisk(state, river, option),
    };
  }

  const preparedRiver =
    option.id === 'wait' ? waitForBetterRiverConditions(river) : river;
  const riskScore = calculateRiverRisk(state, preparedRiver, option);
  const failed = rng() < riskScore;
  const outcomes = failed
    ? buildFailureOutcomes(state, preparedRiver, option, rng)
    : ([{ kind: 'safe_crossing' }] satisfies RiverOutcome[]);
  const stateWithCosts = applyCrossingCosts(state, option);
  const nextState = applyRiverOutcomes(stateWithCosts, outcomes);

  return {
    state: {
      ...nextState,
      crossedRiverIds: [...nextState.crossedRiverIds, river.id],
      currentRiver: {
        ...preparedRiver,
        options: river.options,
      },
      riverResolved: true,
      gameStatus: 'river',
    },
    outcomeText: buildOutcomeText(option, failed, outcomes),
    succeeded: !failed,
    outcomes,
    riskScore,
  };
}

function applyCrossingCosts(state: FrontierReckoningData, option: RiverCrossingOption) {
  const cost = getRiverCostPreview(option);

  return {
    ...state,
    money: Math.max(0, state.money - (cost.money ?? 0)),
    wagonParts: Math.max(0, state.wagonParts - (cost.wagonParts ?? 0)),
    food: Math.max(0, state.food - (cost.food ?? 0)),
    currentDay: state.currentDay + (cost.days ?? 0),
  };
}

function buildFailureOutcomes(
  state: FrontierReckoningData,
  river: RiverCrossing,
  option: RiverCrossingOption,
  rng: Rng,
): RiverOutcome[] {
  const outcomes: RiverOutcome[] = [];
  const severity = Math.max(1, Math.round(river.dangerRating * 10));

  if (option.id !== 'ferry' && rng() < 0.58) {
    outcomes.push({ kind: 'lost_food', amount: 6 + severity });
  }

  if (rng() < river.currentStrength * 0.65) {
    outcomes.push({ kind: 'lost_ammo', amount: 2 + Math.floor(severity / 2) });
  }

  if (rng() < river.depth / 10) {
    outcomes.push({ kind: 'lost_medicine', amount: 1 });
  }

  if (rng() < 0.42 || state.wagonCondition < 45) {
    outcomes.push({ kind: 'wagon_damage', amount: 7 + severity });
  }

  if (rng() < river.dangerRating * 0.55) {
    const target = livingCharacters(state.party)[0];
    const fatal = rng() < Math.max(0.04, river.dangerRating - 0.55);

    if (target) {
      outcomes.push({
        kind: fatal ? 'character_death' : 'character_injury',
        amount: fatal ? target.health : 12 + severity,
        characterId: target.id,
      });
    }
  }

  if (option.id === 'bridge' || option.id === 'raft' || rng() < 0.35) {
    outcomes.push({ kind: 'multi_day_delay', amount: option.id === 'bridge' ? 2 : 1 });
  }

  return outcomes.length > 0 ? outcomes : [{ kind: 'wagon_damage', amount: severity }];
}

function applyRiverOutcomes(
  state: FrontierReckoningData,
  outcomes: RiverOutcome[],
): FrontierReckoningData {
  return outcomes.reduce((nextState, outcome) => {
    switch (outcome.kind) {
      case 'safe_crossing':
        return { ...nextState, morale: clamp(nextState.morale + 2, 0, 100) };
      case 'lost_food':
        return {
          ...nextState,
          food: Math.max(0, nextState.food - (outcome.amount ?? 0)),
        };
      case 'lost_ammo':
        return {
          ...nextState,
          ammo: Math.max(0, nextState.ammo - (outcome.amount ?? 0)),
        };
      case 'lost_medicine':
        return {
          ...nextState,
          medicine: Math.max(0, nextState.medicine - (outcome.amount ?? 0)),
        };
      case 'wagon_damage':
        return {
          ...nextState,
          wagonCondition: clamp(nextState.wagonCondition - (outcome.amount ?? 0), 0, 100),
        };
      case 'character_injury':
      case 'character_death':
        return {
          ...nextState,
          party: nextState.party.map((character) => {
            if (character.id !== outcome.characterId) {
              return character;
            }

            const health =
              outcome.kind === 'character_death'
                ? 0
                : clamp(character.health - (outcome.amount ?? 0), 0, 100);

            return {
              ...character,
              health,
              status: health === 0 ? 'dead' : 'injured',
            };
          }),
        };
      case 'multi_day_delay':
        return { ...nextState, currentDay: nextState.currentDay + (outcome.amount ?? 0) };
      default:
        return nextState;
    }
  }, state);
}

function buildOutcomeText(
  option: RiverCrossingOption,
  failed: boolean,
  outcomes: RiverOutcome[],
) {
  if (!failed) {
    return option.successText;
  }

  return `${option.failureText} ${summarizeRiverOutcomes(outcomes)}`;
}

export function summarizeRiverOutcomes(outcomes: RiverOutcome[]) {
  return outcomes
    .filter((outcome) => outcome.kind !== 'safe_crossing')
    .map((outcome) => {
      switch (outcome.kind) {
        case 'lost_food':
          return `Lost ${outcome.amount} food.`;
        case 'lost_ammo':
          return `Lost ${outcome.amount} ammo.`;
        case 'lost_medicine':
          return `Lost ${outcome.amount} medicine.`;
        case 'wagon_damage':
          return `Wagon damaged ${outcome.amount}%.`;
        case 'character_injury':
          return 'A traveler was injured.';
        case 'character_death':
          return 'A traveler died.';
        case 'multi_day_delay':
          return `Delayed ${outcome.amount} day${outcome.amount === 1 ? '' : 's'}.`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}
