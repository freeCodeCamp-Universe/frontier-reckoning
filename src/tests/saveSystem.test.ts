import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSaveFromStorage,
  loadGameFromStorage,
  saveGameToStorage,
  SAVE_STORAGE_KEY,
  SAVE_VERSION,
} from '@game/systems/saveSystem';
import { useExpeditionStore } from '@stores/expeditionStore';

describe('saveSystem', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  it('serializes saves correctly', () => {
    useExpeditionStore.getState().startGame();
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    const rawSave = window.localStorage.getItem(SAVE_STORAGE_KEY);

    expect(rawSave).not.toBeNull();

    const save = JSON.parse(rawSave!);

    expect(save.saveVersion).toBe(SAVE_VERSION);
    expect(save.state.currentDay).toBe(1);
    expect(save.state.food).toBe(180);
    expect(save.state.startGame).toBeUndefined();
  });

  it('load restores state', () => {
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().updateResource('food', -25);
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());
    useExpeditionStore.getState().resetGame();

    const result = loadGameFromStorage(window.localStorage);

    expect(result.status).toBe('loaded');

    if (result.status === 'loaded') {
      useExpeditionStore.setState(result.save.state);
    }

    expect(useExpeditionStore.getState().food).toBe(155);
    expect(useExpeditionStore.getState().gameStatus).toBe('traveling');
  });

  it('invalid save is ignored', () => {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ nope: true }));

    const result = loadGameFromStorage(window.localStorage);

    expect(result.status).toBe('invalid');
    expect(useExpeditionStore.getState().gameStatus).toBe('not_started');
  });

  it('reset clears save', () => {
    useExpeditionStore.getState().startGame();
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    clearSaveFromStorage(window.localStorage);

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();
    expect(loadGameFromStorage(window.localStorage).status).toBe('empty');
  });

  it('old save version is unsupported', () => {
    window.localStorage.setItem(
      SAVE_STORAGE_KEY,
      JSON.stringify({ saveVersion: 0, state: {} }),
    );

    expect(loadGameFromStorage(window.localStorage)).toEqual({
      status: 'unsupported',
      saveVersion: 0,
    });
  });
});
