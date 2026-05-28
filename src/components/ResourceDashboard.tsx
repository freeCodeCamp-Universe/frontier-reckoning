import { useEffect, useRef, useState } from 'react';
import { useExpeditionStore, type ResourceName } from '@stores/expeditionStore';
import { getDifficultyConfig } from '@game/data/difficulties';
import { Badge } from '@components/ui/Badge';
import { Card } from '@components/ui/Card';
import { ResourceIcon } from '@components/ui/ResourceIcon';
import { cx } from '@components/ui/styles';
import { useSettings } from '@/hooks/useSettings';

type DashboardResourceKey = ResourceName | 'wagonCondition';

const resources: Array<{
  label: string;
  key: DashboardResourceKey;
  unit?: string;
  warningAt: number;
  criticalAt: number;
}> = [
  { label: 'Food', key: 'food', warningAt: 70, criticalAt: 30 },
  { label: 'Medicine', key: 'medicine', warningAt: 3, criticalAt: 1 },
  { label: 'Ammo', key: 'ammo', warningAt: 10, criticalAt: 3 },
  { label: 'Wagon Parts', key: 'wagonParts', warningAt: 2, criticalAt: 0 },
  { label: 'Money', key: 'money', warningAt: 40, criticalAt: 10 },
  { label: 'Morale', key: 'morale', unit: '%', warningAt: 45, criticalAt: 25 },
  { label: 'Health', key: 'health', unit: '%', warningAt: 45, criticalAt: 25 },
  {
    label: 'Wagon Condition',
    key: 'wagonCondition',
    unit: '%',
    warningAt: 50,
    criticalAt: 25,
  },
];

export function ResourceDashboard() {
  const distanceTraveled = useExpeditionStore((state) => state.distanceTraveled);
  const totalDistance = useExpeditionStore((state) => state.totalDistance);
  const expeditionName = useExpeditionStore((state) => state.expeditionName);
  const difficulty = useExpeditionStore((state) => state.difficulty);
  const [settings] = useSettings();
  const difficultyLabel = getDifficultyConfig(difficulty).label;
  const progressPercentage = Math.floor((distanceTraveled / totalDistance) * 100);
  const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);

  return (
    <Card aria-label="Resource dashboard">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">Trail Dashboard</h2>
            <Badge variant="info">{clampedProgress}% complete</Badge>
          </div>
          <p className="mt-1 font-mono text-base text-muted">
            {expeditionName || 'Frontier Expedition'}
            {settings.difficultyDisplay ? ` / ${difficultyLabel}` : null}
          </p>
        </div>
        <div className="min-w-0 lg:w-72">
          <div className="mb-1 flex items-center justify-between gap-3 font-mono text-base">
            <span className="text-muted">Trail progress</span>
            <span className="font-bold text-foreground">
              {distanceTraveled} / {totalDistance} mi
            </span>
          </div>
          <div
            className="h-3 border border-border bg-panel"
            aria-label={`Trail progress ${clampedProgress}%`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedProgress}
          >
            <div className="h-full bg-cta" style={{ width: `${clampedProgress}%` }} />
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-8">
        {resources.map(({ label, key, unit, warningAt, criticalAt }) => (
          <ResourceStat
            key={key}
            label={label}
            resourceName={key}
            reducedMotion={settings.reducedMotion}
            unit={unit}
            warningAt={warningAt}
            criticalAt={criticalAt}
          />
        ))}
      </dl>
    </Card>
  );
}

function ResourceStat({
  label,
  resourceName,
  reducedMotion,
  unit,
  warningAt,
  criticalAt,
}: {
  label: string;
  resourceName: DashboardResourceKey;
  reducedMotion: boolean;
  unit?: string;
  warningAt: number;
  criticalAt: number;
}) {
  const value = useExpeditionStore((state) => state[resourceName]);
  const warning = getResourceWarning(Number(value), warningAt, criticalAt);
  const displayValue = `${value}${unit ?? ''}`;

  return (
    <Stat
      label={label}
      value={displayValue}
      numericValue={Number(value)}
      icon={resourceName}
      reducedMotion={reducedMotion}
      emphasizeChange={resourceName === 'morale' || resourceName === 'health'}
      warning={warning}
    />
  );
}

function Stat({
  label,
  value,
  numericValue,
  icon,
  reducedMotion = false,
  emphasizeChange = false,
  warning,
}: {
  label: string;
  value: string;
  numericValue: number;
  icon: DashboardResourceKey;
  reducedMotion?: boolean;
  emphasizeChange?: boolean;
  warning: ResourceWarning;
}) {
  const previousValueRef = useRef(numericValue);
  const [changeAmount, setChangeAmount] = useState<number | null>(null);
  const changed = changeAmount !== null;

  useEffect(() => {
    const previousValue = previousValueRef.current;

    if (numericValue !== previousValue) {
      setChangeAmount(numericValue - previousValue);
      const timeout = window.setTimeout(() => setChangeAmount(null), 900);
      previousValueRef.current = numericValue;

      return () => window.clearTimeout(timeout);
    }

    previousValueRef.current = numericValue;
  }, [numericValue]);

  return (
    <div
      aria-label={`${label} resource`}
      className={cx(
        'min-w-0 border bg-panel p-2.5',
        warning
          ? 'border-cta bg-bark/30'
          : 'border-border',
        emphasizeChange ? 'fr-vital-change' : null,
        changed && !reducedMotion ? 'fr-resource-pulse' : null,
        changed && emphasizeChange ? 'border-cta bg-bark/40' : null,
      )}
      data-animating={changed && !reducedMotion ? 'true' : 'false'}
      role="group"
    >
      <dt className="flex min-w-0 items-center gap-2 font-mono text-base text-muted">
        <ResourceIcon resource={icon} className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 flex min-h-8 items-baseline justify-between gap-2 text-xl font-bold capitalize text-foreground">
        <span>{value}</span>
        {changeAmount !== null ? (
          <span className="font-mono text-base text-cta" aria-live="polite">
            {changeAmount > 0 ? '+' : ''}
            {changeAmount}
          </span>
        ) : null}
      </dd>
      {warning ? (
        <p className="mt-1 font-mono text-sm text-cta" aria-label={`${label} warning`}>
          {warning} supply
        </p>
      ) : (
        <p className="mt-1 font-mono text-sm text-muted">Stable</p>
      )}
    </div>
  );
}

type ResourceWarning = 'Low' | 'Critical' | null;

function getResourceWarning(
  value: number,
  warningAt: number,
  criticalAt: number,
): ResourceWarning {
  if (value <= criticalAt) {
    return 'Critical';
  }

  if (value <= warningAt) {
    return 'Low';
  }

  return null;
}
