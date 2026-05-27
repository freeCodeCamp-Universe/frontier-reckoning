import { describe, expect, it } from 'vitest';
import {
  createJournalEntries,
  exportJournalAsText,
  filterJournalEntries,
  groupJournalEntries,
} from '@game/systems/journalSystem';
import { createStartingGameState } from '@stores/expeditionStore';

describe('journal system', () => {
  const gameLog = [
    'Victory at the destination.',
    'A traveler died after the fever worsened.',
    'The hunting party returned with food. Food gained: 18.',
    'The caravan made camp.',
    'Traveled to day 3.',
    'Reached Blue Fork River.',
    'Arrived at Dustfall.',
    'Traveled to day 2.',
    'Frontier Expedition started on Trailwise.',
  ];

  it('groups log entries by day chronologically', () => {
    const entries = createJournalEntries(gameLog, 3);
    const groups = groupJournalEntries(entries);

    expect(groups.map((group) => group.day)).toEqual([1, 2, 3]);
    expect(groups[0].entries[0].text).toBe('Frontier Expedition started on Trailwise.');
    expect(groups[1].entries.map((entry) => entry.text)).toEqual([
      'Traveled to day 2.',
      'Arrived at Dustfall.',
      'Reached Blue Fork River.',
    ]);
  });

  it('filters entries by category', () => {
    const entries = createJournalEntries(gameLog, 3);

    expect(filterJournalEntries(entries, { category: 'river' })).toHaveLength(1);
    expect(filterJournalEntries(entries, { category: 'hunting' })[0].text).toContain(
      'hunting',
    );
    expect(filterJournalEntries(entries, { category: 'death' })[0].text).toContain(
      'died',
    );
  });

  it('searches log text and categories', () => {
    const entries = createJournalEntries(gameLog, 3);

    expect(filterJournalEntries(entries, { search: 'Dustfall' })[0].text).toContain(
      'Dustfall',
    );
    expect(filterJournalEntries(entries, { search: 'victory' })[0].text).toContain(
      'Victory',
    );
  });

  it('exports key events as plain text', () => {
    const state = {
      ...createStartingGameState(),
      currentDay: 3,
      distanceTraveled: 320,
      gameLog,
    };

    const exportText = exportJournalAsText(state);

    expect(exportText).toContain('Frontier Expedition Expedition Journal');
    expect(exportText).toContain('Day 2');
    expect(exportText).toContain('! [town] Arrived at Dustfall.');
    expect(exportText).toContain('! [victory] Victory at the destination.');
  });
});
