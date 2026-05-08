import { starterCharacters } from '@game/data/starterCharacters';
import type { Character } from '@game/types/character';
import type { ShopResource, Town } from '@game/types/town';
import type { FrontierReckoningData } from '@stores/expeditionStore';
import { getDifficultyConfig } from '@game/data/difficulties';

export type TownActionResult = {
  state: FrontierReckoningData;
  outcomeText: string;
  succeeded: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function getPendingTown(state: FrontierReckoningData, townList: Town[]) {
  return townList.find(
    (town) =>
      state.distanceTraveled >= town.distance && !state.visitedTownIds.includes(town.id),
  );
}

const getShopItem = (town: Town, resource: ShopResource) => {
  const item = town.shop.find((shopItem) => shopItem.resource === resource);

  if (!item) {
    throw new Error(`Town "${town.id}" does not sell "${resource}".`);
  }

  return item;
};

export function getDifficultyPrice(
  state: Pick<FrontierReckoningData, 'difficulty'>,
  price: number,
) {
  return Math.max(
    1,
    Math.round(price * getDifficultyConfig(state.difficulty).shopPriceMultiplier),
  );
}

export function buyTownSupply(
  state: FrontierReckoningData,
  town: Town,
  resource: ShopResource,
): TownActionResult {
  const item = getShopItem(town, resource);

  const buyPrice = getDifficultyPrice(state, item.buyPrice);

  if (state.money < buyPrice) {
    return {
      state,
      outcomeText: `Not enough money to buy ${item.label.toLowerCase()}.`,
      succeeded: false,
    };
  }

  return {
    state: {
      ...state,
      money: state.money - buyPrice,
      [resource]: state[resource] + item.quantity,
    },
    outcomeText: `Bought ${item.quantity} ${item.label.toLowerCase()} for $${buyPrice}.`,
    succeeded: true,
  };
}

export function sellTownSupply(
  state: FrontierReckoningData,
  town: Town,
  resource: ShopResource,
): TownActionResult {
  const item = getShopItem(town, resource);

  if (state[resource] < item.quantity) {
    return {
      state,
      outcomeText: `Not enough ${item.label.toLowerCase()} to sell.`,
      succeeded: false,
    };
  }

  return {
    state: {
      ...state,
      money: state.money + item.sellPrice,
      [resource]: state[resource] - item.quantity,
    },
    outcomeText: `Sold ${item.quantity} ${item.label.toLowerCase()} for $${item.sellPrice}.`,
    succeeded: true,
  };
}

export function restAtInn(state: FrontierReckoningData, town: Town): TownActionResult {
  const innCost = getDifficultyPrice(state, town.innCost);

  if (state.money < innCost) {
    return {
      state,
      outcomeText: 'Not enough money to rest at the inn.',
      succeeded: false,
    };
  }

  return {
    state: {
      ...state,
      currentDay: state.currentDay + 1,
      money: state.money - innCost,
      health: clamp(state.health + 15, 0, 100),
      morale: clamp(state.morale + 6, 0, 100),
      party: state.party.map((character) =>
        character.status === 'dead'
          ? character
          : {
              ...character,
              health: clamp(character.health + 12, 0, 100),
              morale: clamp(character.morale + 6, 0, 100),
            },
      ),
    },
    outcomeText: `The party rests at the inn for $${innCost}.`,
    succeeded: true,
  };
}

export function repairWagonInTown(
  state: FrontierReckoningData,
  town: Town,
): TownActionResult {
  const repairCost = getDifficultyPrice(state, town.repairCost);

  if (state.money < repairCost) {
    return {
      state,
      outcomeText: 'Not enough money for town repairs.',
      succeeded: false,
    };
  }

  return {
    state: {
      ...state,
      money: state.money - repairCost,
      wagonCondition: clamp(state.wagonCondition + 35, 0, 100),
    },
    outcomeText: `Town mechanics improve the wagon for $${repairCost}.`,
    succeeded: true,
  };
}

const cloneRecruit = (character: Character): Character => ({
  ...character,
  skills: [...character.skills],
  traits: [...character.traits],
});

export function recruitPartyMember(
  state: FrontierReckoningData,
  town: Town,
): TownActionResult {
  const recruitCost = getDifficultyPrice(state, town.recruitCost);

  if (state.money < recruitCost) {
    return {
      state,
      outcomeText: 'Not enough money to recruit a traveler.',
      succeeded: false,
    };
  }

  const recruit = starterCharacters.find(
    (character) => !state.party.some((partyMember) => partyMember.id === character.id),
  );

  if (!recruit) {
    return {
      state,
      outcomeText: 'No willing recruits are available here.',
      succeeded: false,
    };
  }

  return {
    state: {
      ...state,
      money: state.money - recruitCost,
      party: [...state.party, cloneRecruit(recruit)],
    },
    outcomeText: `${recruit.name} joins the caravan for $${recruitCost}.`,
    succeeded: true,
  };
}

export function hearTownRumor(
  state: FrontierReckoningData,
  town: Town,
): TownActionResult {
  return {
    state,
    outcomeText: town.rumor,
    succeeded: true,
  };
}
