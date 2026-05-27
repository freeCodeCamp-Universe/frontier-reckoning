import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('phaser', () => {
  class Scene {
    constructor(public key?: string) {}
  }

  return {
    default: {
      Scene,
    },
  };
});

const createChainable = () => {
  const chainable = {
    add: vi.fn(() => chainable),
    clear: vi.fn(() => chainable),
    fillCircle: vi.fn(() => chainable),
    fillRect: vi.fn(() => chainable),
    fillRoundedRect: vi.fn(() => chainable),
    fillStyle: vi.fn(() => chainable),
    lineBetween: vi.fn(() => chainable),
    lineStyle: vi.fn(() => chainable),
    setAlpha: vi.fn(() => chainable),
    setDepth: vi.fn(() => chainable),
    setFillStyle: vi.fn(() => chainable),
    setInteractive: vi.fn(() => chainable),
    setOrigin: vi.fn(() => chainable),
    setPosition: vi.fn(() => chainable),
    setSize: vi.fn(() => chainable),
    setStrokeStyle: vi.fn(() => chainable),
    setText: vi.fn(() => chainable),
    setVisible: vi.fn(() => chainable),
    strokeRoundedRect: vi.fn(() => chainable),
    on: vi.fn(() => chainable),
    stop: vi.fn(),
    y: 0,
  };

  return chainable;
};

describe('TrailMapScene', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('initializes polished map visuals without crashing', async () => {
    const { TrailMapScene } = await import('@game/scenes/TrailMapScene');
    const emit = vi.fn();
    const scene = new TrailMapScene();
    const gameObject = createChainable();
    const graphics = createChainable();

    Object.assign(scene, {
      add: {
        arc: vi.fn(() => gameObject),
        circle: vi.fn(() => gameObject),
        container: vi.fn(() => gameObject),
        ellipse: vi.fn(() => gameObject),
        graphics: vi.fn(() => graphics),
        line: vi.fn(() => gameObject),
        rectangle: vi.fn(() => gameObject),
        text: vi.fn(() => gameObject),
      },
      cameras: {
        main: {
          setBackgroundColor: vi.fn(),
        },
      },
      game: {
        events: {
          emit,
        },
      },
      registry: {
        get: vi.fn((key: string) => {
          const values: Record<string, unknown> = {
            crossedRiverIds: ['blackwater-crossing'],
            currentDay: 7,
            distanceTraveled: 820,
            totalDistance: 2000,
            visitedTownIds: ['ash-hollow'],
          };

          return values[key];
        }),
      },
      tweens: {
        add: vi.fn(() => ({ stop: vi.fn() })),
      },
    });

    expect(() => scene.create()).not.toThrow();
    expect(graphics.fillRoundedRect).toHaveBeenCalled();
    expect(graphics.lineBetween).toHaveBeenCalled();
    expect(gameObject.setInteractive).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith('trail-map-ready');
  });
});
