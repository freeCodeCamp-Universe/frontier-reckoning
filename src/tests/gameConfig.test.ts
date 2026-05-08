import { describe, expect, it } from 'vitest';
import { gameConfig } from '@game/config';
import { BootScene } from '@game/scenes/BootScene';

describe('gameConfig', () => {
  it('exports the Phaser game config', () => {
    expect(gameConfig).toMatchObject({
      width: 960,
      height: 540,
      backgroundColor: '#1b1b32',
      scene: [BootScene],
    });
  });
});
