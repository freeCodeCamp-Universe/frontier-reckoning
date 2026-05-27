import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card, CardEyebrow } from '@components/ui/Card';
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
    <Card
      aria-label="Ending screen"
      variant={gameStatus === 'victory' ? 'success' : 'danger'}
    >
      <CardEyebrow>
        {gameStatus === 'victory' ? 'expedition complete' : 'expedition ended'}
      </CardEyebrow>
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

      <Button
        onClick={resetGame}
        className="mt-5"
        variant={gameStatus === 'victory' ? 'primary' : 'danger'}
      >
        Restart
      </Button>
    </Card>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card as="div" variant="panel" className="p-3">
      <dt className="font-mono text-base text-muted">{label}</dt>
      <dd className="mt-1">
        <Badge variant="muted">{value}</Badge>
      </dd>
    </Card>
  );
}
