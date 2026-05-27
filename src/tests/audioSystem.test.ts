import { describe, expect, it, vi } from 'vitest';
import {
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

describe('audio system', () => {
  it('uses audio settings to control music and sfx volume', async () => {
    const { createAudioElement, elements } = createAudioFactory();
    const system = new FrontierAudioSystem(
      placeholderAudioAssets,
      createAudioElement,
    );

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
      placeholderAudioAssets,
      createAudioElement,
    );

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
      placeholderAudioAssets,
      createAudioElement,
    );

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
      placeholderAudioAssets,
      createAudioElement,
    );

    system.updateSettings({
      soundEnabled: true,
      musicVolume: 80,
      sfxVolume: 80,
    });

    system.requestSceneAudio('camp');
    system.requestSceneAudio('river');
    vi.runAllTimers();

    expect(elements[0].src).toBe('/audio/placeholders/camp-ambience.ogg');
    expect(elements[0].pause).toHaveBeenCalled();
    expect(elements[1].src).toBe('/audio/placeholders/river-ambience.ogg');
    expect(elements[1].play).toHaveBeenCalled();

    vi.useRealTimers();
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
