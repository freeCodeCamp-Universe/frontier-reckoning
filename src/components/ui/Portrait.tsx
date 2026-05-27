import type { Character } from '@game/types/character';

export function CharacterPortrait({
  character,
  selected = false,
}: {
  character: Pick<Character, 'name' | 'role'>;
  selected?: boolean;
}) {
  const initials = character.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`grid size-14 shrink-0 place-items-center border-2 font-mono font-bold ${
        selected
          ? 'border-cta bg-bark text-cta'
          : 'border-border bg-surface text-highlight'
      }`}
      aria-hidden="true"
      title={`${character.name}, ${character.role}`}
    >
      {initials}
    </div>
  );
}
