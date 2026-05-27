import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusBadge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card, CardEyebrow } from '@components/ui/Card';
import { CharacterPortrait } from '@components/ui/Portrait';
import { ResourceIcon } from '@components/ui/ResourceIcon';

describe('design system UI components', () => {
  it('renders core UI components', () => {
    render(
      <Card aria-label="System card">
        <CardEyebrow>system</CardEyebrow>
        <CharacterPortrait character={{ name: 'Elias Reed', role: 'Scout' }} />
        <ResourceIcon resource="food" />
        <StatusBadge status="healthy" />
      </Card>,
    );

    expect(screen.getByLabelText('System card')).toBeInTheDocument();
    expect(screen.getByText('system')).toBeInTheDocument();
    expect(screen.getByText('ER')).toBeInTheDocument();
    expect(screen.getByLabelText('Healthy')).toBeInTheDocument();
  });

  it('buttons expose accessible names across variants', () => {
    const onClick = vi.fn();

    render(
      <>
        <Button onClick={onClick}>Start trail</Button>
        <Button onClick={onClick} variant="secondary">
          Open settings
        </Button>
        <Button onClick={onClick} variant="danger">
          Reset save data
        </Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Start trail' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reset save data' })).toBeEnabled();
  });

  it('status badges render correct labels', () => {
    render(
      <>
        <StatusBadge status="sick" />
        <StatusBadge status="injured" />
        <StatusBadge status="dead" />
        <StatusBadge status="hungry" />
        <StatusBadge status="repaired" />
        <StatusBadge status="rested" />
      </>,
    );

    expect(screen.getByLabelText('Sick')).toBeInTheDocument();
    expect(screen.getByLabelText('Injured')).toBeInTheDocument();
    expect(screen.getByLabelText('Dead')).toBeInTheDocument();
    expect(screen.getByLabelText('Hungry')).toBeInTheDocument();
    expect(screen.getByLabelText('Repaired')).toBeInTheDocument();
    expect(screen.getByLabelText('Rested')).toBeInTheDocument();
  });
});
