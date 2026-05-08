import { create } from 'zustand';

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
  gameStatus: GameStatus;
  startGame: () => void;
  advanceDay: () => void;
  updateResource: (resourceName: ResourceName, amount: number) => void;
  setGameStatus: (status: GameStatus) => void;
  resetGame: () => void;
};

type FrontierReckoningData = Omit<
  FrontierReckoningState,
  'startGame' | 'advanceDay' | 'updateResource' | 'setGameStatus' | 'resetGame'
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
  gameStatus: 'not_started',
};

export const startingGameState: FrontierReckoningData = {
  currentDay: 1,
  distanceTraveled: 0,
  totalDistance: 2000,
  food: 100,
  medicine: 5,
  ammo: 40,
  wagonParts: 3,
  money: 200,
  morale: 75,
  health: 100,
  gameStatus: 'traveling',
};

export const useExpeditionStore = create<FrontierReckoningState>((set) => ({
  ...initialGameState,
  startGame: () => set(startingGameState),
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
  setGameStatus: (gameStatus) => set({ gameStatus }),
  resetGame: () => set(initialGameState),
}));
