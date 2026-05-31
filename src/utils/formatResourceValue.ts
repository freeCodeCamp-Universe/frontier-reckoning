import type { ResourceName } from '@stores/expeditionStore';

export type DisplayResourceName = ResourceName | 'wagonCondition';

export function formatResourceValue(
  resourceName: DisplayResourceName,
  value: number,
) {
  if (resourceName === 'money') {
    return formatMoneyValue(value);
  }

  return formatWholeNumber(value);
}

export function formatMoneyValue(value: number) {
  return formatWholeNumber(value);
}

export function formatWholeNumber(value: number) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return String(Math.round(value));
}
