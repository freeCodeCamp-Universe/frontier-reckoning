import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NewExpeditionSetup } from '@components/NewExpeditionSetup';

function renderSetup() {
  const props = {
    onBack: vi.fn(),
    onStart: vi.fn(),
  };

  render(<NewExpeditionSetup {...props} />);

  return props;
}

function continueFromName(name = 'Cinder Ridge Crew') {
  fireEvent.change(screen.getByLabelText('Expedition name'), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

function selectRequiredParty() {
  fireEvent.click(screen.getByRole('button', { name: 'Select Elias Reed, Scout' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }));
}

describe('NewExpeditionSetup', () => {
  it('starts on the expedition name screen', () => {
    renderSetup();

    expect(screen.getByRole('heading', { name: 'Name the caravan' })).toBeInTheDocument();
    expect(screen.getByLabelText('Expedition name')).toHaveValue('');
    expect(screen.queryByRole('list', { name: 'Expedition setup steps' })).not.toBeInTheDocument();
    expect(screen.queryByText('Party')).not.toBeInTheDocument();
    expect(screen.queryByText('Difficulty')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Choose party members' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start Expedition' })).not.toBeInTheDocument();
  });

  it('autofocuses the expedition name input', () => {
    renderSetup();

    expect(screen.getByLabelText('Expedition name')).toHaveFocus();
  });

  it('advances to party selection when Enter is pressed on a valid expedition name', () => {
    renderSetup();

    const nameInput = screen.getByLabelText('Expedition name');
    fireEvent.change(nameInput, { target: { value: 'Cinder Ridge Crew' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(screen.getByRole('heading', { name: 'Choose party members' })).toBeInTheDocument();
  });

  it('does not advance when Enter is pressed on an empty expedition name', () => {
    renderSetup();

    fireEvent.keyDown(screen.getByLabelText('Expedition name'), { key: 'Enter' });

    expect(screen.getByRole('heading', { name: 'Name the caravan' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Choose party members' })).not.toBeInTheDocument();
  });

  it('goes back to the main menu from the name screen', () => {
    const props = renderSetup();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it('disables continue when the expedition name is empty', () => {
    renderSetup();

    fireEvent.change(screen.getByLabelText('Expedition name'), {
      target: { value: '' },
    });

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAccessibleDescription(
      'Enter an expedition name before continuing.',
    );
  });

  it('starts the party screen with zero selected members', () => {
    renderSetup();

    continueFromName();

    expect(screen.getByRole('heading', { name: 'Choose party members' })).toBeInTheDocument();
    expect(screen.getByText('0 / 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Elias Reed, Scout' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('cannot continue from the party screen with no party selected', () => {
    renderSetup();

    continueFromName();

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAccessibleDescription(
      'Select exactly 4 party members before continuing.',
    );
  });

  it('supports keyboard selection and arrow navigation for party members', () => {
    renderSetup();

    continueFromName();

    const elias = screen.getByRole('button', { name: 'Select Elias Reed, Scout' });
    elias.focus();
    fireEvent.keyDown(elias, { key: 'Enter' });

    expect(screen.getByRole('button', { name: 'Remove Elias Reed, Scout' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'Remove Elias Reed, Scout' }), {
      key: 'ArrowDown',
    });

    expect(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }), {
      key: ' ',
    });

    expect(screen.getByRole('button', { name: 'Remove Mara Bell, Doctor' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('preserves selected party members after going back and forward', () => {
    renderSetup();

    continueFromName();
    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('4 / 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Elias Reed, Scout' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Expedition name')).toHaveValue('Cinder Ridge Crew');

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('button', { name: 'Remove Elias Reed, Scout' })).toBeInTheDocument();
  });

  it('renders the difficulty screen after party selection', () => {
    renderSetup();

    continueFromName();
    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('heading', { name: 'Choose trail difficulty' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Greenhorn/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Trailwise/ })).toBeInTheDocument();
    expect(screen.getByDisplayValue('reckoning')).toBeInTheDocument();
  });

  it('supports keyboard selection and arrow navigation for difficulty', () => {
    renderSetup();

    continueFromName();
    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    const greenhorn = screen.getByRole('radio', { name: /Greenhorn/ });
    greenhorn.focus();
    fireEvent.keyDown(greenhorn, { key: 'Enter' });

    expect(greenhorn).toBeChecked();

    fireEvent.keyDown(greenhorn, { key: 'ArrowRight' });

    const trailwise = screen.getByRole('radio', { name: /Trailwise/ });
    expect(trailwise).toHaveFocus();
    expect(trailwise).toBeChecked();
  });

  it('back buttons navigate to previous setup screens', () => {
    renderSetup();

    continueFromName();
    expect(screen.getByRole('heading', { name: 'Choose party members' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Name the caravan' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('heading', { name: 'Choose party members' })).toBeInTheDocument();
  });

  it('shows start expedition only on the difficulty screen', () => {
    renderSetup();

    expect(screen.queryByRole('button', { name: 'Start Expedition' })).not.toBeInTheDocument();

    continueFromName();
    expect(screen.queryByRole('button', { name: 'Start Expedition' })).not.toBeInTheDocument();

    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('button', { name: 'Start Expedition' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Expedition' })).toBeDisabled();
  });

  it('starts expedition with name, selected members, and difficulty', () => {
    const props = renderSetup();

    continueFromName('Cinder Ridge Crew');
    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('radio', { name: /Greenhorn/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Expedition' }));

    expect(props.onStart).toHaveBeenCalledWith({
      expeditionName: 'Cinder Ridge Crew',
      difficulty: 'greenhorn',
      partyMemberIds: ['scout', 'doctor', 'hunter', 'mechanic'],
    });
  });

  it('starts expedition when Enter is pressed on the Start Expedition button', () => {
    const props = renderSetup();

    continueFromName('Cinder Ridge Crew');
    selectRequiredParty();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.keyDown(screen.getByRole('radio', { name: /Greenhorn/ }), { key: 'Enter' });

    const startButton = screen.getByRole('button', { name: 'Start Expedition' });
    startButton.focus();
    fireEvent.keyDown(startButton, { key: 'Enter' });

    expect(props.onStart).toHaveBeenCalledWith({
      expeditionName: 'Cinder Ridge Crew',
      difficulty: 'greenhorn',
      partyMemberIds: ['scout', 'doctor', 'hunter', 'mechanic'],
    });
  });

  it('supports a keyboard-only setup flow', () => {
    const props = renderSetup();

    const nameInput = screen.getByLabelText('Expedition name');
    fireEvent.change(nameInput, { target: { value: 'Keyboard Trail' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    const elias = screen.getByRole('button', { name: 'Select Elias Reed, Scout' });
    elias.focus();
    fireEvent.keyDown(elias, { key: ' ' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Remove Elias Reed, Scout' }), {
      key: 'ArrowDown',
    });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Select Mara Bell, Doctor' }), {
      key: ' ',
    });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Remove Mara Bell, Doctor' }), {
      key: 'ArrowDown',
    });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Select Jonah Vale, Hunter' }), {
      key: ' ',
    });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Remove Jonah Vale, Hunter' }), {
      key: 'ArrowDown',
    });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Select Ada Flint, Mechanic' }), {
      key: ' ',
    });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    continueButton.focus();
    fireEvent.keyDown(continueButton, { key: 'Enter' });

    const greenhorn = screen.getByRole('radio', { name: /Greenhorn/ });
    greenhorn.focus();
    fireEvent.keyDown(greenhorn, { key: ' ' });

    const startButton = screen.getByRole('button', { name: 'Start Expedition' });
    startButton.focus();
    fireEvent.keyDown(startButton, { key: 'Enter' });

    expect(props.onStart).toHaveBeenCalledWith({
      expeditionName: 'Keyboard Trail',
      difficulty: 'greenhorn',
      partyMemberIds: ['scout', 'doctor', 'hunter', 'mechanic'],
    });
  });
});
