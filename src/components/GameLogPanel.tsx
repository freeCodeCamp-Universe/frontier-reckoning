import { useExpeditionStore } from '@stores/expeditionStore';

export function GameLogPanel() {
  const gameLog = useExpeditionStore((state) => state.gameLog);
  const latestMessage = gameLog[0];

  return (
    <section className="border border-border bg-surface p-4" aria-label="Game log">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <div>
          <p className="font-mono text-base text-highlight">trail dispatch</p>
          <h2 className="mt-1 text-2xl font-bold">Game Log</h2>
        </div>
        <p className="font-mono text-base text-muted">{gameLog.length} entries</p>
      </div>

      {latestMessage ? (
        <p
          className="mt-4 border border-success bg-panel p-3 font-mono text-base text-success"
          role="status"
        >
          {latestMessage}
        </p>
      ) : null}

      <ol className="mt-4 max-h-72 space-y-2 overflow-y-auto">
        {gameLog.length === 0 ? (
          <li className="font-mono text-base text-muted">No trail events recorded yet</li>
        ) : (
          gameLog.map((entry, index) => (
            <li
              key={`${entry}-${index}`}
              className="border border-border bg-panel px-3 py-2 font-mono text-base text-muted"
            >
              {entry}
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
