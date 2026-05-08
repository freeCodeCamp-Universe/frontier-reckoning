import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PartyPanel } from '@components/PartyPanel';
import { useExpeditionStore } from '@stores/expeditionStore';

describe('PartyPanel', () => {
  beforeEach(() => {
    useExpeditionStore.getState().resetGame();
  });

  it('renders characters in the party', () => {
    useExpeditionStore.getState().startGame();
    render(<PartyPanel />);

    expect(screen.getByRole('heading', { name: 'Caravan Party' })).toBeInTheDocument();
    expect(screen.getByText('Elias Reed')).toBeInTheDocument();
    expect(screen.getByText('Mara Bell')).toBeInTheDocument();
    expect(screen.getByText('Jonah Vale')).toBeInTheDocument();
    expect(screen.getByText('Ada Flint')).toBeInTheDocument();
  });
});
