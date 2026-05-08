import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExpeditionStore } from '@stores/expeditionStore';

const destroyMock = vi.fn();
const onMock = vi.fn();
const offMock = vi.fn();
const setMock = vi.fn();
const getSceneMock = vi.fn(() => undefined);

vi.mock('phaser', () => {
  class Scene {}

  class Game {
    registry = { set: setMock };
    scene = { getScene: getSceneMock };
    events = { on: onMock, off: offMock };
    destroy = destroyMock;
  }

  return {
    default: {
      AUTO: 'AUTO',
      Scale: {
        FIT: 'FIT',
        CENTER_BOTH: 'CENTER_BOTH',
      },
      Scene,
      Game,
    },
  };
});

describe('PhaserGame', () => {
  beforeEach(() => {
    destroyMock.mockClear();
    onMock.mockClear();
    offMock.mockClear();
    setMock.mockClear();
    getSceneMock.mockClear();
    useExpeditionStore.getState().resetGame();
  });

  it('mounts and unmounts cleanly', async () => {
    const { PhaserGame } = await import('@components/PhaserGame');
    const { unmount } = render(<PhaserGame />);

    expect(onMock).toHaveBeenCalledWith('trail-map-ready', expect.any(Function));

    unmount();

    expect(offMock).toHaveBeenCalledWith('trail-map-ready', expect.any(Function));
    expect(destroyMock).toHaveBeenCalledWith(true);
  });
});
