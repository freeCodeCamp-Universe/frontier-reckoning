import { useExpeditionStore, type ResourceName } from '@stores/expeditionStore';
import { getDifficultyConfig } from '@game/data/difficulties';
import { Badge } from '@components/ui/Badge';
import { Card } from '@components/ui/Card';
import { ResourceIcon } from '@components/ui/ResourceIcon';
import { useSettings } from '@/hooks/useSettings';

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
  const wagonCondition = useExpeditionStore((state) => state.wagonCondition);
  const expeditionName = useExpeditionStore((state) => state.expeditionName);
  const difficulty = useExpeditionStore((state) => state.difficulty);
  const [settings] = useSettings();
  const difficultyLabel = getDifficultyConfig(difficulty).label;
  const progressPercentage = Math.floor((distanceTraveled / totalDistance) * 100);
  const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);

  return (
    <Card aria-label="Expedition status">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Trail Dashboard</h2>
            <p className="mt-1 font-mono text-base text-muted">
              {expeditionName || 'Frontier Expedition'}
              {settings.difficultyDisplay ? ` / ${difficultyLabel}` : null}
            </p>
          </div>
          <Badge variant="info">{clampedProgress}% complete</Badge>
        </div>
        <div
          className="h-4 border border-border bg-panel"
          aria-label={`Trail progress ${clampedProgress}%`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedProgress}
        >
          <div className="h-full bg-cta" style={{ width: `${clampedProgress}%` }} />
        </div>
      </div>
      <div className="grid gap-3 border-b border-border pb-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Day" value={currentDay} />
        <Stat label="Distance" value={`${distanceTraveled} / ${totalDistance} mi`} />
        <Stat label="Progress" value={`${progressPercentage}%`} />
        <Stat label="Wagon" value={`${wagonCondition}%`} icon="wagonCondition" />
        <Stat label="Status" value={gameStatus.replace('_', ' ')} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map(({ label, key }) => (
          <ResourceStat key={key} label={label} resourceName={key} />
        ))}
      </div>
    </Card>
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

  return <Stat label={label} value={value} icon={resourceName} />;
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: ResourceName | 'wagonCondition';
}) {
  return (
    <Card as="div" variant="panel" className="p-3">
      <dt className="flex items-center gap-2 font-mono text-base text-muted">
        {icon ? <ResourceIcon resource={icon} /> : null}
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold capitalize text-foreground">{value}</dd>
    </Card>
  );
}
