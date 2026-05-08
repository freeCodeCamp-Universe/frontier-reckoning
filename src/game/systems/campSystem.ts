import type { Character } from '@game/types/character';
import type { FrontierReckoningData } from '@stores/expeditionStore';

export type CampActionResult = {
  state: FrontierReckoningData;
  outcomeText: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const livingCharacters = (party: Character[]) =>
  party.filter((character) => character.status !== 'dead' && character.health > 0);

const advanceCampDay = (state: FrontierReckoningData) => ({
  ...state,
  currentDay: state.currentDay + 1,
  gameStatus: 'camp' as const,
});

export function restAtCamp(state: FrontierReckoningData): CampActionResult {
  const foodCost = livingCharacters(state.party).length * 2;
  const food = Math.max(0, state.food - foodCost);
  const healthGain = food > 0 ? 10 : 4;
  const nextState = advanceCampDay({
    ...state,
    food,
    health: clamp(state.health + healthGain, 0, 100),
    party: state.party.map((character) =>
      character.status === 'dead'
        ? character
        : {
            ...character,
            health: clamp(character.health + healthGain, 0, 100),
            status:
              character.status === 'injured' && character.health + healthGain >= 100
                ? 'healthy'
                : character.status,
          },
    ),
  });

  return {
    state: nextState,
    outcomeText: `The caravan rests for a day, spending ${foodCost} food and recovering strength.`,
  };
}

export function repairWagonAtCamp(state: FrontierReckoningData): CampActionResult {
  if (state.wagonParts <= 0) {
    return {
      state,
      outcomeText: 'The wagon needs parts before repairs can begin.',
    };
  }

  return {
    state: advanceCampDay({
      ...state,
      wagonParts: state.wagonParts - 1,
      wagonCondition: clamp(state.wagonCondition + 25, 0, 100),
    }),
    outcomeText: 'A wagon part is fitted into place, improving the wagon condition.',
  };
}

export function treatPartyMemberAtCamp(
  state: FrontierReckoningData,
  characterId: string,
): CampActionResult {
  if (state.medicine <= 0) {
    return {
      state,
      outcomeText: 'There is no medicine left to treat the party.',
    };
  }

  let treatedName: string | null = null;
  const party: Character[] = state.party.map((character) => {
    if (
      character.id !== characterId ||
      character.status === 'dead' ||
      (character.status !== 'sick' && character.status !== 'injured')
    ) {
      return character;
    }

    treatedName = character.name;
    const health = clamp(character.health + 25, 0, 100);

    return {
      ...character,
      health,
      status: health >= 75 ? 'healthy' : character.status,
    };
  });

  if (!treatedName) {
    return {
      state,
      outcomeText: 'No sick or injured traveler was available for treatment.',
    };
  }

  return {
    state: advanceCampDay({
      ...state,
      medicine: state.medicine - 1,
      party,
    }),
    outcomeText: `${treatedName} receives treatment and recovers some strength.`,
  };
}

export function tellCampfireStoriesAtCamp(
  state: FrontierReckoningData,
): CampActionResult {
  return {
    state: advanceCampDay({
      ...state,
      morale: clamp(state.morale + 8, 0, 100),
      party: state.party.map((character) =>
        character.status === 'dead'
          ? character
          : { ...character, morale: clamp(character.morale + 6, 0, 100) },
      ),
    }),
    outcomeText: 'Stories around the fire lift the party morale.',
  };
}

export function rationFoodAtCamp(state: FrontierReckoningData): CampActionResult {
  return {
    state: advanceCampDay({
      ...state,
      morale: clamp(state.morale - 6, 0, 100),
      rationingDays: state.rationingDays + 3,
      party: state.party.map((character) =>
        character.status === 'dead'
          ? character
          : { ...character, morale: clamp(character.morale - 4, 0, 100) },
      ),
    }),
    outcomeText:
      'Rations are tightened for the next few travel days. Food will last longer, but morale suffers.',
  };
}
