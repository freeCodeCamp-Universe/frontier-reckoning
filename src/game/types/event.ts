import type { CharacterStatus } from '@game/types/character';
import type { ResourceName } from '@stores/expeditionStore';

export type GameEventType =
  | 'resource_loss'
  | 'resource_gain'
  | 'character_injury'
  | 'character_sickness'
  | 'morale_change'
  | 'wagon_damage'
  | 'choice';

export type GameEventCategory =
  | 'campfire'
  | 'sickness_injury'
  | 'wagon_breakdown'
  | 'trader'
  | 'bandit'
  | 'survival'
  | 'navigation'
  | 'supplies';

export type EventEffects = {
  resources?: Partial<Record<ResourceName, number>>;
  morale?: number;
  health?: number;
  wagonParts?: number;
  wagonCondition?: number;
  distance?: number;
  delayDays?: number;
  targetCharacterId?: string;
  characterHealth?: number;
  characterMorale?: number;
  characterStatus?: Extract<CharacterStatus, 'sick' | 'injured' | 'dead'>;
};

export type ChoiceRequirements = {
  minimumFood?: number;
  minimumAmmo?: number;
  minimumMoney?: number;
  characterRolePresent?: string;
  minimumMorale?: number;
};

export type EventChoice = {
  id: string;
  label: string;
  description: string;
  requirements?: ChoiceRequirements;
  effects: EventEffects;
  outcomeText: string;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  type: GameEventType;
  categories: GameEventCategory[];
  weight: number;
  effects: EventEffects;
  choices?: EventChoice[];
};
