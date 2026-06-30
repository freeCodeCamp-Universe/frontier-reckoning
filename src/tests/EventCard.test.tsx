import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventCard } from '@components/EventCard';
import { EventIllustration } from '@components/EventIllustration';
import { starterEvents } from '@game/data/starterEvents';
import {
  eventSceneConfigs,
  getEventIllustrationKind,
  getEventSceneConfig,
} from '@game/systems/eventIllustrations';
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
    expect(getEventIllustrationKind({ categories: ['wagon_damage'] })).toBe(
      'wagon_damage',
    );
    expect(getEventIllustrationKind({ categories: ['campfire'] })).toBe('campfire');
    expect(getEventIllustrationKind({ categories: ['town'] })).toBe('town');
    expect(getEventIllustrationKind({ categories: ['discovery'] })).toBe('discovery');
    expect(getEventIllustrationKind({ id: 'ridge-scouting' })).toBe('ridge_scouting');
    expect(getEventIllustrationKind({ title: 'Scout the Ridge' })).toBe('ridge_scouting');
    expect(getEventIllustrationKind({ id: 'bad-water' })).toBe('bad_water');
    expect(getEventIllustrationKind({ title: 'Bad Water' })).toBe('bad_water');
    expect(getEventIllustrationKind({ id: 'predator-hunt' })).toBe('predator_hunt');
    expect(getEventIllustrationKind({ title: 'Hunt in Predator Territory' })).toBe(
      'predator_hunt',
    );
    expect(getEventIllustrationKind({ id: 'stolen-tack' })).toBe('stolen_tack');
    expect(getEventIllustrationKind({ title: 'Stolen Tack' })).toBe('stolen_tack');
    expect(getEventIllustrationKind({ id: 'night-watch-song' })).toBe('night_watch_song');
    expect(getEventIllustrationKind({ title: 'Night Watch Song' })).toBe(
      'night_watch_song',
    );
    expect(getEventIllustrationKind({ id: 'snakebite' })).toBe('rattlesnake_strike');
    expect(getEventIllustrationKind({ title: 'Rattlesnake Strike' })).toBe(
      'rattlesnake_strike',
    );
    expect(getEventIllustrationKind({ id: 'guide-for-ammo' })).toBe('guide_for_ammo');
    expect(getEventIllustrationKind({ title: 'Guide for Ammunition' })).toBe(
      'guide_for_ammo',
    );
    expect(getEventIllustrationKind({ id: 'ration-dispute' })).toBe('ration_dispute');
    expect(getEventIllustrationKind({ title: 'Ration Dispute' })).toBe('ration_dispute');
  });

  it('falls back safely for unknown illustration categories', () => {
    expect(getEventIllustrationKind({ categories: ['mystery'] })).toBe('discovery');

    const { container } = render(
      <EventIllustration
        event={{
          categories: ['mystery' as never],
          title: 'Unmarked Sign',
          type: 'choice',
        }}
      />,
    );

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('covers every starter event with a cinematic scene config', () => {
    const configuredIds = new Set(Object.keys(eventSceneConfigs));

    expect(configuredIds.size).toBe(starterEvents.length);

    for (const event of starterEvents) {
      expect(getEventSceneConfig(event.id)?.id).toBe(event.id);
    }
  });

  it('renders every starter event illustration without external assets', () => {
    for (const event of starterEvents) {
      const { container, unmount } = render(<EventIllustration event={event} />);

      expect(
        container.querySelector(`[data-event-scene-id="${event.id}"]`),
      ).toBeInTheDocument();
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelector('svg image')).not.toBeInTheDocument();
      expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
      expect(container.innerHTML).not.toMatch(/https?:\/\//i);

      unmount();
    }
  });

  it('disables animated cinematic illustration effects for reduced motion', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'broken-axle');

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders every starter event title and description in the event card', () => {
    for (const event of starterEvents) {
      useExpeditionStore.setState({
        ...createStartingGameState(),
        currentEvent: event,
        eventResolved: false,
        gameStatus: 'event',
      });

      const { unmount } = render(<EventCard />);

      expect(screen.getByRole('dialog', { name: event.title })).toBeInTheDocument();
      expect(screen.getByText(event.description)).toBeInTheDocument();

      unmount();
    }
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
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(event?.description ?? '')).toBeInTheDocument();
  });

  it('uses the upgraded ridge scouting illustration without external assets', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'ridge-scouting',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('ridge-scouting-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables ridge scouting illustration animation for reduced motion', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'ridge-scouting',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Scout the Ridge content and choices with the upgraded illustration', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'ridge-scouting',
    );

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('dialog', { name: 'Scout the Ridge' })).toBeInTheDocument();
    expect(
      screen.getByText('A ridge ahead may reveal water, game, or danger.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('ridge-scouting-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send the Scout/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skip the ridge/ })).toBeInTheDocument();
  });

  it('uses the upgraded bad water illustration without external assets', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'bad-water');

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('bad-water-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables bad water illustration animation for reduced motion', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'bad-water');

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Bad Water content with the upgraded illustration', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'bad-water');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('dialog', { name: 'Bad Water' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'The creek water looked clean enough. By noon, that bet feels costly.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('bad-water-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve Event' })).toBeInTheDocument();
  });

  it('uses the upgraded predator hunt illustration without external assets', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'predator-hunt',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('predator-hunt-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables predator hunt illustration animation for reduced motion', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'predator-hunt',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Hunt in Predator Territory content and choices with the upgraded illustration', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'predator-hunt',
    );

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(
      screen.getByRole('dialog', { name: 'Hunt in Predator Territory' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The Hunter finds elk tracks crossing fresh claw marks.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('predator-hunt-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Risk the hunt/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Avoid the territory/ }),
    ).toBeInTheDocument();
  });

  it('uses the upgraded stolen tack illustration without external assets', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'stolen-tack');

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('stolen-tack-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables stolen tack illustration animation for reduced motion', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'stolen-tack');

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Stolen Tack content with the upgraded illustration', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'stolen-tack');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('dialog', { name: 'Stolen Tack' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'A strap bundle disappears in the night, sliced clean from the wagon rail.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('stolen-tack-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve Event' })).toBeInTheDocument();
  });

  it('uses the upgraded night watch song illustration without external assets', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'night-watch-song',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('night-watch-song-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables night watch song illustration animation for reduced motion', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'night-watch-song',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Night Watch Song content with the upgraded illustration', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'night-watch-song',
    );

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('dialog', { name: 'Night Watch Song' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'A low song travels around the campfire while the stars burn cold.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('night-watch-song-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve Event' })).toBeInTheDocument();
  });

  it('uses the upgraded rattlesnake strike illustration without external assets', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'snakebite');

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('rattlesnake-strike-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables rattlesnake strike illustration animation for reduced motion', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'snakebite');

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Rattlesnake Strike content with the upgraded illustration', () => {
    const event = starterEvents.find((starterEvent) => starterEvent.id === 'snakebite');

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(
      screen.getByRole('dialog', { name: 'Rattlesnake Strike' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A careless step near brush leaves one traveler badly shaken.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('rattlesnake-strike-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve Event' })).toBeInTheDocument();
  });

  it('uses the upgraded guide for ammunition illustration without external assets', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'guide-for-ammo',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('guide-for-ammo-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables guide for ammunition illustration animation for reduced motion', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'guide-for-ammo',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Guide for Ammunition content and choices with the upgraded illustration', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'guide-for-ammo',
    );

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(
      screen.getByRole('dialog', { name: 'Guide for Ammunition' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'A local guide will show a faster trail in exchange for ammunition.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('guide-for-ammo-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay the guide/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trust your map/ })).toBeInTheDocument();
  });

  it('uses the upgraded ration dispute illustration without external assets', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'ration-dispute',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('ration-dispute-illustration')).toBeInTheDocument();
    expect(container.querySelector('svg image')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/\.(png|jpe?g|webp|gif|avif|svg)/i);
    expect(container.innerHTML).not.toMatch(/https?:\/\//i);
  });

  it('disables ration dispute illustration animation for reduced motion', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'ration-dispute',
    );

    const { container } = render(<EventIllustration event={event!} />);

    expect(container.querySelector('style')?.textContent).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(container.querySelector('style')?.textContent).toContain('animation: none');
  });

  it('renders Ration Dispute content and choices with the upgraded illustration', () => {
    const event = starterEvents.find(
      (starterEvent) => starterEvent.id === 'ration-dispute',
    );

    useExpeditionStore.setState({
      ...createStartingGameState(),
      currentEvent: event,
      eventResolved: false,
      gameStatus: 'event',
    });

    render(<EventCard />);

    expect(screen.getByRole('dialog', { name: 'Ration Dispute' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Two travelers argue over whether the food stores should be tightened.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('ration-dispute-illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tighten rations/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Keep rations steady/ }),
    ).toBeInTheDocument();
  });
});
