import { create } from 'zustand';
import { starterEvents } from '@game/data/starterEvents';
import { createStartingParty } from '@game/data/starterCharacters';
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
import { huntAtCamp, type HuntingAmmoAmount } from '@game/systems/huntingSystem';
import { applyDailyTravel } from '@game/systems/travelSystem';
import type { Character } from '@game/types/character';
import type { GameEvent } from '@game/types/event';

export type GameStatus =
  | 'not_started'
  | 'traveling'
  | 'event'
  | 'camp'
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
  daysSinceLastEvent: number;
  rationingDays: number;
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
  daysSinceLastEvent: 0,
  rationingDays: 0,
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

export const useExpeditionStore = create<FrontierReckoningState>((set) => ({
  ...initialGameState,
  startGame: () => set(createStartingGameState()),
  advanceDay: () =>
    set((state) => {
      const nextState = applyDailyTravel(state);

      if (shouldTriggerTravelEvent(nextState)) {
        return {
          ...nextState,
          currentEvent: pickWeightedEvent(starterEvents),
          eventResolved: false,
          eventOutcomeText: null,
          daysSinceLastEvent: 0,
          gameStatus: 'event',
        };
      }

      return nextState;
    }),
  enterCamp: () =>
    set((state) =>
      state.gameStatus === 'traveling'
        ? {
            ...state,
            campOutcomeText: 'The caravan makes camp.',
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

      return { ...result.state, campOutcomeText: result.outcomeText };
    }),
  repairWagonAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = repairWagonAtCamp(state);

      return { ...result.state, campOutcomeText: result.outcomeText };
    }),
  treatPartyMemberAtCamp: (id) =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = treatPartyMemberAtCamp(state, id);

      return { ...result.state, campOutcomeText: result.outcomeText };
    }),
  tellCampfireStoriesAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = tellCampfireStoriesAtCamp(state);

      return { ...result.state, campOutcomeText: result.outcomeText };
    }),
  rationFoodAtCamp: () =>
    set((state) => {
      if (state.gameStatus !== 'camp') {
        return state;
      }

      const result = rationFoodAtCamp(state);

      return { ...result.state, campOutcomeText: result.outcomeText };
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
      };
    }),
  resumeTravel: () =>
    set((state) =>
      state.gameStatus === 'camp'
        ? {
            ...state,
            campOutcomeText: 'The caravan breaks camp and resumes travel.',
            gameStatus: 'traveling',
          }
        : state,
    ),
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
