import { useExpeditionStore, type ResourceName } from '@stores/expeditionStore';

const resources: Array<{ label: string; key: ResourceName }> = [
  { label: 'Food', key: 'food' },
  { label: 'Medicine', key: 'medicine' },
  { label: 'Ammo', key: 'ammo' },
  { label: 'Wagon parts', key: 'wagonParts' },
  { label: 'Money', key: 'money' },
  { label: 'Morale', key: 'morale' },
  { label: 'Health', key: 'health' },
];

export function ResourceDashboard() {
  const currentDay = useExpeditionStore((state) => state.currentDay);
  const distanceTraveled = useExpeditionStore((state) => state.distanceTraveled);
  const totalDistance = useExpeditionStore((state) => state.totalDistance);
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const progressPercentage = Math.floor((distanceTraveled / totalDistance) * 100);

  return (
    <section className="border border-border bg-surface p-4" aria-label="Expedition status">
      <div className="grid gap-3 border-b border-border pb-4 sm:grid-cols-4">
        <Stat label="Day" value={currentDay} />
        <Stat label="Distance" value={`${distanceTraveled} / ${totalDistance} mi`} />
        <Stat label="Progress" value={`${progressPercentage}%`} />
        <Stat label="Status" value={gameStatus.replace('_', ' ')} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map(({ label, key }) => (
          <ResourceStat key={key} label={label} resourceName={key} />
        ))}
      </div>
    </section>
  );
}

function ResourceStat({
  label,
  resourceName,
}: {
  label: string;
  resourceName: ResourceName;
}) {
  const value = useExpeditionStore((state) => state[resourceName]);

  return <Stat label={label} value={value} />;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border bg-panel p-3">
      <dt className="font-mono text-base text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-bold capitalize text-foreground">{value}</dd>
    </div>
  );
}
