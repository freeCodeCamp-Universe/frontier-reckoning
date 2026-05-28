import {
  Activity,
  ChevronDown,
  Compass,
  Crosshair,
  Stethoscope,
  Utensils,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useId, useState } from 'react';
import { useExpeditionStore } from '@stores/expeditionStore';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { StatusBadge, type BadgeVariant, type StatusKind } from '@components/ui/Badge';
import { cx } from '@components/ui/styles';
import type { Character } from '@game/types/character';

const roleIconMap: Record<string, LucideIcon> = {
  Child: UserRound,
  Cook: Utensils,
  Doctor: Stethoscope,
  Hunter: Crosshair,
  Mechanic: Wrench,
  Scout: Compass,
};

export function PartyPanel() {
  const [expanded, setExpanded] = useState(false);
  const partyListId = useId();
  const party = useExpeditionStore((state) => state.party);

  return (
    <Card aria-label="Caravan party">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Caravan Party</h2>
            <p className="mt-1 font-mono text-base text-muted">
              {party.length === 0 ? 'No party assembled' : `${party.length} travelers`}
            </p>
          </div>
          <Button
            aria-controls={partyListId}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse caravan party' : 'Expand caravan party'}
            className="w-full justify-between sm:w-auto"
            onClick={() => setExpanded((currentExpanded) => !currentExpanded)}
            size="sm"
            variant="ghost"
          >
            <span>{expanded ? 'Collapse' : 'Expand'}</span>
            <ChevronDown
              aria-hidden="true"
              className={`size-5 motion-safe:transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>
      </div>

      {party.length === 0 ? (
        <p className="mt-4 font-mono text-base text-muted">No party assembled</p>
      ) : expanded ? (
        <div
          id={partyListId}
          className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1"
          data-testid="caravan-party-list"
        >
          {party.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const RoleIcon = roleIconMap[character.role] ?? Activity;
  const stateVariant = getStateVariant(character.status);
  const isDead = character.status === 'dead';

  return (
    <article
      aria-label={`${character.name}, ${character.role}, ${stateVariant.label}`}
      className={cx(
        'border p-3',
        stateVariant.className,
        character.status === 'sick' && 'grayscale',
        character.status === 'dead' && 'opacity-90',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold">{character.name}</h3>
          <p className="mt-1 inline-flex items-center gap-2 font-mono text-base text-highlight">
            <RoleIcon aria-hidden="true" className="size-5 shrink-0" />
            {character.role}
          </p>
        </div>
        <StatusBadge status={character.status as StatusKind} />
      </div>

      {isDead ? (
        <p className="sr-only">
          {character.name} has died. Their record remains visible in the party
          roster.
        </p>
      ) : null}

      <div className="mt-3 grid gap-2">
        <ConditionBar
          label={`${character.name} health`}
          value={character.health}
          tone={character.health <= 35 ? 'danger' : character.health <= 65 ? 'warning' : 'success'}
        />
        <ConditionBar
          label={`${character.name} morale`}
          value={character.morale}
          tone={character.morale <= 35 ? 'danger' : character.morale <= 65 ? 'warning' : 'info'}
        />
      </div>
    </article>
  );
}

function ConditionBar({
  label,
  tone,
  value,
}: {
  label: string;
  tone: BadgeVariant;
  value: number;
}) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 font-mono text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-bold text-foreground">{clampedValue}/100</span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} ${clampedValue} of 100`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        aria-valuetext={`${clampedValue} of 100`}
        className="h-3 overflow-hidden border border-border bg-canvas"
      >
        <div
          className={cx(
            'h-full',
            tone === 'danger' && 'bg-danger',
            tone === 'warning' && 'bg-cta',
            tone === 'success' && 'bg-success',
            tone === 'info' && 'bg-highlight',
            tone === 'muted' && 'bg-muted',
            tone === 'default' && 'bg-foreground',
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

function getStateVariant(status: Character['status']) {
  if (status === 'dead') {
    return {
      label: 'Dead',
      className: 'border-danger bg-panel text-foreground',
    };
  }

  if (status === 'injured') {
    return {
      label: 'Injured',
      className: 'border-cta bg-bark/30 text-foreground',
    };
  }

  if (status === 'sick') {
    return {
      label: 'Sick',
      className: 'border-danger bg-surface text-muted',
    };
  }

  return {
    label: 'Healthy',
    className: 'border-border bg-panel text-foreground',
  };
}
