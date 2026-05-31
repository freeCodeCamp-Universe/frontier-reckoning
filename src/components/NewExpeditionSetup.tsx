import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { difficultyOptions, type Difficulty } from '@game/data/difficulties';
import { starterCharacters } from '@game/data/starterCharacters';
import type { StartExpeditionOptions } from '@stores/expeditionStore';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card, CardHeader } from '@components/ui/Card';
import { CharacterPortrait } from '@components/ui/Portrait';
import { formatResourceValue } from '@utils/formatResourceValue';

type NewExpeditionSetupProps = {
  onBack: () => void;
  onStart: (options: StartExpeditionOptions) => void;
};

type SetupStep = 'name' | 'party' | 'difficulty';

const requiredPartySize = 4;

export function NewExpeditionSetup({ onBack, onStart }: NewExpeditionSetupProps) {
  const [step, setStep] = useState<SetupStep>('name');
  const [expeditionName, setExpeditionName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const partyButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const difficultyInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const uniqueSelectedIds = useMemo(
    () => Array.from(new Set(selectedCharacterIds)),
    [selectedCharacterIds],
  );
  const canContinueFromName = expeditionName.trim().length > 0;
  const canContinueFromParty = uniqueSelectedIds.length === requiredPartySize;
  const canStart = canContinueFromName && canContinueFromParty && difficulty !== null;

  useEffect(() => {
    if (step === 'name') {
      nameInputRef.current?.focus();
    }
  }, [step]);

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

  const handleNameContinue = () => {
    if (canContinueFromName) {
      setStep('party');
    }
  };

  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleNameContinue();
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleNameContinue();
    }
  };

  const handlePartyContinue = () => {
    if (canContinueFromParty) {
      setStep('difficulty');
    }
  };

  const focusPartyButton = (nextIndex: number, direction: 1 | -1) => {
    const buttons = partyButtonRefs.current;

    for (let offset = 0; offset < starterCharacters.length; offset += 1) {
      const candidateIndex =
        (nextIndex + starterCharacters.length + offset * direction) %
        starterCharacters.length;
      const candidate = buttons[candidateIndex];

      if (candidate && !candidate.disabled) {
        candidate.focus();
        return;
      }
    }
  };

  const handlePartyKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCharacter(starterCharacters[index].id);
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusPartyButton(index + 1, 1);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusPartyButton(index - 1, -1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusPartyButton(0, 1);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusPartyButton(starterCharacters.length - 1, -1);
    }
  };

  const focusDifficultyOption = (index: number) => {
    const nextInput = difficultyInputRefs.current[index];
    const nextDifficulty = difficultyOptions[index];

    nextInput?.focus();

    if (nextDifficulty) {
      setDifficulty(nextDifficulty.id);
    }
  };

  const handleDifficultyKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setDifficulty(difficultyOptions[index].id);
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusDifficultyOption((index + 1) % difficultyOptions.length);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusDifficultyOption(
        (index - 1 + difficultyOptions.length) % difficultyOptions.length,
      );
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusDifficultyOption(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusDifficultyOption(difficultyOptions.length - 1);
    }
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
          <form onSubmit={handleNameSubmit}>
            <CardHeader>
              <h2 className="text-3xl font-bold sm:text-4xl">Name the caravan</h2>
            </CardHeader>
            <label htmlFor="expedition-name" className="mt-8 block font-mono text-base text-muted">
              Expedition name
            </label>
            <input
              ref={nameInputRef}
              id="expedition-name"
              className="mt-3 w-full border border-border bg-panel px-4 py-4 text-xl text-foreground outline-none focus:border-highlight focus:ring-2 focus:ring-highlight"
              value={expeditionName}
              onChange={(event) => setExpeditionName(event.target.value)}
              onKeyDown={handleNameKeyDown}
            />
            <SetupActions>
              <Button onClick={handleBack} variant="secondary">
                Back
              </Button>
              <Button
                type="submit"
                disabled={!canContinueFromName}
                disabledReason="Enter an expedition name before continuing."
              >
                Continue
              </Button>
            </SetupActions>
          </form>
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
            {starterCharacters.map((character, index) => {
              const selected = uniqueSelectedIds.includes(character.id);
              const disabled = !selected && uniqueSelectedIds.length >= requiredPartySize;

              return (
                <button
                  ref={(element) => {
                    partyButtonRefs.current[index] = element;
                  }}
                  key={character.id}
                  type="button"
                  onClick={() => toggleCharacter(character.id)}
                  onKeyDown={(event) => handlePartyKeyDown(event, index)}
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
                    Health {formatResourceValue('health', character.health)} / Morale{' '}
                    {formatResourceValue('morale', character.morale)}
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
              onClick={handlePartyContinue}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handlePartyContinue();
                }
              }}
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleStart();
            }}
          >
            <CardHeader>
              <h2 className="text-3xl font-bold sm:text-4xl">Choose trail difficulty</h2>
            </CardHeader>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {difficultyOptions.map((option, index) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer gap-4 border border-border bg-panel p-5 focus-within:border-highlight"
                >
                  <input
                    ref={(element) => {
                      difficultyInputRefs.current[index] = element;
                    }}
                    type="radio"
                    name="difficulty"
                    value={option.id}
                    checked={difficulty === option.id}
                    onChange={() => setDifficulty(option.id)}
                    onKeyDown={(event) => handleDifficultyKeyDown(event, index)}
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
                type="submit"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleStart();
                  }
                }}
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
          </form>
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
