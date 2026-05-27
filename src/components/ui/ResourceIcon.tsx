import {
  Apple,
  BadgeDollarSign,
  Cross,
  HeartPulse,
  Package,
  Shield,
  Smile,
  Target,
  type LucideIcon,
} from 'lucide-react';
import type { ResourceName } from '@stores/expeditionStore';

const resourceIcons: Record<ResourceName | 'wagonCondition', LucideIcon> = {
  food: Apple,
  medicine: Cross,
  ammo: Target,
  wagonParts: Package,
  money: BadgeDollarSign,
  morale: Smile,
  health: HeartPulse,
  wagonCondition: Shield,
};

export function ResourceIcon({
  resource,
  className = 'size-5',
}: {
  resource: ResourceName | 'wagonCondition';
  className?: string;
}) {
  const Icon = resourceIcons[resource];

  return <Icon aria-hidden="true" className={className} />;
}
