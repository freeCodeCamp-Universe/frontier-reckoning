import type { Character } from '@game/types/character';
import type { FrontierReckoningData } from '@stores/expeditionStore';
import type { Rng } from '@utils/rng';
import { getDifficultyConfig } from '@game/data/difficulties';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

export function calculateDailyDistance(state: FrontierReckoningData) {
  const livingParty = livingCharacters(state.party);

  if (livingParty.length === 0) {
    return 0;
  }

  const scoutBonus = livingParty.some((character) =>
    character.skills.includes('navigation'),
  )
    ? 4
    : 0;
  const wagonPenalty = state.wagonParts === 0 ? 6 : 0;
  const moralePenalty = state.morale < 30 ? 4 : 0;
  const healthPenalty = state.health < 40 ? 4 : 0;

  return Math.max(10, 24 + scoutBonus - wagonPenalty - moralePenalty - healthPenalty);
}

export function calculateFoodConsumption(
  party: Character[],
  isRationing = false,
  consumptionMultiplier = 1,
) {
  return livingCharacters(party).length * (isRationing ? 1 : 1.5) * consumptionMultiplier;
}

export function applyDailyTravel(
  state: FrontierReckoningData,
  rng: Rng = Math.random,
): FrontierReckoningData {
  if (state.gameStatus !== 'traveling') {
    return state;
  }

  const livingParty = livingCharacters(state.party);

  if (livingParty.length === 0) {
    return {
      ...state,
      gameStatus: 'game_over',
    };
  }

  const difficultyConfig = getDifficultyConfig(state.difficulty);
  const foodConsumption = calculateFoodConsumption(
    state.party,
    state.rationingDays > 0,
    difficultyConfig.resourceConsumptionMultiplier,
  );
  const food = Math.max(0, state.food - foodConsumption);
  const isOutOfFood = food === 0;
  const suppliesExhaustedDays = isOutOfFood ? state.suppliesExhaustedDays + 1 : 0;
  const health = clamp(state.health - (isOutOfFood ? 5 : 0), 0, 100);
  const morale = clamp(state.morale - 1 - (isOutOfFood ? 3 : 0), 0, 100);
  const distanceTraveled = Math.min(
    state.distanceTraveled + calculateDailyDistance(state),
    state.totalDistance,
  );
  const incidentRoll = rng();
  const wagonPartBreak = incidentRoll < 0.08;
  const wagonWear = incidentRoll >= 0.08 && incidentRoll < 0.2;
  const wagonParts = wagonPartBreak
    ? Math.max(0, state.wagonParts - 1)
    : state.wagonParts;
  const wagonCondition = clamp(
    state.wagonCondition -
      (wagonPartBreak ? (state.wagonParts > 0 ? 5 : 9) : wagonWear ? 4 : 0),
    0,
    100,
  );
  const party: Character[] = state.party.map((character) => {
    if (character.status === 'dead') {
      return character;
    }

    const characterHealth = clamp(character.health - (isOutOfFood ? 4 : 0), 0, 100);

    return {
      ...character,
      health: characterHealth,
      morale: clamp(character.morale - 1 - (isOutOfFood ? 2 : 0), 0, 100),
      status: characterHealth === 0 ? 'dead' : character.status,
    };
  });
  const allPartyDead = party.every(
    (character) => character.status === 'dead' || character.health === 0,
  );

  return {
    ...state,
    currentDay: state.currentDay + 1,
    distanceTraveled,
    food,
    wagonParts,
    wagonCondition,
    morale,
    health,
    party,
    rationingDays: Math.max(0, state.rationingDays - 1),
    suppliesExhaustedDays,
    daysSinceLastEvent: state.daysSinceLastEvent + 1,
    gameStatus: allPartyDead
      ? 'game_over'
      : distanceTraveled >= state.totalDistance
        ? 'victory'
        : 'traveling',
  };
}
