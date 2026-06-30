import { lazy, Suspense, useState } from 'react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card, CardEyebrow, CardHeader } from '@components/ui/Card';
import { useExpeditionStore } from '@stores/expeditionStore';
import { useSettings } from '@/hooks/useSettings';

const HuntingMiniGame = lazy(() =>
  import('@components/HuntingMiniGame').then((module) => ({
    default: module.HuntingMiniGame,
  })),
);

export function CampScreen() {
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const gameState = useExpeditionStore((state) => state);
  const party = useExpeditionStore((state) => state.party);
  const medicine = useExpeditionStore((state) => state.medicine);
  const wagonParts = useExpeditionStore((state) => state.wagonParts);
  const ammo = useExpeditionStore((state) => state.ammo);
  const campOutcomeText = useExpeditionStore((state) => state.campOutcomeText);
  const restAtCamp = useExpeditionStore((state) => state.restAtCamp);
  const repairWagonAtCamp = useExpeditionStore((state) => state.repairWagonAtCamp);
  const treatPartyMemberAtCamp = useExpeditionStore(
    (state) => state.treatPartyMemberAtCamp,
  );
  const tellCampfireStoriesAtCamp = useExpeditionStore(
    (state) => state.tellCampfireStoriesAtCamp,
  );
  const rationFoodAtCamp = useExpeditionStore((state) => state.rationFoodAtCamp);
  const applyHuntingResult = useExpeditionStore((state) => state.applyHuntingResult);
  const resumeTravel = useExpeditionStore((state) => state.resumeTravel);
  const [settings] = useSettings();
  const [huntingActive, setHuntingActive] = useState(false);
  const treatableParty = party.filter(
    (character) =>
      character.status !== 'dead' &&
      (character.status === 'sick' || character.status === 'injured'),
  );

  if (gameStatus !== 'camp') {
    return null;
  }

  return (
    <Card aria-label="Camp actions">
      <CardHeader>
        <CardEyebrow>camp</CardEyebrow>
        <h2 className="mt-1 text-2xl font-bold">Camp</h2>
      </CardHeader>

      {campOutcomeText ? (
        <p
          role="status"
          aria-atomic="true"
          className="mt-4 border border-success bg-panel p-3 font-mono text-base text-success"
        >
          {campOutcomeText}
        </p>
      ) : null}

      <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <li>
          <Button onClick={restAtCamp} className="h-full w-full justify-start text-left">
            Rest
          </Button>
        </li>
        <li>
          <Button
            onClick={repairWagonAtCamp}
            disabled={wagonParts <= 0}
            disabledReason="Repair wagon requires at least one wagon part."
            className="h-full w-full justify-start text-left"
          >
            Repair wagon
          </Button>
        </li>
        <li>
          <Button
            onClick={tellCampfireStoriesAtCamp}
            className="h-full w-full justify-start text-left"
          >
            Tell campfire stories
          </Button>
        </li>
        <li>
          <Button
            onClick={rationFoodAtCamp}
            className="h-full w-full justify-start text-left"
          >
            Ration food
          </Button>
        </li>
        <li>
          <Button
            onClick={resumeTravel}
            className="h-full w-full justify-start text-left"
          >
            Resume travel
          </Button>
        </li>
      </ul>

      <div className="mt-5">
        <Badge variant="muted">Hunt</Badge>
        <p className="mt-2 text-base text-muted">
          Spend up to 8 ammo in a 30-second hunting run.
        </p>
        <Button
          onClick={() => setHuntingActive(true)}
          disabled={ammo < 1 || huntingActive}
          disabledReason="Hunting requires at least 1 ammo."
          className="mt-3 justify-start text-left"
        >
          Start hunting mini-game
        </Button>

        {huntingActive ? (
          <div className="mt-4">
            <Suspense
              fallback={
                <div
                  role="status"
                  className="border border-border bg-panel p-4 font-mono text-base text-muted"
                >
                  Loading hunting range...
                </div>
              }
            >
              <HuntingMiniGame
                ammoAvailable={ammo}
                gameState={gameState}
                reducedMotion={settings.reducedMotion}
                onComplete={(result) => {
                  applyHuntingResult(result);
                  setHuntingActive(false);
                }}
              />
            </Suspense>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <Badge variant="muted">Treat sick or injured</Badge>
        {treatableParty.length === 0 ? (
          <p className="mt-2 font-mono text-base text-muted">
            No sick or injured party members
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {treatableParty.map((character) => (
              <li key={character.id}>
                <Button
                  onClick={() => treatPartyMemberAtCamp(character.id)}
                  disabled={medicine <= 0}
                  disabledReason="Treating a party member requires medicine."
                  className="h-full w-full justify-start text-left"
                >
                  Treat {character.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
