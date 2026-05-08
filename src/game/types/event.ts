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

export type EventEffects = {
  resources?: Partial<Record<ResourceName, number>>;
  morale?: number;
  health?: number;
  wagonParts?: number;
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
  weight: number;
  effects: EventEffects;
  choices?: EventChoice[];
};
