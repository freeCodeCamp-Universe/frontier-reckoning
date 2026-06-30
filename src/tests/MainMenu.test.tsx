import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MainMenu } from '@components/MainMenu';

function renderMainMenu(canContinue = true) {
  const props = {
    canContinue,
    onContinue: vi.fn(),
    onNewExpedition: vi.fn(),
    onSettings: vi.fn(),
  };

  render(<MainMenu {...props} />);

  return props;
}

describe('MainMenu', () => {
  it('renders the landing screen content', () => {
    renderMainMenu();

    expect(
      screen.getByRole('heading', { name: 'Frontier Reckoning' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Manage Supplies' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Survive Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cross Rivers' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('does not render decorative caravan status content', () => {
    renderMainMenu();

    expect(
      screen.queryByRole('complementary', { name: 'Caravan status' }),
    ).not.toBeInTheDocument();

    for (const text of [
      'Trail',
      'Uncharted',
      'Supplies',
      'Carefully packed',
      'Morale',
      'Holding steady',
      'Destination',
      'Last Lantern',
    ]) {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
  });

  it('calls the correct handlers from homepage actions', () => {
    const props = renderMainMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(props.onNewExpedition).toHaveBeenCalledTimes(1);
    expect(props.onContinue).toHaveBeenCalledTimes(1);
    expect(props.onSettings).toHaveBeenCalledTimes(1);
  });

  it('activates homepage actions with Enter from keyboard focus', () => {
    const props = renderMainMenu();

    const startButton = screen.getByRole('button', { name: 'Start Expedition' });
    startButton.focus();
    fireEvent.keyDown(startButton, { key: 'Enter' });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    continueButton.focus();
    fireEvent.keyDown(continueButton, { key: 'Enter' });

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    settingsButton.focus();
    fireEvent.keyDown(settingsButton, { key: 'Enter' });

    expect(props.onNewExpedition).toHaveBeenCalledTimes(1);
    expect(props.onContinue).toHaveBeenCalledTimes(1);
    expect(props.onSettings).toHaveBeenCalledTimes(1);
  });

  it('keeps homepage actions reachable by keyboard focus', () => {
    renderMainMenu();

    for (const buttonName of ['Start Expedition', 'Continue', 'Settings']) {
      const button = screen.getByRole('button', { name: buttonName });
      button.focus();
      expect(button).toHaveFocus();
    }
  });

  it('hides continue until a save is available', () => {
    const props = renderMainMenu(false);

    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();

    expect(props.onContinue).not.toHaveBeenCalled();
  });
});
