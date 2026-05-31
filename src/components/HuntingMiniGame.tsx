import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import {
  chooseHuntingAnimalType,
  HUNTING_DURATION_SECONDS,
  huntingAnimalConfigs,
  isHuntingTimerExpired,
  resolveHuntingShot,
  type HuntingAnimal,
  type HuntingMiniGameResult,
} from '@game/systems/huntingSystem';
import { audioSystem } from '@game/systems/audioSystem';
import type { FrontierReckoningData } from '@stores/expeditionStore';
import { formatWholeNumber } from '@utils/formatResourceValue';

type HuntingMiniGameProps = {
  ammoAvailable: number;
  gameState: FrontierReckoningData;
  reducedMotion: boolean;
  onComplete: (result: HuntingMiniGameResult) => void;
};

const sceneWidth = 960;
const sceneHeight = 540;
const maxHuntAmmo = 8;

export function HuntingMiniGame({
  ammoAvailable,
  gameState,
  reducedMotion,
  onComplete,
}: HuntingMiniGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const completionRef = useRef(onComplete);

  useEffect(() => {
    completionRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    const scene = new HuntingScene({
      ammoAvailable: Math.min(ammoAvailable, maxHuntAmmo),
      gameState,
      reducedMotion,
      onComplete: (result) => completionRef.current(result),
    });

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: sceneWidth,
      height: sceneHeight,
      backgroundColor: '#1b1b32',
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [ammoAvailable, gameState, reducedMotion]);

  return (
    <section
      className="overflow-hidden border border-border bg-panel"
      aria-label="Hunting mini-game"
    >
      <div className="border-b border-border bg-surface p-3">
        <p className="font-mono text-base text-highlight">hunting range</p>
        <p className="mt-1 text-base text-muted">
          Move the reticle, then click, tap, or press Space to shoot.
        </p>
      </div>
      <div ref={containerRef} className="min-h-[320px] w-full" />
    </section>
  );
}

type HuntingSceneOptions = {
  ammoAvailable: number;
  gameState: FrontierReckoningData;
  reducedMotion: boolean;
  onComplete: (result: HuntingMiniGameResult) => void;
};

class HuntingScene extends Phaser.Scene {
  private ammoRemaining: number;
  private elapsedSeconds = 0;
  private foodGained = 0;
  private hits = 0;
  private misses = 0;
  private predatorEncountered = false;
  private completed = false;
  private crosshair?: Phaser.GameObjects.Container;
  private ammoText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private resultText?: Phaser.GameObjects.Text;
  private animals: Array<HuntingAnimal & { gameObject: Phaser.GameObjects.Container }> =
    [];

  constructor(private options: HuntingSceneOptions) {
    super('HuntingScene');
    this.ammoRemaining = options.ammoAvailable;
  }

  create() {
    this.drawRange();
    this.crosshair = this.createCrosshair();
    this.ammoText = this.add.text(24, 24, '', textStyle('#f5f6f7'));
    this.timerText = this.add.text(24, 54, '', textStyle('#f5f6f7'));
    this.resultText = this.add.text(24, 492, '', textStyle('#d0d0d5'));
    this.updateHud();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair?.setPosition(pointer.x, pointer.y);
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.shoot(pointer.x, pointer.y);
    });
    this.input.keyboard?.on('keydown-SPACE', () => {
      const position = this.crosshair ?? { x: sceneWidth / 2, y: sceneHeight / 2 };
      this.shoot(position.x, position.y);
    });

    this.time.addEvent({
      delay: this.options.reducedMotion ? 1500 : 950,
      loop: true,
      callback: () => this.spawnAnimal(),
    });
    this.time.addEvent({
      delay: 1000,
      repeat: HUNTING_DURATION_SECONDS - 1,
      callback: () => {
        this.elapsedSeconds += 1;
        this.updateHud();

        if (isHuntingTimerExpired(this.elapsedSeconds)) {
          this.finish();
        }
      },
    });
    this.spawnAnimal();
  }

  private drawRange() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x2a2a40, 1);
    graphics.fillRect(0, 0, sceneWidth, sceneHeight);
    graphics.fillStyle(0x1b1b32, 1);
    graphics.fillRect(0, 360, sceneWidth, 180);
    graphics.lineStyle(3, 0x6b4f2a, 0.8);
    graphics.lineBetween(0, 360, sceneWidth, 330);

    for (let index = 0; index < 18; index += 1) {
      const x = 28 + index * 58;
      const y = 330 + (index % 4) * 18;

      graphics.fillStyle(0x00471b, 0.65);
      graphics.fillTriangle(x, y, x - 15, y + 42, x + 20, y + 42);
    }
  }

  private createCrosshair() {
    const crosshair = this.add.container(sceneWidth / 2, sceneHeight / 2).setDepth(10);
    const graphics = this.add.graphics();

    graphics.lineStyle(2, 0xf1be32, 1);
    graphics.strokeCircle(0, 0, 18);
    graphics.lineBetween(-28, 0, -8, 0);
    graphics.lineBetween(8, 0, 28, 0);
    graphics.lineBetween(0, -28, 0, -8);
    graphics.lineBetween(0, 8, 0, 28);
    crosshair.add(graphics);

    return crosshair;
  }

  private spawnAnimal() {
    if (this.completed) {
      return;
    }

    const type = chooseHuntingAnimalType(this.options.gameState);
    const config = huntingAnimalConfigs[type];
    const fromLeft = Math.random() > 0.5;
    const y = Phaser.Math.Between(150, 385);
    const size = type === 'rabbit' ? 15 : type === 'deer' ? 24 : type === 'elk' ? 32 : 22;
    const startX = fromLeft ? -60 : sceneWidth + 60;
    const endX = fromLeft ? sceneWidth + 60 : -60;
    const animal = this.add.container(startX, y);
    const bodyColor =
      type === 'rabbit'
        ? 0xd0d0d5
        : type === 'deer'
          ? 0x8b5a2b
          : type === 'elk'
            ? 0x5c4325
            : 0x3b3b4f;
    const body = this.add.ellipse(0, 0, size * 2, size, bodyColor);
    const head = this.add.circle(fromLeft ? size : -size, -4, size / 2, bodyColor);
    const label = this.add
      .text(0, -size - 18, type, textStyle(type === 'wolf' ? '#ffadad' : '#f5f6f7'))
      .setOrigin(0.5);

    animal.add([body, head, label]);

    const huntingAnimal = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: startX,
      y,
      size: size + 10,
      gameObject: animal,
    };
    this.animals.push(huntingAnimal);

    this.tweens.add({
      targets: animal,
      x: endX,
      y: this.options.reducedMotion ? y : y + Phaser.Math.Between(-24, 24),
      duration: this.options.reducedMotion ? 5200 : (sceneWidth / config.speed) * 1000,
      ease: 'Linear',
      onUpdate: () => {
        huntingAnimal.x = animal.x;
        huntingAnimal.y = animal.y;
      },
      onComplete: () => {
        this.animals = this.animals.filter((current) => current.id !== huntingAnimal.id);
        animal.destroy();
      },
    });
  }

  private shoot(x: number, y: number) {
    if (this.completed || this.ammoRemaining <= 0) {
      return;
    }

    void audioSystem.playSfx('hunting_shot');

    const shot = resolveHuntingShot({
      animals: this.animals,
      target: { x, y },
      ammoRemaining: this.ammoRemaining,
      state: this.options.gameState,
    });

    this.ammoRemaining = shot.ammoRemaining;

    if (shot.hitAnimal) {
      const hitAnimal = this.animals.find((animal) => animal.id === shot.hitAnimal?.id);

      void audioSystem.playSfx('hunting_hit');
      this.hits += 1;
      this.foodGained += shot.foodGained;
      this.resultText?.setText(`${shot.hitAnimal.type} hit +${shot.foodGained} food`);
      hitAnimal?.gameObject.destroy();
      this.animals = this.animals.filter((animal) => animal.id !== shot.hitAnimal?.id);

      if (shot.predatorEncountered) {
        this.predatorEncountered = true;
        this.resultText?.setText('Wolf hit, but it injures a traveler.');
      }
    } else {
      this.misses += 1;
      this.resultText?.setText('Miss. Ammo spent.');
    }

    this.updateHud();

    if (this.ammoRemaining <= 0) {
      this.finish();
    }
  }

  private updateHud() {
    this.ammoText?.setText(`Ammo ${formatWholeNumber(this.ammoRemaining)}`);
    this.timerText?.setText(
      `Time ${Math.max(0, HUNTING_DURATION_SECONDS - this.elapsedSeconds)}s`,
    );
  }

  private finish() {
    if (this.completed) {
      return;
    }

    this.completed = true;
    this.options.onComplete({
      ammoSpent: this.options.ammoAvailable - this.ammoRemaining,
      foodGained: this.foodGained,
      hits: this.hits,
      misses: this.misses,
      predatorEncountered: this.predatorEncountered,
    });
  }
}

function textStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    color,
    fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
    fontSize: '18px',
  };
}
