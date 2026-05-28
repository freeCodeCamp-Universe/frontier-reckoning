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
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
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

  it('places the compact trail dashboard above the trail map', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(
      <ActiveGameLayout
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
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
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
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
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
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
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
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
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
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
        onRestart={() => undefined}
        onSaveExistsChange={() => undefined}
        onSaveReset={() => undefined}
        onSettings={onSettings}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(onSettings).toHaveBeenCalledTimes(1);
  });
});
