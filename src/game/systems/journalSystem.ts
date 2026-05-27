import type { FrontierReckoningData } from '@stores/expeditionStore';

export type JournalCategory =
  | 'travel'
  | 'camp'
  | 'town'
  | 'hunting'
  | 'river'
  | 'illness'
  | 'death'
  | 'victory';

export type JournalEntry = {
  id: string;
  day: number;
  text: string;
  categories: JournalCategory[];
  important: boolean;
};

export type JournalDayGroup = {
  day: number;
  entries: JournalEntry[];
};

export const journalCategories: JournalCategory[] = [
  'travel',
  'camp',
  'town',
  'hunting',
  'river',
  'illness',
  'death',
  'victory',
];

export function createJournalEntries(
  gameLog: string[],
  currentDay: number,
): JournalEntry[] {
  let activeDay = gameLog.some((entry) => getExplicitDay(entry))
    ? 1
    : Math.max(1, currentDay);

  return [...gameLog]
    .reverse()
    .map((text, index) => {
      const explicitDay = getExplicitDay(text);

      if (explicitDay) {
        activeDay = explicitDay;
      }

      return {
        id: `${activeDay}-${index}-${text}`,
        day: activeDay,
        text,
        categories: getJournalCategories(text),
        important: isImportantJournalEntry(text),
      };
    });
}

export function groupJournalEntries(entries: JournalEntry[]): JournalDayGroup[] {
  return entries.reduce<JournalDayGroup[]>((groups, entry) => {
    const existingGroup = groups.find((group) => group.day === entry.day);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      return groups;
    }

    groups.push({ day: entry.day, entries: [entry] });
    return groups;
  }, []);
}

export function filterJournalEntries(
  entries: JournalEntry[],
  options: { category?: JournalCategory | 'all'; search?: string },
) {
  const normalizedSearch = options.search?.trim().toLowerCase() ?? '';

  return entries.filter((entry) => {
    const categoryMatches =
      !options.category ||
      options.category === 'all' ||
      entry.categories.includes(options.category);
    const searchMatches =
      normalizedSearch.length === 0 ||
      entry.text.toLowerCase().includes(normalizedSearch) ||
      entry.categories.some((category) => category.includes(normalizedSearch));

    return categoryMatches && searchMatches;
  });
}

export function createJournalSummary(state: Pick<
  FrontierReckoningData,
  | 'expeditionName'
  | 'currentDay'
  | 'distanceTraveled'
  | 'totalDistance'
  | 'gameStatus'
  | 'party'
  | 'gameLog'
>) {
  const survivors = state.party.filter((character) => character.status !== 'dead');

  return {
    expeditionName: state.expeditionName || 'Unnamed Expedition',
    currentDay: state.currentDay,
    distance: `${Math.round(state.distanceTraveled)} / ${state.totalDistance} miles`,
    status: state.gameStatus.replace('_', ' '),
    survivors: `${survivors.length} / ${state.party.length}`,
    entries: state.gameLog.length,
  };
}

export function exportJournalAsText(state: FrontierReckoningData) {
  const summary = createJournalSummary(state);
  const groups = groupJournalEntries(createJournalEntries(state.gameLog, state.currentDay));
  const lines = [
    `${summary.expeditionName} Expedition Journal`,
    `Day: ${summary.currentDay}`,
    `Distance: ${summary.distance}`,
    `Status: ${summary.status}`,
    `Survivors: ${summary.survivors}`,
    '',
  ];

  groups.forEach((group) => {
    lines.push(`Day ${group.day}`);
    group.entries.forEach((entry) => {
      const marker = entry.important ? '!' : '-';
      lines.push(`${marker} [${entry.categories.join(', ')}] ${entry.text}`);
    });
    lines.push('');
  });

  return lines.join('\n').trim();
}

function getExplicitDay(text: string) {
  const match = text.match(/\bday\s+(\d+)\b/i);

  return match ? Number(match[1]) : null;
}

function getJournalCategories(text: string): JournalCategory[] {
  const normalizedText = text.toLowerCase();
  const categories = new Set<JournalCategory>();

  if (matchesAny(normalizedText, ['traveled', 'resumed travel', 'trail', 'continued'])) {
    categories.add('travel');
  }

  if (matchesAny(normalizedText, ['camp', 'rest', 'ration', 'stories'])) {
    categories.add('camp');
  }

  if (matchesAny(normalizedText, ['arrived at', 'town', 'market', 'inn', 'rumor', 'left '])) {
    categories.add('town');
  }

  if (matchesAny(normalizedText, ['hunt', 'hunting', 'food gained', 'wolf'])) {
    categories.add('hunting');
  }

  if (matchesAny(normalizedText, ['river', 'crossing', 'ferry', 'ford', 'raft'])) {
    categories.add('river');
  }

  if (matchesAny(normalizedText, ['sick', 'ill', 'injur', 'medicine', 'treat'])) {
    categories.add('illness');
  }

  if (matchesAny(normalizedText, ['died', 'dead', 'death', 'life signs lost'])) {
    categories.add('death');
  }

  if (matchesAny(normalizedText, ['victory', 'completed', 'destination'])) {
    categories.add('victory');
  }

  if (categories.size === 0) {
    categories.add('travel');
  }

  return [...categories];
}

function isImportantJournalEntry(text: string) {
  const normalizedText = text.toLowerCase();

  return matchesAny(normalizedText, [
    'arrived',
    'died',
    'ended',
    'event encountered',
    'reached',
    'victory',
    'wagon',
  ]);
}

function matchesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}
