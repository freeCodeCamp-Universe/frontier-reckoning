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
    expect(screen.getByRole('complementary', { name: 'Caravan status' })).toBeInTheDocument();
    expect(screen.getByText('Trail')).toBeInTheDocument();
    expect(screen.getByText('Uncharted')).toBeInTheDocument();
    expect(screen.getByText('Supplies')).toBeInTheDocument();
    expect(screen.getByText('Carefully packed')).toBeInTheDocument();
    expect(screen.getByText('Morale')).toBeInTheDocument();
    expect(screen.getByText('Holding steady')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Last Lantern')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Manage Supplies' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Survive Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cross Rivers' })).toBeInTheDocument();
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

  it('hides continue until a save is available', () => {
    const props = renderMainMenu(false);

    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();

    expect(props.onContinue).not.toHaveBeenCalled();
  });
});
