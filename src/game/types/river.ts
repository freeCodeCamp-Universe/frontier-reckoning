export type RiverCrossingOptionId =
  | 'ford'
  | 'caulk'
  | 'ferry'
  | 'raft'
  | 'wait'
  | 'bridge';

export type RiverCrossingRequirements = {
  minimumMoney?: number;
  minimumWagonParts?: number;
  requiresFerry?: boolean;
  requiresBridge?: boolean;
};

export type RiverCostPreview = {
  money?: number;
  wagonParts?: number;
  food?: number;
  days?: number;
};

export type RiverCrossingOption = {
  id: RiverCrossingOptionId;
  label: string;
  description: string;
  riskDescription: string;
  strategyRiskModifier: number;
  requirements?: RiverCrossingRequirements;
  costPreview?: RiverCostPreview;
  successText: string;
  failureText: string;
};

export type RiverConditions = {
  width: number;
  depth: number;
  currentStrength: number;
  weatherModifier: number;
  ferryAvailable: boolean;
  bridgeAvailable: boolean;
  dangerRating: number;
};

export type RiverCrossing = RiverConditions & {
  id: string;
  name: string;
  distance: number;
  description: string;
  options: RiverCrossingOption[];
};

export type RiverOutcomeKind =
  | 'safe_crossing'
  | 'lost_food'
  | 'lost_ammo'
  | 'lost_medicine'
  | 'wagon_damage'
  | 'character_injury'
  | 'character_death'
  | 'multi_day_delay';

export type RiverOutcome = {
  kind: RiverOutcomeKind;
  amount?: number;
  characterId?: string;
};
