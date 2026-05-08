import type {
  FrontierReckoningData,
  FrontierReckoningState,
} from '@stores/expeditionStore';

export const SAVE_STORAGE_KEY = 'frontier-reckoning-save';
export const SAVE_VERSION = 1;

export type GameSave = {
  saveVersion: typeof SAVE_VERSION;
  savedAt: string;
  state: FrontierReckoningData;
};

export type LoadSaveResult =
  | { status: 'loaded'; save: GameSave }
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'unsupported'; saveVersion: number };

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
  'gameLog',
  'gameStatus',
] as const satisfies Array<keyof FrontierReckoningData>;

const numberKeys: Array<keyof FrontierReckoningData> = [
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
  'daysSinceLastEvent',
  'rationingDays',
  'suppliesExhaustedDays',
];

const validStatuses = new Set([
  'not_started',
  'traveling',
  'event',
  'camp',
  'river',
  'town',
  'game_over',
  'victory',
]);

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
  };
}

export function serializeGameSave(state: FrontierReckoningState) {
  return JSON.stringify(createGameSave(state));
}

export function isSaveableState(state: FrontierReckoningData) {
  return state.gameStatus !== 'not_started' || state.currentDay > 0;
}

export function validateGameSave(value: unknown): LoadSaveResult {
  if (!value || typeof value !== 'object') {
    return { status: 'invalid' };
  }

  const maybeSave = value as Partial<GameSave> & { saveVersion?: unknown };

  if (typeof maybeSave.saveVersion !== 'number') {
    return { status: 'invalid' };
  }

  if (maybeSave.saveVersion !== SAVE_VERSION) {
    return { status: 'unsupported', saveVersion: maybeSave.saveVersion };
  }

  if (!maybeSave.state || typeof maybeSave.state !== 'object') {
    return { status: 'invalid' };
  }

  const state = maybeSave.state as Partial<FrontierReckoningData>;

  for (const key of numberKeys) {
    if (typeof state[key] !== 'number') {
      return { status: 'invalid' };
    }
  }

  if (!Array.isArray(state.party)) {
    return { status: 'invalid' };
  }

  if (
    !Array.isArray(state.crossedRiverIds) ||
    !Array.isArray(state.visitedTownIds) ||
    !Array.isArray(state.gameLog)
  ) {
    return { status: 'invalid' };
  }

  if (
    typeof state.eventResolved !== 'boolean' ||
    typeof state.riverResolved !== 'boolean'
  ) {
    return { status: 'invalid' };
  }

  if (typeof state.gameStatus !== 'string' || !validStatuses.has(state.gameStatus)) {
    return { status: 'invalid' };
  }

  if (
    typeof state.expeditionName !== 'string' ||
    (state.difficulty !== 'greenhorn' &&
      state.difficulty !== 'trailwise' &&
      state.difficulty !== 'reckoning')
  ) {
    return { status: 'invalid' };
  }

  return {
    status: 'loaded',
    save: maybeSave as GameSave,
  };
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
