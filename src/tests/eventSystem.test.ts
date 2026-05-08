import { beforeEach, describe, expect, it, vi } from 'vitest';
import { starterEvents } from '@game/data/starterEvents';
import {
  applyEventChoice,
  applyEventEffects,
  pickWeightedEvent,
} from '@game/systems/eventSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('eventSystem', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('returns a valid weighted event', () => {
    const event = pickWeightedEvent(starterEvents, 0.25);

    expect(starterEvents).toContain(event);
  });

  it('applies event effects correctly', () => {
    const state = createStartingGameState();
    const nextState = applyEventEffects(state, {
      resources: { food: -25, ammo: 5 },
      morale: -10,
      wagonParts: -1,
      characterHealth: -20,
      characterStatus: 'injured',
    });

    expect(nextState.food).toBe(75);
    expect(nextState.ammo).toBe(45);
    expect(nextState.morale).toBe(65);
    expect(nextState.wagonParts).toBe(2);
    expect(nextState.party[0]).toMatchObject({
      health: 80,
      status: 'injured',
    });
  });

  it('applies choice effects correctly', () => {
    const state = createStartingGameState();
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'market-day');

    expect(event).toBeDefined();

    const nextState = applyEventChoice(state, event!, 'buy-food');

    expect(nextState.money).toBe(170);
    expect(nextState.food).toBe(130);
  });

  it('pauses travel when an event appears', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0);

    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().advanceDay();
    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().gameStatus).toBe('event');
    expect(useExpeditionStore.getState().currentEvent).toBeTruthy();

    const dayDuringEvent = useExpeditionStore.getState().currentDay;
    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().currentDay).toBe(dayDuringEvent);
  });
});
