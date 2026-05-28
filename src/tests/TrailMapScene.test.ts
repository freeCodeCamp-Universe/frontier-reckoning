import { beforeEach, describe, expect, it, vi } from 'vitest';
import { riverCrossings } from '@game/data/riverCrossings';
import { towns } from '@game/data/towns';

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
    setScale: vi.fn(() => chainable),
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
    const text = vi.fn(() => gameObject);

    Object.assign(scene, {
      add: {
        arc: vi.fn(() => gameObject),
        circle: vi.fn(() => gameObject),
        container: vi.fn(() => gameObject),
        ellipse: vi.fn(() => gameObject),
        graphics: vi.fn(() => graphics),
        line: vi.fn(() => gameObject),
        rectangle: vi.fn(() => gameObject),
        text,
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
    const renderedText = text.mock.calls.map(
      (call) => (call as unknown as [number, number, string, object?])[2],
    );

    expect(renderedText).not.toContain('Frontier Reckoning');
    expect(renderedText.filter((content) => content === 'Mercy Bend')).toHaveLength(1);
    expect(renderedText.filter((content) => content === 'Last Lantern')).toHaveLength(1);
    expect(
      renderedText.some((content) => typeof content === 'string' && /^Day\b/.test(content)),
    ).toBe(false);
    expect(graphics.fillRoundedRect).toHaveBeenCalled();
    expect(graphics.lineBetween).toHaveBeenCalled();
    expect(scene.add.circle).toHaveBeenCalled();
    expect(scene.add.container).toHaveBeenCalled();
    expect(gameObject.setInteractive).toHaveBeenCalled();
    expect(gameObject.setText).not.toHaveBeenCalledWith(expect.stringMatching(/^Day\b/));
    expect(emit).toHaveBeenCalledWith('trail-map-ready');
  });

  it('uses a single Mercy Bend landmark in Reckoning Trail data', () => {
    const reckoningTrailLocations = [...towns, ...riverCrossings];
    const mercyBendLocations = reckoningTrailLocations.filter(
      (location) => location.name === 'Mercy Bend',
    );

    expect(mercyBendLocations).toHaveLength(1);
    expect(mercyBendLocations[0]).toMatchObject({
      id: 'mercy-bend',
      distance: 1550,
    });
  });
});
