import type { LegacyEventEffects } from '@game/types/event';

export type RiverCrossingOptionId = 'ford' | 'caulk' | 'ferry' | 'wait' | 'bridge';

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
  successEffects: LegacyEventEffects;
  failureEffects: LegacyEventEffects;
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
