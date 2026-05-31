import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card, CardEyebrow, CardHeader } from '@components/ui/Card';
import { ResourceIcon } from '@components/ui/ResourceIcon';
import { useExpeditionStore } from '@stores/expeditionStore';
import { getDifficultyPrice } from '@game/systems/townSystem';
import { formatMoneyValue } from '@utils/formatResourceValue';

export function TownScreen() {
  const currentTown = useExpeditionStore((state) => state.currentTown);
  const townOutcomeText = useExpeditionStore((state) => state.townOutcomeText);
  const money = useExpeditionStore((state) => state.money);
  const buySupplyInTown = useExpeditionStore((state) => state.buySupplyInTown);
  const sellSupplyInTown = useExpeditionStore((state) => state.sellSupplyInTown);
  const restAtInn = useExpeditionStore((state) => state.restAtInn);
  const repairWagonInTown = useExpeditionStore((state) => state.repairWagonInTown);
  const recruitPartyMember = useExpeditionStore((state) => state.recruitPartyMember);
  const hearTownRumor = useExpeditionStore((state) => state.hearTownRumor);
  const resumeTrailFromTown = useExpeditionStore((state) => state.resumeTrailFromTown);
  const food = useExpeditionStore((state) => state.food);
  const medicine = useExpeditionStore((state) => state.medicine);
  const ammo = useExpeditionStore((state) => state.ammo);
  const wagonParts = useExpeditionStore((state) => state.wagonParts);
  const difficulty = useExpeditionStore((state) => state.difficulty);
  const resources = { food, medicine, ammo, wagonParts };

  if (!currentTown) {
    return null;
  }

  return (
    <Card aria-label="Town">
      <CardHeader>
        <CardEyebrow>town</CardEyebrow>
        <h2 className="mt-1 text-2xl font-bold">{currentTown.name}</h2>
        <p className="mt-3 text-muted">{currentTown.description}</p>
      </CardHeader>

      {townOutcomeText ? (
        <p className="mt-4 border border-success bg-panel p-3 font-mono text-base text-success">
          {townOutcomeText}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] border-collapse bg-panel text-left">
          <thead className="border-b border-border bg-surface font-mono text-base text-muted">
            <tr>
              <th className="p-3">Supply</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Buy</th>
              <th className="p-3">Sell</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTown.shop.map((item) => {
              const buyPrice = getDifficultyPrice({ difficulty }, item.buyPrice);

              return (
                <tr
                  key={item.resource}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="p-3 font-bold">
                    <span className="inline-flex items-center gap-2">
                      <ResourceIcon resource={item.resource} />
                      {item.label}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-base text-muted">{item.quantity}</td>
                  <td className="p-3 font-mono text-base">${buyPrice}</td>
                  <td className="p-3 font-mono text-base">${item.sellPrice}</td>
                  <td className="flex gap-2 p-3">
                    <Button
                      onClick={() => buySupplyInTown(item.resource)}
                      disabled={money < buyPrice}
                      disabledReason={`Buying ${item.label.toLowerCase()} requires $${buyPrice}.`}
                      className="min-h-10 px-3 py-2"
                      size="sm"
                    >
                      Buy
                    </Button>
                    <Button
                      onClick={() => sellSupplyInTown(item.resource)}
                      disabled={resources[item.resource] < item.quantity}
                      disabledReason={`Selling ${item.label.toLowerCase()} requires ${item.quantity} available.`}
                      className="min-h-10 px-3 py-2"
                      size="sm"
                      variant="secondary"
                    >
                      Sell
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Badge variant="warning" className="md:col-span-2 lg:col-span-3">
          Money ${formatMoneyValue(money)}
        </Badge>
        <Button
          onClick={restAtInn}
          disabled={money < getDifficultyPrice({ difficulty }, currentTown.innCost)}
          disabledReason={`Resting at the inn requires $${getDifficultyPrice({ difficulty }, currentTown.innCost)}.`}
        >
          Rest at inn ${getDifficultyPrice({ difficulty }, currentTown.innCost)}
        </Button>
        <Button
          onClick={repairWagonInTown}
          disabled={money < getDifficultyPrice({ difficulty }, currentTown.repairCost)}
          disabledReason={`Town wagon repair requires $${getDifficultyPrice({ difficulty }, currentTown.repairCost)}.`}
        >
          Repair wagon ${getDifficultyPrice({ difficulty }, currentTown.repairCost)}
        </Button>
        <Button
          onClick={recruitPartyMember}
          disabled={money < getDifficultyPrice({ difficulty }, currentTown.recruitCost)}
          disabledReason={`Recruiting requires $${getDifficultyPrice({ difficulty }, currentTown.recruitCost)}.`}
        >
          Recruit ${getDifficultyPrice({ difficulty }, currentTown.recruitCost)}
        </Button>
        <Button onClick={hearTownRumor} variant="secondary">
          Hear rumors
        </Button>
        <Button onClick={resumeTrailFromTown} variant="secondary">
          Resume trail
        </Button>
      </div>
    </Card>
  );
}
