import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PartyPanel } from '@components/PartyPanel';
import { useExpeditionStore } from '@stores/expeditionStore';
import type { Character } from '@game/types/character';

describe('PartyPanel', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('renders characters in the party', () => {
    useExpeditionStore.getState().startGame();
    render(<PartyPanel />);

    expect(screen.getByRole('heading', { name: 'Caravan Party' })).toBeInTheDocument();
    expect(screen.getByText('Elias Reed')).toBeInTheDocument();
    expect(screen.getByText('Mara Bell')).toBeInTheDocument();
    expect(screen.getByText('Jonah Vale')).toBeInTheDocument();
    expect(screen.getByText('Ada Flint')).toBeInTheDocument();
  });

  it('renders character cards for all status states', () => {
    useExpeditionStore.setState({
      party: createStatusParty(),
    });

    render(<PartyPanel />);

    expect(screen.getByRole('article', { name: /Hazel Green, Scout, Healthy/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Otto Gray, Doctor, Sick/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Pearl Fox, Hunter, Injured/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Cal Moss, Mechanic, Dead/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Healthy')).toBeInTheDocument();
    expect(screen.getByLabelText('Sick')).toBeInTheDocument();
    expect(screen.getByLabelText('Injured')).toBeInTheDocument();
    expect(screen.getByLabelText('Dead')).toBeInTheDocument();
    expect(screen.getByText('Recent change: stable')).toBeInTheDocument();
    expect(screen.getByText('Recent change: health -38')).toBeInTheDocument();
    expect(screen.getByText('Recent change: life signs lost')).toBeInTheDocument();
  });

  it('announces dead characters to screen readers', () => {
    useExpeditionStore.setState({
      party: [createCharacter({ name: 'Cal Moss', status: 'dead', health: 0, morale: 0 })],
    });

    render(<PartyPanel />);

    const deadCard = screen.getByRole('article', {
      name: /Cal Moss, Scout, Dead/i,
    });

    expect(deadCard).toBeInTheDocument();
    expect(within(deadCard).getByText(/Cal Moss has died/i)).toBeInTheDocument();
    expect(within(deadCard).getByText('Deceased')).toBeInTheDocument();
  });

  it('exposes health and morale bars with text labels', () => {
    useExpeditionStore.setState({
      party: [createCharacter({ name: 'Pearl Fox', health: 42, morale: 67 })],
    });

    render(<PartyPanel />);

    expect(
      screen.getByRole('progressbar', { name: 'Pearl Fox health 42 of 100' }),
    ).toHaveAttribute('aria-valuetext', '42 of 100');
    expect(
      screen.getByRole('progressbar', { name: 'Pearl Fox morale 67 of 100' }),
    ).toHaveAttribute('aria-valuetext', '67 of 100');
    expect(screen.getByText('42/100')).toBeInTheDocument();
    expect(screen.getByText('67/100')).toBeInTheDocument();
  });
});

function createStatusParty(): Character[] {
  return [
    createCharacter({ id: 'healthy', name: 'Hazel Green', status: 'healthy' }),
    createCharacter({
      id: 'sick',
      name: 'Otto Gray',
      role: 'Doctor',
      status: 'sick',
      health: 62,
      morale: 76,
      skills: ['medicine', 'morale'],
    }),
    createCharacter({
      id: 'injured',
      name: 'Pearl Fox',
      role: 'Hunter',
      status: 'injured',
      health: 44,
      morale: 70,
      skills: ['hunting', 'foraging'],
    }),
    createCharacter({
      id: 'dead',
      name: 'Cal Moss',
      role: 'Mechanic',
      status: 'dead',
      health: 0,
      morale: 0,
      skills: ['repair', 'bartering'],
    }),
  ];
}

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character',
    name: 'Hazel Green',
    age: 30,
    role: 'Scout',
    health: 100,
    morale: 100,
    skills: ['navigation', 'foraging'],
    status: 'healthy',
    traits: ['Steady', 'Observant'],
    ...overrides,
  };
}
