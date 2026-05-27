import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventCard } from '@components/EventCard';
import { EventIllustration } from '@components/EventIllustration';
import { starterEvents } from '@game/data/starterEvents';
import { getEventIllustrationKind } from '@game/systems/eventIllustrations';
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

  it('maps each event illustration category', () => {
    expect(getEventIllustrationKind({ categories: ['storm'] })).toBe('storm');
    expect(getEventIllustrationKind({ categories: ['sickness'] })).toBe('sickness');
    expect(getEventIllustrationKind({ categories: ['trader'] })).toBe('trader');
    expect(getEventIllustrationKind({ categories: ['bandit'] })).toBe('bandit');
    expect(getEventIllustrationKind({ categories: ['river'] })).toBe('river');
    expect(getEventIllustrationKind({ categories: ['hunting'] })).toBe('hunting');
    expect(getEventIllustrationKind({ categories: ['wagon_damage'] })).toBe('wagon_damage');
    expect(getEventIllustrationKind({ categories: ['campfire'] })).toBe('campfire');
    expect(getEventIllustrationKind({ categories: ['town'] })).toBe('town');
    expect(getEventIllustrationKind({ categories: ['discovery'] })).toBe('discovery');
  });

  it('falls back safely for unknown illustration categories', () => {
    expect(getEventIllustrationKind({ categories: ['mystery'] })).toBe('discovery');

    render(
      <EventIllustration
        event={{
          categories: ['mystery' as never],
          title: 'Unmarked Sign',
          type: 'choice',
        }}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Event illustration: discovery' }),
    ).toBeInTheDocument();
  });

  it('keeps the event card accessible with an illustration', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'market-day');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('dialog', { name: 'Market Day' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(screen.getByRole('img', { name: 'Event illustration: trader' })).toBeInTheDocument();
    expect(screen.getByText(event?.description ?? '')).toBeInTheDocument();
  });
});
