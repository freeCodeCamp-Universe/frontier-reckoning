import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ResourceDashboard } from '@components/ResourceDashboard';
import { createStartingGameState, useExpeditionStore } from '@stores/expeditionStore';

describe('ResourceDashboard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useExpeditionStore.getState().resetGame();
  });

  it('renders all resource values in compact stat cards', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      food: 180,
      medicine: 6,
      ammo: 34,
      wagonParts: 4,
      money: 125,
      morale: 78,
      health: 88,
      wagonCondition: 92,
    });

    render(<ResourceDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand resource summary' }));

    expectResourceValue('Food', '180');
    expectResourceValue('Medicine', '6');
    expectResourceValue('Ammo', '34');
    expectResourceValue('Wagon Parts', '4');
    expectResourceValue('Money', '125');
    expectResourceValue('Morale', '78%');
    expectResourceValue('Health', '88%');
    expectResourceValue('Wagon Condition', '92%');
  });

  it('formats resource precision artifacts without changing stored values', () => {
    const artifactFood = 104.80000000000008;
    const artifactMorale = 99.99999999997;

    useExpeditionStore.setState({
      ...createStartingGameState(),
      food: artifactFood,
      medicine: 3.2,
      ammo: 43.2,
      wagonParts: 1.8,
      money: 99.99999999997,
      morale: artifactMorale,
      health: 67.6,
      wagonCondition: 88.4,
    });

    render(<ResourceDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand resource summary' }));

    expectResourceValue('Food', '105');
    expectResourceValue('Medicine', '3');
    expectResourceValue('Ammo', '43');
    expectResourceValue('Wagon Parts', '2');
    expectResourceValue('Money', '100');
    expectResourceValue('Morale', '100%');
    expectResourceValue('Health', '68%');
    expectResourceValue('Wagon Condition', '88%');
    expect(document.body).not.toHaveTextContent('104.80000000000008');
    expect(document.body).not.toHaveTextContent('99.99999999997');
    expect(useExpeditionStore.getState().food).toBe(artifactFood);
    expect(useExpeditionStore.getState().morale).toBe(artifactMorale);
  });

  it('renders a text warning for low resources', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      food: 60,
      medicine: 6,
      ammo: 34,
      wagonParts: 4,
      money: 125,
      morale: 78,
      health: 88,
      wagonCondition: 92,
    });

    render(<ResourceDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand resource summary' }));

    const food = screen.getByRole('group', { name: 'Food resource' });

    expect(within(food).getByLabelText('Food warning')).toHaveTextContent('Low supply');
  });

  it('remains accessible as a named dashboard with resource groups', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(<ResourceDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand resource summary' }));

    expect(
      screen.getByRole('region', { name: 'Resource dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /Trail progress/ })).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(8);
  });

  it('is collapsed by default with a collapsible full resource grid', () => {
    useExpeditionStore.setState(createStartingGameState());

    render(<ResourceDashboard />);

    expect(screen.getByRole('heading', { name: 'Resource Summary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand resource summary' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByTestId('resource-summary-grid')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand resource summary' }));

    expect(screen.getByTestId('resource-summary-grid')).toHaveClass(
      'grid',
      'grid-cols-2',
      'md:grid-cols-4',
    );
    expect(screen.getAllByRole('group')).toHaveLength(8);
  });

  it('keeps resource cards hidden while collapsed and expands the full grid', () => {
    useExpeditionStore.setState({
      ...createStartingGameState(),
      food: 180,
      medicine: 6,
      ammo: 34,
      morale: 78,
    });

    render(<ResourceDashboard />);

    expect(screen.getByRole('button', { name: 'Expand resource summary' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByTestId('resource-summary-grid')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('group')).toHaveLength(0);
    expect(screen.queryByLabelText('Food summary')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Medicine summary')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Ammo summary')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Morale summary')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand resource summary' }));

    expect(screen.getByRole('button', { name: 'Collapse resource summary' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getAllByRole('group')).toHaveLength(8);
  });
});

function expectResourceValue(label: string, value: string) {
  const resource = screen.getByRole('group', { name: `${label} resource` });

  expect(within(resource).getByText(label)).toBeInTheDocument();
  expect(within(resource).getByText(value)).toBeInTheDocument();
}
