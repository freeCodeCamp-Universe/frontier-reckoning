import { Flame, Package, Play, Settings, Waves } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

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
    <section className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center gap-6 overflow-hidden">
      <div className="relative border border-border bg-surface p-5 sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,59,79,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(59,59,79,0.24)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-cta"
        />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <header>
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              Frontier Reckoning
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-muted">
              Lead a caravan through scarce supplies, uneasy crossings, and the
              hard choices waiting beyond the map.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={onNewExpedition} className="sm:min-w-48">
                <Play aria-hidden="true" className="size-5" />
                Start Expedition
              </Button>
              {canContinue ? (
                <Button
                  onClick={onContinue}
                  variant="secondary"
                  className="sm:min-w-36"
                >
                  Continue
                </Button>
              ) : null}
              <Button onClick={onSettings} variant="ghost" className="sm:min-w-32">
                <Settings aria-hidden="true" className="size-5" />
                Settings
              </Button>
            </div>
          </header>

          <Card
            as="div"
            variant="panel"
            aria-label="Caravan status"
            role="complementary"
            className="p-5"
          >
            <p className="font-mono text-base text-highlight">caravan status</p>
            <dl className="mt-4 grid gap-3">
              <StatusRow label="Trail" value="Uncharted" />
              <StatusRow label="Supplies" value="Carefully packed" />
              <StatusRow label="Morale" value="Holding steady" />
              <StatusRow label="Destination" value="Last Lantern" />
            </dl>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon={Package}
          title="Manage Supplies"
          description="Track food, medicine, parts, and morale before the trail takes its share."
        />
        <FeatureCard
          icon={Flame}
          title="Survive Events"
          description="Respond to weather, illness, traders, and danger with limited choices."
        />
        <FeatureCard
          icon={Waves}
          title="Cross Rivers"
          description="Weigh risk, cost, and timing when the road ends at deep water."
        />
      </div>
    </section>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <dt className="font-mono text-base text-muted">{label}</dt>
      <dd className="text-right font-bold text-foreground">{value}</dd>
    </div>
  );
}

function FeatureCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof Package;
  title: string;
}) {
  return (
    <Card as="article" variant="panel" className="p-4">
      <Icon aria-hidden="true" className="size-6 text-cta" />
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-base text-muted">{description}</p>
    </Card>
  );
}
