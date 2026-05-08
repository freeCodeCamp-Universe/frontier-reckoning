import { useExpeditionStore } from '@stores/expeditionStore';

export function PartyPanel() {
  const party = useExpeditionStore((state) => state.party);

  return (
    <section className="border border-border bg-surface p-4" aria-label="Caravan party">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-2xl font-bold">Caravan Party</h2>
        <p className="font-mono text-base text-muted">{party.length} travelers</p>
      </div>

      {party.length === 0 ? (
        <p className="mt-4 font-mono text-base text-muted">No party assembled</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {party.map((character) => (
            <article
              key={character.id}
              className="border border-border bg-panel p-4"
              aria-label={`${character.name}, ${character.role}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">{character.name}</h3>
                  <p className="font-mono text-base text-highlight">{character.role}</p>
                </div>
                <span className="border border-border px-2 py-1 font-mono text-base capitalize text-muted">
                  {character.status}
                </span>
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
