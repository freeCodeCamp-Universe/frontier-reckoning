import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventCard } from '@components/EventCard';
import { starterEvents } from '@game/data/starterEvents';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('EventCard', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('disables choices with unmet requirements and shows why', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'market-day');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      money: 5,
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('button', { name: /Buy food/ })).toBeDisabled();
    expect(screen.getAllByText('Requires at least $30.')).toHaveLength(2);
  });

  it('shows outcome text after choosing', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'market-day');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);
    fireEvent.click(screen.getByRole('button', { name: /Buy food/ }));

    expect(
      screen.getByText('The supply sacks look better, and dinner has weight again.'),
    ).toBeInTheDocument();
  });

  it('traps focus and resolves the event from the focused control', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'broken-axle');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    const dialog = screen.getByRole('dialog', { name: 'Broken Axle' });
    const resolveButton = screen.getByRole('button', { name: 'Resolve Event' });

    expect(resolveButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(resolveButton).toHaveFocus();

    fireEvent.click(document.activeElement as HTMLElement);

    expect(screen.getByText('Event resolved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
  });
});
