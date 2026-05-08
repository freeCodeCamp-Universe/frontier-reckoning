import { describe, expect, it } from 'vitest';
import { riverCrossings } from '@game/data/riverCrossings';
import { starterEvents } from '@game/data/starterEvents';
import { towns } from '@game/data/towns';
import {
  applyEventChoice,
  applyEventEffects,
  getChoiceAvailability,
  pickWeightedEvent,
  shouldTriggerTravelEvent,
} from '@game/systems/eventSystem';
import { getGameOverReason } from '@game/systems/endingSystem';
import { huntAtCamp } from '@game/systems/huntingSystem';
import {
  crossRiver,
  getPendingRiverCrossing,
  getRiverOptionAvailability,
} from '@game/systems/riverSystem';
import {
  getPendingTown,
  buyTownSupply,
  repairWagonInTown,
} from '@game/systems/townSystem';
import { applyDailyTravel } from '@game/systems/travelSystem';
import {
  createStartingGameState,
  type FrontierReckoningData,
} from '@stores/expeditionStore';
import type { EventChoice, GameEvent } from '@game/types/event';
import type { RiverCrossing } from '@game/types/river';
import type { Town } from '@game/types/town';

type SimulationResult = {
  finalState: FrontierReckoningData;
  snapshots: FrontierReckoningData[];
};

const createSeededRandom = (seed: number) => {
  let value = seed;

  return () => {
    value = (value * 48271) % 0x7fffffff;
    return (value - 1) / 0x7ffffffe;
  };
};

const supplyTotal = (state: FrontierReckoningData) =>
  state.food +
  state.ammo +
  state.medicine * 8 +
  state.wagonParts * 12 +
  state.money +
  state.wagonCondition;

const isTerminal = (state: FrontierReckoningData) =>
  state.gameStatus === 'victory' || state.gameStatus === 'game_over';

const finishIfGameOver = (state: FrontierReckoningData): FrontierReckoningData => {
  const gameOverReason = getGameOverReason(state);

  return gameOverReason ? { ...state, gameOverReason, gameStatus: 'game_over' } : state;
};

const chooseEventChoice = (
  state: FrontierReckoningData,
  event: GameEvent,
  random: () => number,
) => {
  const availableChoices =
    event.choices?.filter((choice) => getChoiceAvailability(state, choice).available) ??
    [];

  if (availableChoices.length === 0) {
    return undefined;
  }

  const survivalChoice = availableChoices.find((choice) =>
    choiceHelpsCurrentProblem(state, choice),
  );

  return (
    survivalChoice ?? availableChoices[Math.floor(random() * availableChoices.length)]
  );
};

const choiceHelpsCurrentProblem = (state: FrontierReckoningData, choice: EventChoice) => {
  const effects = choice.effects;

  return (
    (state.food < 45 && (effects.resources?.food ?? 0) > 0) ||
    (state.medicine < 3 && (effects.resources?.medicine ?? 0) > 0) ||
    (state.ammo < 10 && (effects.resources?.ammo ?? 0) > 0) ||
    (state.wagonParts < 2 && (effects.wagonParts ?? 0) > 0) ||
    (state.wagonCondition < 60 && (effects.wagonCondition ?? 0) > 0) ||
    (state.morale < 45 && (effects.morale ?? 0) > 0)
  );
};

const resolveEvent = (
  state: FrontierReckoningData,
  event: GameEvent,
  random: () => number,
) => {
  const choice = chooseEventChoice(state, event, random);
  const nextState = choice
    ? applyEventChoice(state, event, choice.id)
    : applyEventEffects(state, event.effects);

  return finishIfGameOver({
    ...nextState,
    currentEvent: null,
    eventResolved: false,
    gameStatus: nextState.gameStatus === 'game_over' ? 'game_over' : 'traveling',
  });
};

const chooseRiverOption = (
  state: FrontierReckoningData,
  river: RiverCrossing,
  random: () => number,
) => {
  const availableOptions = river.options.filter(
    (option) => getRiverOptionAvailability(state, option).available,
  );
  const roll = random();

  return (
    (roll < 0.4 && availableOptions.find((option) => option.id === 'ferry')) ||
    (roll < 0.75 && availableOptions.find((option) => option.id === 'caulk')) ||
    (roll < 0.9 && availableOptions.find((option) => option.id === 'bridge')) ||
    availableOptions.find((option) => option.id === 'ford') ||
    availableOptions[0]
  );
};

const resolveRiver = (
  state: FrontierReckoningData,
  river: RiverCrossing,
  random: () => number,
) => {
  const option = chooseRiverOption(state, river, random);
  const result = crossRiver(state, river, option.id, random());

  return finishIfGameOver({
    ...result.state,
    currentRiver: null,
    riverResolved: false,
    riverOutcomeText: null,
    gameStatus: 'traveling',
  });
};

const visitTown = (state: FrontierReckoningData, town: Town) => {
  let nextState = state;

  if (nextState.wagonCondition < 65 && nextState.money >= town.repairCost) {
    nextState = repairWagonInTown(nextState, town).state;
  }

  while (nextState.food < 150 && nextState.money >= town.shop[0].buyPrice) {
    nextState = buyTownSupply(nextState, town, 'food').state;
  }

  if (nextState.medicine < 4 && nextState.money >= town.shop[1].buyPrice) {
    nextState = buyTownSupply(nextState, town, 'medicine').state;
  }

  if (nextState.ammo < 12 && nextState.money >= town.shop[2].buyPrice) {
    nextState = buyTownSupply(nextState, town, 'ammo').state;
  }

  if (nextState.wagonParts < 2 && nextState.money >= town.shop[3].buyPrice) {
    nextState = buyTownSupply(nextState, town, 'wagonParts').state;
  }

  return {
    ...nextState,
    currentTown: null,
    visitedTownIds: [...nextState.visitedTownIds, town.id],
    gameStatus: 'traveling' as const,
  };
};

const campIfNeeded = (state: FrontierReckoningData, random: () => number) => {
  if (state.food >= 35 || state.ammo < 3) {
    return state;
  }

  return finishIfGameOver(
    huntAtCamp({ ...state, gameStatus: 'camp' }, 3, random()).state,
  );
};

const simulateRun = (seed: number): SimulationResult => {
  const random = createSeededRandom(seed);
  let state = createStartingGameState();
  const snapshots: FrontierReckoningData[] = [state];

  for (let turn = 0; turn < 220 && !isTerminal(state); turn += 1) {
    state = campIfNeeded(state, random);

    if (isTerminal(state)) {
      break;
    }

    state = applyDailyTravel({ ...state, gameStatus: 'traveling' }, random());
    state = finishIfGameOver(state);

    const town = getPendingTown(state, towns);
    if (!isTerminal(state) && town) {
      state = visitTown({ ...state, currentTown: town, gameStatus: 'town' }, town);
    }

    const river = getPendingRiverCrossing(state, riverCrossings);
    if (!isTerminal(state) && river) {
      state = resolveRiver(
        { ...state, currentRiver: river, gameStatus: 'river' },
        river,
        random,
      );
    }

    if (!isTerminal(state) && shouldTriggerTravelEvent(state, random())) {
      state = resolveEvent(state, pickWeightedEvent(starterEvents, random()), random);
    }

    snapshots.push(state);
  }

  return { finalState: state, snapshots };
};

describe('gameplay balance simulations', () => {
  it('produces both winning and losing runs across seeded simulations', () => {
    const results = Array.from({ length: 100 }, (_, index) => simulateRun(index + 1));
    const wins = results.filter((result) => result.finalState.gameStatus === 'victory');
    const losses = results.filter(
      (result) => result.finalState.gameStatus === 'game_over',
    );

    expect(wins.length).toBeGreaterThan(10);
    expect(losses.length).toBeGreaterThan(10);
    expect(wins.length).toBeLessThan(90);
  });

  it('trends resources downward without producing invalid resource values', () => {
    const results = Array.from({ length: 100 }, (_, index) => simulateRun(index + 101));
    const startingSupply = supplyTotal(createStartingGameState());
    const averageFinalSupply =
      results.reduce((total, result) => total + supplyTotal(result.finalState), 0) /
      results.length;

    expect(averageFinalSupply).toBeLessThan(startingSupply);

    for (const { snapshots } of results) {
      for (const snapshot of snapshots) {
        for (const value of [
          snapshot.food,
          snapshot.medicine,
          snapshot.ammo,
          snapshot.wagonParts,
          snapshot.money,
          snapshot.morale,
          snapshot.health,
          snapshot.wagonCondition,
        ]) {
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
