import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HuntingMiniGame } from '@components/HuntingMiniGame';
import { createStartingGameState } from '@stores/expeditionStore';
import { isTextEntryTarget } from '@utils/keyboard';

const { destroyMock, playSfxMock, setPositionMock } = vi.hoisted(() => ({
  destroyMock: vi.fn(),
  playSfxMock: vi.fn(),
  setPositionMock: vi.fn(),
}));

vi.mock('@game/systems/audioSystem', () => ({
  audioSystem: {
    playSfx: playSfxMock,
  },
}));

vi.mock('phaser', () => {
  class Scene {
    add = {
      container: vi.fn(() => ({
        add: vi.fn(),
        setDepth: vi.fn().mockReturnThis(),
        setPosition: setPositionMock,
        x: 480,
        y: 270,
      })),
      graphics: vi.fn(() => ({
        fillCircle: vi.fn(),
        fillEllipse: vi.fn(),
        fillRect: vi.fn(),
        fillStyle: vi.fn(),
        fillTriangle: vi.fn(),
        lineBetween: vi.fn(),
        lineStyle: vi.fn(),
        strokeCircle: vi.fn(),
      })),
      text: vi.fn(() => ({ setText: vi.fn() })),
    };
  }

  class Game {
    destroy = destroyMock;
  }

  return {
    default: {
      AUTO: 'AUTO',
      Math: {
        Clamp: (value: number, min: number, max: number) =>
          Math.min(Math.max(value, min), max),
      },
      Scale: {
        FIT: 'FIT',
        CENTER_BOTH: 'CENTER_BOTH',
      },
      Scene,
      Game,
    },
  };
});

describe('HuntingMiniGame keyboard access', () => {
  beforeEach(() => {
    destroyMock.mockClear();
    playSfxMock.mockClear();
    setPositionMock.mockClear();
  });

  it('makes the hunting range focusable and operable with keyboard controls', () => {
    render(
      <HuntingMiniGame
        ammoAvailable={3}
        gameState={createStartingGameState()}
        reducedMotion
        onComplete={() => undefined}
      />,
    );

    const range = screen.getByRole('button', { name: /Hunting range/i });

    range.focus();
    expect(range).toHaveFocus();

    fireEvent.keyDown(range, { key: 'ArrowRight' });
    expect(setPositionMock).toHaveBeenCalledWith(504, 270);

    fireEvent.keyDown(range, { key: ' ', target: range });
    expect(playSfxMock).toHaveBeenCalledWith('hunting_shot');
    expect(screen.getByRole('status')).toHaveTextContent('Miss. Ammo 2.');
  });

  it('suppresses single-key hunting shortcuts from text-entry targets', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const editable = document.createElement('div');
    const button = document.createElement('button');

    editable.setAttribute('contenteditable', 'true');

    expect(isTextEntryTarget(input)).toBe(true);
    expect(isTextEntryTarget(textarea)).toBe(true);
    expect(isTextEntryTarget(editable)).toBe(true);
    expect(isTextEntryTarget(button)).toBe(false);
  });
});
