import type { FrontierSettings } from '@game/systems/settingsSystem';
import type { GameStatus } from '@stores/expeditionStore';

export type AudioCategory =
  | 'main_menu_music'
  | 'trail_ambience'
  | 'camp_ambience'
  | 'town_ambience'
  | 'storm_ambience'
  | 'river_ambience'
  | 'button_click'
  | 'event_alert'
  | 'hunting_shot'
  | 'hunting_hit'
  | 'victory'
  | 'game_over';

export type AudioComposition =
  | 'menu_theme'
  | 'trail_ambience'
  | 'campfire_ambience'
  | 'town_ambience'
  | 'storm_ambience'
  | 'river_ambience'
  | 'button_click'
  | 'event_alert'
  | 'hunting_shot'
  | 'hunting_hit'
  | 'victory_sting'
  | 'game_over_sting';

export type AudioAsset = {
  category: AudioCategory;
  loop: boolean;
  channel: 'music' | 'ambience' | 'sfx';
  composition: AudioComposition;
  replacementFileName: string;
  src?: string;
};

export type AudioSettings = Pick<
  FrontierSettings,
  'soundEnabled' | 'musicVolume' | 'sfxVolume'
>;

type ManagedAudio = {
  __frontierCategory?: AudioCategory;
  currentTime: number;
  loop: boolean;
  pause: () => void;
  play: () => Promise<void> | void;
  preload: string;
  volume: number;
};

type ManagedHtmlAudio = HTMLAudioElement & ManagedAudio;

type AudioContextConstructor = new () => AudioContext;

type AudioWindow = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

type AudioNodeWithStop = AudioScheduledSourceNode & {
  stop: (when?: number) => void;
};

export const generatedAudioAssets: Record<AudioCategory, AudioAsset> = {
  main_menu_music: {
    category: 'main_menu_music',
    loop: true,
    channel: 'music',
    composition: 'menu_theme',
    replacementFileName: 'main-menu.ogg',
  },
  trail_ambience: {
    category: 'trail_ambience',
    loop: true,
    channel: 'ambience',
    composition: 'trail_ambience',
    replacementFileName: 'trail-ambience.ogg',
  },
  camp_ambience: {
    category: 'camp_ambience',
    loop: true,
    channel: 'ambience',
    composition: 'campfire_ambience',
    replacementFileName: 'camp-ambience.ogg',
  },
  town_ambience: {
    category: 'town_ambience',
    loop: true,
    channel: 'ambience',
    composition: 'town_ambience',
    replacementFileName: 'town-ambience.ogg',
  },
  storm_ambience: {
    category: 'storm_ambience',
    loop: true,
    channel: 'ambience',
    composition: 'storm_ambience',
    replacementFileName: 'storm-ambience.ogg',
  },
  river_ambience: {
    category: 'river_ambience',
    loop: true,
    channel: 'ambience',
    composition: 'river_ambience',
    replacementFileName: 'river-ambience.ogg',
  },
  button_click: {
    category: 'button_click',
    loop: false,
    channel: 'sfx',
    composition: 'button_click',
    replacementFileName: 'button-click.ogg',
  },
  event_alert: {
    category: 'event_alert',
    loop: false,
    channel: 'sfx',
    composition: 'event_alert',
    replacementFileName: 'event-alert.ogg',
  },
  hunting_shot: {
    category: 'hunting_shot',
    loop: false,
    channel: 'sfx',
    composition: 'hunting_shot',
    replacementFileName: 'hunting-shot.ogg',
  },
  hunting_hit: {
    category: 'hunting_hit',
    loop: false,
    channel: 'sfx',
    composition: 'hunting_hit',
    replacementFileName: 'hunting-hit.ogg',
  },
  victory: {
    category: 'victory',
    loop: false,
    channel: 'sfx',
    composition: 'victory_sting',
    replacementFileName: 'victory.ogg',
  },
  game_over: {
    category: 'game_over',
    loop: false,
    channel: 'sfx',
    composition: 'game_over_sting',
    replacementFileName: 'game-over.ogg',
  },
};

export const placeholderAudioAssets = generatedAudioAssets;

export class FrontierAudioSystem {
  private settings: AudioSettings = {
    soundEnabled: false,
    musicVolume: 50,
    sfxVolume: 70,
  };
  private music: ManagedAudio | null = null;
  private ambience: ManagedAudio | null = null;
  private audioContext: AudioContext | null = null;
  private userInteractionReceived = false;
  private autoplayBlocked = false;

  constructor(
    private assets: Record<AudioCategory, AudioAsset> = generatedAudioAssets,
    private createAudioElement: (src: string) => ManagedHtmlAudio = (src) =>
      new Audio(src) as ManagedHtmlAudio,
    private createAudioContext: () => AudioContext | null = () =>
      createBrowserAudioContext(),
  ) {}

  registerUserInteraction() {
    this.userInteractionReceived = true;

    if (this.audioContext?.state === 'suspended') {
      void this.audioContext.resume().catch(() => undefined);
    }
  }

  hasUserInteraction() {
    return this.userInteractionReceived;
  }

  updateSettings(settings: AudioSettings) {
    this.settings = settings;

    if (!settings.soundEnabled) {
      this.mute();
      return;
    }

    this.applyVolume(this.music);
    this.applyVolume(this.ambience);
  }

  mute() {
    this.stopMusic();
    this.stopAmbience();
  }

  async playMusic(category: AudioCategory, fadeMs = 600) {
    const asset = this.assets[category];

    if (!asset || asset.channel !== 'music' || !this.canStartAudio()) {
      return false;
    }

    if (this.music?.__frontierCategory === category) {
      this.applyVolume(this.music);
      return true;
    }

    this.stopMusic(fadeMs);
    this.music = this.createManagedAudio(asset);

    if (!this.music) {
      return false;
    }

    return this.safePlay(this.music, fadeMs);
  }

  async playAmbience(category: AudioCategory, fadeMs = 500) {
    const asset = this.assets[category];

    if (!asset || asset.channel !== 'ambience' || !this.canStartAudio()) {
      return false;
    }

    if (this.ambience?.__frontierCategory === category) {
      this.applyVolume(this.ambience);
      return true;
    }

    this.stopAmbience(fadeMs);
    this.ambience = this.createManagedAudio(asset);

    if (!this.ambience) {
      return false;
    }

    return this.safePlay(this.ambience, fadeMs);
  }

  async playSfx(category: AudioCategory) {
    const asset = this.assets[category];

    if (!asset || asset.channel !== 'sfx' || !this.canStartAudio()) {
      return false;
    }

    const audio = this.createManagedAudio(asset);

    if (!audio) {
      return false;
    }

    audio.volume = this.settings.sfxVolume / 100;

    return this.safePlay(audio, 0);
  }

  requestSceneAudio(scene: AudioScene) {
    if (!this.settings.soundEnabled) {
      this.mute();
      return;
    }

    const category = audioSceneAmbience[scene];

    if (scene === 'main_menu') {
      void this.playMusic('main_menu_music');
      this.stopAmbience();
      return;
    }

    this.stopMusic();

    if (category) {
      void this.playAmbience(category);
    } else {
      this.stopAmbience();
    }
  }

  stopMusic(fadeMs = 300) {
    this.fadeOutAndStop(this.music, fadeMs);
    this.music = null;
  }

  stopAmbience(fadeMs = 300) {
    this.fadeOutAndStop(this.ambience, fadeMs);
    this.ambience = null;
  }

  isAutoplayBlocked() {
    return this.autoplayBlocked;
  }

  private canStartAudio() {
    if (!this.settings.soundEnabled) {
      return false;
    }

    if (!this.userInteractionReceived) {
      this.autoplayBlocked = true;
      return false;
    }

    return true;
  }

  private createManagedAudio(asset: AudioAsset) {
    let audio: ManagedAudio | null;

    try {
      audio = asset.src
        ? this.createAudioElement(asset.src)
        : this.createGeneratedAudio(asset);
    } catch {
      this.autoplayBlocked = true;
      return null;
    }

    if (!audio) {
      this.autoplayBlocked = true;
      return null;
    }

    audio.__frontierCategory = asset.category;
    audio.loop = asset.loop;
    audio.preload = 'auto';
    this.applyVolume(audio);

    return audio;
  }

  private createGeneratedAudio(asset: AudioAsset) {
    const context = this.getAudioContext();

    if (!context) {
      return null;
    }

    return new GeneratedAudioComposition(context, asset) as ManagedAudio;
  }

  private getAudioContext() {
    if (this.audioContext) {
      return this.audioContext;
    }

    this.audioContext = this.createAudioContext();

    return this.audioContext;
  }

  private applyVolume(audio: ManagedAudio | null) {
    if (!audio) {
      return;
    }

    const asset = audio.__frontierCategory
      ? this.assets[audio.__frontierCategory]
      : null;
    const volume =
      asset?.channel === 'sfx' ? this.settings.sfxVolume : this.settings.musicVolume;

    audio.volume = this.settings.soundEnabled ? volume / 100 : 0;
  }

  private async safePlay(audio: ManagedAudio, fadeMs: number) {
    if (!this.canStartAudio()) {
      return false;
    }

    try {
      const targetVolume = audio.volume;

      if (fadeMs > 0) {
        audio.volume = 0;
      }

      const playResult = audio.play();

      if (typeof playResult?.then === 'function') {
        await playResult;
      }

      this.autoplayBlocked = false;
      this.fadeTo(audio, targetVolume, fadeMs);

      return true;
    } catch {
      this.autoplayBlocked = true;
      return false;
    }
  }

  private fadeTo(audio: ManagedAudio, targetVolume: number, fadeMs: number) {
    if (fadeMs <= 0) {
      audio.volume = targetVolume;
      return;
    }

    globalThis.setTimeout(() => {
      audio.volume = targetVolume;
    }, Math.min(fadeMs, 50));
  }

  private fadeOutAndStop(audio: ManagedAudio | null, fadeMs: number) {
    if (!audio) {
      return;
    }

    const stop = () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Audio is decorative. Failure should never interrupt gameplay.
      }
    };

    if (fadeMs <= 0) {
      stop();
      return;
    }

    audio.volume = 0;
    globalThis.setTimeout(stop, Math.min(fadeMs, 50));
  }
}

class GeneratedAudioComposition {
  __frontierCategory?: AudioCategory;
  currentTime = 0;
  loop: boolean;
  preload = 'auto';
  private output: GainNode;
  private activeNodes: AudioNodeWithStop[] = [];
  private loopTimer: ReturnType<typeof globalThis.setInterval> | null = null;

  constructor(
    private context: AudioContext,
    private asset: AudioAsset,
  ) {
    this.loop = asset.loop;
    this.output = context.createGain();
    this.output.gain.value = 0;
    this.output.connect(context.destination);
  }

  get volume() {
    return this.output.gain.value;
  }

  set volume(value: number) {
    this.output.gain.value = clamp(value, 0, 1);
  }

  async play() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.pause();
    this.schedule();

    if (this.loop) {
      this.loopTimer = globalThis.setInterval(() => this.schedule(), 5200);
    }
  }

  pause() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Nodes may already have ended naturally.
      }
    });
    this.activeNodes = [];

    if (this.loopTimer !== null) {
      globalThis.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private schedule() {
    const start = this.context.currentTime + 0.02;

    switch (this.asset.composition) {
      case 'menu_theme':
        scheduleMenuTheme(this.context, this.output, start, this.activeNodes);
        break;
      case 'trail_ambience':
        scheduleTrailAmbience(this.context, this.output, start, this.activeNodes);
        break;
      case 'campfire_ambience':
        scheduleCampfireAmbience(this.context, this.output, start, this.activeNodes);
        break;
      case 'town_ambience':
        scheduleTownAmbience(this.context, this.output, start, this.activeNodes);
        break;
      case 'storm_ambience':
        scheduleStormAmbience(this.context, this.output, start, this.activeNodes);
        break;
      case 'river_ambience':
        scheduleRiverAmbience(this.context, this.output, start, this.activeNodes);
        break;
      case 'button_click':
        scheduleToneSequence(this.context, this.output, start, this.activeNodes, [
          [660, 0, 0.045, 'triangle', 0.08],
          [880, 0.035, 0.035, 'triangle', 0.04],
        ]);
        break;
      case 'event_alert':
        scheduleToneSequence(this.context, this.output, start, this.activeNodes, [
          [220, 0, 0.16, 'sawtooth', 0.08],
          [185, 0.18, 0.2, 'sawtooth', 0.07],
        ]);
        break;
      case 'hunting_shot':
        scheduleNoiseBurst(this.context, this.output, start, 0.09, 0.16, this.activeNodes);
        scheduleToneSequence(this.context, this.output, start, this.activeNodes, [
          [90, 0.01, 0.12, 'square', 0.07],
        ]);
        break;
      case 'hunting_hit':
        scheduleToneSequence(this.context, this.output, start, this.activeNodes, [
          [330, 0, 0.08, 'triangle', 0.07],
          [440, 0.08, 0.08, 'triangle', 0.06],
        ]);
        break;
      case 'victory_sting':
        scheduleToneSequence(this.context, this.output, start, this.activeNodes, [
          [392, 0, 0.22, 'triangle', 0.08],
          [494, 0.2, 0.22, 'triangle', 0.08],
          [587, 0.4, 0.36, 'triangle', 0.09],
          [784, 0.74, 0.28, 'sine', 0.06],
        ]);
        break;
      case 'game_over_sting':
        scheduleToneSequence(this.context, this.output, start, this.activeNodes, [
          [196, 0, 0.32, 'sawtooth', 0.07],
          [165, 0.3, 0.42, 'sawtooth', 0.065],
          [123, 0.72, 0.5, 'sine', 0.05],
        ]);
        break;
    }
  }
}

function createBrowserAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextConstructor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  try {
    return new AudioContextConstructor();
  } catch {
    return null;
  }
}

function scheduleMenuTheme(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
) {
  scheduleToneSequence(context, destination, start, nodes, [
    [196, 0, 0.9, 'sine', 0.045],
    [247, 0.9, 0.9, 'sine', 0.04],
    [294, 1.8, 1, 'triangle', 0.04],
    [247, 3.1, 0.8, 'sine', 0.035],
    [330, 3.9, 0.9, 'triangle', 0.03],
  ]);
}

function scheduleTrailAmbience(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
) {
  scheduleToneSequence(context, destination, start, nodes, [
    [73, 0, 5.1, 'sine', 0.025],
    [110, 1.2, 3.8, 'sine', 0.012],
  ]);
  scheduleNoiseBurst(context, destination, start, 5.2, 0.018, nodes, 900);
}

function scheduleCampfireAmbience(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
) {
  scheduleToneSequence(context, destination, start, nodes, [
    [82, 0, 5.2, 'sine', 0.015],
  ]);

  for (let index = 0; index < 16; index += 1) {
    scheduleNoiseBurst(
      context,
      destination,
      start + index * 0.31,
      0.05 + (index % 3) * 0.02,
      0.035,
      nodes,
      2600,
    );
  }
}

function scheduleTownAmbience(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
) {
  scheduleToneSequence(context, destination, start, nodes, [
    [147, 0, 1.8, 'triangle', 0.025],
    [196, 2.1, 1.2, 'triangle', 0.02],
    [247, 3.6, 0.8, 'triangle', 0.018],
  ]);
  scheduleNoiseBurst(context, destination, start + 0.5, 4.2, 0.012, nodes, 1300);
}

function scheduleStormAmbience(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
) {
  scheduleNoiseBurst(context, destination, start, 5.2, 0.06, nodes, 500);
  scheduleToneSequence(context, destination, start, nodes, [
    [55, 0.6, 1.4, 'sine', 0.04],
    [46, 2.7, 1.8, 'sine', 0.05],
  ]);
}

function scheduleRiverAmbience(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
) {
  scheduleNoiseBurst(context, destination, start, 5.2, 0.05, nodes, 750);
  scheduleNoiseBurst(context, destination, start + 0.35, 4.5, 0.025, nodes, 1700);
}

function scheduleToneSequence(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  nodes: AudioNodeWithStop[],
  tones: Array<[number, number, number, OscillatorType, number]>,
) {
  tones.forEach(([frequency, offset, duration, type, peak]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const toneStart = start + offset;
    const toneEnd = toneStart + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, toneStart);
    gain.gain.setValueAtTime(0.0001, toneStart);
    gain.gain.linearRampToValueAtTime(peak, toneStart + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(toneStart);
    oscillator.stop(toneEnd + 0.04);
    nodes.push(oscillator);
  });
}

function scheduleNoiseBurst(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  duration: number,
  peak: number,
  nodes: AudioNodeWithStop[],
  filterFrequency = 1200,
) {
  const buffer = context.createBuffer(
    1,
    Math.max(1, Math.floor(context.sampleRate * duration)),
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const end = start + duration;

  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFrequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start);
  source.stop(end + 0.02);
  nodes.push(source);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export type AudioScene =
  | 'main_menu'
  | 'trail'
  | 'camp'
  | 'town'
  | 'storm'
  | 'river'
  | 'event'
  | 'victory'
  | 'game_over';

const audioSceneAmbience: Partial<Record<AudioScene, AudioCategory>> = {
  trail: 'trail_ambience',
  camp: 'camp_ambience',
  town: 'town_ambience',
  storm: 'storm_ambience',
  river: 'river_ambience',
  event: 'storm_ambience',
};

export function getAudioSceneForGameStatus(
  gameStatus: GameStatus,
  currentEventType?: string,
): AudioScene {
  if (gameStatus === 'not_started') {
    return 'main_menu';
  }

  if (gameStatus === 'traveling') {
    return 'trail';
  }

  if (gameStatus === 'camp') {
    return 'camp';
  }

  if (gameStatus === 'town') {
    return 'town';
  }

  if (gameStatus === 'river') {
    return 'river';
  }

  if (gameStatus === 'event') {
    return currentEventType === 'wagon_damage' ? 'storm' : 'event';
  }

  if (gameStatus === 'victory') {
    return 'victory';
  }

  return 'game_over';
}

export const audioSystem = new FrontierAudioSystem();
