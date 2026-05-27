import { Button } from '@components/ui/Button';

type MainMenuProps = {
  onNewExpedition: () => void;
  onContinue: () => void;
  onSettings: () => void;
  canContinue: boolean;
};

export function MainMenu({
  onNewExpedition,
  onContinue,
  onSettings,
  canContinue,
}: MainMenuProps) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center gap-6">
      <header className="border border-border bg-surface p-6">
        <p className="font-mono text-base text-highlight">main menu</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-6xl">Frontier Reckoning</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Name the caravan, choose the hands riding west, and decide how hard the trail
          will bite.
        </p>
      </header>

      <div className="grid gap-4 border border-border bg-surface p-4 sm:grid-cols-3">
        <Button onClick={onNewExpedition} className="w-full">
          New Expedition
        </Button>
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          disabledReason="Continue is available after saving an expedition."
        >
          Continue
        </Button>
        <Button onClick={onSettings}>Settings</Button>
      </div>
    </section>
  );
}
