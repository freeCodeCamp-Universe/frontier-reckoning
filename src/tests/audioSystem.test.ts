import { describe, expect, it, vi } from 'vitest';
import {
  type AudioAsset,
  FrontierAudioSystem,
  getAudioSceneForGameStatus,
  placeholderAudioAssets,
} from '@game/systems/audioSystem';

type FakeAudio = HTMLAudioElement & {
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  src: string;
};

function createAudioFactory(playImplementation = () => Promise.resolve()) {
  const elements: FakeAudio[] = [];
  const createAudioElement = vi.fn((src: string) => {
    const audio = {
      currentTime: 0,
      loop: false,
      pause: vi.fn(),
      play: vi.fn(playImplementation),
      preload: '',
      src,
      volume: 1,
    } as unknown as FakeAudio;

    elements.push(audio);

    return audio;
  });

  return { createAudioElement, elements };
}

function createFileAudioAssets() {
  return Object.fromEntries(
    Object.entries(placeholderAudioAssets).map(([category, asset]) => [
      category,
      {
        ...asset,
        src: asset.src ?? `/audio/placeholders/${asset.replacementFileName}`,
      },
    ]),
  ) as Record<keyof typeof placeholderAudioAssets, AudioAsset>;
}

function createAudioContextFactory() {
  const createAudioParam = () => ({
    value: 0,
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
  });
  const stop = vi.fn();
  const context = {
    currentTime: 0,
    destination: {},
    sampleRate: 120,
    state: 'running',
    createBiquadFilter: vi.fn(() => ({
      connect: vi.fn(),
      frequency: createAudioParam(),
      type: 'lowpass',
    })),
    createBuffer: vi.fn((_channels: number, length: number) => ({
      getChannelData: vi.fn(() => new Float32Array(length)),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop,
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: createAudioParam(),
    })),
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      frequency: createAudioParam(),
      start: vi.fn(),
      stop,
      type: 'sine',
    })),
    resume: vi.fn(() => Promise.resolve()),
  } as unknown as AudioContext;
  const createAudioContext = vi.fn(() => context);

  return { context, createAudioContext, stop };
}

describe('audio system', () => {
  it('uses audio settings to control music and sfx volume', async () => {
    const { createAudioElement, elements } = createAudioFactory();
    const system = new FrontierAudioSystem(
      createFileAudioAssets(),
      createAudioElement,
    );

    system.registerUserInteraction();
    system.updateSettings({
      soundEnabled: true,
      musicVolume: 25,
      sfxVolume: 40,
    });

    await system.playAmbience('camp_ambience', 0);
    await system.playSfx('button_click');

    expect(elements[0].volume).toBe(0.25);
    expect(elements[1].volume).toBe(0.4);
  });

  it('does not play audio while muted', async () => {
    const { createAudioElement, elements } = createAudioFactory();
    const system = new FrontierAudioSystem(
      createFileAudioAssets(),
      createAudioElement,
    );

    system.registerUserInteraction();
    system.updateSettings({
      soundEnabled: false,
      musicVolume: 100,
      sfxVolume: 100,
    });

    await expect(system.playSfx('button_click')).resolves.toBe(false);

    expect(elements).toHaveLength(0);
  });

  it('fails gracefully when an audio file cannot play', async () => {
    const { createAudioElement } = createAudioFactory(() =>
      Promise.reject(new Error('missing asset')),
    );
    const system = new FrontierAudioSystem(
      createFileAudioAssets(),
      createAudioElement,
    );

    system.registerUserInteraction();
    system.updateSettings({
      soundEnabled: true,
      musicVolume: 70,
      sfxVolume: 70,
    });

    await expect(system.playSfx('event_alert')).resolves.toBe(false);
    expect(system.isAutoplayBlocked()).toBe(true);
  });

  it('requests the correct ambience for scene changes', () => {
    vi.useFakeTimers();

    const { createAudioElement, elements } = createAudioFactory();
    const system = new FrontierAudioSystem(
      createFileAudioAssets(),
      createAudioElement,
    );

    system.registerUserInteraction();
    system.updateSettings({
      soundEnabled: true,
      musicVolume: 80,
      sfxVolume: 80,
    });

    system.requestSceneAudio('camp');
    system.requestSceneAudio('river');
    vi.runAllTimers();

    expect(elements).toHaveLength(1);
    expect(elements[0].src).toBe('/audio/nature-ambience.mp3');
    expect(elements[0].loop).toBe(true);
    expect(elements[0].pause).not.toHaveBeenCalled();
    expect(elements[0].play).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('loads procedural audio only after user interaction', async () => {
    const { createAudioContext, stop } = createAudioContextFactory();
    const system = new FrontierAudioSystem(
      placeholderAudioAssets,
      undefined,
      createAudioContext,
    );

    system.updateSettings({
      soundEnabled: true,
      musicVolume: 55,
      sfxVolume: 70,
    });

    await expect(system.playMusic('main_menu_music', 0)).resolves.toBe(false);

    expect(createAudioContext).not.toHaveBeenCalled();
    expect(system.isAutoplayBlocked()).toBe(true);

    system.registerUserInteraction();

    await expect(system.playMusic('main_menu_music', 0)).resolves.toBe(true);
    system.stopMusic(0);

    expect(createAudioContext).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalled();
  });

  it('reuses the ambient audio instance when scenes share the same soundtrack', async () => {
    const { createAudioElement, elements } = createAudioFactory();
    const system = new FrontierAudioSystem(
      createFileAudioAssets(),
      createAudioElement,
    );

    system.registerUserInteraction();
    system.updateSettings({
      soundEnabled: true,
      musicVolume: 65,
      sfxVolume: 80,
    });

    await system.playAmbience('trail_ambience', 0);
    await system.playAmbience('camp_ambience', 0);

    expect(elements).toHaveLength(1);
    expect(elements[0].src).toBe('/audio/nature-ambience.mp3');
    expect(elements[0].play).toHaveBeenCalledTimes(1);
    expect(elements[0].pause).not.toHaveBeenCalled();
  });

  it('maps game status to scene audio categories', () => {
    expect(getAudioSceneForGameStatus('not_started')).toBe('main_menu');
    expect(getAudioSceneForGameStatus('traveling')).toBe('trail');
    expect(getAudioSceneForGameStatus('camp')).toBe('camp');
    expect(getAudioSceneForGameStatus('town')).toBe('town');
    expect(getAudioSceneForGameStatus('river')).toBe('river');
    expect(getAudioSceneForGameStatus('event', 'wagon_damage')).toBe('storm');
    expect(getAudioSceneForGameStatus('victory')).toBe('victory');
    expect(getAudioSceneForGameStatus('game_over')).toBe('game_over');
  });
});
