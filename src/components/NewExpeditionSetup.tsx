import { useMemo, useState } from 'react';
import { difficultyOptions, type Difficulty } from '@game/data/difficulties';
import { starterCharacters } from '@game/data/starterCharacters';
import type { StartExpeditionOptions } from '@stores/expeditionStore';
import { Button } from '@components/ui/Button';

type NewExpeditionSetupProps = {
  onBack: () => void;
  onStart: (options: StartExpeditionOptions) => void;
};

const requiredPartySize = 4;

export function NewExpeditionSetup({ onBack, onStart }: NewExpeditionSetupProps) {
  const [expeditionName, setExpeditionName] = useState('Last Lantern Company');
  const [difficulty, setDifficulty] = useState<Difficulty>('trailwise');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([
    'scout',
    'doctor',
    'hunter',
    'mechanic',
  ]);

  const uniqueSelectedIds = useMemo(
    () => Array.from(new Set(selectedCharacterIds)),
    [selectedCharacterIds],
  );
  const canStart =
    expeditionName.trim().length > 0 && uniqueSelectedIds.length === requiredPartySize;
  const startDisabledReason =
    expeditionName.trim().length === 0
      ? 'Enter an expedition name before starting.'
      : `Select exactly ${requiredPartySize} party members before starting.`;

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

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="border border-border bg-surface p-5">
        <p className="font-mono text-base text-highlight">new expedition setup</p>
        <h1 className="mt-2 text-4xl font-bold">Frontier Reckoning</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Build a four-person caravan and choose how punishing the trail should be.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <section className="border border-border bg-surface p-4">
            <label htmlFor="expedition-name" className="font-mono text-base text-muted">
              Expedition name
            </label>
            <input
              id="expedition-name"
              className="mt-2 w-full border border-border bg-panel px-3 py-3 text-foreground outline-none focus:border-highlight"
              value={expeditionName}
              onChange={(event) => setExpeditionName(event.target.value)}
            />
          </section>

          <section className="border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold">Party Members</h2>
              <p className="font-mono text-base text-muted">
                {uniqueSelectedIds.length} / {requiredPartySize}
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {starterCharacters.map((character) => {
                const selected = uniqueSelectedIds.includes(character.id);
                const disabled =
                  !selected && uniqueSelectedIds.length >= requiredPartySize;

                return (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => toggleCharacter(character.id)}
                    disabled={disabled}
                    aria-pressed={selected}
                    className={`border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-highlight disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? 'border-cta bg-panel text-foreground'
                        : 'border-border bg-surface text-muted hover:border-highlight'
                    }`}
                  >
                    <span className="font-bold text-foreground">{character.name}</span>
                    <span className="mt-1 block font-mono text-base text-highlight">
                      {character.role}
                    </span>
                    <span className="mt-2 block text-base">
                      Health {character.health} / Morale {character.morale}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="border border-border bg-surface p-4">
            <h2 className="text-2xl font-bold">Difficulty</h2>
            <div className="mt-4 grid gap-3">
              {difficultyOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer gap-3 border border-border bg-panel p-3"
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
          </section>

          <div className="grid gap-3 border border-border bg-surface p-4">
            <Button
              onClick={() =>
                onStart({
                  expeditionName,
                  difficulty,
                  partyMemberIds: uniqueSelectedIds,
                })
              }
              disabled={!canStart}
              disabledReason={startDisabledReason}
            >
              Start Custom Expedition
            </Button>
            <Button onClick={onBack}>Back to Menu</Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
