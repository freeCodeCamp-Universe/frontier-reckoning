import { useExpeditionStore } from '@stores/expeditionStore';
import { Card, CardHeader } from '@components/ui/Card';
import { CharacterPortrait } from '@components/ui/Portrait';
import { StatusBadge, type StatusKind } from '@components/ui/Badge';

export function PartyPanel() {
  const party = useExpeditionStore((state) => state.party);

  return (
    <Card aria-label="Caravan party">
      <CardHeader className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold">Caravan Party</h2>
        <p className="font-mono text-base text-muted">{party.length} travelers</p>
      </CardHeader>

      {party.length === 0 ? (
        <p className="mt-4 font-mono text-base text-muted">No party assembled</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {party.map((character) => (
            <Card
              as="article"
              variant="panel"
              key={character.id}
              aria-label={`${character.name}, ${character.role}`}
            >
              <div className="flex items-start gap-3">
                <CharacterPortrait character={character} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold">{character.name}</h3>
                  <p className="font-mono text-base text-highlight">{character.role}</p>
                </div>
                <StatusBadge status={character.status as StatusKind} />
              </div>
              <p className="mt-3 font-mono text-base text-muted">
                Age {character.age} / {character.traits.join(', ')}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <dt className="font-mono text-base text-muted">Health</dt>
                  <dd className="text-2xl font-bold">{character.health}</dd>
                </div>
                <div>
                  <dt className="font-mono text-base text-muted">Morale</dt>
                  <dd className="text-2xl font-bold">{character.morale}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
