import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventCard } from '@components/EventCard';
import { ResourceDashboard } from '@components/ResourceDashboard';
import { starterEvents } from '@game/data/starterEvents';
import { updateStoredSettings } from '@game/systems/settingsSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('animation layer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  it('disables animation classes when reduced motion is enabled', () => {
    updateStoredSettings(window.localStorage, { reducedMotion: true });
    useExpeditionStore.getState().startGame();

    const { rerender } = render(<ResourceDashboard />);

    act(() => {
      useExpeditionStore.getState().updateResource('food', -12);
      rerender(<ResourceDashboard />);
    });

    expect(screen.getByText('Food').closest('div')).not.toHaveClass('fr-resource-pulse');
    expect(screen.getByText('-12')).toBeInTheDocument();
  });

  it('shows a resource change indicator when values change', () => {
    useExpeditionStore.getState().startGame();

    const { rerender } = render(<ResourceDashboard />);

    act(() => {
      useExpeditionStore.getState().updateResource('morale', -5);
      rerender(<ResourceDashboard />);
    });

    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('Morale').closest('div')).toHaveClass('fr-resource-pulse');
    expect(screen.getByText('Morale').closest('div')).toHaveClass('fr-vital-change');
  });

  it('keeps the event card accessible while it animates in', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'event',
      currentEvent: starterEvents[0],
      eventResolved: false,
    });

    render(<EventCard />);

    const dialog = screen.getByRole('dialog', { name: starterEvents[0].title });

    expect(dialog).toHaveClass('fr-event-card-enter');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(starterEvents[0].description)).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(dialog).toBeInTheDocument();
  });
});
