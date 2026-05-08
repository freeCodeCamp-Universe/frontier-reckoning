import { beforeEach, describe, expect, it, vi } from 'vitest';
import { towns } from '@game/data/towns';
import {
  buyTownSupply,
  getPendingTown,
  sellTownSupply,
} from '@game/systems/townSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('townSystem', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('triggers a town at the correct distance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    useExpeditionStore.setState({
      ...createStartingGameState(),
      distanceTraveled: 290,
      gameStatus: 'traveling',
    });

    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().gameStatus).toBe('town');
    expect(useExpeditionStore.getState().currentTown?.name).toBe('Ash Hollow');
    expect(getPendingTown(useExpeditionStore.getState(), towns)?.name).toBe(
      'Ash Hollow',
    );
  });

  it('buying decreases money and increases resource', () => {
    const state = createStartingGameState();
    const result = buyTownSupply(state, towns[0], 'food');

    expect(result.succeeded).toBe(true);
    expect(result.state.money).toBe(state.money - 24);
    expect(result.state.food).toBe(state.food + 25);
  });

  it('cannot buy without money', () => {
    const state = {
      ...createStartingGameState(),
      money: 0,
    };
    const result = buyTownSupply(state, towns[0], 'medicine');

    expect(result.succeeded).toBe(false);
    expect(result.state.money).toBe(0);
    expect(result.state.medicine).toBe(state.medicine);
  });

  it('selling increases money and decreases resource', () => {
    const state = createStartingGameState();
    const result = sellTownSupply(state, towns[0], 'ammo');

    expect(result.succeeded).toBe(true);
    expect(result.state.money).toBe(state.money + 6);
    expect(result.state.ammo).toBe(state.ammo - 5);
  });
});
