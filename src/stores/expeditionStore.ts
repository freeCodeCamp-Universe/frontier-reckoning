import { create } from 'zustand';
import { createStartingParty } from '@game/data/starterCharacters';
import type { Character } from '@game/types/character';

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
  money: number;
  morale: number;
  health: number;
  party: Character[];
  gameStatus: GameStatus;
  startGame: () => void;
  advanceDay: () => void;
  updateResource: (resourceName: ResourceName, amount: number) => void;
  damageCharacter: (id: string, amount: number) => void;
  healCharacter: (id: string, amount: number) => void;
  updateCharacterMorale: (id: string, amount: number) => void;
  killCharacter: (id: string) => void;
  setGameStatus: (status: GameStatus) => void;
  resetGame: () => void;
};

type FrontierReckoningData = Omit<
  FrontierReckoningState,
  | 'startGame'
  | 'advanceDay'
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
  money: 0,
  morale: 100,
  health: 100,
  party: [],
  gameStatus: 'not_started',
};

export const createStartingGameState = (): FrontierReckoningData => ({
  ...initialGameState,
  currentDay: 1,
  food: 100,
  medicine: 5,
  ammo: 40,
  wagonParts: 3,
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
      const distanceTraveled = Math.min(
        state.distanceTraveled + 20,
        state.totalDistance,
      );

      return {
        currentDay: state.currentDay + 1,
        distanceTraveled,
        gameStatus:
          distanceTraveled >= state.totalDistance ? 'victory' : state.gameStatus,
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
