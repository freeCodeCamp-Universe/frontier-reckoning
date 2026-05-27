import { forwardRef } from 'react';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cx } from '@components/ui/styles';

type CardVariant = 'surface' | 'panel' | 'parchment' | 'danger' | 'success';

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    as?: 'article' | 'div' | 'header' | 'section';
    variant?: CardVariant;
  }
>;

const variantClasses: Record<CardVariant, string> = {
  surface: 'border-border bg-surface text-foreground',
  panel: 'border-border bg-panel text-foreground',
  parchment: 'border-bark bg-parchment text-canvas',
  danger: 'border-danger bg-panel text-foreground',
  success: 'border-success bg-panel text-foreground',
};

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as: Component = 'section', variant = 'surface', className, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref as never}
      className={cx('border p-4', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
});

export function CardHeader({
  className,
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cx('border-b border-border pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardEyebrow({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <p className={cx('font-mono text-base text-highlight', className)}>{children}</p>
  );
}
