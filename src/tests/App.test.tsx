import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@app/App';
import { saveGameToStorage, SAVE_STORAGE_KEY } from '@game/systems/saveSystem';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

const phaserGameModuleLoadMock = vi.hoisted(() => vi.fn());
const phaserGameRenderMock = vi.hoisted(() => vi.fn());

vi.mock('@components/PhaserGame', () => ({
  phaserGameModuleLoadMock: phaserGameModuleLoadMock(),
  PhaserGame: () => {
    phaserGameRenderMock();

    return <div data-testid="phaser-game" />;
  },
}));

function completeSetupPrerequisites(expeditionName = 'Cinder Ridge Crew') {
  fireEvent.change(screen.getByLabelText('Expedition name'), {
    target: { value: expeditionName },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Elias Reed, Scout' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

describe('App', () => {
  beforeEach(() => {
    phaserGameModuleLoadMock.mockClear();
    phaserGameRenderMock.mockClear();
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  it('renders the homepage without the main menu label', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Main Menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Expedition' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();
  });

  it('user can start a custom expedition', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Greenhorn/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(screen.getByText(/Cinder Ridge Crew \/ Greenhorn/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Make Camp' })).toBeEnabled();
    const trailMap = screen.getByRole('region', { name: 'Trail Map' });
    expect(
      within(trailMap).getByRole('heading', { name: 'Trail Map' }),
    ).toBeInTheDocument();
    expect(within(trailMap).getByRole('status')).toHaveTextContent(
      'Loading trail map...',
    );
    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
    expect(phaserGameModuleLoadMock).toHaveBeenCalledTimes(1);
    expect(phaserGameRenderMock).toHaveBeenCalledTimes(1);
  });

  it('renders the active survival dashboard panels', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    const statusBar = screen.getByRole('banner');

    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();
    expect(statusBar).toHaveTextContent('Cinder Ridge Crew');
    expect(statusBar).toHaveTextContent('Day');
    expect(statusBar).toHaveTextContent('1');
    expect(statusBar).toHaveTextContent('Distance');
    expect(statusBar).toHaveTextContent('0 / 2000');
    expect(statusBar).toHaveTextContent('Status');
    expect(statusBar).toHaveTextContent('traveling');
    expect(statusBar).toHaveTextContent('Location');
    expect(statusBar).toHaveTextContent('Open trail');
    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Make Camp' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(
      within(statusBar).getByRole('region', { name: 'Save controls' }),
    ).toBeInTheDocument();
    expect(
      within(statusBar).getByRole('button', { name: 'Save game' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trail Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Trail Map' })).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Trail map distance progress 0%' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Caravan Party' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Game Log' })).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Secondary expedition panels' }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
  });

  it('traps focus inside the return-to-menu confirmation and restores focus on cancel', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(<App />);

    const returnToMenuButton = screen.getByRole('button', { name: 'Return to Menu' });
    returnToMenuButton.focus();
    fireEvent.click(returnToMenuButton);

    const dialog = screen.getByRole('dialog', { name: 'Return to menu confirmation' });
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' });
    const confirmButton = within(dialog).getByRole('button', { name: 'Return to Menu' });

    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(cancelButton).toHaveFocus();

    fireEvent.keyDown(cancelButton, { key: 'Tab', shiftKey: true });
    expect(confirmButton).toHaveFocus();

    fireEvent.keyDown(confirmButton, { key: 'Tab' });
    expect(cancelButton).toHaveFocus();

    fireEvent.click(cancelButton);

    expect(
      screen.queryByRole('dialog', { name: 'Return to menu confirmation' }),
    ).not.toBeInTheDocument();
    expect(returnToMenuButton).toHaveFocus();
  });

  it('keeps right rail panels available in the responsive active game layout', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    const rightRail = screen.getByRole('complementary', {
      name: 'Secondary expedition panels',
    });

    expect(
      within(rightRail).getByRole('heading', { name: 'Caravan Party' }),
    ).toBeInTheDocument();
    expect(
      within(rightRail).getByRole('heading', { name: 'Game Log' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Current situation' })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Resource dashboard' }),
    ).toBeInTheDocument();
  });

  it('does not repeat the large homepage title in the active game header', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites('North Pass Company');
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(
      screen.queryByRole('heading', { name: 'Frontier Reckoning' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'North Pass Company' }),
    ).toBeInTheDocument();
  });

  it('opens settings and saves from the expedition status bar', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save game' }));

    expect(
      within(screen.getByRole('region', { name: 'Save controls' })).getByRole('status'),
    ).toHaveTextContent('Game saved.');
    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
    expect(screen.getByText('Game saved.')).toBeInTheDocument();
  });

  it('opens settings from the main menu and active game screens', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('keeps save controls compact in the status bar instead of the main stack', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    const statusBar = screen.getByRole('banner');
    const saveControls = within(statusBar).getByRole('region', {
      name: 'Save controls',
    });

    expect(saveControls).toBeInTheDocument();
    expect(saveControls).not.toHaveClass('bg-surface');
    expect(saveControls).not.toHaveClass('p-4');
    expect(
      within(statusBar).queryByRole('button', { name: /Reset save/i }),
    ).not.toBeInTheDocument();
    expect(
      within(statusBar).getByRole('button', { name: 'Return to Menu' }),
    ).toBeInTheDocument();
  });

  it('opens and cancels the return to menu confirmation', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    fireEvent.click(screen.getByRole('button', { name: 'Return to Menu' }));

    const dialog = screen.getByRole('dialog', {
      name: 'Return to menu confirmation',
    });

    expect(dialog).toHaveTextContent(
      'The current expedition can be continued later if saves exist.',
    );

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByRole('dialog', { name: 'Return to menu confirmation' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();
  });

  it('closes return to menu confirmation from outside click and Escape', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    fireEvent.click(screen.getByRole('button', { name: 'Return to Menu' }));
    fireEvent.mouseDown(screen.getByTestId('return-to-menu-confirmation-backdrop'));

    expect(
      screen.queryByRole('dialog', { name: 'Return to menu confirmation' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Return to Menu' }));
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.queryByRole('dialog', { name: 'Return to menu confirmation' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();
  });

  it('returns to the main menu and preserves continue from saved data', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    completeSetupPrerequisites('Saved Trail Crew');
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save game' }));

    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Return to Menu' }));

    const dialog = screen.getByRole('dialog', {
      name: 'Return to menu confirmation',
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Return to Menu' }));

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('region', { name: 'Active game layout' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saved Trail Crew' })).toBeInTheDocument();
  });

  it('starts a new game from game over into a fresh expedition setup flow', () => {
    useExpeditionStore.setState({
      ...createStartingGameState({
        expeditionName: 'Doomed Trail Crew',
        difficulty: 'greenhorn',
        partyMemberIds: ['scout', 'doctor', 'hunter', 'mechanic'],
      }),
      gameStatus: 'game_over',
      gameOverReason: 'wagon_destroyed',
    });
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restart' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'New Game' }));

    expect(screen.getByRole('heading', { name: 'Name the caravan' })).toBeInTheDocument();
    expect(screen.getByLabelText('Expedition name')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Game Over' })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();

    fireEvent.change(screen.getByLabelText('Expedition name'), {
      target: { value: 'Fresh Trail Crew' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Choose party members' }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 / 4')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Select Elias Reed, Scout' }),
    ).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Select Elias Reed, Scout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Choose trail difficulty' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Greenhorn/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Trailwise/ })).not.toBeChecked();
    expect(screen.getByDisplayValue('reckoning')).not.toBeChecked();
  });

  it('lazy-loads Phaser only after the active game screen opens', async () => {
    render(<App />);

    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    expect(phaserGameModuleLoadMock).not.toHaveBeenCalled();

    completeSetupPrerequisites();
    fireEvent.click(screen.getByRole('radio', { name: /Trailwise/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(await screen.findByTestId('phaser-game')).toBeInTheDocument();
    expect(phaserGameRenderMock).toHaveBeenCalledTimes(1);
  });

  it('cannot start without selecting required party members', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    fireEvent.change(screen.getByLabelText('Expedition name'), {
      target: { value: 'Validation Crew' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAccessibleDescription(
      'Select exactly 4 party members before continuing.',
    );
  });

  it('exposes important setup controls with accessible names', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(screen.getByLabelText('Expedition name')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Expedition name'), {
      target: { value: 'Accessible Trail Crew' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('button', { name: 'Select Elias Reed, Scout' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('button', { name: 'Select Nell Carter, Child' }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Select Elias Reed, Scout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }));
    expect(
      screen.getByRole('button', { name: 'Select Nell Carter, Child' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('radio', { name: /Greenhorn/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Trailwise/ })).not.toBeChecked();
  });
});
