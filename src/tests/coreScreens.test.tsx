import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CampScreen } from '@components/CampScreen';
import { EndingScreen } from '@components/EndingScreen';
import { EventCard } from '@components/EventCard';
import { GameLogPanel } from '@components/GameLogPanel';
import { PartyPanel } from '@components/PartyPanel';
import { ResourceDashboard } from '@components/ResourceDashboard';
import { RiverEventScreen } from '@components/RiverEventScreen';
import { TownScreen } from '@components/TownScreen';
import { riverCrossings } from '@game/data/riverCrossings';
import { starterEvents } from '@game/data/starterEvents';
import { towns } from '@game/data/towns';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('core screens', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useExpeditionStore.getState().resetGame();
  });

  it('renders dashboard, party, and log panels', () => {
    useExpeditionStore.getState().startGame();

    render(
      <>
        <ResourceDashboard />
        <PartyPanel />
        <GameLogPanel />
      </>,
    );

    expect(screen.getByRole('heading', { name: 'Trail Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Caravan Party' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Game Log' })).toBeInTheDocument();
  });

  it('renders camp, event, town, river, and ending screens', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'camp',
      campOutcomeText: 'The caravan makes camp.',
    });
    const camp = render(<CampScreen />);
    expect(screen.getByRole('heading', { name: 'Camp' })).toBeInTheDocument();
    camp.unmount();

    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'event',
      currentEvent: starterEvents.find((event) => event.id === 'market-day') ?? null,
      eventResolved: false,
    });
    const event = render(<EventCard />);
    expect(screen.getByRole('heading', { name: 'Market Day' })).toBeInTheDocument();
    event.unmount();

    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'town',
      currentTown: towns[0],
    });
    const town = render(<TownScreen />);
    expect(screen.getByRole('heading', { name: 'Ash Hollow' })).toBeInTheDocument();
    town.unmount();

    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'river',
      currentRiver: riverCrossings[0],
    });
    const river = render(<RiverEventScreen />);
    expect(
      screen.getByRole('heading', { name: 'Blackwater Crossing' }),
    ).toBeInTheDocument();
    river.unmount();

    useExpeditionStore.setState({
      ...createStartingGameState(),
      gameStatus: 'victory',
    });
    render(<EndingScreen />);
    expect(screen.getByRole('heading', { name: 'Victory' })).toBeInTheDocument();
  });

  it('game log records major actions and keeps the latest events visible', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    useExpeditionStore.getState().startGame();
    useExpeditionStore.getState().advanceDay();

    render(<GameLogPanel />);

    expect(screen.getByText('Expedition started.')).toBeInTheDocument();
    expect(screen.getAllByText('Traveled to day 2.')).toHaveLength(2);
  });
});
