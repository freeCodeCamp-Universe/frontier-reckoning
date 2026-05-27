import type { GameEvent, GameEventType } from '@game/types/event';

export type EventIllustrationKind =
  | 'storm'
  | 'sickness'
  | 'trader'
  | 'bandit'
  | 'river'
  | 'hunting'
  | 'wagon_damage'
  | 'campfire'
  | 'town'
  | 'discovery';

const categoryMap: Record<string, EventIllustrationKind> = {
  bandit: 'bandit',
  campfire: 'campfire',
  discovery: 'discovery',
  hunting: 'hunting',
  navigation: 'discovery',
  river: 'river',
  sickness: 'sickness',
  sickness_injury: 'sickness',
  storm: 'storm',
  supplies: 'trader',
  survival: 'hunting',
  town: 'town',
  trader: 'trader',
  wagon_damage: 'wagon_damage',
  wagon_breakdown: 'wagon_damage',
};

const typeMap: Partial<Record<GameEventType, EventIllustrationKind>> = {
  character_injury: 'sickness',
  character_sickness: 'sickness',
  resource_gain: 'discovery',
  resource_loss: 'bandit',
  wagon_damage: 'wagon_damage',
};

export function getEventIllustrationKind(
  event:
    | Pick<GameEvent, 'categories' | 'type' | 'title'>
    | { categories?: string[]; type?: string; title?: string },
): EventIllustrationKind {
  const categories = event.categories ?? [];
  const mappedCategory = categories
    .map((category) => categoryMap[category])
    .find((category): category is EventIllustrationKind => Boolean(category));

  if (mappedCategory) {
    return mappedCategory;
  }

  if (event.type && typeMap[event.type as GameEventType]) {
    return typeMap[event.type as GameEventType] ?? 'discovery';
  }

  const searchableTitle = event.title?.toLowerCase() ?? '';

  if (searchableTitle.includes('river')) {
    return 'river';
  }

  if (searchableTitle.includes('storm')) {
    return 'storm';
  }

  if (searchableTitle.includes('town')) {
    return 'town';
  }

  return 'discovery';
}
