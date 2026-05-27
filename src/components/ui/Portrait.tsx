import type { Character } from '@game/types/character';
import { cx } from '@components/ui/styles';

export function CharacterPortrait({
  character,
  selected = false,
}: {
  character: Pick<Character, 'name' | 'role'> & Partial<Pick<Character, 'status'>>;
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
      className={cx(
        'relative grid size-20 shrink-0 place-items-center overflow-hidden border-2 bg-surface font-mono font-bold',
        selected
          ? 'border-cta bg-bark text-cta'
          : 'border-border text-highlight',
        character.status === 'sick' && 'grayscale',
        character.status === 'injured' && 'border-cta bg-bark/40',
        character.status === 'dead' && 'border-danger bg-danger-deep grayscale',
      )}
      aria-hidden="true"
      title={`${character.name}, ${character.role}`}
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 80 80"
        role="img"
        aria-label=""
      >
        <rect width="80" height="80" fill="currentColor" opacity="0.1" />
        <circle cx="40" cy="30" r="17" fill="rgb(var(--color-parchment-dark))" />
        <path
          d="M18 75c3-17 13-26 22-26s19 9 22 26"
          fill="rgb(var(--color-frontier-bark))"
        />
        <path
          d="M23 27c5-16 29-18 35 0-8-6-26-6-35 0Z"
          fill="rgb(var(--color-frontier-trail))"
        />
        <circle cx="34" cy="31" r="2" fill="rgb(var(--color-canvas))" />
        <circle cx="46" cy="31" r="2" fill="rgb(var(--color-canvas))" />
        <path
          d="M33 40c5 4 10 4 14 0"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {character.status === 'dead' ? (
          <path
            d="M26 24 54 52M54 24 26 52"
            stroke="rgb(var(--color-danger))"
            strokeWidth="5"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
      <span className="absolute bottom-1 right-1 border border-border bg-canvas px-1 text-sm text-foreground">
        {initials}
      </span>
    </div>
  );
}
