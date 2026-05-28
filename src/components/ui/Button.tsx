import { forwardRef, useId } from 'react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cx } from '@components/ui/styles';
import { getStoredAudioEnabled, playAudioCue } from '@utils/audio';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    disabledReason?: string;
    size?: ButtonSize;
    variant?: ButtonVariant;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-cta bg-cta text-canvas hover:bg-transparent hover:text-cta disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:bg-panel disabled:hover:text-muted',
  secondary:
    'border-highlight bg-transparent text-highlight hover:bg-highlight hover:text-canvas disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:bg-panel disabled:hover:text-muted',
  danger:
    'border-danger bg-danger text-canvas hover:bg-transparent hover:text-danger disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:bg-panel disabled:hover:text-muted',
  ghost:
    'border-border bg-panel text-foreground hover:border-highlight hover:text-highlight disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:text-muted',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 py-2 text-base',
  md: 'min-h-12 px-5 py-3',
  lg: 'min-h-14 px-6 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = '',
    disabledReason,
    disabled,
    size = 'md',
    variant = 'primary',
    'aria-describedby': ariaDescribedBy,
    onClick,
    onKeyDown,
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
        className={cx(
          'inline-flex items-center justify-center gap-2 border-2 font-mono font-bold motion-safe:transition-colors disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled}
        onClick={(event) => {
          playAudioCue('button', getStoredAudioEnabled(window.localStorage));
          onClick?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (!event.defaultPrevented && event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.click();
          }
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
