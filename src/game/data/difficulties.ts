export type Difficulty = 'greenhorn' | 'trailwise' | 'reckoning';

export type DifficultyConfig = {
  id: Difficulty;
  label: string;
  description: string;
  startingMoney: number;
  resourceConsumptionMultiplier: number;
  eventSeverityMultiplier: number;
  shopPriceMultiplier: number;
};

export const difficultyConfigs: Record<Difficulty, DifficultyConfig> = {
  greenhorn: {
    id: 'greenhorn',
    label: 'Greenhorn',
    description: 'A forgiving supply fund and softer trail pressure.',
    startingMoney: 340,
    resourceConsumptionMultiplier: 0.85,
    eventSeverityMultiplier: 0.8,
    shopPriceMultiplier: 0.85,
  },
  trailwise: {
    id: 'trailwise',
    label: 'Trailwise',
    description: 'The intended Frontier Reckoning balance.',
    startingMoney: 260,
    resourceConsumptionMultiplier: 1,
    eventSeverityMultiplier: 1,
    shopPriceMultiplier: 1,
  },
  reckoning: {
    id: 'reckoning',
    label: 'Reckoning',
    description: 'Lean money, harsher events, and expensive towns.',
    startingMoney: 190,
    resourceConsumptionMultiplier: 1.2,
    eventSeverityMultiplier: 1.25,
    shopPriceMultiplier: 1.2,
  },
};

export const difficultyOptions = Object.values(difficultyConfigs);

export function getDifficultyConfig(difficulty: Difficulty = 'trailwise') {
  return difficultyConfigs[difficulty];
}
