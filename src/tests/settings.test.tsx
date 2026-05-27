import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@app/App';
import { SettingsModal } from '@components/SettingsModal';
import { saveGameToStorage, SAVE_STORAGE_KEY } from '@game/systems/saveSystem';
import {
  getEffectiveReducedMotion,
  getStoredSettings,
  SETTINGS_STORAGE_KEY,
  updateStoredSettings,
} from '@game/systems/settingsSystem';
import { shouldAnimateWagon } from '@game/systems/mapProgress';
import { useExpeditionStore } from '@stores/expeditionStore';
import { playAudioCue } from '@utils/audio';

vi.mock('@components/PhaserGame', () => ({
  PhaserGame: () => <div data-testid="phaser-game" />,
}));

describe('settings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders from the main menu and active game', async () => {
    const { unmount } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('dialog', { name: 'Frontier Settings' })).toBeInTheDocument();
    expect(screen.getByLabelText('Sound on or off')).toBeInTheDocument();
    expect(screen.getByLabelText('Music volume')).toBeInTheDocument();
    expect(screen.getByLabelText('SFX volume')).toBeInTheDocument();
    expect(screen.getByLabelText('Reduced motion')).toBeInTheDocument();
    expect(screen.getByLabelText('Text speed')).toBeInTheDocument();
    expect(screen.getByLabelText('Autosave on or off')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficulty display')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset save data' })).toBeInTheDocument();

    unmount();
    useExpeditionStore.getState().startGame();
    render(<App />);
    await screen.findByTestId('phaser-game');

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('dialog', { name: 'Frontier Settings' })).toBeInTheDocument();
  });

  it('persists settings after reload', () => {
    const { unmount } = render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByLabelText('Sound on or off'));
    fireEvent.change(screen.getByLabelText('Music volume'), {
      target: { value: '25' },
    });
    fireEvent.change(screen.getByLabelText('SFX volume'), {
      target: { value: '40' },
    });
    fireEvent.click(screen.getByLabelText('Reduced motion'));
    fireEvent.change(screen.getByLabelText('Text speed'), {
      target: { value: 'fast' },
    });
    fireEvent.click(screen.getByLabelText('Autosave on or off'));
    fireEvent.click(screen.getByLabelText('Difficulty display'));

    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).not.toBeNull();

    unmount();
    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(screen.getByLabelText('Sound on or off')).toBeChecked();
    expect(screen.getByLabelText('Music volume')).toHaveValue('25');
    expect(screen.getByLabelText('SFX volume')).toHaveValue('40');
    expect(screen.getByLabelText('Reduced motion')).toBeChecked();
    expect(screen.getByLabelText('Text speed')).toHaveValue('fast');
    expect(screen.getByLabelText('Autosave on or off')).not.toBeChecked();
    expect(screen.getByLabelText('Difficulty display')).not.toBeChecked();
  });

  it('uses sound settings in the audio system', () => {
    const createOscillator = vi.fn(() => ({
      connect: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
    }));
    const audioContext = vi.fn(() => ({
      currentTime: 0,
      destination: {},
      sampleRate: 120,
      state: 'running',
      createBiquadFilter: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'lowpass',
      })),
      createBuffer: vi.fn((_channels: number, length: number) => ({
        getChannelData: vi.fn(() => new Float32Array(length)),
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: {
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          setValueAtTime: vi.fn(),
          value: 0,
        },
      })),
      createOscillator,
      resume: vi.fn(() => Promise.resolve()),
    }));

    vi.stubGlobal('AudioContext', audioContext);

    updateStoredSettings(window.localStorage, {
      soundEnabled: false,
      sfxVolume: 50,
    });

    playAudioCue('button');

    expect(audioContext).not.toHaveBeenCalled();

    updateStoredSettings(window.localStorage, { soundEnabled: true });
    playAudioCue('button');

    expect(audioContext).toHaveBeenCalledTimes(1);
    expect(createOscillator).toHaveBeenCalled();
  });

  it('persists mute and volume settings', () => {
    updateStoredSettings(window.localStorage, {
      musicVolume: 18,
      sfxVolume: 33,
      soundEnabled: true,
    });

    expect(getStoredSettings(window.localStorage)).toMatchObject({
      musicVolume: 18,
      sfxVolume: 33,
      soundEnabled: true,
    });

    updateStoredSettings(window.localStorage, { soundEnabled: false });

    expect(getStoredSettings(window.localStorage)).toMatchObject({
      musicVolume: 18,
      sfxVolume: 33,
      soundEnabled: false,
    });
  });

  it('uses reduced motion settings for animation flags', () => {
    expect(getEffectiveReducedMotion(window.localStorage, false)).toBe(false);
    expect(
      shouldAnimateWagon(getEffectiveReducedMotion(window.localStorage, false)),
    ).toBe(true);

    updateStoredSettings(window.localStorage, { reducedMotion: true });

    expect(getStoredSettings(window.localStorage).reducedMotion).toBe(true);
    expect(getEffectiveReducedMotion(window.localStorage, false)).toBe(true);
    expect(
      shouldAnimateWagon(getEffectiveReducedMotion(window.localStorage, false)),
    ).toBe(false);
  });

  it('clears save data from settings reset', () => {
    useExpeditionStore.getState().startGame();
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reset save data' }));

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();
    expect(useExpeditionStore.getState().gameStatus).toBe('not_started');
  });
});
