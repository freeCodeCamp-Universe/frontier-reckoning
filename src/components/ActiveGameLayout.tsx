import { lazy, Suspense, useState } from 'react';
import { Home, Settings as SettingsIcon } from 'lucide-react';
import { CurrentSituationPanel } from '@components/CurrentSituationPanel';
import { GameLogPanel } from '@components/GameLogPanel';
import { PartyPanel } from '@components/PartyPanel';
import { ResourceDashboard } from '@components/ResourceDashboard';
import { SaveControls } from '@components/SaveControls';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { getTrailMapLandmarks } from '@game/data/mapLandmarks';
import { getLandmarkState } from '@game/systems/mapProgress';
import { useExpeditionStore } from '@stores/expeditionStore';
import { formatWholeNumber } from '@utils/formatResourceValue';

const LazyPhaserGame = lazy(() =>
  import('@components/PhaserGame').then((module) => ({
    default: module.PhaserGame,
  })),
);

type ActiveGameLayoutProps = {
  onNewGame: () => void;
  onReturnToMenu: () => void;
  onSaveExistsChange: (saveExists: boolean) => void;
  onSettings: () => void;
};

export function ActiveGameLayout({
  onNewGame,
  onReturnToMenu,
  onSaveExistsChange,
  onSettings,
}: ActiveGameLayoutProps) {
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const expeditionName = useExpeditionStore((state) => state.expeditionName);
  const currentDay = useExpeditionStore((state) => state.currentDay);
  const distanceTraveled = useExpeditionStore((state) => state.distanceTraveled);
  const totalDistance = useExpeditionStore((state) => state.totalDistance);
  const visitedTownIds = useExpeditionStore((state) => state.visitedTownIds);
  const crossedRiverIds = useExpeditionStore((state) => state.crossedRiverIds);
  const currentTown = useExpeditionStore((state) => state.currentTown);
  const currentRiver = useExpeditionStore((state) => state.currentRiver);

  return (
    <section
      aria-label="Active game layout"
      className="mx-auto flex max-w-7xl flex-col gap-5"
    >
      <Card as="header" className="!p-3">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center">
          <div className="flex lg:items-start">
            <Button
              aria-label="Return to Menu"
              className="min-h-10 px-3 py-2"
              onClick={onReturnToMenu}
              size="sm"
              variant="ghost"
            >
              <Home aria-hidden="true" className="size-4" />
              Menu
            </Button>
          </div>

          <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.5fr)] xl:items-center">
            <div className="min-w-0">
              <p className="font-mono text-sm uppercase tracking-normal text-muted">
                Expedition
              </p>
              <h1 className="truncate text-xl font-bold tracking-normal text-foreground">
                {expeditionName || 'Unnamed expedition'}
              </h1>
            </div>

            <dl
              aria-label="Expedition status"
              aria-live="polite"
              aria-atomic="true"
              className="grid gap-x-4 gap-y-2 font-mono text-sm text-muted sm:grid-cols-2 lg:grid-cols-4"
            >
              <StatusStat label="Day" value={formatWholeNumber(currentDay)} />
              <StatusStat
                label="Distance"
                value={`${formatWholeNumber(distanceTraveled)} / ${formatWholeNumber(totalDistance)}`}
              />
              <StatusStat label="Status" value={formatGameStatus(gameStatus)} />
              <StatusStat
                label="Location"
                value={getTrailPhase(gameStatus, currentTown?.name, currentRiver?.name)}
              />
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:col-start-2 xl:col-start-auto xl:justify-end">
            <Button
              aria-label="Settings"
              className="size-10 p-0"
              onClick={onSettings}
              size="sm"
              variant="ghost"
            >
              <SettingsIcon aria-hidden="true" className="size-5" />
            </Button>
            <SaveControls onSaveExistsChange={onSaveExistsChange} variant="compact" />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <CurrentSituationPanel onNewGame={onNewGame} />
          <ResourceDashboard />
          <TrailMapPanel
            crossedRiverIds={crossedRiverIds}
            distanceTraveled={distanceTraveled}
            totalDistance={totalDistance}
            visitedTownIds={visitedTownIds}
          />
        </div>

        <aside aria-label="Secondary expedition panels" className="flex flex-col gap-5">
          <PartyPanel />
          <GameLogPanel />
        </aside>
      </div>
    </section>
  );
}

type GameStatus = ReturnType<typeof useExpeditionStore.getState>['gameStatus'];

function StatusStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      aria-label={`${label} status`}
      className="min-w-0 border-l border-border/80 px-3 py-1"
      role="group"
    >
      <dt className="text-xs uppercase tracking-normal text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-bold capitalize text-foreground">{value}</dd>
    </div>
  );
}

function formatGameStatus(status: GameStatus) {
  return status.replace('_', ' ');
}

function getTrailPhase(
  status: GameStatus,
  currentTownName?: string,
  currentRiverName?: string,
) {
  if (currentTownName) {
    return currentTownName;
  }

  if (currentRiverName) {
    return currentRiverName;
  }

  if (status === 'camp') {
    return 'Camp';
  }

  if (status === 'event') {
    return 'Trail event';
  }

  if (status === 'victory') {
    return 'Last Lantern';
  }

  if (status === 'game_over') {
    return 'Trail ended';
  }

  return 'Open trail';
}

function TrailMapPanel({
  crossedRiverIds,
  distanceTraveled,
  totalDistance,
  visitedTownIds,
}: {
  crossedRiverIds: string[];
  distanceTraveled: number;
  totalDistance: number;
  visitedTownIds: string[];
}) {
  const progressPercentage = Math.floor((distanceTraveled / totalDistance) * 100);
  const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);
  const landmarks = getTrailMapLandmarks(totalDistance);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState(
    landmarks[0]?.id ?? 'destination',
  );
  const selectedLandmark =
    landmarks.find((landmark) => landmark.id === selectedLandmarkId) ?? landmarks[0];

  return (
    <Card as="section" aria-label="Trail Map" className="!p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase text-highlight">route view</p>
          <h2 className="mt-1 text-2xl font-bold">Trail Map</h2>
        </div>
        <div className="min-w-0 sm:w-72">
          <div className="mb-1 flex items-center justify-between gap-3 font-mono text-base">
            <span className="text-muted">Distance progress</span>
            <span className="font-bold text-foreground">
              {formatWholeNumber(distanceTraveled)} / {formatWholeNumber(totalDistance)}{' '}
              mi
            </span>
          </div>
          <div
            aria-label={`Trail map distance progress ${clampedProgress}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={clampedProgress}
            className="h-3 border border-border bg-panel"
            role="progressbar"
          >
            <div className="h-full bg-cta" style={{ width: `${clampedProgress}%` }} />
          </div>
        </div>
      </div>
      <Suspense fallback={<PhaserGameLoadingFallback />}>
        <LazyPhaserGame />
      </Suspense>
      {selectedLandmark ? (
        <div
          aria-label="Trail landmarks"
          className="mt-3 border border-border bg-panel p-3"
        >
          <h3 className="font-mono text-base text-muted">Route landmarks</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {landmarks.map((landmark) => {
              const state = getLandmarkState({
                id: landmark.id,
                distance: landmark.distance,
                kind: landmark.kind,
                distanceTraveled,
                visitedTownIds,
                crossedRiverIds,
              });
              const selected = landmark.id === selectedLandmark.id;

              return (
                <li key={landmark.id}>
                  <Button
                    aria-pressed={selected}
                    className="min-h-10 w-full justify-start px-3 py-2 text-left"
                    onClick={() => setSelectedLandmarkId(landmark.id)}
                    size="sm"
                    variant={selected ? 'secondary' : 'ghost'}
                  >
                    <span>
                      <span className="block">{landmark.name}</span>
                      <span className="block font-normal capitalize text-muted">
                        {state} / {formatWholeNumber(landmark.distance)} mi
                      </span>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
          <div
            className="mt-3 border border-border bg-canvas p-3"
            data-testid="trail-landmark-details"
          >
            <p className="text-xl font-bold">{selectedLandmark.name}</p>
            <p className="mt-1 font-mono text-base capitalize text-highlight">
              {selectedLandmark.kind} / {formatWholeNumber(selectedLandmark.distance)} mi
            </p>
            <p className="mt-2 text-base text-muted">{selectedLandmark.description}</p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function PhaserGameLoadingFallback() {
  return (
    <div className="overflow-hidden border border-border bg-panel">
      <div className="flex min-h-60 w-full items-center justify-center px-4 sm:min-h-[320px]">
        <p className="font-mono text-base text-muted" role="status">
          Loading trail map...
        </p>
      </div>
    </div>
  );
}
