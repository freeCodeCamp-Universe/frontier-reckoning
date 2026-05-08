import type { EventEffects } from '@game/types/event';

export type RiverCrossingOptionId =
  | 'ford'
  | 'caulk'
  | 'ferry'
  | 'wait'
  | 'bridge';

export type RiverCrossingRequirements = {
  minimumMoney?: number;
  minimumWagonParts?: number;
};

export type RiverCrossingOption = {
  id: RiverCrossingOptionId;
  label: string;
  description: string;
  riskDescription: string;
  requirements?: RiverCrossingRequirements;
  successEffects: EventEffects;
  failureEffects: EventEffects;
  failureChance: number;
  successText: string;
  failureText: string;
};

export type RiverCrossing = {
  id: string;
  name: string;
  distance: number;
  description: string;
  options: RiverCrossingOption[];
};
