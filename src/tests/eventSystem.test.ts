import { beforeEach, describe, expect, it, vi } from 'vitest';
import { starterEvents } from '@game/data/starterEvents';
import {
  applyEventChoice,
  applyEventEffect,
  applyEventEffects,
  getChoiceAvailability,
  pickWeightedEvent,
} from '@game/systems/eventSystem';
import { applyDailyTravel } from '@game/systems/travelSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';
import { createSeededRng } from '@utils/rng';

describe('eventSystem', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('returns a valid weighted event', () => {
    const event = pickWeightedEvent(starterEvents, createSeededRng(25));

    expect(starterEvents).toContain(event);
  });

  it('selects events deterministically from a seeded rng', () => {
    const firstEvent = pickWeightedEvent(starterEvents, createSeededRng('event-seed'));
    const secondEvent = pickWeightedEvent(starterEvents, createSeededRng('event-seed'));

    expect(firstEvent.id).toBe(secondEvent.id);
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

    expect(nextState.food).toBe(155);
    expect(nextState.ammo).toBe(39);
    expect(nextState.morale).toBe(68);
    expect(nextState.wagonParts).toBe(3);
    expect(nextState.party[0]).toMatchObject({
      health: 80,
      status: 'injured',
    });
  });

  it('applies each expressive effect type safely', () => {
    const state = createStartingGameState();
    const followupEvent = starterEvents[0];
    const targetCharacterId = state.party[0].id;
    const nextState = applyEventEffects(state, [
      { type: 'change_resource', resource: 'food', amount: -10 },
      { type: 'change_party_health', amount: -5 },
      { type: 'change_party_morale', amount: -6 },
      {
        type: 'change_single_character_health',
        targetCharacterId,
        amount: -7,
      },
      {
        type: 'change_single_character_status',
        targetCharacterId,
        status: 'injured',
      },
      { type: 'change_wagon_condition', amount: -9 },
      { type: 'add_game_log', message: 'A test log entry.' },
      { type: 'advance_days', days: 2 },
      { type: 'change_distance', amount: 25 },
      { type: 'start_subsystem', subsystem: 'camp' },
      {
        type: 'add_temporary_modifier',
        modifier: {
          id: 'tailwind',
          label: 'Tailwind',
          durationDays: 2,
          travelSpeedMultiplier: 1.2,
          foodConsumptionMultiplier: 0.9,
          eventWeightModifiers: { navigation: 1.5 },
          moraleDeltaPerDay: 1,
        },
      },
      { type: 'remove_temporary_modifier', modifierId: 'missing-modifier' },
      { type: 'faction_reputation_change', factionId: 'settlers', amount: 3 },
      { type: 'trigger_followup_event', event: followupEvent },
    ]);

    expect(nextState.food).toBe(170);
    expect(nextState.health).toBe(95);
    expect(nextState.morale).toBe(72);
    expect(nextState.party[0]).toMatchObject({
      health: 88,
      status: 'injured',
    });
    expect(nextState.wagonCondition).toBe(91);
    expect(nextState.currentDay).toBe(3);
    expect(nextState.distanceTraveled).toBe(25);
    expect(nextState.gameLog).toContain('A test log entry.');
    expect(nextState.gameLog[0]).toContain('Faction reputation placeholder');
    expect(nextState.temporaryModifiers).toHaveLength(1);
    expect(nextState.currentEvent?.id).toBe(followupEvent.id);
    expect(nextState.gameStatus).toBe('event');
  });

  it('temporary modifiers expire after travel days', () => {
    const state = {
      ...createStartingGameState(),
      temporaryModifiers: [
        {
          id: 'hard-rations',
          label: 'Hard rations',
          durationDays: 1,
          foodConsumptionMultiplier: 0.5,
          moraleDeltaPerDay: -2,
        },
      ],
    };
    const nextState = applyDailyTravel(state, () => 0.99);

    expect(nextState.temporaryModifiers).toHaveLength(0);
    expect(nextState.morale).toBe(75);
    expect(nextState.food).toBe(177);
  });

  it('follow-up events trigger directly', () => {
    const state = createStartingGameState();
    const followupEvent = starterEvents.find((event) => event.id === 'market-day')!;
    const nextState = applyEventEffect(state, {
      type: 'trigger_followup_event',
      event: followupEvent,
    });

    expect(nextState.currentEvent?.id).toBe('market-day');
    expect(nextState.gameStatus).toBe('event');
    expect(nextState.eventResolved).toBe(false);
  });

  it('invalid effects fail safely', () => {
    const state = createStartingGameState();
    const nextState = applyEventEffect(state, {
      type: 'change_resource',
      resource: 'not-real',
      amount: -999,
    } as never);

    expect(nextState).toBe(state);
  });

  it('applies choice effects correctly', () => {
    const state = createStartingGameState();
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'market-day');

    expect(event).toBeDefined();

    const nextState = applyEventChoice(state, event!, 'buy-food');

    expect(nextState.money).toBe(230);
    expect(nextState.food).toBe(210);
  });

  it('marks choices unavailable when requirements are unmet', () => {
    const state = {
      ...createStartingGameState(),
      money: 5,
    };
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'market-day');
    const choice = event?.choices?.find((eventChoice) => eventChoice.id === 'buy-food');

    expect(choice).toBeDefined();

    const availability = getChoiceAvailability(state, choice!);

    expect(availability.available).toBe(false);
    expect(availability.reasons).toContain('Requires at least $30.');
  });

  it('pauses travel when an event appears', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0);

    useExpeditionStore.setState({
      ...createStartingGameState(),
      daysSinceLastEvent: 2,
    });
    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().gameStatus).toBe('event');
    expect(useExpeditionStore.getState().currentEvent).toBeTruthy();

    const dayDuringEvent = useExpeditionStore.getState().currentDay;
    useExpeditionStore.getState().advanceDay();

    expect(useExpeditionStore.getState().currentDay).toBe(dayDuringEvent);
  });
});
