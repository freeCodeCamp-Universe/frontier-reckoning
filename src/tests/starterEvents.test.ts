import { describe, expect, it } from 'vitest';
import { starterEvents } from '@game/data/starterEvents';
import type { EventEffects, GameEventCategory, GameEventType } from '@game/types/event';
import type { ResourceName } from '@stores/expeditionStore';

const validTypes = new Set<GameEventType>([
  'resource_loss',
  'resource_gain',
  'character_injury',
  'character_sickness',
  'morale_change',
  'wagon_damage',
  'choice',
]);

const validCategories = new Set<GameEventCategory>([
  'campfire',
  'sickness_injury',
  'wagon_breakdown',
  'trader',
  'bandit',
  'survival',
  'navigation',
  'supplies',
]);

const validResources = new Set<ResourceName>([
  'food',
  'medicine',
  'ammo',
  'wagonParts',
  'money',
  'morale',
  'health',
]);

function expectValidEffects(effects: EventEffects) {
  expect(Array.isArray(effects)).toBe(true);

  for (const effect of effects) {
    expect(effect.type).toBeTruthy();

    if ('amount' in effect) {
      expect(typeof effect.amount, effect.type).toBe('number');
      expect(Number.isFinite(effect.amount), effect.type).toBe(true);
    }

    if (effect.type === 'change_resource') {
      expect(validResources.has(effect.resource), effect.resource).toBe(true);
    }

    if (effect.type === 'change_single_character_status') {
      expect(['healthy', 'sick', 'injured', 'dead']).toContain(effect.status);
    }
  }
}

describe('starterEvents', () => {
  it('contains the requested event counts', () => {
    expect(starterEvents).toHaveLength(50);
    expect(starterEvents.filter((event) => event.type === 'choice')).toHaveLength(25);
    expect(
      starterEvents.filter((event) => event.categories.includes('campfire')),
    ).toHaveLength(10);
    expect(
      starterEvents.filter((event) => event.categories.includes('sickness_injury')),
    ).toHaveLength(8);
    expect(
      starterEvents.filter((event) => event.categories.includes('wagon_breakdown')),
    ).toHaveLength(6);
    expect(
      starterEvents.filter((event) => event.categories.includes('trader')),
    ).toHaveLength(6);
    expect(
      starterEvents.filter((event) => event.categories.includes('bandit')),
    ).toHaveLength(5);
  });

  it('gives every event required fields', () => {
    for (const event of starterEvents) {
      expect(event.id).toBeTruthy();
      expect(event.title).toBeTruthy();
      expect(event.description).toBeTruthy();
      expect(validTypes.has(event.type)).toBe(true);
      expect(event.weight).toBeGreaterThan(0);
      expect(event.effects).toBeDefined();
      expect(event.categories.length).toBeGreaterThan(0);
      expect(event.categories.every((category) => validCategories.has(category))).toBe(
        true,
      );

      if (event.type === 'choice') {
        expect(event.choices?.length).toBeGreaterThan(0);
      }
    }
  });

  it('uses unique event ids and titles', () => {
    expect(new Set(starterEvents.map((event) => event.id)).size).toBe(
      starterEvents.length,
    );
    expect(new Set(starterEvents.map((event) => event.title)).size).toBe(
      starterEvents.length,
    );
  });

  it('uses unique choice ids within each event', () => {
    for (const event of starterEvents) {
      const choiceIds = event.choices?.map((choice) => choice.id) ?? [];

      expect(new Set(choiceIds).size).toBe(choiceIds.length);
    }
  });

  it('uses valid event and choice effects', () => {
    for (const event of starterEvents) {
      expectValidEffects(event.effects);

      for (const choice of event.choices ?? []) {
        expect(choice.id).toBeTruthy();
        expect(choice.label).toBeTruthy();
        expect(choice.description).toBeTruthy();
        expect(choice.outcomeText).toBeTruthy();
        expectValidEffects(choice.effects);
      }
    }
  });
});
