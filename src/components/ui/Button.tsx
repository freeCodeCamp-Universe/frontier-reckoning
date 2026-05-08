import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center border-2 border-cta bg-cta px-5 py-3 font-mono font-bold text-canvas transition-colors hover:bg-transparent hover:text-cta disabled:cursor-not-allowed disabled:border-border disabled:bg-panel disabled:text-muted disabled:hover:bg-panel disabled:hover:text-muted ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
