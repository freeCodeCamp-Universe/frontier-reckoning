import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@game/config';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = new Phaser.Game(
      createGameConfig({ parent: containerRef.current }),
    );

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

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
