import { PhaserGame } from '@components/PhaserGame';
import { Button } from '@components/ui/Button';
import { useExpeditionStore } from '@stores/expeditionStore';

export function App() {
  const started = useExpeditionStore((state) => state.started);
  const startExpedition = useExpeditionStore((state) => state.startExpedition);

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
          <Button onClick={startExpedition}>Start Expedition</Button>
          <p className="font-mono text-base text-muted" aria-live="polite">
            {started ? 'Expedition initialized' : 'Awaiting launch command'}
          </p>
        </div>

        <PhaserGame />
      </section>
    </main>
  );
}
