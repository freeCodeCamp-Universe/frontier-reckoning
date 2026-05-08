import { useId } from 'react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    disabledReason?: string;
  }
>;

export function Button({
  children,
  className = '',
  disabledReason,
  disabled,
  'aria-describedby': ariaDescribedBy,
  ...props
}: ButtonProps) {
  const disabledReasonId = useId();
  const showDisabledReason = disabled && disabledReason;

  return (
    <>
      <button
        aria-describedby={showDisabledReason ? disabledReasonId : ariaDescribedBy}
        className={`inline-flex min-h-12 items-center justify-center border-2 border-cta bg-cta px-5 py-3 font-mono font-bold text-canvas transition-colors hover:bg-transparent hover:text-cta disabled:cursor-not-allowed disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:bg-panel disabled:hover:text-muted ${className}`}
        disabled={disabled}
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
}
