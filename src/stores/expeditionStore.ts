import { create } from 'zustand';
import { riverCrossings } from '@game/data/riverCrossings';
import { starterEvents } from '@game/data/starterEvents';
import { createStartingParty } from '@game/data/starterCharacters';
import { towns } from '@game/data/towns';
import {
  rationFoodAtCamp,
  repairWagonAtCamp,
  restAtCamp,
  tellCampfireStoriesAtCamp,
  treatPartyMemberAtCamp,
} from '@game/systems/campSystem';
import {
  applyEventChoice,
  applyEventEffects,
  getChoiceAvailability,
  pickWeightedEvent,
  shouldTriggerTravelEvent,
} from '@game/systems/eventSystem';
import { getGameOverReason, type GameOverReason } from '@game/systems/endingSystem';
import { huntAtCamp, type HuntingAmmoAmount } from '@game/systems/huntingSystem';
import {
  crossRiver,
  getPendingRiverCrossing,
  type RiverCrossingResult,
} from '@game/systems/riverSystem';
import {
  buyTownSupply,
  getPendingTown,
  hearTownRumor,
  recruitPartyMember,
  repairWagonInTown,
  restAtInn,
  sellTownSupply,
} from '@game/systems/townSystem';
import { applyDailyTravel } from '@game/systems/travelSystem';
import type { Character } from '@game/types/character';
import type { GameEvent } from '@game/types/event';
import type { RiverCrossing, RiverCrossingOptionId } from '@game/types/river';
import type { ShopResource, Town } from '@game/types/town';

export type GameStatus =
  | 'not_started'
  | 'traveling'
  | 'event'
  | 'camp'
  | 'river'
  | 'town'
  | 'game_over'
  | 'victory';

export type ResourceName =
  | 'food'
  | 'medicine'
  | 'ammo'
  | 'wagonParts'
  | 'money'
  | 'morale'
  | 'health';

export type FrontierReckoningState = {
  currentDay: number;
  distanceTraveled: number;
  totalDistance: number;
  food: number;
  medicine: number;
  ammo: number;
  wagonParts: number;
  wagonCondition: number;
  money: number;
  morale: number;
  health: number;
  party: Character[];
  currentEvent: GameEvent | null;
  eventResolved: boolean;
  eventOutcomeText: string | null;
  campOutcomeText: string | null;
  currentRiver: RiverCrossing | null;
  riverResolved: boolean;
  riverOutcomeText: string | null;
  crossedRiverIds: string[];
  currentTown: Town | null;
  townOutcomeText: string | null;
  visitedTownIds: string[];
  daysSinceLastEvent: number;
  rationingDays: number;
  suppliesExhaustedDays: number;
  gameOverReason: GameOverReason | null;
  gameLog: string[];
  gameStatus: GameStatus;
  startGame: () => void;
  advanceDay: () => void;
  enterCamp: () => void;
  restAtCamp: () => void;
  repairWagonAtCamp: () => void;
  treatPartyMemberAtCamp: (id: string) => void;
  tellCampfireStoriesAtCamp: () => void;
  rationFoodAtCamp: () => void;
  huntAtCamp: (ammoSpent: HuntingAmmoAmount) => void;
  resumeTravel: () => void;
  resolveRiverCrossing: (optionId: RiverCrossingOptionId) => void;
  continueFromRiver: () => void;
  buySupplyInTown: (resource: ShopResource) => void;
  sellSupplyInTown: (resource: ShopResource) => void;
  restAtInn: () => void;
  repairWagonInTown: () => void;
  recruitPartyMember: () => void;
  hearTownRumor: () => void;
  resumeTrailFromTown: () => void;
  resolveCurrentEvent: (choiceId?: string) => void;
  continueFromEvent: () => void;
  updateResource: (resourceName: ResourceName, amount: number) => void;
  damageCharacter: (id: string, amount: number) => void;
  healCharacter: (id: string, amount: number) => void;
  updateCharacterMorale: (id: string, amount: number) => void;
  killCharacter: (id: string) => void;
  setGameStatus: (status: GameStatus) => void;
  resetGame: () => void;
};

export type FrontierReckoningData = Omit<
  FrontierReckoningState,
  | 'startGame'
  | 'advanceDay'
  | 'enterCamp'
  | 'restAtCamp'
  | 'repairWagonAtCamp'
  | 'treatPartyMemberAtCamp'
  | 'tellCampfireStoriesAtCamp'
  | 'rationFoodAtCamp'
  | 'huntAtCamp'
  | 'resumeTravel'
  | 'resolveRiverCrossing'
  | 'continueFromRiver'
  | 'buySupplyInTown'
  | 'sellSupplyInTown'
  | 'restAtInn'
  | 'repairWagonInTown'
  | 'recruitPartyMember'
  | 'hearTownRumor'
  | 'resumeTrailFromTown'
  | 'resolveCurrentEvent'
  | 'continueFromEvent'
  | 'updateResource'
  | 'damageCharacter'
  | 'healCharacter'
  | 'updateCharacterMorale'
  | 'killCharacter'
  | 'setGameStatus'
  | 'resetGame'
>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const initialGameState: FrontierReckoningData = {
  currentDay: 0,
  distanceTraveled: 0,
  totalDistance: 2000,
  food: 0,
  medicine: 0,
  ammo: 0,
  wagonParts: 0,
  wagonCondition: 100,
  money: 0,
  morale: 100,
  health: 100,
  party: [],
  currentEvent: null,
  eventResolved: false,
  eventOutcomeText: null,
  campOutcomeText: null,
  currentRiver: null,
  riverResolved: false,
  riverOutcomeText: null,
  crossedRiverIds: [],
  currentTown: null,
  townOutcomeText: null,
  visitedTownIds: [],
  daysSinceLastEvent: 0,
  rationingDays: 0,
  suppliesExhaustedDays: 0,
  gameOverReason: null,
  gameLog: [],
  gameStatus: 'not_started',
};

export const createStartingGameState = (): FrontierReckoningData => ({
  ...initialGameState,
  currentDay: 1,
  food: 100,
  medicine: 5,
  ammo: 40,
  wagonParts: 3,
  wagonCondition: 100,
  money: 200,
  morale: 75,
  party: createStartingParty(),
  gameStatus: 'traveling',
});

export const startingGameState = createStartingGameState();

const withLog = <T extends FrontierReckoningData>(state: T, message: string): T => ({
  ...state,
  gameLog: [message, ...state.gameLog].slice(0, 20),
});

export const useExpeditionStore = create<FrontierReckoningState>((set) => ({
  ...initialGameState,
  startGame: () => set(() => withLog(createStartingGameState(), 'Expedition started.')),
  advanceDay: () =>
    set((state) => {
      const nextState = applyDailyTravel(state);
      const gameOverReason = getGameOverReason(nextState);

      if (gameOverReason) {
        return withLog(
          {
            ...nextState,
            gameOverReason,
            gameStatus: 'game_over',
          },
          'The expedition ended.',
        );
      }

      const pendingTown = getPendingTown(nextState, towns);

      if (pendingTown && nextState.gameStatus === 'traveling') {
        return withLog(
          {
            ...nextState,
            currentTown: pendingTown,
            townOutcomeText: `Arrived at ${pendingTown.name}.`,
            gameStatus: 'town',
          },
          `Arrived at ${pendingTown.name}.`,
        );
      }

      const pendingRiver = getPendingRiverCrossing(nextState, riverCrossings);

      if (pendingRiver && nextState.gameStatus === 'traveling') {
        return withLog(
          {
            ...nextState,
            currentRiver: pendingRiver,
            riverResolved: false,
            riverOutcomeText: null,
            gameStatus: 'river',
          },
          `Reached ${pendingRiver.name}.`,
        );
      }

      if (shouldTriggerTravelEvent(nextState)) {
        const currentEvent = pickWeightedEvent(starterEvents);

        return withLog(
          {
            ...nextState,
            currentEvent,
            eventResolved: false,
            eventOutcomeText: null,
            daysSinceLastEvent: 0,
            gameStatus: 'event',
          },
          `Event encountered: ${currentEvent.title}.`,
        );
      }

      return withLog(nextState, `Traveled to day ${nextState.currentDay}.`);
    }),
  enterCamp: () =>
    set((state) =>
      state.gameStatus === 'traveling'
        ? {
            ...state,
            campOutcomeText: 'The caravan makes camp.',
            gameLog: ['The caravan made camp.', ...state.gameLog].slice(0, 20),
            gameStatus: 'camp',
          }
        : state,
    ),
  restAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = restAtCamp(state);

      return withLog(
        { ...result.state, campOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  repairWagonAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = repairWagonAtCamp(state);

      return withLog(
        { ...result.state, campOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  treatPartyMemberAtCamp: (id) =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = treatPartyMemberAtCamp(state, id);

      return withLog(
        { ...result.state, campOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  tellCampfireStoriesAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = tellCampfireStoriesAtCamp(state);

      return withLog(
        { ...result.state, campOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  rationFoodAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = rationFoodAtCamp(state);

      return withLog(
        { ...result.state, campOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  huntAtCamp: (ammoSpent) =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = huntAtCamp(state, ammoSpent);
      const foodMessage =
        result.foodGained > 0 ? ` Food gained: ${result.foodGained}.` : '';

      return {
        ...result.state,
        campOutcomeText: `${result.outcomeText}${foodMessage}`,
        gameLog: [`${result.outcomeText}${foodMessage}`, ...state.gameLog].slice(0, 20),
      };
    }),
  resumeTravel: () =>
    set((state) =>
      state.gameStatus === 'camp'
        ? {
            ...state,
            campOutcomeText: 'The caravan breaks camp and resumes travel.',
            gameLog: ['The caravan resumed travel.', ...state.gameLog].slice(0, 20),
            gameStatus: 'traveling',
          }
        : state,
    ),
  resolveRiverCrossing: (optionId) =>
    set((state) => {
      if (state.gameStatus !== 'river' || !state.currentRiver || state.riverResolved) {
        return state;
      }

      const result: RiverCrossingResult = crossRiver(state, state.currentRiver, optionId);

      return {
        ...result.state,
        riverOutcomeText: result.outcomeText,
        gameLog: [result.outcomeText, ...state.gameLog].slice(0, 20),
      };
    }),
  continueFromRiver: () =>
    set((state) => {
      if (state.gameStatus !== 'river' || !state.riverResolved) {
        return state;
      }

      return {
        ...state,
        currentRiver: null,
        riverResolved: false,
        riverOutcomeText: null,
        gameLog: ['The caravan moved beyond the river crossing.', ...state.gameLog].slice(
          0,
          20,
        ),
        gameStatus: 'traveling',
      };
    }),
  buySupplyInTown: (resource) =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      const result = buyTownSupply(state, state.currentTown, resource);

      return withLog(
        { ...result.state, townOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  sellSupplyInTown: (resource) =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      const result = sellTownSupply(state, state.currentTown, resource);

      return withLog(
        { ...result.state, townOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  restAtInn: () =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      const result = restAtInn(state, state.currentTown);

      return withLog(
        { ...result.state, townOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  repairWagonInTown: () =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      const result = repairWagonInTown(state, state.currentTown);

      return withLog(
        { ...result.state, townOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  recruitPartyMember: () =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      const result = recruitPartyMember(state, state.currentTown);

      return withLog(
        { ...result.state, townOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  hearTownRumor: () =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      const result = hearTownRumor(state, state.currentTown);

      return withLog(
        { ...result.state, townOutcomeText: result.outcomeText },
        result.outcomeText,
      );
    }),
  resumeTrailFromTown: () =>
    set((state) => {
      if (state.gameStatus !== 'town' || !state.currentTown) {
        return state;
      }

      return {
        ...state,
        visitedTownIds: [...state.visitedTownIds, state.currentTown.id],
        currentTown: null,
        townOutcomeText: null,
        gameLog: [`Left ${state.currentTown.name}.`, ...state.gameLog].slice(0, 20),
        gameStatus: 'traveling',
      };
    }),
  resolveCurrentEvent: (choiceId) =>
    set((state) => {
      if (!state.currentEvent || state.eventResolved) {
        return state;
      }

      if (state.currentEvent.choices?.length && !choiceId) {
        return state;
      }

      const choice = choiceId
        ? state.currentEvent.choices?.find((eventChoice) => eventChoice.id === choiceId)
        : undefined;

      if (choice && !getChoiceAvailability(state, choice).available) {
        return state;
      }

      const nextState = choiceId
        ? applyEventChoice(state, state.currentEvent, choiceId)
        : applyEventEffects(state, state.currentEvent.effects);

      return {
        ...nextState,
        currentEvent: state.currentEvent,
        eventResolved: true,
        eventOutcomeText: choice?.outcomeText ?? 'The caravan absorbs the consequences.',
        gameLog: [
          choice?.outcomeText ?? 'The caravan absorbs the consequences.',
          ...state.gameLog,
        ].slice(0, 20),
        gameStatus: nextState.gameStatus === 'game_over' ? 'game_over' : 'event',
      };
    }),
  continueFromEvent: () =>
    set((state) => {
      if (!state.currentEvent || !state.eventResolved) {
        return state;
      }

      return {
        ...state,
        currentEvent: null,
        eventResolved: false,
        eventOutcomeText: null,
        gameLog: ['The caravan continued after the event.', ...state.gameLog].slice(
          0,
          20,
        ),
        gameStatus: state.gameStatus === 'game_over' ? 'game_over' : 'traveling',
      };
    }),
  updateResource: (resourceName, amount) =>
    set((state) => {
      const nextValue = state[resourceName] + amount;
      const upperLimit =
        resourceName === 'morale' || resourceName === 'health'
          ? 100
          : Number.POSITIVE_INFINITY;

      return {
        [resourceName]: clamp(nextValue, 0, upperLimit),
      } as Pick<FrontierReckoningState, ResourceName>;
    }),
  damageCharacter: (id, amount) =>
    set((state) => ({
      party: state.party.map((character) => {
        if (character.id !== id || character.status === 'dead') {
          return character;
        }

        const health = clamp(character.health - amount, 0, 100);

        return {
          ...character,
          health,
          status: health === 0 ? 'dead' : 'injured',
        };
      }),
    })),
  healCharacter: (id, amount) =>
    set((state) => ({
      party: state.party.map((character) => {
        if (character.id !== id || character.status === 'dead') {
          return character;
        }

        const health = clamp(character.health + amount, 0, 100);

        return {
          ...character,
          health,
          status: health === 100 ? 'healthy' : character.status,
        };
      }),
    })),
  updateCharacterMorale: (id, amount) =>
    set((state) => ({
      party: state.party.map((character) =>
        character.id === id
          ? { ...character, morale: clamp(character.morale + amount, 0, 100) }
          : character,
      ),
    })),
  killCharacter: (id) =>
    set((state) => ({
      party: state.party.map((character) =>
        character.id === id
          ? { ...character, health: 0, morale: 0, status: 'dead' }
          : character,
      ),
    })),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  resetGame: () => set(initialGameState),
}));
