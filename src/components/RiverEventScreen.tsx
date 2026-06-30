import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card, CardEyebrow, CardHeader } from '@components/ui/Card';
import {
  calculateRiverRisk,
  getRiverCostPreview,
  getRiverOptionAvailability,
} from '@game/systems/riverSystem';
import { useExpeditionStore } from '@stores/expeditionStore';
import {
  formatMoneyValue,
  formatResourceValue,
  formatWholeNumber,
} from '@utils/formatResourceValue';

export function RiverEventScreen() {
  const currentRiver = useExpeditionStore((state) => state.currentRiver);
  const riverResolved = useExpeditionStore((state) => state.riverResolved);
  const riverOutcomeText = useExpeditionStore((state) => state.riverOutcomeText);
  const gameState = useExpeditionStore((state) => state);
  const resolveRiverCrossing = useExpeditionStore((state) => state.resolveRiverCrossing);
  const continueFromRiver = useExpeditionStore((state) => state.continueFromRiver);

  if (!currentRiver) {
    return null;
  }

  return (
    <Card aria-label="River crossing">
      <CardHeader>
        <CardEyebrow>river crossing</CardEyebrow>
        <h2 className="mt-1 text-2xl font-bold">{currentRiver.name}</h2>
        <p className="mt-3 text-muted">{currentRiver.description}</p>
      </CardHeader>

      <RiverDetailPanel />

      {riverResolved ? (
        <Card as="div" variant="success" className="mt-4">
          <div role="status" aria-atomic="true">
            <Badge variant="success">Outcome summary</Badge>
            <p className="mt-3 font-mono text-base text-success">{riverOutcomeText}</p>
          </div>
          <Button onClick={continueFromRiver} className="mt-4">
            Continue
          </Button>
        </Card>
      ) : (
        <ul className="mt-4 grid gap-3">
          {currentRiver.options.map((option) => {
            const availability = getRiverOptionAvailability(
              gameState,
              option,
              currentRiver,
            );
            const risk = Math.round(
              calculateRiverRisk(gameState, currentRiver, option) * 100,
            );
            const cost = getRiverCostPreview(option);

            return (
              <li key={option.id}>
                <Card as="div" variant="panel" className="p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{option.label}</h3>
                      <p className="mt-2 text-muted">{option.description}</p>
                      <p className="mt-2 font-mono text-base text-highlight">
                        {option.riskDescription}
                      </p>
                    </div>
                    <div className="min-w-48">
                      <RiskMeter value={risk} />
                      <p className="mt-2 font-mono text-base text-muted">
                        Cost: {formatCost(cost)}
                      </p>
                    </div>
                  </div>
                  {!availability.available ? (
                    <p className="mt-3 font-mono text-base text-danger">
                      {availability.reasons.join(' ')}
                    </p>
                  ) : null}
                  <Button
                    onClick={() => resolveRiverCrossing(option.id)}
                    disabled={!availability.available}
                    className="mt-3 w-full justify-start text-left"
                  >
                    Choose {option.label}
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function RiverDetailPanel() {
  const river = useExpeditionStore((state) => state.currentRiver)!;

  return (
    <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <RiverStat label="Width" value={`${river.width} ft`} />
      <RiverStat label="Depth" value={`${river.depth.toFixed(1)} ft`} />
      <RiverStat label="Current" value={`${Math.round(river.currentStrength * 100)}%`} />
      <RiverStat label="Weather" value={`${Math.round(river.weatherModifier * 100)}%`} />
      <RiverStat label="Ferry" value={river.ferryAvailable ? 'Available' : 'None'} />
      <RiverStat label="Bridge" value={river.bridgeAvailable ? 'Known' : 'Unknown'} />
      <RiverStat label="Danger" value={`${Math.round(river.dangerRating * 100)}%`} />
    </dl>
  );
}

function RiverStat({ label, value }: { label: string; value: string }) {
  return (
    <Card as="div" variant="panel" className="p-3">
      <dt className="font-mono text-base text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-bold">{value}</dd>
    </Card>
  );
}

function RiskMeter({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-base text-muted">Risk</span>
        <Badge variant={value >= 65 ? 'danger' : value >= 35 ? 'warning' : 'success'}>
          {value}%
        </Badge>
      </div>
      <div
        className="mt-2 h-3 border border-border bg-canvas"
        role="meter"
        aria-label={`Crossing risk ${value}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="h-full bg-cta" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function formatCost(cost: ReturnType<typeof getRiverCostPreview>) {
  const parts = [
    cost.money ? `$${formatMoneyValue(cost.money)}` : null,
    cost.wagonParts
      ? `${formatResourceValue('wagonParts', cost.wagonParts)} part${Math.round(cost.wagonParts) === 1 ? '' : 's'}`
      : null,
    cost.food ? `${formatResourceValue('food', cost.food)} food` : null,
    cost.days
      ? `${formatWholeNumber(cost.days)} day${Math.round(cost.days) === 1 ? '' : 's'}`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'none';
}
