import { beforeEach, describe, expect, it } from 'vitest';
import {
  initialGameState,
  startingGameState,
  useExpeditionStore,
} from '@stores/expeditionStore';

describe('useExpeditionStore', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('initializes correctly', () => {
    expect(useExpeditionStore.getState()).toMatchObject(initialGameState);
  });

  it('startGame sets correct values', () => {
    useExpeditionStore.getState().startGame();

    expect(useExpeditionStore.getState()).toMatchObject({
      ...startingGameState,
      gameLog: ['Expedition started.'],
    });
  });

  it('initializes the party on game start', () => {
    useExpeditionStore.getState().startGame();

    expect(useExpeditionStore.getState().party).toHaveLength(4);
    expect(
      useExpeditionStore.getState().party.map((character) => character.role),
    ).toEqual(['Scout', 'Doctor', 'Hunter', 'Mechanic']);
  });

  it('prevents resources from going below zero', () => {
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().updateResource('food', -500);
    useExpeditionStore.getState().updateResource('money', -500);

    expect(useExpeditionStore.getState().food).toBe(0);
    expect(useExpeditionStore.getState().money).toBe(0);
  });

  it('clamps morale and health between zero and one hundred', () => {
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().updateResource('morale', 50);
    useExpeditionStore.getState().updateResource('health', 50);

    expect(useExpeditionStore.getState().morale).toBe(100);
    expect(useExpeditionStore.getState().health).toBe(100);

    useExpeditionStore.getState().updateResource('morale', -150);
    useExpeditionStore.getState().updateResource('health', -150);

    expect(useExpeditionStore.getState().morale).toBe(0);
    expect(useExpeditionStore.getState().health).toBe(0);
  });

  it('clamps character health between zero and one hundred', () => {
    useExpeditionStore.getState().startGame();

    useExpeditionStore.getState().damageCharacter('scout', 250);
    expect(useExpeditionStore.getState().party[0]).toMatchObject({
      health: 0,
      status: 'dead',
    });

    useExpeditionStore.getState().resetGame();
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().damageCharacter('scout', 25);
    useExpeditionStore.getState().healCharacter('scout', 250);

    expect(useExpeditionStore.getState().party[0]).toMatchObject({
      health: 100,
      status: 'healthy',
    });
  });

  it('does not heal dead characters above zero', () => {
    useExpeditionStore.getState().startGame();

    useExpeditionStore.getState().killCharacter('doctor');
    useExpeditionStore.getState().healCharacter('doctor', 50);

    expect(useExpeditionStore.getState().party[1]).toMatchObject({
      health: 0,
      status: 'dead',
    });
  });

  it('rest consumes food and improves health', () => {
    useExpeditionStore.setState({
      ...useExpeditionStore.getState(),
      ...startingGameState,
      gameStatus: 'camp',
      food: 100,
      health: 50,
      party: startingGameState.party.map((character) => ({
        ...character,
        health: 50,
      })),
    });

    useExpeditionStore.getState().restAtCamp();

    expect(useExpeditionStore.getState().food).toBe(92);
    expect(useExpeditionStore.getState().health).toBe(60);
    expect(useExpeditionStore.getState().party[0].health).toBe(60);
  });

  it('repair consumes wagon parts and improves wagon condition', () => {
    useExpeditionStore.setState({
      ...useExpeditionStore.getState(),
      ...startingGameState,
      gameStatus: 'camp',
      wagonParts: 3,
      wagonCondition: 50,
    });

    useExpeditionStore.getState().repairWagonAtCamp();

    expect(useExpeditionStore.getState().wagonParts).toBe(2);
    expect(useExpeditionStore.getState().wagonCondition).toBe(75);
  });

  it('treat consumes medicine and improves a character', () => {
    useExpeditionStore.setState({
      ...useExpeditionStore.getState(),
      ...startingGameState,
      gameStatus: 'camp',
      medicine: 5,
      party: startingGameState.party.map((character) =>
        character.id === 'scout'
          ? { ...character, health: 40, status: 'injured' }
          : character,
      ),
    });

    useExpeditionStore.getState().treatPartyMemberAtCamp('scout');

    expect(useExpeditionStore.getState().medicine).toBe(4);
    expect(useExpeditionStore.getState().party[0].health).toBe(65);
  });

  it('campfire improves morale', () => {
    useExpeditionStore.setState({
      ...useExpeditionStore.getState(),
      ...startingGameState,
      gameStatus: 'camp',
      morale: 50,
    });

    useExpeditionStore.getState().tellCampfireStoriesAtCamp();

    expect(useExpeditionStore.getState().morale).toBe(58);
  });

  it('rationing affects morale', () => {
    useExpeditionStore.setState({
      ...useExpeditionStore.getState(),
      ...startingGameState,
      gameStatus: 'camp',
      morale: 50,
      rationingDays: 0,
    });

    useExpeditionStore.getState().rationFoodAtCamp();

    expect(useExpeditionStore.getState().morale).toBe(44);
    expect(useExpeditionStore.getState().rationingDays).toBe(3);
  });

  it('hunting consumes ammo from camp', () => {
    useExpeditionStore.setState({
      ...useExpeditionStore.getState(),
      ...startingGameState,
      gameStatus: 'camp',
      ammo: 10,
    });

    useExpeditionStore.getState().huntAtCamp(5);

    expect(useExpeditionStore.getState().ammo).toBe(5);
  });
});
