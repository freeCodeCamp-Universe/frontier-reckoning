import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioControls } from '@components/AudioControls';
import {
  AUDIO_ENABLED_STORAGE_KEY,
  AMBIENCE_ENABLED_STORAGE_KEY,
  getStoredAmbienceEnabled,
  getStoredAudioEnabled,
} from '@utils/audio';

describe('audio controls', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      'Audio',
      vi.fn(() => ({
        currentTime: 0,
        loop: false,
        pause: vi.fn(),
        play: vi.fn(() => Promise.resolve()),
        preload: '',
        volume: 1,
      })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('defaults to muted and persists audio settings', () => {
    render(<AudioControls />);

    const soundButton = screen.getByRole('button', {
      name: 'Enable sound effects',
    });
    const ambienceButton = screen.getByRole('button', {
      name: 'Enable background ambience',
    });

    expect(soundButton).toHaveAttribute('aria-pressed', 'false');
    expect(ambienceButton).toBeDisabled();
    expect(getStoredAudioEnabled(window.localStorage)).toBe(false);

    fireEvent.click(soundButton);
    fireEvent.click(screen.getByRole('button', { name: 'Enable background ambience' }));

    expect(getStoredAudioEnabled(window.localStorage)).toBe(true);
    expect(getStoredAmbienceEnabled(window.localStorage)).toBe(true);
    expect(window.localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY)).toBe('true');
    expect(window.localStorage.getItem(AMBIENCE_ENABLED_STORAGE_KEY)).toBe('true');
  });

  it('toggles sound effects and ambience labels', () => {
    render(<AudioControls />);

    fireEvent.click(screen.getByRole('button', { name: 'Enable sound effects' }));
    expect(
      screen.getByRole('button', { name: 'Disable sound effects' }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Enable background ambience' }));
    expect(
      screen.getByRole('button', { name: 'Disable background ambience' }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Disable sound effects' }));
    expect(screen.getByRole('button', { name: 'Enable sound effects' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('does not crash if the audio engine fails', () => {
    vi.stubGlobal(
      'Audio',
      vi.fn(() => {
        throw new Error('Audio unavailable');
      }),
    );

    render(<AudioControls />);

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Enable sound effects' }));
    }).not.toThrow();

    expect(getStoredAudioEnabled(window.localStorage)).toBe(true);
  });
});
