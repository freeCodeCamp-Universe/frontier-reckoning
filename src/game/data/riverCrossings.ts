import type { RiverCrossing } from '@game/types/river';

const standardOptions = (
  ferryCost: number,
  depthDescription: string,
): RiverCrossing['options'] => [
  {
    id: 'ford',
    label: 'Ford the river',
    description: 'Push the wagon through the shallows and hope the current holds.',
    riskDescription: 'High risk: supplies may wash away and a traveler may be injured.',
    failureChance: 0.4,
    successEffects: { morale: 1 },
    failureEffects: {
      resources: { food: -12, ammo: -4 },
      wagonCondition: -16,
      characterHealth: -14,
      characterStatus: 'injured',
    },
    successText: 'The wagon groans through the current and reaches the far bank.',
    failureText: 'The current slams the wagon hard, scattering supplies downstream.',
  },
  {
    id: 'caulk',
    label: 'Caulk the wagon',
    description: 'Seal the wagon bed and float it across.',
    riskDescription: 'Medium risk: safer than fording, but hard on the wagon.',
    requirements: { minimumWagonParts: 1 },
    failureChance: 0.22,
    successEffects: { wagonParts: -1, morale: 2 },
    failureEffects: {
      wagonParts: -1,
      wagonCondition: -10,
      resources: { food: -8 },
    },
    successText: 'The sealed wagon rides low but crosses without taking water.',
    failureText:
      'The caulking fails midway, soaking crates before the team can pull free.',
  },
  {
    id: 'ferry',
    label: 'Hire a ferry',
    description: `Pay the ferryman to haul the wagon across ${depthDescription}.`,
    riskDescription: 'Low risk: expensive, but the safest crossing.',
    requirements: { minimumMoney: ferryCost },
    failureChance: 0.03,
    successEffects: { resources: { money: -ferryCost }, morale: 3 },
    failureEffects: {
      resources: { money: -ferryCost, food: -4 },
      wagonCondition: -5,
    },
    successText: 'The ferry carries the wagon across with only a few nervous minutes.',
    failureText: 'The ferry bumps a hidden snag, costing supplies and patience.',
  },
  {
    id: 'wait',
    label: 'Wait one day',
    description: 'Make camp and hope the water drops by morning.',
    riskDescription: 'No crossing risk today, but it costs time and morale.',
    failureChance: 0,
    successEffects: { delayDays: 1, morale: -1, resources: { food: -4 } },
    failureEffects: {},
    successText: 'By morning the water is calmer and the party is ready to cross.',
    failureText: 'The river refuses to settle.',
  },
  {
    id: 'bridge',
    label: 'Search for a bridge',
    description: 'Follow the bank and look for a safer crossing.',
    riskDescription: 'Low risk: costs a day and may add miles, but avoids deep water.',
    failureChance: 0.12,
    successEffects: { delayDays: 1, distance: 10, morale: -1 },
    failureEffects: { delayDays: 1, distance: -8, morale: -4 },
    successText:
      'A rough bridge appears around the bend, saving the wagon from the water.',
    failureText: 'The search finds only mud, brambles, and a worse place to cross.',
  },
];

export const riverCrossings: RiverCrossing[] = [
  {
    id: 'blackwater-crossing',
    name: 'Blackwater Crossing',
    distance: 450,
    description: 'Dark water cuts across the trail, slow but deeper than it looks.',
    options: standardOptions(35, 'the black channel'),
  },
  {
    id: 'red-fork-river',
    name: 'Red Fork River',
    distance: 1000,
    description: 'Red clay churns through a wide river with a fast middle current.',
    options: standardOptions(50, 'the red fork'),
  },
  {
    id: 'mercy-bend',
    name: 'Mercy Bend',
    distance: 1550,
    description: 'Mercy Bend loops around slick banks and a graveyard of broken wheels.',
    options: standardOptions(70, 'the bend'),
  },
];
