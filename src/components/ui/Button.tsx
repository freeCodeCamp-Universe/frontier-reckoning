import { forwardRef, useId } from 'react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { getStoredAudioEnabled, playAudioCue } from '@utils/audio';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    disabledReason?: string;
  }
>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = '',
    disabledReason,
    disabled,
    'aria-describedby': ariaDescribedBy,
    onClick,
    ...props
  },
  ref,
) {
  const disabledReasonId = useId();
  const showDisabledReason = disabled && disabledReason;

  return (
    <>
      <button
        ref={ref}
        aria-describedby={showDisabledReason ? disabledReasonId : ariaDescribedBy}
        className={`inline-flex min-h-12 items-center justify-center border-2 border-cta bg-cta px-5 py-3 font-mono font-bold text-canvas motion-safe:transition-colors hover:bg-transparent hover:text-cta disabled:cursor-not-allowed disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:bg-panel disabled:hover:text-muted ${className}`}
        disabled={disabled}
        onClick={(event) => {
          playAudioCue('button', getStoredAudioEnabled(window.localStorage));
          onClick?.(event);
        }}
        type="button"
        {...props}
      >
        {children}
      </button>
      {showDisabledReason ? (
        <span id={disabledReasonId} className="sr-only">
          {disabledReason}
        </span>
      ) : null}
    </>
  );
});
