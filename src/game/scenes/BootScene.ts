import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Frontier Reckoning', {
        color: '#ffffff',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: '36px',
        fontStyle: '700',
      })
      .setOrigin(0.5);
  }
}
