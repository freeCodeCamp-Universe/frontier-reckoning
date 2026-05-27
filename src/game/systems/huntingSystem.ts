import type { Character } from '@game/types/character';
import type { FrontierReckoningData } from '@stores/expeditionStore';
import type { Rng } from '@utils/rng';

export type HuntingAmmoAmount = 1 | 3 | 5;

export type HuntingOutcome =
  | 'no_game_found'
  | 'small_game'
  | 'large_game'
  | 'predator_injury'
  | 'wasted_ammo';

export type HuntingResult = {
  state: FrontierReckoningData;
  outcome: HuntingOutcome;
  foodGained: number;
  outcomeText: string;
};

export type HuntingAnimalType = 'rabbit' | 'deer' | 'elk' | 'wolf';

export type HuntingAnimal = {
  id: string;
  type: HuntingAnimalType;
  x: number;
  y: number;
  size: number;
};

export type HuntingMiniGameResult = {
  ammoSpent: number;
  foodGained: number;
  hits: number;
  misses: number;
  predatorEncountered: boolean;
  injuredCharacterId?: string;
};

export type HuntingAnimalConfig = {
  food: number;
  speed: number;
  dangerous: boolean;
  injuryChance: number;
};

export const HUNTING_DURATION_SECONDS = 30;
export const huntingAnimalConfigs: Record<HuntingAnimalType, HuntingAnimalConfig> = {
  rabbit: { food: 4, speed: 170, dangerous: false, injuryChance: 0 },
  deer: { food: 14, speed: 112, dangerous: false, injuryChance: 0 },
  elk: { food: 24, speed: 72, dangerous: false, injuryChance: 0 },
  wolf: { food: 2, speed: 128, dangerous: true, injuryChance: 0.45 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

export function hasLivingHunter(party: Character[]) {
  return livingCharacters(party).some((character) => character.role === 'Hunter');
}

export function calculateHuntingScore(
  state: FrontierReckoningData,
  ammoSpent: HuntingAmmoAmount,
  rng: Rng = Math.random,
) {
  const hunterBonus = hasLivingHunter(state.party) ? 0.16 : 0;

  return rng() + ammoSpent * 0.06 + hunterBonus;
}

export function huntAtCamp(
  state: FrontierReckoningData,
  ammoSpent: HuntingAmmoAmount,
  rng: Rng = Math.random,
): HuntingResult {
  if (state.ammo < ammoSpent) {
    return {
      state,
      outcome: 'wasted_ammo',
      foodGained: 0,
      outcomeText: 'There is not enough ammo to hunt.',
    };
  }

  const huntRoll = rng();
  const score = huntRoll + ammoSpent * 0.06 + (hasLivingHunter(state.party) ? 0.16 : 0);
  let outcome: HuntingOutcome = 'no_game_found';
  let foodGained = 0;
  let outcomeText = 'No game is found before dusk.';
  let party = state.party;

  if (huntRoll < 0.1) {
    const target = livingCharacters(state.party)[0];
    outcome = 'predator_injury';
    outcomeText = 'A predator charges from the brush. The hunt ends in injury.';

    if (target) {
      party = state.party.map((character) => {
        if (character.id !== target.id) {
          return character;
        }

        const health = clamp(character.health - 18, 0, 100);

        return {
          ...character,
          health,
          status: health === 0 ? 'dead' : 'injured',
        };
      });
    }
  } else if (huntRoll > 0.92 && !hasLivingHunter(state.party)) {
    outcome = 'wasted_ammo';
    outcomeText = 'Shots echo across empty scrub. The ammo is gone and nothing falls.';
  } else if (score >= 0.86) {
    outcome = 'large_game';
    foodGained = 24;
    outcomeText = 'The hunt brings down large game and fills the food stores.';
  } else if (score >= 0.54) {
    outcome = 'small_game';
    foodGained = 9;
    outcomeText = 'The hunters return with small game for the cookpot.';
  }

  return {
    state: {
      ...state,
      currentDay: state.currentDay + 1,
      ammo: state.ammo - ammoSpent,
      food: state.food + foodGained,
      party,
      gameStatus: 'camp',
    },
    outcome,
    foodGained,
    outcomeText,
  };
}

export function getHunterAccuracyBonus(state: Pick<FrontierReckoningData, 'party'>) {
  return hasLivingHunter(state.party) ? 18 : 0;
}

export function getHunterSpawnQualityBonus(state: Pick<FrontierReckoningData, 'party'>) {
  return hasLivingHunter(state.party) ? 0.18 : 0;
}

export function chooseHuntingAnimalType(
  state: Pick<FrontierReckoningData, 'party'>,
  rng: Rng = Math.random,
): HuntingAnimalType {
  const roll = rng() + getHunterSpawnQualityBonus(state);

  if (roll >= 0.9) {
    return 'elk';
  }

  if (roll >= 0.58) {
    return 'deer';
  }

  if (roll <= 0.12) {
    return 'wolf';
  }

  return 'rabbit';
}

export function isHuntingTimerExpired(elapsedSeconds: number) {
  return elapsedSeconds >= HUNTING_DURATION_SECONDS;
}

export function resolveHuntingShot({
  animals,
  target,
  ammoRemaining,
  state,
  rng = Math.random,
}: {
  animals: HuntingAnimal[];
  target: { x: number; y: number };
  ammoRemaining: number;
  state: Pick<FrontierReckoningData, 'party'>;
  rng?: Rng;
}) {
  if (ammoRemaining <= 0) {
    return {
      hitAnimal: null as HuntingAnimal | null,
      ammoRemaining,
      ammoSpent: 0,
      foodGained: 0,
      predatorEncountered: false,
    };
  }

  const accuracyBonus = getHunterAccuracyBonus(state);
  const hitAnimal =
    animals.find((animal) => {
      const hitRadius = animal.size + accuracyBonus;

      return Math.hypot(target.x - animal.x, target.y - animal.y) <= hitRadius;
    }) ?? null;

  if (!hitAnimal) {
    return {
      hitAnimal,
      ammoRemaining: ammoRemaining - 1,
      ammoSpent: 1,
      foodGained: 0,
      predatorEncountered: false,
    };
  }

  const config = huntingAnimalConfigs[hitAnimal.type];

  return {
    hitAnimal,
    ammoRemaining: ammoRemaining - 1,
    ammoSpent: 1,
    foodGained: config.food,
    predatorEncountered: config.dangerous && rng() < config.injuryChance,
  };
}

export function applyHuntingMiniGameResult(
  state: FrontierReckoningData,
  result: HuntingMiniGameResult,
): HuntingResult {
  const ammoSpent = Math.min(state.ammo, Math.max(0, result.ammoSpent));
  let party = state.party;

  if (result.predatorEncountered) {
    const target =
      livingCharacters(state.party).find(
        (character) => character.id === result.injuredCharacterId,
      ) ?? livingCharacters(state.party)[0];

    if (target) {
      party = state.party.map((character) => {
        if (character.id !== target.id) {
          return character;
        }

        const health = clamp(character.health - 16, 0, 100);

        return {
          ...character,
          health,
          status: health === 0 ? 'dead' : 'injured',
        };
      });
    }
  }

  const outcomeText = getMiniGameOutcomeText(result);

  return {
    state: {
      ...state,
      ammo: state.ammo - ammoSpent,
      food: state.food + result.foodGained,
      party,
      campOutcomeText: outcomeText,
      gameStatus: 'camp',
    },
    outcome: result.predatorEncountered
      ? 'predator_injury'
      : result.foodGained > 12
        ? 'large_game'
        : result.foodGained > 0
          ? 'small_game'
          : result.ammoSpent > 0
            ? 'wasted_ammo'
            : 'no_game_found',
    foodGained: result.foodGained,
    outcomeText,
  };
}

function getMiniGameOutcomeText(result: HuntingMiniGameResult) {
  const foodText =
    result.foodGained > 0
      ? `The hunt brings back ${result.foodGained} food.`
      : 'The hunt ends without fresh food.';
  const shotText = ` Shots fired: ${result.ammoSpent}.`;
  const predatorText = result.predatorEncountered
    ? ' A wolf encounter injures a party member.'
    : '';

  return `${foodText}${shotText}${predatorText}`;
}
