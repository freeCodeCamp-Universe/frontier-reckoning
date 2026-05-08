import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@game/config';
import { TrailMapScene } from '@game/scenes/TrailMapScene';
import { useExpeditionStore } from '@stores/expeditionStore';

function updateTrailMapScene(
  game: Phaser.Game | null,
  distanceTraveled: number,
  totalDistance: number,
) {
  if (!game) {
    return;
  }

  game.registry.set('distanceTraveled', distanceTraveled);
  game.registry.set('totalDistance', totalDistance);

  const scene = game.scene.getScene('TrailMapScene');

  if (scene instanceof TrailMapScene) {
    scene.updateMapProgress({ distanceTraveled, totalDistance });
  }
}

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const distanceTraveled = useExpeditionStore((state) => state.distanceTraveled);
  const totalDistance = useExpeditionStore((state) => state.totalDistance);

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

    updateTrailMapScene(game, distanceTraveled, totalDistance);

    const handleReady = () => {
      updateTrailMapScene(game, distanceTraveled, totalDistance);
    };

    game?.events.on('trail-map-ready', handleReady);

    return () => {
      game?.events.off('trail-map-ready', handleReady);
    };
  }, [distanceTraveled, totalDistance]);

  return (
    <section
      className="overflow-hidden rounded border border-border bg-panel"
      aria-label="Frontier Reckoning game canvas"
    >
      <div
        ref={containerRef}
        className="min-h-[360px] w-full"
        data-testid="phaser-game"
      />
    </section>
  );
}
