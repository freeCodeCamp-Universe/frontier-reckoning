import Phaser from 'phaser';
import { BootScene } from '@game/scenes/BootScene';

type CreateGameConfigOptions = {
  parent?: HTMLElement;
};

export function createGameConfig({
  parent,
}: CreateGameConfigOptions = {}): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#1b1b32',
    scene: [BootScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}

export const gameConfig = createGameConfig();
