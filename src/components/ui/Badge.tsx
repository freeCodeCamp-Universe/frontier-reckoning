import type { HTMLAttributes, PropsWithChildren } from 'react';
import {
  Activity,
  Bed,
  CheckCircle2,
  Drumstick,
  HeartCrack,
  Skull,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cx } from '@components/ui/styles';

export type BadgeVariant =
  | 'default'
  | 'muted'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

export type StatusKind =
  | 'healthy'
  | 'sick'
  | 'injured'
  | 'dead'
  | 'hungry'
  | 'repaired'
  | 'rested';

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
    icon?: LucideIcon;
  }
>;

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-border bg-panel text-foreground',
  muted: 'border-border bg-surface text-muted',
  success: 'border-success bg-success-deep text-success',
  danger: 'border-danger bg-danger-deep text-danger',
  warning: 'border-cta bg-bark text-cta',
  info: 'border-highlight bg-panel text-highlight',
};

const statusConfig: Record<
  StatusKind,
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  healthy: { label: 'Healthy', variant: 'success', icon: CheckCircle2 },
  sick: { label: 'Sick', variant: 'danger', icon: Stethoscope },
  injured: { label: 'Injured', variant: 'warning', icon: HeartCrack },
  dead: { label: 'Dead', variant: 'danger', icon: Skull },
  hungry: { label: 'Hungry', variant: 'warning', icon: Drumstick },
  repaired: { label: 'Repaired', variant: 'success', icon: Wrench },
  rested: { label: 'Rested', variant: 'info', icon: Bed },
};

export function Badge({
  variant = 'default',
  icon: Icon = Activity,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-base capitalize',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusKind }) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} icon={config.icon} aria-label={config.label}>
      {config.label}
    </Badge>
  );
}
