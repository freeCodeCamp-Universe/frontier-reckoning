import type { Character } from '@game/types/character';
import type { FrontierReckoningData } from '@stores/expeditionStore';

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
  randomValue = Math.random(),
) {
  const hunterBonus = hasLivingHunter(state.party) ? 0.2 : 0;

  return randomValue + ammoSpent * 0.08 + hunterBonus;
}

export function huntAtCamp(
  state: FrontierReckoningData,
  ammoSpent: HuntingAmmoAmount,
  randomValue = Math.random(),
): HuntingResult {
  if (state.ammo < ammoSpent) {
    return {
      state,
      outcome: 'wasted_ammo',
      foodGained: 0,
      outcomeText: 'There is not enough ammo to hunt.',
    };
  }

  const score = calculateHuntingScore(state, ammoSpent, randomValue);
  let outcome: HuntingOutcome = 'no_game_found';
  let foodGained = 0;
  let outcomeText = 'No game is found before dusk.';
  let party = state.party;

  if (randomValue < 0.08) {
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
  } else if (randomValue > 0.92 && !hasLivingHunter(state.party)) {
    outcome = 'wasted_ammo';
    outcomeText = 'Shots echo across empty scrub. The ammo is gone and nothing falls.';
  } else if (score >= 0.82) {
    outcome = 'large_game';
    foodGained = 30;
    outcomeText = 'The hunt brings down large game and fills the food stores.';
  } else if (score >= 0.48) {
    outcome = 'small_game';
    foodGained = 12;
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
