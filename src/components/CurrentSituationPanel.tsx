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
    <Card as="section" aria-label="Current situation" className="p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-mono text-base text-highlight">current situation</p>
          <h2 className="mt-1 text-2xl font-bold">Choose the next move</h2>
          <p className="mt-2 max-w-2xl text-muted">
            The trail is open. Push forward while conditions hold, or make camp to
            recover and manage the caravan.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={advanceDay}
            disabled={gameStatus !== 'traveling'}
            disabledReason="Travel is available only while the expedition is traveling."
            className="sm:min-w-44"
          >
            Travel One Day
          </Button>
          <Button
            onClick={enterCamp}
            disabled={gameStatus !== 'traveling'}
            disabledReason="Camp can be made only while the expedition is traveling."
            className="sm:min-w-36"
            variant="secondary"
          >
            Make Camp
          </Button>
        </div>
      </div>
    </Card>
  );
}
