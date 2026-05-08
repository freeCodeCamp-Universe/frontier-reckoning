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

  it('initializes the party on game start', () => {
    useExpeditionStore.getState().startGame();

    expect(useExpeditionStore.getState().party).toHaveLength(4);
    expect(useExpeditionStore.getState().party.map((character) => character.role)).toEqual([
      'Scout',
      'Doctor',
      'Hunter',
      'Mechanic',
    ]);
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

  it('clamps character health between zero and one hundred', () => {
    useExpeditionStore.getState().startGame();

    useExpeditionStore.getState().damageCharacter('scout', 250);
    expect(useExpeditionStore.getState().party[0]).toMatchObject({
      health: 0,
      status: 'dead',
    });

    useExpeditionStore.getState().resetGame();
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().damageCharacter('scout', 25);
    useExpeditionStore.getState().healCharacter('scout', 250);

    expect(useExpeditionStore.getState().party[0]).toMatchObject({
      health: 100,
      status: 'healthy',
    });
  });

  it('does not heal dead characters above zero', () => {
    useExpeditionStore.getState().startGame();

    useExpeditionStore.getState().killCharacter('doctor');
    useExpeditionStore.getState().healCharacter('doctor', 50);

    expect(useExpeditionStore.getState().party[1]).toMatchObject({
      health: 0,
      status: 'dead',
    });
  });
});
