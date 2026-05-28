import { useMemo, useState, type ReactNode } from 'react';
import { difficultyOptions, type Difficulty } from '@game/data/difficulties';
import { starterCharacters } from '@game/data/starterCharacters';
import type { StartExpeditionOptions } from '@stores/expeditionStore';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card, CardHeader } from '@components/ui/Card';
import { CharacterPortrait } from '@components/ui/Portrait';

type NewExpeditionSetupProps = {
  onBack: () => void;
  onStart: (options: StartExpeditionOptions) => void;
};

type SetupStep = 'name' | 'party' | 'difficulty';

const requiredPartySize = 4;

export function NewExpeditionSetup({ onBack, onStart }: NewExpeditionSetupProps) {
  const [step, setStep] = useState<SetupStep>('name');
  const [expeditionName, setExpeditionName] = useState('Last Lantern Company');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  const uniqueSelectedIds = useMemo(
    () => Array.from(new Set(selectedCharacterIds)),
    [selectedCharacterIds],
  );
  const canContinueFromName = expeditionName.trim().length > 0;
  const canContinueFromParty = uniqueSelectedIds.length === requiredPartySize;
  const canStart = canContinueFromName && canContinueFromParty && difficulty !== null;

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacterIds((currentIds) => {
      if (currentIds.includes(characterId)) {
        return currentIds.filter((id) => id !== characterId);
      }

      if (currentIds.length >= requiredPartySize) {
        return currentIds;
      }

      return [...currentIds, characterId];
    });
  };

  const handleBack = () => {
    if (step === 'name') {
      onBack();
      return;
    }

    setStep(step === 'difficulty' ? 'party' : 'name');
  };

  const handleStart = () => {
    if (!canStart || !difficulty) {
      return;
    }

    onStart({
      expeditionName,
      difficulty,
      partyMemberIds: uniqueSelectedIds,
    });
  };

  return (
    <section className="mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-center py-8 sm:py-12 lg:py-16">
      {step === 'name' ? (
        <SetupCard>
          <CardHeader>
            <h2 className="text-3xl font-bold sm:text-4xl">Name the caravan</h2>
          </CardHeader>
          <label htmlFor="expedition-name" className="mt-8 block font-mono text-base text-muted">
            Expedition name
          </label>
          <input
            id="expedition-name"
            className="mt-3 w-full border border-border bg-panel px-4 py-4 text-xl text-foreground outline-none focus:border-highlight"
            value={expeditionName}
            onChange={(event) => setExpeditionName(event.target.value)}
          />
          <SetupActions>
            <Button onClick={handleBack} variant="secondary">
              Back
            </Button>
            <Button
              onClick={() => setStep('party')}
              disabled={!canContinueFromName}
              disabledReason="Enter an expedition name before continuing."
            >
              Continue
            </Button>
          </SetupActions>
        </SetupCard>
      ) : null}

      {step === 'party' ? (
        <SetupCard>
          <CardHeader className="flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">Choose party members</h2>
            <Badge variant="muted">
              {uniqueSelectedIds.length} / {requiredPartySize}
            </Badge>
          </CardHeader>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {starterCharacters.map((character) => {
              const selected = uniqueSelectedIds.includes(character.id);
              const disabled = !selected && uniqueSelectedIds.length >= requiredPartySize;

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => toggleCharacter(character.id)}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={`${selected ? 'Remove' : 'Select'} ${character.name}, ${character.role}`}
                  className={`border p-5 text-left motion-safe:transition-colors focus:outline-none focus:ring-2 focus:ring-highlight disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? 'border-cta bg-panel text-foreground'
                      : 'border-border bg-surface text-muted hover:border-highlight'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <CharacterPortrait character={character} selected={selected} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-foreground">
                        {character.name}
                      </span>
                      <span className="mt-1 block font-mono text-base text-highlight">
                        {character.role}
                      </span>
                    </span>
                    <Badge variant={selected ? 'success' : 'muted'}>
                      {selected ? 'Selected' : 'Available'}
                    </Badge>
                  </span>
                  <span className="mt-2 block text-base">
                    Health {character.health} / Morale {character.morale}
                  </span>
                </button>
              );
            })}
          </div>
          <SetupActions>
            <Button onClick={handleBack} variant="secondary">
              Back
            </Button>
            <Button
              onClick={() => setStep('difficulty')}
              disabled={!canContinueFromParty}
              disabledReason={`Select exactly ${requiredPartySize} party members before continuing.`}
            >
              Continue
            </Button>
          </SetupActions>
        </SetupCard>
      ) : null}

      {step === 'difficulty' ? (
        <SetupCard>
          <CardHeader>
            <h2 className="text-3xl font-bold sm:text-4xl">Choose trail difficulty</h2>
          </CardHeader>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {difficultyOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer gap-4 border border-border bg-panel p-5"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={option.id}
                  checked={difficulty === option.id}
                  onChange={() => setDifficulty(option.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-bold">{option.label}</span>
                  <span className="block text-base text-muted">
                    {option.description}
                  </span>
                  <span className="mt-1 block font-mono text-base text-highlight">
                    ${option.startingMoney} start
                  </span>
                </span>
              </label>
            ))}
          </div>
          <SetupActions>
            <Button onClick={handleBack} variant="secondary">
              Back
            </Button>
            <Button
              onClick={handleStart}
              disabled={!canStart}
              disabledReason={
                difficulty === null
                  ? 'Select a difficulty before starting.'
                  : 'Complete expedition setup before starting.'
              }
            >
              Start Expedition
            </Button>
          </SetupActions>
        </SetupCard>
      ) : null}
    </section>
  );
}

function SetupCard({ children }: { children: ReactNode }) {
  return (
    <Card className="flex min-h-[58vh] flex-col justify-center p-6 sm:p-8 lg:p-10">
      {children}
    </Card>
  );
}

function SetupActions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-col gap-4 sm:flex-row">{children}</div>;
}
