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

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByLabelText('Sound on or off')).toBeInTheDocument();
    expect(screen.getByLabelText('Music volume')).toBeInTheDocument();
    expect(screen.getByLabelText('SFX volume')).toBeInTheDocument();
    expect(screen.getByLabelText('Reduced motion')).toBeInTheDocument();
    expect(screen.getByLabelText('Text speed')).toBeInTheDocument();
    expect(screen.getByLabelText('Autosave on or off')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficulty display')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Save Data' })).toBeInTheDocument();

    unmount();
    useExpeditionStore.getState().startGame();
    render(<App />);
    await screen.findByTestId('phaser-game');

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('does not render visible settings text inside the modal', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the modal content', () => {
    const onClose = vi.fn();

    render(<SettingsModal isOpen onClose={onClose} />);

    fireEvent.mouseDown(screen.getByTestId('settings-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with the close icon button', () => {
    const onClose = vi.fn();

    render(<SettingsModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with Escape', () => {
    const onClose = vi.fn();

    render(<SettingsModal isOpen onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render parent Audio or Gameplay checkboxes', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(screen.queryByRole('checkbox', { name: 'Audio' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Gameplay' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Sound on or off' }),
    ).not.toBeInTheDocument();
  });

  it('allows audio controls to change immediately', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    const musicVolume = screen.getByLabelText('Music volume');
    const sfxVolume = screen.getByLabelText('SFX volume');
    const soundToggle = screen.getByRole('button', { name: 'Sound on or off' });

    expect(soundToggle).toHaveAttribute('aria-pressed', 'false');
    expect(musicVolume).toBeEnabled();
    expect(sfxVolume).toBeEnabled();

    fireEvent.change(musicVolume, { target: { value: '25' } });
    fireEvent.change(sfxVolume, { target: { value: '40' } });

    expect(musicVolume).toHaveValue('25');
    expect(sfxVolume).toHaveValue('40');
  });

  it('allows gameplay controls to change immediately', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    const reducedMotion = screen.getByLabelText('Reduced motion');
    const autosave = screen.getByLabelText('Autosave on or off');

    expect(reducedMotion).toBeEnabled();
    expect(autosave).toBeEnabled();

    fireEvent.click(reducedMotion);
    fireEvent.click(autosave);

    expect(reducedMotion).toBeChecked();
    expect(autosave).not.toBeChecked();
  });

  it('does not render a native text speed select', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(screen.queryByRole('combobox', { name: 'Text speed' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Text speed' })).toHaveTextContent(
      'Normal',
    );
  });

  it('opens the custom text speed dropdown on click', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Text speed' }));

    expect(screen.getByRole('listbox', { name: 'Text speed' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Slow' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Normal' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: 'Fast' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Instant' })).toBeInTheDocument();
  });

  it('updates text speed from the custom dropdown', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Text speed' }));
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Instant' }));

    expect(screen.getByRole('button', { name: 'Text speed' })).toHaveTextContent(
      'Instant',
    );
    expect(getStoredSettings(window.localStorage).textSpeed).toBe('instant');
  });

  it('supports keyboard text speed selection', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    const trigger = screen.getByRole('button', { name: 'Text speed' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(trigger).toHaveTextContent('Fast');
    expect(getStoredSettings(window.localStorage).textSpeed).toBe('fast');
  });

  it('closes the text speed dropdown with Escape', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    const trigger = screen.getByRole('button', { name: 'Text speed' });

    fireEvent.click(trigger);
    expect(screen.getByRole('listbox', { name: 'Text speed' })).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(screen.queryByRole('listbox', { name: 'Text speed' })).not.toBeInTheDocument();
  });

  it('persists settings after reload', () => {
    const { unmount } = render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sound on or off' }));
    fireEvent.change(screen.getByLabelText('Music volume'), {
      target: { value: '25' },
    });
    fireEvent.change(screen.getByLabelText('SFX volume'), {
      target: { value: '40' },
    });
    fireEvent.click(screen.getByLabelText('Reduced motion'));
    fireEvent.click(screen.getByRole('button', { name: 'Text speed' }));
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Instant' }));
    fireEvent.click(screen.getByLabelText('Autosave on or off'));
    fireEvent.click(screen.getByLabelText('Difficulty display'));

    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).not.toBeNull();

    unmount();
    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Sound on or off' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Music volume')).toHaveValue('25');
    expect(screen.getByLabelText('SFX volume')).toHaveValue('40');
    expect(screen.getByLabelText('Reduced motion')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Text speed' })).toHaveTextContent(
      'Instant',
    );
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

  it('does not render permanent reset explanatory text', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(screen.queryByText('Save Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Permanent')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Clear the saved expedition from this browser.'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Save Data' })).toBeInTheDocument();
  });

  it('opens reset save confirmation from reset save data', () => {
    render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Save Data' }));

    expect(
      screen.getByRole('dialog', { name: 'Reset save data confirmation' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm reset' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close reset confirmation' }),
    ).toBeInTheDocument();
  });

  it('does not clear save data when reset confirmation is canceled', () => {
    useExpeditionStore.getState().startGame();
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Save Data' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
    expect(
      screen.queryByRole('dialog', { name: 'Reset save data confirmation' }),
    ).not.toBeInTheDocument();
  });

  it('does not clear save data when clicking outside reset confirmation', () => {
    useExpeditionStore.getState().startGame();
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    render(<SettingsModal isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Save Data' }));
    fireEvent.mouseDown(screen.getByTestId('reset-save-confirmation-backdrop'));

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
    expect(
      screen.queryByRole('dialog', { name: 'Reset save data confirmation' }),
    ).not.toBeInTheDocument();
  });

  it('clears save data from reset confirmation', () => {
    useExpeditionStore.getState().startGame();
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    render(<SettingsModal isOpen onClose={() => undefined} />);

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reset Save Data' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reset' }));

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();
    expect(useExpeditionStore.getState().gameStatus).toBe('not_started');
    expect(
      screen.queryByRole('dialog', { name: 'Reset save data confirmation' }),
    ).not.toBeInTheDocument();
  });
});
