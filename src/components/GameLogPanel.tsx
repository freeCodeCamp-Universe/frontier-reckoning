import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { useExpeditionStore } from '@stores/expeditionStore';

export function GameLogPanel() {
  const gameLog = useExpeditionStore((state) => state.gameLog);
  const [expanded, setExpanded] = useState(false);
  const visibleEntries = expanded ? gameLog : gameLog.slice(0, 5);
  const hiddenEntryCount = Math.max(gameLog.length - visibleEntries.length, 0);

  return (
    <>
      <section className="border border-border bg-surface p-3" aria-label="Game log">
        <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-sm uppercase text-highlight">trail dispatch</p>
            <h2 className="mt-1 text-xl font-bold">Game Log</h2>
            <p className="mt-1 font-mono text-base text-muted">
              {gameLog.length} entries
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {gameLog.length > 5 ? (
              <Button
                aria-expanded={expanded}
                aria-controls="game-log-entries"
                size="sm"
                variant="ghost"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? 'Show recent 5' : 'Show all'}
              </Button>
            ) : null}
          </div>
        </div>

        <ol
          id="game-log-entries"
          className="mt-3 max-h-72 space-y-2 overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {gameLog.length === 0 ? (
            <li className="font-mono text-base text-muted">
              No trail events recorded yet
            </li>
          ) : (
            visibleEntries.map((entry, index) => (
              <li
                key={`${entry}-${index}`}
                className="border border-border bg-panel px-3 py-2 font-mono text-base text-muted"
              >
                {entry}
              </li>
            ))
          )}
        </ol>
        {hiddenEntryCount > 0 ? (
          <p className="mt-3 font-mono text-sm text-muted">
            {hiddenEntryCount} older entries hidden
          </p>
        ) : null}
      </section>
    </>
  );
}
