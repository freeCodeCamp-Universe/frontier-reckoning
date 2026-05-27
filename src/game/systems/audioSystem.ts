import type { GameStatus } from '@stores/expeditionStore';
import type { FrontierSettings } from '@game/systems/settingsSystem';

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

export type AudioAsset = {
  category: AudioCategory;
  src: string;
  loop: boolean;
  channel: 'music' | 'ambience' | 'sfx';
};

export type AudioSettings = Pick<
  FrontierSettings,
  'soundEnabled' | 'musicVolume' | 'sfxVolume'
>;

type ManagedAudio = HTMLAudioElement & {
  __frontierCategory?: AudioCategory;
};

export const placeholderAudioAssets: Record<AudioCategory, AudioAsset> = {
  main_menu_music: {
    category: 'main_menu_music',
    src: '/audio/placeholders/main-menu.ogg',
    loop: true,
    channel: 'music',
  },
  trail_ambience: {
    category: 'trail_ambience',
    src: '/audio/placeholders/trail-ambience.ogg',
    loop: true,
    channel: 'ambience',
  },
  camp_ambience: {
    category: 'camp_ambience',
    src: '/audio/placeholders/camp-ambience.ogg',
    loop: true,
    channel: 'ambience',
  },
  town_ambience: {
    category: 'town_ambience',
    src: '/audio/placeholders/town-ambience.ogg',
    loop: true,
    channel: 'ambience',
  },
  storm_ambience: {
    category: 'storm_ambience',
    src: '/audio/placeholders/storm-ambience.ogg',
    loop: true,
    channel: 'ambience',
  },
  river_ambience: {
    category: 'river_ambience',
    src: '/audio/placeholders/river-ambience.ogg',
    loop: true,
    channel: 'ambience',
  },
  button_click: {
    category: 'button_click',
    src: '/audio/placeholders/button-click.ogg',
    loop: false,
    channel: 'sfx',
  },
  event_alert: {
    category: 'event_alert',
    src: '/audio/placeholders/event-alert.ogg',
    loop: false,
    channel: 'sfx',
  },
  hunting_shot: {
    category: 'hunting_shot',
    src: '/audio/placeholders/hunting-shot.ogg',
    loop: false,
    channel: 'sfx',
  },
  hunting_hit: {
    category: 'hunting_hit',
    src: '/audio/placeholders/hunting-hit.ogg',
    loop: false,
    channel: 'sfx',
  },
  victory: {
    category: 'victory',
    src: '/audio/placeholders/victory.ogg',
    loop: false,
    channel: 'sfx',
  },
  game_over: {
    category: 'game_over',
    src: '/audio/placeholders/game-over.ogg',
    loop: false,
    channel: 'sfx',
  },
};

export class FrontierAudioSystem {
  private settings: AudioSettings = {
    soundEnabled: false,
    musicVolume: 50,
    sfxVolume: 70,
  };
  private music: ManagedAudio | null = null;
  private ambience: ManagedAudio | null = null;
  private autoplayBlocked = false;

  constructor(
    private assets: Record<AudioCategory, AudioAsset> = placeholderAudioAssets,
    private createAudioElement: (src: string) => ManagedAudio = (src) =>
      new Audio(src) as ManagedAudio,
  ) {}

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

    if (!asset || asset.channel !== 'music') {
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

    if (!asset || asset.channel !== 'ambience') {
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

    if (!asset || asset.channel !== 'sfx' || !this.settings.soundEnabled) {
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

  private createManagedAudio(asset: AudioAsset) {
    let audio: ManagedAudio;

    try {
      audio = this.createAudioElement(asset.src);
    } catch {
      this.autoplayBlocked = true;
      return null;
    }

    audio.__frontierCategory = asset.category;
    audio.loop = asset.loop;
    audio.preload = 'auto';
    this.applyVolume(audio);

    return audio;
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
    if (!this.settings.soundEnabled) {
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
        // Missing or interrupted audio should not affect gameplay.
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
