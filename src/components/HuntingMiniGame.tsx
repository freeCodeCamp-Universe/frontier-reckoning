import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
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
import { getHuntingAnimalHitRadius } from '@game/systems/huntingSpriteProfiles';
import type { FrontierReckoningData } from '@stores/expeditionStore';
import { formatWholeNumber } from '@utils/formatResourceValue';
import { isTextEntryTarget } from '@utils/keyboard';

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
  const containerRef = useRef<HTMLButtonElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<HuntingScene | null>(null);
  const completionRef = useRef(onComplete);
  const [announcement, setAnnouncement] = useState('');

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
      onAnnounce: setAnnouncement,
      onComplete: (result) => completionRef.current(result),
    });
    sceneRef.current = scene;

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
      sceneRef.current = null;
    };
  }, [ammoAvailable, gameState, reducedMotion]);

  const handleHuntingKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (sceneRef.current?.handleKeyboardControl(event.nativeEvent)) {
      event.preventDefault();
    }
  };

  return (
    <section
      className="overflow-hidden border border-border bg-panel"
      aria-label="Hunting mini-game"
    >
      <div className="border-b border-border bg-surface p-3">
        <p className="font-mono text-base text-highlight">hunting range</p>
        <p id="hunting-controls-help" className="mt-1 text-base text-muted">
          Move the reticle, then click, tap, or use Arrow keys and Space to shoot.
        </p>
      </div>
      <button
        ref={containerRef}
        aria-describedby="hunting-controls-help"
        aria-label="Hunting range. Use Arrow keys to move the reticle and Space or Enter to shoot."
        className="block min-h-[320px] w-full border-0 bg-transparent p-0 text-left text-inherit outline-offset-4"
        onKeyDown={handleHuntingKeyDown}
        type="button"
      />
      <p className="sr-only" role="status" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}

type HuntingSceneOptions = {
  ammoAvailable: number;
  gameState: FrontierReckoningData;
  reducedMotion: boolean;
  onAnnounce: (message: string) => void;
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
    this.input.keyboard?.on('keydown-SPACE', (event: globalThis.KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) {
        return;
      }

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

  handleKeyboardControl(event: globalThis.KeyboardEvent) {
    if (isTextEntryTarget(event.target)) {
      return false;
    }

    const step = event.shiftKey ? 48 : 24;

    if (event.key === 'ArrowUp') {
      this.moveCrosshairBy(0, -step);
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.moveCrosshairBy(0, step);
      return true;
    }

    if (event.key === 'ArrowLeft') {
      this.moveCrosshairBy(-step, 0);
      return true;
    }

    if (event.key === 'ArrowRight') {
      this.moveCrosshairBy(step, 0);
      return true;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      const position = this.crosshair ?? { x: sceneWidth / 2, y: sceneHeight / 2 };

      this.shoot(position.x, position.y);
      return true;
    }

    return false;
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

  private moveCrosshairBy(deltaX: number, deltaY: number) {
    const position = this.crosshair ?? this.createCrosshair();
    const nextX = Phaser.Math.Clamp(position.x + deltaX, 0, sceneWidth);
    const nextY = Phaser.Math.Clamp(position.y + deltaY, 0, sceneHeight);

    this.crosshair = position;
    position.setPosition(nextX, nextY);
  }

  private spawnAnimal() {
    if (this.completed) {
      return;
    }

    const type = chooseHuntingAnimalType(this.options.gameState);
    const config = huntingAnimalConfigs[type];
    const fromLeft = Math.random() > 0.5;
    const y = Phaser.Math.Between(150, 385);
    const size = getHuntingAnimalHitRadius(type);
    const startX = fromLeft ? -60 : sceneWidth + 60;
    const endX = fromLeft ? sceneWidth + 60 : -60;
    const animal = this.add.container(startX, y);
    const sprite = renderHuntingAnimalSprite(this, type, fromLeft);

    animal.add(sprite.container);

    const huntingAnimal = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: startX,
      y,
      size: size + 10,
      gameObject: animal,
    };
    this.animals.push(huntingAnimal);
    animateAnimalSprite(this, sprite, type, fromLeft, this.options.reducedMotion);

    const travelDuration = Math.min(
      4800,
      this.options.reducedMotion ? 4800 : (sceneWidth / config.speed) * 1000,
    );

    this.tweens.add({
      targets: animal,
      x: endX,
      y: this.options.reducedMotion
        ? y
        : y +
          Phaser.Math.Between(type === 'rabbit' ? -12 : -24, type === 'rabbit' ? 10 : 24),
      duration: travelDuration,
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
      this.options.onAnnounce(
        `${shot.hitAnimal.type} hit. ${shot.foodGained} food gained. Ammo ${this.ammoRemaining}.`,
      );
      hitAnimal?.gameObject.destroy();
      this.animals = this.animals.filter((animal) => animal.id !== shot.hitAnimal?.id);

      if (shot.predatorEncountered) {
        this.predatorEncountered = true;
        this.resultText?.setText('Wolf hit, but it injures a traveler.');
        this.options.onAnnounce(
          `Wolf hit, but it injures a traveler. Ammo ${this.ammoRemaining}.`,
        );
      }
    } else {
      this.misses += 1;
      this.resultText?.setText('Miss. Ammo spent.');
      this.options.onAnnounce(`Miss. Ammo ${this.ammoRemaining}.`);
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
    this.options.onAnnounce(
      `Hunting complete. ${this.foodGained} food gained, ${this.hits} hits, ${this.misses} misses.`,
    );
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

type AnimalSprite = {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Container;
  dust?: Phaser.GameObjects.Graphics;
};

function renderHuntingAnimalSprite(
  scene: Phaser.Scene,
  type: HuntingAnimal['type'],
  fromLeft: boolean,
) {
  switch (type) {
    case 'elk':
      return renderElkSprite(scene, fromLeft);
    case 'deer':
      return renderDeerSprite(scene, fromLeft);
    case 'rabbit':
      return renderRabbitSprite(scene, fromLeft);
    case 'wolf':
      return renderWolfSprite(scene, fromLeft);
  }
}

function renderElkSprite(scene: Phaser.Scene, fromLeft: boolean): AnimalSprite {
  const container = scene.add.container(0, 0).setScale(fromLeft ? 1 : -1, 1);
  const body = scene.add.container(0, 0);
  const shadow = scene.add.graphics();
  const legs = scene.add.graphics();
  const torso = scene.add.graphics();
  const head = scene.add.graphics();
  const antlers = scene.add.graphics();

  shadow.fillStyle(0x0a0a23, 0.28);
  shadow.fillEllipse(-8, 23, 108, 16);

  legs.lineStyle(8, 0x3a2716, 1);
  legs.lineBetween(-35, 4, -45, 30);
  legs.lineBetween(-18, 7, -12, 34);
  legs.lineBetween(18, 8, 10, 34);
  legs.lineBetween(37, 4, 44, 31);
  legs.lineStyle(4, 0x1f160f, 1);
  legs.lineBetween(-45, 30, -54, 32);
  legs.lineBetween(-12, 34, -3, 34);
  legs.lineBetween(10, 34, 0, 36);
  legs.lineBetween(44, 31, 54, 33);

  torso.fillStyle(0x5c4325, 1);
  torso.fillEllipse(-10, -7, 92, 42);
  torso.fillStyle(0x6b4f2a, 1);
  torso.fillEllipse(22, -10, 48, 45);
  torso.fillStyle(0x3a2716, 0.95);
  torso.fillEllipse(34, -13, 34, 40);
  torso.fillStyle(0x8c6a3f, 0.55);
  torso.fillEllipse(-19, -16, 44, 13);
  torso.fillStyle(0xf5f6f7, 0.3);
  torso.fillEllipse(-42, -7, 13, 9);

  head.fillStyle(0x4a321c, 1);
  head.fillEllipse(50, -33, 31, 21);
  head.fillStyle(0x5c4325, 1);
  head.fillEllipse(64, -30, 22, 13);
  head.fillStyle(0xd8c6a2, 1);
  head.fillTriangle(38, -46, 47, -63, 51, -42);
  head.fillTriangle(52, -44, 65, -58, 62, -38);
  head.fillStyle(0x0a0a23, 1);
  head.fillCircle(56, -37, 2.2);
  head.fillStyle(0xd0d0d5, 0.75);
  head.fillCircle(70, -31, 2.5);

  antlers.lineStyle(4, 0xd8c6a2, 1);
  antlers.lineBetween(42, -48, 23, -78);
  antlers.lineBetween(52, -47, 74, -77);
  antlers.lineStyle(3, 0xd8c6a2, 1);
  antlers.lineBetween(29, -68, 10, -75);
  antlers.lineBetween(29, -68, 21, -91);
  antlers.lineBetween(38, -59, 31, -82);
  antlers.lineBetween(68, -69, 87, -76);
  antlers.lineBetween(68, -69, 77, -91);
  antlers.lineBetween(58, -58, 65, -82);

  body.add([legs, torso, head, antlers]);
  container.add([shadow, body]);

  return { container, body };
}

function renderDeerSprite(scene: Phaser.Scene, fromLeft: boolean): AnimalSprite {
  const container = scene.add.container(0, 0).setScale(fromLeft ? 1 : -1, 1);
  const body = scene.add.container(0, 0);
  const shadow = scene.add.graphics();
  const legs = scene.add.graphics();
  const torso = scene.add.graphics();
  const head = scene.add.graphics();
  const antlers = scene.add.graphics();

  shadow.fillStyle(0x0a0a23, 0.24);
  shadow.fillEllipse(-4, 22, 86, 12);

  legs.lineStyle(5, 0x6b4426, 1);
  legs.lineBetween(-28, 5, -38, 30);
  legs.lineBetween(-13, 7, -5, 31);
  legs.lineBetween(13, 7, 4, 31);
  legs.lineBetween(30, 4, 40, 28);
  legs.lineStyle(3, 0x2a1b10, 1);
  legs.lineBetween(-38, 30, -47, 31);
  legs.lineBetween(-5, 31, 4, 31);
  legs.lineBetween(4, 31, -5, 33);
  legs.lineBetween(40, 28, 49, 29);

  torso.fillStyle(0x8b5a2b, 1);
  torso.fillEllipse(-5, -7, 76, 31);
  torso.fillStyle(0xa36b35, 1);
  torso.fillEllipse(21, -10, 33, 31);
  torso.fillStyle(0xd8c6a2, 0.85);
  torso.fillEllipse(-39, -7, 12, 8);
  torso.fillStyle(0xc58b4a, 0.45);
  torso.fillEllipse(-14, -17, 34, 8);

  head.fillStyle(0x7a4e27, 1);
  head.fillEllipse(43, -27, 25, 17);
  head.fillStyle(0x8b5a2b, 1);
  head.fillEllipse(56, -24, 17, 10);
  head.fillStyle(0xd8c6a2, 1);
  head.fillTriangle(34, -38, 41, -55, 45, -34);
  head.fillTriangle(46, -37, 56, -51, 55, -32);
  head.fillStyle(0x0a0a23, 1);
  head.fillCircle(49, -30, 2);
  head.fillStyle(0xd0d0d5, 0.8);
  head.fillCircle(62, -24, 2);

  antlers.lineStyle(2, 0xd8c6a2, 1);
  antlers.lineBetween(40, -40, 31, -58);
  antlers.lineBetween(50, -39, 62, -57);
  antlers.lineBetween(34, -52, 27, -56);
  antlers.lineBetween(58, -52, 66, -56);

  body.add([legs, torso, head, antlers]);
  container.add([shadow, body]);

  return { container, body };
}

function renderRabbitSprite(scene: Phaser.Scene, fromLeft: boolean): AnimalSprite {
  const container = scene.add.container(0, 0).setScale(fromLeft ? 1 : -1, 1);
  const body = scene.add.container(0, 0);
  const dust = scene.add.graphics();
  const shadow = scene.add.graphics();
  const rabbit = scene.add.graphics();

  dust.fillStyle(0xd8c6a2, 0.28);
  dust.fillCircle(-34, 17, 4);
  dust.fillCircle(-43, 19, 2.5);
  dust.fillCircle(-27, 20, 2);

  shadow.fillStyle(0x0a0a23, 0.22);
  shadow.fillEllipse(-3, 19, 54, 10);

  rabbit.fillStyle(0xd0d0d5, 1);
  rabbit.fillEllipse(-7, 0, 43, 26);
  rabbit.fillStyle(0xf5f6f7, 1);
  rabbit.fillEllipse(17, -8, 25, 21);
  rabbit.fillStyle(0xd0d0d5, 1);
  rabbit.fillEllipse(16, -29, 8, 34);
  rabbit.fillEllipse(27, -28, 8, 31);
  rabbit.fillStyle(0xffadad, 0.72);
  rabbit.fillEllipse(16, -29, 3, 24);
  rabbit.fillEllipse(27, -28, 3, 22);
  rabbit.fillStyle(0xf5f6f7, 1);
  rabbit.fillCircle(-30, -1, 8);
  rabbit.fillEllipse(-14, 14, 28, 9);
  rabbit.fillEllipse(8, 14, 25, 8);
  rabbit.fillStyle(0x0a0a23, 1);
  rabbit.fillCircle(24, -11, 1.8);

  body.add([rabbit]);
  container.add([dust, shadow, body]);

  return { container, body, dust };
}

function renderWolfSprite(scene: Phaser.Scene, fromLeft: boolean): AnimalSprite {
  const container = scene.add.container(0, 0).setScale(fromLeft ? 1 : -1, 1);
  const body = scene.add.container(0, 0);
  const shadow = scene.add.graphics();
  const wolf = scene.add.graphics();

  shadow.fillStyle(0x0a0a23, 0.28);
  shadow.fillEllipse(-3, 21, 78, 12);
  wolf.lineStyle(5, 0x1b1b32, 1);
  wolf.lineBetween(-23, 3, -31, 28);
  wolf.lineBetween(21, 4, 32, 27);
  wolf.fillStyle(0x3b3b4f, 1);
  wolf.fillEllipse(-4, -6, 74, 29);
  wolf.fillStyle(0x2a2a40, 1);
  wolf.fillEllipse(37, -19, 30, 20);
  wolf.fillTriangle(25, -31, 34, -50, 39, -28);
  wolf.fillTriangle(45, -31, 57, -47, 55, -25);
  wolf.fillStyle(0xffadad, 1);
  wolf.fillCircle(46, -22, 2.2);
  wolf.fillStyle(0xd0d0d5, 0.75);
  wolf.fillTriangle(51, -17, 62, -15, 52, -12);

  body.add(wolf);
  container.add([shadow, body]);

  return { container, body };
}

function animateAnimalSprite(
  scene: Phaser.Scene,
  sprite: AnimalSprite,
  type: HuntingAnimal['type'],
  fromLeft: boolean,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    sprite.body.setY(type === 'rabbit' ? 2 : 0);
    sprite.dust?.setVisible(false);
    return;
  }

  if (type === 'rabbit') {
    scene.tweens.add({
      targets: sprite.body,
      y: -10,
      scaleX: 1.08,
      scaleY: 0.9,
      duration: 210,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    if (sprite.dust) {
      scene.tweens.add({
        targets: sprite.dust,
        alpha: 0.1,
        x: fromLeft ? -8 : 8,
        duration: 260,
        yoyo: true,
        repeat: -1,
      });
    }
    return;
  }

  scene.tweens.add({
    targets: sprite.body,
    y: type === 'elk' ? -4 : -7,
    angle: type === 'elk' ? 1.2 : 2,
    duration: type === 'elk' ? 560 : type === 'deer' ? 330 : 390,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}
