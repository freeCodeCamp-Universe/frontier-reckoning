import type {
  FrontierReckoningData,
  FrontierReckoningState,
} from '@stores/expeditionStore';
import { CURRENT_SAVE_VERSION, migrateSave, type GameSave } from '@stores/saveMigrations';

export const SAVE_STORAGE_KEY = 'frontier-reckoning-save';
export const SAVE_VERSION = CURRENT_SAVE_VERSION;

export type LoadSaveResult =
  | { status: 'loaded'; save: GameSave }
  | { status: 'empty' }
  | { status: 'invalid'; message?: string }
  | { status: 'unsupported'; saveVersion: number; message?: string };

const dataKeys = [
  'expeditionName',
  'difficulty',
  'currentDay',
  'distanceTraveled',
  'totalDistance',
  'food',
  'medicine',
  'ammo',
  'wagonParts',
  'wagonCondition',
  'money',
  'morale',
  'health',
  'party',
  'currentEvent',
  'eventResolved',
  'eventOutcomeText',
  'campOutcomeText',
  'currentRiver',
  'riverResolved',
  'riverOutcomeText',
  'crossedRiverIds',
  'currentTown',
  'townOutcomeText',
  'visitedTownIds',
  'daysSinceLastEvent',
  'rationingDays',
  'suppliesExhaustedDays',
  'gameOverReason',
  'temporaryModifiers',
  'gameLog',
  'gameStatus',
] as const satisfies Array<keyof FrontierReckoningData>;

export function extractSaveData(state: FrontierReckoningState): FrontierReckoningData {
  return Object.fromEntries(
    dataKeys.map((key) => [key, state[key]]),
  ) as FrontierReckoningData;
}

export function createGameSave(state: FrontierReckoningState): GameSave {
  return {
    saveVersion: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state: extractSaveData(state),
    settings: getSaveSettings(),
    discoveredLandmarks: [
      ...new Set(
        [
          ...state.visitedTownIds,
          ...state.crossedRiverIds,
          state.currentTown?.id,
          state.currentRiver?.id,
        ].filter((landmarkId): landmarkId is string => typeof landmarkId === 'string'),
      ),
    ],
  };
}

function getSaveSettings(): GameSave['settings'] {
  const defaultSettings: GameSave['settings'] = {
    soundEnabled: false,
    musicVolume: 50,
    sfxVolume: 70,
    reducedMotion: false,
    textSpeed: 'normal',
    autosaveEnabled: true,
    difficultyDisplay: true,
  };

  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(window.localStorage.getItem('frontier-reckoning-settings') ?? '{}'),
    };
  } catch {
    return defaultSettings;
  }
}

export function serializeGameSave(state: FrontierReckoningState) {
  return JSON.stringify(createGameSave(state));
}

export function isSaveableState(state: FrontierReckoningData) {
  return state.gameStatus !== 'not_started' || state.currentDay > 0;
}

export function validateGameSave(value: unknown): LoadSaveResult {
  const result = migrateSave(value);

  if (result.status === 'migrated') {
    return { status: 'loaded', save: result.save };
  }

  return result;
}

export function saveGameToStorage(
  storage: Pick<Storage, 'setItem'>,
  state: FrontierReckoningState,
) {
  storage.setItem(SAVE_STORAGE_KEY, serializeGameSave(state));
}

export function loadGameFromStorage(storage: Pick<Storage, 'getItem'>): LoadSaveResult {
  const rawSave = storage.getItem(SAVE_STORAGE_KEY);

  if (!rawSave) {
    return { status: 'empty' };
  }

  try {
    return validateGameSave(JSON.parse(rawSave));
  } catch {
    return { status: 'invalid' };
  }
}

export function clearSaveFromStorage(storage: Pick<Storage, 'removeItem'>) {
  storage.removeItem(SAVE_STORAGE_KEY);
}

export function hasSave(storage: Pick<Storage, 'getItem'>) {
  return storage.getItem(SAVE_STORAGE_KEY) !== null;
}
