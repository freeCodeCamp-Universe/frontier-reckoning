import { CampScreen } from '@components/CampScreen';
import { EndingScreen } from '@components/EndingScreen';
import { RiverEventScreen } from '@components/RiverEventScreen';
import { TownScreen } from '@components/TownScreen';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { useExpeditionStore } from '@stores/expeditionStore';

type CurrentSituationPanelProps = {
  onRestart?: () => void;
};

export function CurrentSituationPanel({ onRestart }: CurrentSituationPanelProps) {
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const currentRiver = useExpeditionStore((state) => state.currentRiver);
  const currentTown = useExpeditionStore((state) => state.currentTown);
  const advanceDay = useExpeditionStore((state) => state.advanceDay);
  const enterCamp = useExpeditionStore((state) => state.enterCamp);

  if (gameStatus === 'camp') {
    return (
      <section aria-label="Current situation">
        <CampScreen />
      </section>
    );
  }

  if (gameStatus === 'river' && currentRiver) {
    return (
      <section aria-label="Current situation">
        <RiverEventScreen />
      </section>
    );
  }

  if (gameStatus === 'town' && currentTown) {
    return (
      <section aria-label="Current situation">
        <TownScreen />
      </section>
    );
  }

  if (gameStatus === 'victory' || gameStatus === 'game_over') {
    return (
      <section aria-label="Current situation">
        <EndingScreen onRestart={onRestart} />
      </section>
    );
  }

  return (
    <section aria-label="Current situation">
      <Card as="section" aria-label="Trail Dashboard" className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Trail Dashboard</h2>
          <div
            className="grid gap-3 sm:grid-cols-2 md:min-w-[24rem]"
            data-testid="trail-dashboard-actions"
          >
            <Button
              onClick={advanceDay}
              disabled={gameStatus !== 'traveling'}
              disabledReason="Travel is available only while the expedition is traveling."
              className="w-full"
            >
              Travel One Day
            </Button>
            <Button
              onClick={enterCamp}
              disabled={gameStatus !== 'traveling'}
              disabledReason="Camp can be made only while the expedition is traveling."
              className="w-full"
              variant="secondary"
            >
              Make Camp
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
