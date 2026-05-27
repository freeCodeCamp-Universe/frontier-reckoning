import type { CharacterStatus } from '@game/types/character';
import type { GameStatus, ResourceName } from '@stores/expeditionStore';

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

export type TemporaryModifier = {
  id: string;
  label: string;
  durationDays: number;
  travelSpeedMultiplier?: number;
  foodConsumptionMultiplier?: number;
  eventWeightModifiers?: Partial<Record<GameEventCategory | string, number>>;
  moraleDeltaPerDay?: number;
};

export type EventEffect =
  | {
      type: 'change_resource';
      resource: ResourceName;
      amount: number;
    }
  | {
      type: 'change_party_health';
      amount: number;
    }
  | {
      type: 'change_party_morale';
      amount: number;
    }
  | {
      type: 'change_single_character_health';
      amount: number;
      targetCharacterId?: string;
    }
  | {
      type: 'change_single_character_morale';
      amount: number;
      targetCharacterId?: string;
    }
  | {
      type: 'change_single_character_status';
      status: Extract<CharacterStatus, 'healthy' | 'sick' | 'injured' | 'dead'>;
      targetCharacterId?: string;
    }
  | {
      type: 'change_wagon_condition';
      amount: number;
    }
  | {
      type: 'change_distance';
      amount: number;
    }
  | {
      type: 'add_game_log';
      message: string;
    }
  | {
      type: 'advance_days';
      days: number;
    }
  | {
      type: 'trigger_followup_event';
      event: GameEvent;
    }
  | {
      type: 'start_subsystem';
      subsystem: Extract<GameStatus, 'camp' | 'river' | 'town'> | 'hunting';
    }
  | {
      type: 'add_temporary_modifier';
      modifier: TemporaryModifier;
    }
  | {
      type: 'remove_temporary_modifier';
      modifierId: string;
    }
  | {
      type: 'faction_reputation_change';
      factionId: string;
      amount: number;
    };

export type EventEffects = EventEffect[];

export type LegacyEventEffects = {
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
