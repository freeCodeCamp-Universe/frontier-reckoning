import { PhaserGame } from '@components/PhaserGame';
import { PartyPanel } from '@components/PartyPanel';
import { ResourceDashboard } from '@components/ResourceDashboard';
import { Button } from '@components/ui/Button';
import { useExpeditionStore } from '@stores/expeditionStore';

export function App() {
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const startGame = useExpeditionStore((state) => state.startGame);
  const advanceDay = useExpeditionStore((state) => state.advanceDay);

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="border-b border-border pb-5">
          <p className="font-mono text-base text-highlight">browser game scaffold</p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal sm:text-5xl">
            Frontier Reckoning
          </h1>
        </header>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={startGame}>Start Expedition</Button>
            <Button
              onClick={advanceDay}
              disabled={gameStatus !== 'traveling'}
              className="sm:min-w-44"
            >
              Travel One Day
            </Button>
          </div>
          <p className="font-mono text-base text-muted" aria-live="polite">
            {gameStatus === 'not_started'
              ? 'Awaiting launch command'
              : 'Expedition initialized'}
          </p>
        </div>

        <ResourceDashboard />

        <PartyPanel />

        <PhaserGame />
      </section>
    </main>
  );
}
