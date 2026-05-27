import { describe, expect, it } from 'vitest';
import { createStartingGameState } from '@stores/expeditionStore';
import { CURRENT_SAVE_VERSION, migrateSave } from '@stores/saveMigrations';

describe('save migrations', () => {
  it('migrates v1 saves to v2', () => {
    const state = createStartingGameState();
    const result = migrateSave({
      saveVersion: 1,
      savedAt: '2026-05-27T00:00:00.000Z',
      state,
    });

    expect(result.status).toBe('migrated');

    if (result.status === 'migrated') {
      expect(result.save.saveVersion).toBe(CURRENT_SAVE_VERSION);
      expect(result.save.settings.autosaveEnabled).toBe(true);
      expect(result.save.discoveredLandmarks).toEqual([]);
      expect(result.save.state.temporaryModifiers).toEqual([]);
    }
  });

  it('rejects invalid saves', () => {
    const result = migrateSave({ nope: true });

    expect(result.status).toBe('invalid');

    if (result.status === 'invalid') {
      expect(result.message).toContain('version');
    }
  });

  it('rejects future save versions', () => {
    const result = migrateSave({
      saveVersion: CURRENT_SAVE_VERSION + 1,
      savedAt: '2026-05-27T00:00:00.000Z',
      state: createStartingGameState(),
    });

    expect(result.status).toBe('unsupported');

    if (result.status === 'unsupported') {
      expect(result.saveVersion).toBe(CURRENT_SAVE_VERSION + 1);
      expect(result.message).toContain('newer');
    }
  });

  it('defaults missing fields safely', () => {
    const state = createStartingGameState();
    const oldState = { ...state } as Partial<typeof state>;
    delete oldState.temporaryModifiers;
    delete oldState.gameLog;
    delete oldState.crossedRiverIds;
    delete oldState.visitedTownIds;
    const result = migrateSave({
      saveVersion: 1,
      savedAt: '2026-05-27T00:00:00.000Z',
      state: oldState,
      settings: { musicVolume: 250 },
      discoveredLandmarks: ['ash-hollow', 42],
    });

    expect(result.status).toBe('migrated');

    if (result.status === 'migrated') {
      expect(result.save.state.temporaryModifiers).toEqual([]);
      expect(result.save.state.gameLog).toEqual([]);
      expect(result.save.state.crossedRiverIds).toEqual([]);
      expect(result.save.state.visitedTownIds).toEqual([]);
      expect(result.save.settings.musicVolume).toBe(100);
      expect(result.save.discoveredLandmarks).toEqual(['ash-hollow']);
    }
  });
});
