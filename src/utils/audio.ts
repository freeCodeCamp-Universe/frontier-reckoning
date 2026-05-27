import { getStoredSettings, updateStoredSettings } from '@game/systems/settingsSystem';

export const AUDIO_ENABLED_STORAGE_KEY = 'frontier-reckoning-audio-enabled';
export const AMBIENCE_ENABLED_STORAGE_KEY = 'frontier-reckoning-ambience-enabled';

export type AudioCue = 'button' | 'event' | 'victory' | 'game_over';

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;
let ambienceOscillator: OscillatorNode | null = null;
let ambienceGain: GainNode | null = null;

const cueFrequencies: Record<AudioCue, number[]> = {
  button: [440],
  event: [220, 330],
  victory: [392, 523, 659],
  game_over: [196, 165],
};

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

function getAudioContext() {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextConstructor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  try {
    audioContext = new AudioContextConstructor();
    return audioContext;
  } catch {
    return null;
  }
}

export function playAudioCue(
  cue: AudioCue,
  enabled = getStoredAudioEnabled(window.localStorage),
) {
  const settings = getStoredSettings(window.localStorage);

  if (!enabled || settings.sfxVolume <= 0) {
    return;
  }

  try {
    const context = getAudioContext();

    if (!context) {
      return;
    }

    const startTime = context.currentTime;

    cueFrequencies[cue].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const noteStart = startTime + index * 0.08;
      const noteEnd = noteStart + 0.08;

      oscillator.type = cue === 'game_over' ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(
        0.04 * (settings.sfxVolume / 100),
        noteStart + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.02);
    });
  } catch {
    // Audio is decorative. If the browser blocks or fails it, gameplay continues silently.
  }
}

export function startAmbience(enabled = getStoredAudioEnabled(window.localStorage)) {
  const settings = getStoredSettings(window.localStorage);

  if (!enabled || settings.musicVolume <= 0 || ambienceOscillator) {
    return;
  }

  try {
    const context = getAudioContext();

    if (!context) {
      return;
    }

    ambienceOscillator = context.createOscillator();
    ambienceGain = context.createGain();
    ambienceOscillator.type = 'sine';
    ambienceOscillator.frequency.setValueAtTime(82, context.currentTime);
    ambienceGain.gain.setValueAtTime(
      0.015 * (settings.musicVolume / 100),
      context.currentTime,
    );
    ambienceOscillator.connect(ambienceGain);
    ambienceGain.connect(context.destination);
    ambienceOscillator.start();
  } catch {
    ambienceOscillator = null;
    ambienceGain = null;
  }
}

export function stopAmbience() {
  try {
    ambienceOscillator?.stop();
    ambienceOscillator?.disconnect();
    ambienceGain?.disconnect();
  } catch {
    // Stopping ambience should never interrupt gameplay.
  } finally {
    ambienceOscillator = null;
    ambienceGain = null;
  }
}
