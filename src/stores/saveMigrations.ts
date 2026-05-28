import type { FrontierReckoningData } from '@stores/expeditionStore';
import type { FrontierSettings } from '@game/systems/settingsSystem';

export const CURRENT_SAVE_VERSION = 2;

export type GameSave = {
  saveVersion: typeof CURRENT_SAVE_VERSION;
  savedAt: string;
  state: FrontierReckoningData;
  settings: FrontierSettings;
  discoveredLandmarks: string[];
};

export type MigrationResult =
  | { status: 'migrated'; save: GameSave }
  | { status: 'invalid'; message: string }
  | { status: 'unsupported'; saveVersion: number; message: string };

type RawSave = {
  saveVersion?: unknown;
  savedAt?: unknown;
  state?: unknown;
  settings?: unknown;
  discoveredLandmarks?: unknown;
};

type Migration = (save: RawSave) => RawSave;

const defaultSettings: FrontierSettings = {
  soundEnabled: false,
  musicVolume: 50,
  sfxVolume: 70,
  reducedMotion: false,
  textSpeed: 'normal',
  autosaveEnabled: true,
  difficultyDisplay: true,
};

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

export const migrations: Record<number, Migration> = {
  1: (save) => ({
    ...save,
    saveVersion: 2,
    settings: normalizeSettings(save.settings),
    discoveredLandmarks: normalizeStringArray(save.discoveredLandmarks),
    state: normalizeStateDefaults(save.state),
  }),
};

export function migrateSave(rawSave: unknown): MigrationResult {
  if (!rawSave || typeof rawSave !== 'object') {
    return { status: 'invalid', message: 'Save data is not an object.' };
  }

  let workingSave = rawSave as RawSave;

  if (typeof workingSave.saveVersion !== 'number') {
    return { status: 'invalid', message: 'Save data is missing a numeric version.' };
  }

  if (workingSave.saveVersion > CURRENT_SAVE_VERSION) {
    return {
      status: 'unsupported',
      saveVersion: workingSave.saveVersion,
      message: `Save version ${workingSave.saveVersion} is newer than this app supports.`,
    };
  }

  while (workingSave.saveVersion !== CURRENT_SAVE_VERSION) {
    const saveVersion = workingSave.saveVersion;

    if (typeof saveVersion !== 'number') {
      return { status: 'invalid', message: 'Migration produced an invalid version.' };
    }

    const migration = migrations[saveVersion];

    if (!migration) {
      return {
        status: 'unsupported',
        saveVersion,
        message: `No migration exists for save version ${saveVersion}.`,
      };
    }

    workingSave = migration(workingSave);
  }

  const normalizedSave = {
    ...workingSave,
    settings: normalizeSettings(workingSave.settings),
    discoveredLandmarks: normalizeStringArray(workingSave.discoveredLandmarks),
    state: normalizeStateDefaults(workingSave.state),
  };

  return validateMigratedSave(normalizedSave);
}

function validateMigratedSave(value: RawSave): MigrationResult {
  if (value.saveVersion !== CURRENT_SAVE_VERSION) {
    return {
      status: 'invalid',
      message: 'Save migration did not reach current version.',
    };
  }

  if (typeof value.savedAt !== 'string') {
    return { status: 'invalid', message: 'Save data is missing a saved timestamp.' };
  }

  if (!value.state || typeof value.state !== 'object') {
    return { status: 'invalid', message: 'Save data is missing game state.' };
  }

  const state = value.state as Partial<FrontierReckoningData>;

  for (const key of numberKeys) {
    if (typeof state[key] !== 'number') {
      return { status: 'invalid', message: `Save state has invalid ${key}.` };
    }
  }

  if (
    typeof state.expeditionName !== 'string' ||
    (state.difficulty !== 'greenhorn' &&
      state.difficulty !== 'trailwise' &&
      state.difficulty !== 'reckoning')
  ) {
    return { status: 'invalid', message: 'Save state has invalid expedition metadata.' };
  }

  if (
    typeof state.eventResolved !== 'boolean' ||
    typeof state.riverResolved !== 'boolean'
  ) {
    return { status: 'invalid', message: 'Save state has invalid resolution flags.' };
  }

  if (typeof state.gameStatus !== 'string' || !validStatuses.has(state.gameStatus)) {
    return { status: 'invalid', message: 'Save state has invalid game status.' };
  }

  if (
    !Array.isArray(state.party) ||
    !Array.isArray(state.crossedRiverIds) ||
    !Array.isArray(state.visitedTownIds) ||
    !Array.isArray(state.temporaryModifiers) ||
    !Array.isArray(state.gameLog)
  ) {
    return { status: 'invalid', message: 'Save state has invalid list fields.' };
  }

  if (!Array.isArray(value.discoveredLandmarks)) {
    return { status: 'invalid', message: 'Save data has invalid landmarks.' };
  }

  return {
    status: 'migrated',
    save: {
      saveVersion: CURRENT_SAVE_VERSION,
      savedAt: value.savedAt,
      state: state as FrontierReckoningData,
      settings: normalizeSettings(value.settings),
      discoveredLandmarks: value.discoveredLandmarks,
    },
  };
}

function normalizeStateDefaults(state: unknown) {
  if (!state || typeof state !== 'object') {
    return state;
  }

  const partialState = state as Partial<FrontierReckoningData>;

  return {
    ...partialState,
    temporaryModifiers: Array.isArray(partialState.temporaryModifiers)
      ? partialState.temporaryModifiers
      : [],
    crossedRiverIds: Array.isArray(partialState.crossedRiverIds)
      ? partialState.crossedRiverIds
      : [],
    visitedTownIds: Array.isArray(partialState.visitedTownIds)
      ? partialState.visitedTownIds
      : [],
    gameLog: Array.isArray(partialState.gameLog) ? partialState.gameLog : [],
  };
}

function normalizeSettings(value: unknown): FrontierSettings {
  if (!value || typeof value !== 'object') {
    return defaultSettings;
  }

  const maybeSettings = value as Partial<FrontierSettings>;

  return {
    soundEnabled:
      typeof maybeSettings.soundEnabled === 'boolean'
        ? maybeSettings.soundEnabled
        : defaultSettings.soundEnabled,
    musicVolume: normalizeVolume(maybeSettings.musicVolume, defaultSettings.musicVolume),
    sfxVolume: normalizeVolume(maybeSettings.sfxVolume, defaultSettings.sfxVolume),
    reducedMotion:
      typeof maybeSettings.reducedMotion === 'boolean'
        ? maybeSettings.reducedMotion
        : defaultSettings.reducedMotion,
    textSpeed:
      maybeSettings.textSpeed === 'slow' ||
      maybeSettings.textSpeed === 'normal' ||
      maybeSettings.textSpeed === 'fast' ||
      maybeSettings.textSpeed === 'instant'
        ? maybeSettings.textSpeed
        : defaultSettings.textSpeed,
    autosaveEnabled:
      typeof maybeSettings.autosaveEnabled === 'boolean'
        ? maybeSettings.autosaveEnabled
        : defaultSettings.autosaveEnabled,
    difficultyDisplay:
      typeof maybeSettings.difficultyDisplay === 'boolean'
        ? maybeSettings.difficultyDisplay
        : defaultSettings.difficultyDisplay,
  };
}

function normalizeVolume(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), 0), 100)
    : fallback;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
