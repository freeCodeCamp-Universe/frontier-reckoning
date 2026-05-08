import { Button } from '@components/ui/Button';
import { getRiverOptionAvailability } from '@game/systems/riverSystem';
import { useExpeditionStore } from '@stores/expeditionStore';

export function RiverEventScreen() {
  const currentRiver = useExpeditionStore((state) => state.currentRiver);
  const riverResolved = useExpeditionStore((state) => state.riverResolved);
  const riverOutcomeText = useExpeditionStore((state) => state.riverOutcomeText);
  const gameState = useExpeditionStore((state) => state);
  const resolveRiverCrossing = useExpeditionStore(
    (state) => state.resolveRiverCrossing,
  );
  const continueFromRiver = useExpeditionStore((state) => state.continueFromRiver);

  if (!currentRiver) {
    return null;
  }

  return (
    <section className="border border-border bg-surface p-4" aria-label="River crossing">
      <div className="border-b border-border pb-3">
        <p className="font-mono text-base text-highlight">river crossing</p>
        <h2 className="mt-1 text-2xl font-bold">{currentRiver.name}</h2>
        <p className="mt-3 text-muted">{currentRiver.description}</p>
      </div>

      {riverResolved ? (
        <div className="mt-4 border border-border bg-panel p-4">
          <p className="font-mono text-base text-success">{riverOutcomeText}</p>
          <Button onClick={continueFromRiver} className="mt-4">
            Continue
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {currentRiver.options.map((option) => {
            const availability = getRiverOptionAvailability(gameState, option);

            return (
              <div key={option.id} className="border border-border bg-panel p-3">
                <Button
                  onClick={() => resolveRiverCrossing(option.id)}
                  disabled={!availability.available}
                  className="w-full justify-start text-left"
                >
                  {option.label}
                </Button>
                <p className="mt-3 text-muted">{option.description}</p>
                <p className="mt-2 font-mono text-base text-highlight">
                  {option.riskDescription}
                </p>
                {!availability.available ? (
                  <p className="mt-2 font-mono text-base text-danger">
                    {availability.reasons.join(' ')}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
