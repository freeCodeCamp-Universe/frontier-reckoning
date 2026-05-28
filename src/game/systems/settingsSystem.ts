import { clearSaveFromStorage } from '@game/systems/saveSystem';

export const SETTINGS_STORAGE_KEY = 'frontier-reckoning-settings';
export const SETTINGS_CHANGED_EVENT = 'frontier-reckoning-settings-changed';

export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export type FrontierSettings = {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
  textSpeed: TextSpeed;
  autosaveEnabled: boolean;
  difficultyDisplay: boolean;
};

export const defaultSettings: FrontierSettings = {
  soundEnabled: false,
  musicVolume: 50,
  sfxVolume: 70,
  reducedMotion: false,
  textSpeed: 'normal',
  autosaveEnabled: true,
  difficultyDisplay: true,
};

const validTextSpeeds = new Set<TextSpeed>(['slow', 'normal', 'fast', 'instant']);

const clampVolume = (value: unknown, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(value), 0), 100);
};

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
    musicVolume: clampVolume(maybeSettings.musicVolume, defaultSettings.musicVolume),
    sfxVolume: clampVolume(maybeSettings.sfxVolume, defaultSettings.sfxVolume),
    reducedMotion:
      typeof maybeSettings.reducedMotion === 'boolean'
        ? maybeSettings.reducedMotion
        : defaultSettings.reducedMotion,
    textSpeed:
      typeof maybeSettings.textSpeed === 'string' &&
      validTextSpeeds.has(maybeSettings.textSpeed as TextSpeed)
        ? (maybeSettings.textSpeed as TextSpeed)
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

export function getStoredSettings(storage: Pick<Storage, 'getItem'>): FrontierSettings {
  const rawSettings = storage.getItem(SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    return defaultSettings;
  }

  try {
    return normalizeSettings(JSON.parse(rawSettings));
  } catch {
    return defaultSettings;
  }
}

export function setStoredSettings(
  storage: Pick<Storage, 'setItem'>,
  settings: FrontierSettings,
) {
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
  dispatchSettingsChanged();
}

export function updateStoredSettings(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  updates: Partial<FrontierSettings>,
) {
  const nextSettings = normalizeSettings({
    ...getStoredSettings(storage),
    ...updates,
  });

  setStoredSettings(storage, nextSettings);

  return nextSettings;
}

export function getEffectiveReducedMotion(
  storage: Pick<Storage, 'getItem'>,
  prefersReducedMotion = false,
) {
  return getStoredSettings(storage).reducedMotion || prefersReducedMotion;
}

export function resetSaveData(storage: Pick<Storage, 'removeItem'>) {
  clearSaveFromStorage(storage);
}

export function dispatchSettingsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
  }
}
