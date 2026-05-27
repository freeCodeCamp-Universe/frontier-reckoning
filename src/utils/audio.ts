import {
  audioSystem,
  type AudioCategory,
} from '@game/systems/audioSystem';
import { getStoredSettings, updateStoredSettings } from '@game/systems/settingsSystem';

export const AUDIO_ENABLED_STORAGE_KEY = 'frontier-reckoning-audio-enabled';
export const AMBIENCE_ENABLED_STORAGE_KEY = 'frontier-reckoning-ambience-enabled';

export type AudioCue = 'button' | 'event' | 'victory' | 'game_over';

const cueCategoryMap: Record<AudioCue, AudioCategory> = {
  button: 'button_click',
  event: 'event_alert',
  victory: 'victory',
  game_over: 'game_over',
};

function syncAudioSystemFromStorage() {
  const settings = getStoredSettings(window.localStorage);

  audioSystem.updateSettings({
    soundEnabled: settings.soundEnabled,
    musicVolume: settings.musicVolume,
    sfxVolume: settings.sfxVolume,
  });

  return settings;
}

export function getStoredAudioEnabled(storage: Pick<Storage, 'getItem'>) {
  return getStoredSettings(storage).soundEnabled;
}

export function setStoredAudioEnabled(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  enabled: boolean,
) {
  storage.setItem(AUDIO_ENABLED_STORAGE_KEY, String(enabled));
  updateStoredSettings(storage, { soundEnabled: enabled });
}

export function getStoredAmbienceEnabled(storage: Pick<Storage, 'getItem'>) {
  return storage.getItem(AMBIENCE_ENABLED_STORAGE_KEY) === 'true';
}

export function setStoredAmbienceEnabled(
  storage: Pick<Storage, 'setItem'>,
  enabled: boolean,
) {
  storage.setItem(AMBIENCE_ENABLED_STORAGE_KEY, String(enabled));
}

export function playAudioCue(
  cue: AudioCue,
  enabled = getStoredAudioEnabled(window.localStorage),
) {
  const settings = syncAudioSystemFromStorage();

  if (!enabled || settings.sfxVolume <= 0) {
    return;
  }

  void audioSystem.playSfx(cueCategoryMap[cue]);
}

export function startAmbience(enabled = getStoredAudioEnabled(window.localStorage)) {
  const settings = syncAudioSystemFromStorage();

  if (!enabled || settings.musicVolume <= 0) {
    return;
  }

  void audioSystem.playAmbience('trail_ambience');
}

export function stopAmbience() {
  audioSystem.stopAmbience();
}
