import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveGameLayout } from '@components/ActiveGameLayout';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

vi.mock('@components/PhaserGame', () => ({
  PhaserGame: () => <div data-testid="phaser-game" />,
}));

describe('ActiveGameLayout', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  it('renders the active game dashboard shell', async () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();
    const header = screen.getByRole('banner');

    expect(header).toHaveTextContent('Frontier Expedition');
    expect(header).not.toHaveClass('sticky');
    expect(header).not.toHaveClass('fixed');
    expect(header.className).not.toContain('top-');
    expect(header.className).not.toContain('z-');
    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Trail Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Resource dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Trail Map' })).toBeInTheDocument();
    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
  });

  it('formats header and trail map distance values as whole numbers', async () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      distanceTraveled: 104.80000000000008,
      totalDistance: 1999.99999999997,
    });

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    expect(screen.getAllByText('105 / 2000')).toHaveLength(1);
    expect(screen.getByText('105 / 2000 mi')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('104.80000000000008');
    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
  });

  it('places the compact trail dashboard above the trail map', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    const trailDashboard = screen.getByRole('region', { name: 'Trail Dashboard' });
    const trailMap = screen.getByRole('region', { name: 'Trail Map' });

    expect(
      trailDashboard.compareDocumentPosition(trailMap) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(trailDashboard).getByText('Trail Dashboard')).toBeInTheDocument();
    expect(
      within(trailDashboard).queryByRole('button', { name: /trail dashboard/ }),
    ).not.toBeInTheDocument();
    expect(within(trailDashboard).queryByText(/Day 1/)).not.toBeInTheDocument();
    expect(within(trailDashboard).queryByText(/0 of 2000/)).not.toBeInTheDocument();
    expect(within(trailDashboard).queryByText('traveling')).not.toBeInTheDocument();
    expect(within(trailDashboard).getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
    expect(within(trailDashboard).getByRole('button', { name: 'Make Camp' })).toBeEnabled();
  });

  it('places resource summary between trail dashboard and trail map', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    const trailDashboard = screen.getByRole('region', { name: 'Trail Dashboard' });
    const resourceSummary = screen.getByRole('region', { name: 'Resource dashboard' });
    const trailMap = screen.getByRole('region', { name: 'Trail Map' });

    expect(
      trailDashboard.compareDocumentPosition(resourceSummary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      resourceSummary.compareDocumentPosition(trailMap) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(resourceSummary).getByRole('heading', { name: 'Resource Summary' }),
    ).toBeInTheDocument();
    expect(
      within(resourceSummary).getByRole('button', { name: 'Expand resource summary' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not expose trail dashboard collapse controls or aria-expanded', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    const trailDashboard = screen.getByRole('region', { name: 'Trail Dashboard' });

    expect(
      within(trailDashboard).queryByRole('button', { name: 'Collapse trail dashboard' }),
    ).not.toBeInTheDocument();
    expect(
      within(trailDashboard).queryByRole('button', { name: 'Expand trail dashboard' }),
    ).not.toBeInTheDocument();
    for (const button of within(trailDashboard).getAllByRole('button')) {
      expect(button).not.toHaveAttribute('aria-expanded');
    }
  });

  it('uses a responsive grid for trail dashboard actions', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    expect(screen.getByTestId('trail-dashboard-actions')).toHaveClass(
      'grid',
      'gap-3',
      'sm:grid-cols-2',
    );
  });

  it('keeps trail dashboard travel actions working while expanded', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Travel One Day' }));

    expect(useExpeditionStore.getState().currentDay).toBe(2);

    fireEvent.click(screen.getByRole('button', { name: 'Make Camp' }));

    expect(useExpeditionStore.getState().gameStatus).toBe('camp');
  });

  it('calls onSettings from the status bar settings button', () => {
    const onSettings = vi.fn();

    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={onSettings}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(onSettings).toHaveBeenCalledTimes(1);
  });

  it('renders expedition status as passive non-focusable information', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={() => undefined}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    const status = screen.getByLabelText('Expedition status');

    for (const label of ['Day', 'Distance', 'Status', 'Location']) {
      const stat = within(status).getByRole('group', { name: `${label} status` });

      expect(within(status).queryByRole('button', { name: label })).not.toBeInTheDocument();
      expect(stat).not.toHaveAttribute('tabindex');
      stat.focus();
      expect(stat).not.toHaveFocus();
      expect(stat).not.toHaveClass('bg-panel');
      expect(stat).not.toHaveClass('hover:border-highlight');
    }
  });

  it('renders return to menu and omits reset save from the status bar', () => {
    const onReturnToMenu = vi.fn();

    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onNewGame={() => undefined}
        onReturnToMenu={onReturnToMenu}
        onSaveExistsChange={() => undefined}
        onSettings={() => undefined}
      />,
    );

    const header = screen.getByRole('banner');
    const menuButton = within(header).getByRole('button', { name: 'Return to Menu' });
    const settingsButton = within(header).getByRole('button', { name: 'Settings' });
    const saveButton = within(header).getByRole('button', { name: 'Save game' });

    expect(menuButton).toBeInTheDocument();
    expect(within(header).queryByRole('button', { name: /Reset save/i })).not.toBeInTheDocument();
    expect(within(header).queryByText('Save ready.')).not.toBeInTheDocument();
    expect(within(header).queryByText('No save yet.')).not.toBeInTheDocument();
    expect(
      menuButton.compareDocumentPosition(settingsButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      menuButton.compareDocumentPosition(saveButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.click(menuButton);

    expect(onReturnToMenu).toHaveBeenCalledTimes(1);
  });
});
