import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card, CardEyebrow, CardHeader } from '@components/ui/Card';
import { useExpeditionStore } from '@stores/expeditionStore';

export function CampScreen() {
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
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
  const huntAtCamp = useExpeditionStore((state) => state.huntAtCamp);
  const resumeTravel = useExpeditionStore((state) => state.resumeTravel);
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
        <p className="mt-4 border border-success bg-panel p-3 font-mono text-base text-success">
          {campOutcomeText}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Button onClick={restAtCamp} className="justify-start text-left">
          Rest
        </Button>
        <Button
          onClick={repairWagonAtCamp}
          disabled={wagonParts <= 0}
          disabledReason="Repair wagon requires at least one wagon part."
          className="justify-start text-left"
        >
          Repair wagon
        </Button>
        <Button onClick={tellCampfireStoriesAtCamp} className="justify-start text-left">
          Tell campfire stories
        </Button>
        <Button onClick={rationFoodAtCamp} className="justify-start text-left">
          Ration food
        </Button>
        <Button onClick={resumeTravel} className="justify-start text-left">
          Resume travel
        </Button>
      </div>

      <div className="mt-5">
        <Badge variant="muted">Hunt</Badge>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Button
            onClick={() => huntAtCamp(1)}
            disabled={ammo < 1}
            disabledReason="Hunting with 1 ammo requires at least 1 ammo."
            className="justify-start text-left"
          >
            Hunt with 1 ammo
          </Button>
          <Button
            onClick={() => huntAtCamp(3)}
            disabled={ammo < 3}
            disabledReason="Hunting with 3 ammo requires at least 3 ammo."
            className="justify-start text-left"
          >
            Hunt with 3 ammo
          </Button>
          <Button
            onClick={() => huntAtCamp(5)}
            disabled={ammo < 5}
            disabledReason="Hunting with 5 ammo requires at least 5 ammo."
            className="justify-start text-left"
          >
            Hunt with 5 ammo
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <Badge variant="muted">Treat sick or injured</Badge>
        {treatableParty.length === 0 ? (
          <p className="mt-2 font-mono text-base text-muted">
            No sick or injured party members
          </p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {treatableParty.map((character) => (
              <Button
                key={character.id}
                onClick={() => treatPartyMemberAtCamp(character.id)}
                disabled={medicine <= 0}
                disabledReason="Treating a party member requires medicine."
                className="justify-start text-left"
              >
                Treat {character.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
