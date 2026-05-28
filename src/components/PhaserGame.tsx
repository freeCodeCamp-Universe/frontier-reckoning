import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@game/config';
import { TrailMapScene } from '@game/scenes/TrailMapScene';
import { useExpeditionStore } from '@stores/expeditionStore';
import { useSettings } from '@/hooks/useSettings';

function updateTrailMapScene(
  game: Phaser.Game | null,
  distanceTraveled: number,
  totalDistance: number,
  currentDay: number,
  visitedTownIds: string[],
  crossedRiverIds: string[],
) {
  if (!game) {
    return;
  }

  game.registry.set('distanceTraveled', distanceTraveled);
  game.registry.set('totalDistance', totalDistance);
  game.registry.set('currentDay', currentDay);
  game.registry.set('visitedTownIds', visitedTownIds);
  game.registry.set('crossedRiverIds', crossedRiverIds);

  const scene = game.scene.getScene('TrailMapScene');

  if (scene instanceof TrailMapScene) {
    scene.updateMapProgress({
      distanceTraveled,
      totalDistance,
      currentDay,
      visitedTownIds,
      crossedRiverIds,
    });
  }
}

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const distanceTraveled = useExpeditionStore((state) => state.distanceTraveled);
  const totalDistance = useExpeditionStore((state) => state.totalDistance);
  const currentDay = useExpeditionStore((state) => state.currentDay);
  const visitedTownIds = useExpeditionStore((state) => state.visitedTownIds);
  const crossedRiverIds = useExpeditionStore((state) => state.crossedRiverIds);
  const [settings] = useSettings();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    const initialState = useExpeditionStore.getState();

    gameRef.current = new Phaser.Game(
      createGameConfig({
        parent: containerRef.current,
        mapState: {
          distanceTraveled: initialState.distanceTraveled,
          totalDistance: initialState.totalDistance,
          currentDay: initialState.currentDay,
          visitedTownIds: initialState.visitedTownIds,
          crossedRiverIds: initialState.crossedRiverIds,
        },
      }),
    );

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current;

    updateTrailMapScene(
      game,
      distanceTraveled,
      totalDistance,
      currentDay,
      visitedTownIds,
      crossedRiverIds,
    );

    const handleReady = () => {
      updateTrailMapScene(
        game,
        distanceTraveled,
        totalDistance,
        currentDay,
        visitedTownIds,
        crossedRiverIds,
      );
    };

    game?.events.on('trail-map-ready', handleReady);

    return () => {
      game?.events.off('trail-map-ready', handleReady);
    };
  }, [crossedRiverIds, currentDay, distanceTraveled, totalDistance, visitedTownIds]);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene('TrailMapScene');

    if (scene instanceof TrailMapScene) {
      scene.setReducedMotion(settings.reducedMotion);
    }
  }, [settings.reducedMotion]);

  return (
    <section
      className="overflow-hidden border border-border bg-panel"
      aria-label="Frontier Reckoning game canvas"
    >
      <div
        ref={containerRef}
        className="min-h-60 w-full sm:min-h-[360px]"
        data-testid="phaser-game"
      />
    </section>
  );
}
