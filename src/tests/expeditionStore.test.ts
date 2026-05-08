import { beforeEach, describe, expect, it } from 'vitest';
import {
  initialGameState,
  startingGameState,
  useExpeditionStore,
} from '@stores/expeditionStore';

describe('useExpeditionStore', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('initializes correctly', () => {
    expect(useExpeditionStore.getState()).toMatchObject(initialGameState);
  });

  it('startGame sets correct values', () => {
    useExpeditionStore.getState().startGame();

    expect(useExpeditionStore.getState()).toMatchObject(startingGameState);
  });

  it('prevents resources from going below zero', () => {
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().updateResource('food', -500);
    useExpeditionStore.getState().updateResource('money', -500);

    expect(useExpeditionStore.getState().food).toBe(0);
    expect(useExpeditionStore.getState().money).toBe(0);
  });

  it('clamps morale and health between zero and one hundred', () => {
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().updateResource('morale', 50);
    useExpeditionStore.getState().updateResource('health', 50);

    expect(useExpeditionStore.getState().morale).toBe(100);
    expect(useExpeditionStore.getState().health).toBe(100);

    useExpeditionStore.getState().updateResource('morale', -150);
    useExpeditionStore.getState().updateResource('health', -150);

    expect(useExpeditionStore.getState().morale).toBe(0);
    expect(useExpeditionStore.getState().health).toBe(0);
  });
});
