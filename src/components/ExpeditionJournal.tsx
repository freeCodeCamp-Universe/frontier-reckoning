import { useMemo, useState, type KeyboardEvent } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card, CardEyebrow } from '@components/ui/Card';
import { cx } from '@components/ui/styles';
import {
  createJournalEntries,
  createJournalSummary,
  exportJournalAsText,
  filterJournalEntries,
  groupJournalEntries,
  journalCategories,
  type JournalCategory,
} from '@game/systems/journalSystem';
import type { FrontierReckoningData } from '@stores/expeditionStore';

type ExpeditionJournalProps = {
  isOpen: boolean;
  onClose: () => void;
  state: FrontierReckoningData;
};

export function ExpeditionJournal({ isOpen, onClose, state }: ExpeditionJournalProps) {
  const [category, setCategory] = useState<JournalCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showExport, setShowExport] = useState(false);
  const summary = createJournalSummary(state);
  const entries = useMemo(
    () => createJournalEntries(state.gameLog, state.currentDay),
    [state.currentDay, state.gameLog],
  );
  const visibleEntries = filterJournalEntries(entries, { category, search });
  const groups = groupJournalEntries(visibleEntries);
  const exportText = exportJournalAsText(state);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 px-4 py-6"
      role="presentation"
    >
      <Card
        as="section"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-title"
        className="max-h-full w-full max-w-5xl overflow-y-auto p-5"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardEyebrow>expedition archive</CardEyebrow>
            <h2 id="journal-title" className="mt-1 text-3xl font-bold">
              Expedition Journal
            </h2>
            <p className="mt-2 text-base text-muted">
              Review the run chronologically by day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setShowExport((value) => !value)}>
              Export Plain Text
            </Button>
            <Button onClick={onClose} aria-label="Close journal">
              Close
            </Button>
          </div>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Current run summary">
          <SummaryStat label="Expedition" value={summary.expeditionName} />
          <SummaryStat label="Day" value={String(summary.currentDay)} />
          <SummaryStat label="Distance" value={summary.distance} />
          <SummaryStat label="Status" value={summary.status} />
          <SummaryStat label="Survivors" value={summary.survivors} />
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border border-border bg-panel p-4" aria-label="Journal filters">
            <label htmlFor="journal-search" className="font-mono text-base text-muted">
              Search log text
            </label>
            <input
              id="journal-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-2 w-full border border-border bg-canvas px-3 py-2 text-foreground outline-none focus:border-highlight"
              type="search"
            />

            <fieldset className="mt-4">
              <legend className="font-mono text-base text-muted">Category</legend>
              <div className="mt-2 grid gap-2">
                <FilterButton
                  active={category === 'all'}
                  label="All"
                  onClick={() => setCategory('all')}
                />
                {journalCategories.map((journalCategory) => (
                  <FilterButton
                    key={journalCategory}
                    active={category === journalCategory}
                    label={journalCategory}
                    onClick={() => setCategory(journalCategory)}
                  />
                ))}
              </div>
            </fieldset>
          </aside>

          <section aria-label="Journal entries">
            {showExport ? (
              <div className="mb-4 border border-border bg-panel p-4">
                <label htmlFor="journal-export" className="font-mono text-base text-muted">
                  Plain text export
                </label>
                <textarea
                  id="journal-export"
                  readOnly
                  value={exportText}
                  className="mt-2 min-h-56 w-full border border-border bg-canvas p-3 font-mono text-base text-foreground"
                />
              </div>
            ) : null}

            {groups.length === 0 ? (
              <p className="border border-border bg-panel p-4 font-mono text-base text-muted">
                No journal entries match the current filters.
              </p>
            ) : (
              <div className="grid gap-4">
                {groups.map((group) => (
                  <section key={group.day} aria-labelledby={`journal-day-${group.day}`}>
                    <h3 id={`journal-day-${group.day}`} className="font-mono text-xl font-bold text-highlight">
                      Day {group.day}
                    </h3>
                    <ol className="mt-2 grid gap-2">
                      {group.entries.map((entry) => (
                        <li
                          key={entry.id}
                          className={cx(
                            'border bg-panel p-3 font-mono text-base',
                            entry.important
                              ? 'border-cta text-foreground'
                              : 'border-border text-muted',
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.important ? <Badge variant="warning">Important</Badge> : null}
                            {entry.categories.map((entryCategory) => (
                              <Badge key={entryCategory} variant="muted">
                                {entryCategory}
                              </Badge>
                            ))}
                          </div>
                          <p className="mt-2">{entry.text}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-panel p-3">
      <p className="font-mono text-base text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold capitalize">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        'border px-3 py-2 text-left font-mono text-base capitalize',
        active
          ? 'border-highlight bg-canvas text-highlight'
          : 'border-border bg-surface text-muted hover:border-highlight hover:text-highlight',
      )}
    >
      {label}
    </button>
  );
}
