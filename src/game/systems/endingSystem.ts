import type { FrontierReckoningData } from '@stores/expeditionStore';

export type GameOverReason =
  | 'all_party_dead'
  | 'wagon_destroyed'
  | 'health_collapsed'
  | 'supplies_exhausted';

export function getSurvivors(state: FrontierReckoningData) {
  return state.party.filter(
    (character) => character.status !== 'dead' && character.health > 0,
  );
}

export function getGameOverReason(
  state: FrontierReckoningData,
): GameOverReason | null {
  if (state.party.length > 0 && getSurvivors(state).length === 0) {
    return 'all_party_dead';
  }

  if (state.wagonCondition <= 0) {
    return 'wagon_destroyed';
  }

  if (state.health <= 0) {
    return 'health_collapsed';
  }

  if (state.suppliesExhaustedDays >= 3) {
    return 'supplies_exhausted';
  }

  return null;
}

export function getGameOverReasonText(reason: GameOverReason | null) {
  switch (reason) {
    case 'all_party_dead':
      return 'All party members died.';
    case 'wagon_destroyed':
      return 'The wagon was destroyed.';
    case 'health_collapsed':
      return 'The caravan health collapsed.';
    case 'supplies_exhausted':
      return 'Supplies were exhausted for too long.';
    default:
      return 'The expedition could not continue.';
  }
}

export function calculateScore(state: FrontierReckoningData) {
  const survivors = getSurvivors(state).length;
  const resourceScore =
    state.food + state.ammo + state.medicine * 8 + state.wagonParts * 12 + state.money;
  const dayPenalty = Math.max(0, state.currentDay - 1) * 3;
  const moraleScore = state.morale * 2;
  const wagonScore = state.wagonCondition * 2;
  const survivorScore = survivors * 250;

  return Math.max(
    0,
    Math.round(survivorScore + resourceScore + moraleScore + wagonScore - dayPenalty),
  );
}
