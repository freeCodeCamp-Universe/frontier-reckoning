import { Button } from '@components/ui/Button';
import {
  calculateScore,
  getGameOverReasonText,
  getSurvivors,
} from '@game/systems/endingSystem';
import { useExpeditionStore } from '@stores/expeditionStore';

export function EndingScreen() {
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const gameOverReason = useExpeditionStore((state) => state.gameOverReason);
  const resetGame = useExpeditionStore((state) => state.resetGame);
  const state = useExpeditionStore((currentState) => currentState);

  if (gameStatus !== 'game_over' && gameStatus !== 'victory') {
    return null;
  }

  const survivors = getSurvivors(state);
  const score = calculateScore(state);

  return (
    <section className="border border-border bg-surface p-5" aria-label="Ending screen">
      <p className="font-mono text-base text-highlight">
        {gameStatus === 'victory' ? 'expedition complete' : 'expedition ended'}
      </p>
      <h2 className="mt-2 text-3xl font-bold">
        {gameStatus === 'victory' ? 'Victory' : 'Game Over'}
      </h2>
      <p className="mt-3 text-muted">
        {gameStatus === 'victory'
          ? 'The caravan reaches the destination.'
          : getGameOverReasonText(gameOverReason)}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Days traveled" value={state.currentDay} />
        <SummaryCard label="Survivors" value={survivors.length} />
        <SummaryCard
          label="Distance traveled"
          value={`${state.distanceTraveled} / ${state.totalDistance} mi`}
        />
        <SummaryCard label="Final money" value={`$${state.money}`} />
        <SummaryCard label="Reputation" value="Frontier-tested" />
        <SummaryCard label="Score" value={score} />
      </div>

      <Button onClick={resetGame} className="mt-5">
        Restart
      </Button>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border bg-panel p-3">
      <dt className="font-mono text-base text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-foreground">{value}</dd>
    </div>
  );
}
