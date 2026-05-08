import { describe, expect, it } from 'vitest';
import { gameConfig } from '@game/config';
import { TrailMapScene } from '@game/scenes/TrailMapScene';

describe('gameConfig', () => {
  it('exports the Phaser game config', () => {
    expect(gameConfig).toMatchObject({
      width: 960,
      height: 540,
      backgroundColor: '#1b1b32',
      scene: [TrailMapScene],
    });
  });

  it('creates the trail map scene without throwing', () => {
    expect(() => new TrailMapScene()).not.toThrow();
  });
});
