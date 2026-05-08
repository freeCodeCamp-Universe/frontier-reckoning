import Phaser from 'phaser';
import { TrailMapScene } from '@game/scenes/TrailMapScene';

type CreateGameConfigOptions = {
  parent?: HTMLElement;
  mapState?: {
    distanceTraveled: number;
    totalDistance: number;
  };
};

export function createGameConfig({
  parent,
  mapState,
}: CreateGameConfigOptions = {}): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#1b1b32',
    scene: [TrailMapScene],
    callbacks: {
      preBoot: (game) => {
        if (!mapState) {
          return;
        }

        game.registry.set('distanceTraveled', mapState.distanceTraveled);
        game.registry.set('totalDistance', mapState.totalDistance);
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}

export const gameConfig = createGameConfig();
