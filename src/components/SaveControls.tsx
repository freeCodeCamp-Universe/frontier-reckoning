import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@components/ui/Button';
import {
  clearSaveFromStorage,
  hasSave,
  loadGameFromStorage,
  saveGameToStorage,
} from '@game/systems/saveSystem';
import { useExpeditionStore } from '@stores/expeditionStore';

type SaveControlsProps = {
  onReset?: () => void;
  onSaveExistsChange?: (saveExists: boolean) => void;
  variant?: 'card' | 'compact';
};

export function SaveControls({
  onReset,
  onSaveExistsChange,
  variant = 'card',
}: SaveControlsProps) {
  const [saveExists, setSaveExists] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const resetGame = useExpeditionStore((state) => state.resetGame);

  useEffect(() => {
    setSaveExists(hasSave(window.localStorage));
  }, []);

  const handleManualSave = () => {
    saveGameToStorage(window.localStorage, useExpeditionStore.getState());
    setSaveExists(true);
    onSaveExistsChange?.(true);
    setMessage('Game saved.');
  };

  const handleContinue = () => {
    const result = loadGameFromStorage(window.localStorage);

    if (result.status === 'loaded') {
      useExpeditionStore.setState(result.save.state);
      setMessage('Save loaded.');
      onSaveExistsChange?.(true);
      return;
    }

    if (result.status === 'unsupported') {
      setMessage(result.message ?? `Unsupported save version ${result.saveVersion}.`);
      return;
    }

    if (result.status === 'invalid') {
      clearSaveFromStorage(window.localStorage);
      resetGame();
      setSaveExists(false);
      onSaveExistsChange?.(false);
      setMessage(result.message ?? 'Invalid save ignored. Starting fresh.');
      return;
    }

    setMessage('No save found.');
  };

  const handleResetSave = () => {
    clearSaveFromStorage(window.localStorage);
    resetGame();
    setSaveExists(false);
    onSaveExistsChange?.(false);
    setMessage('Save reset.');
    onReset?.();
  };

  if (variant === 'compact') {
    return (
      <section
        className="flex flex-wrap items-center gap-2 font-mono text-sm text-muted"
        aria-label="Save controls"
      >
        <Button
          aria-label="Save game"
          className="min-h-10 px-3 py-2"
          onClick={handleManualSave}
          disabled={gameStatus === 'not_started'}
          disabledReason="Save is available after starting an expedition."
          size="sm"
          variant="secondary"
        >
          <Save aria-hidden="true" className="size-4" />
          Save
        </Button>
        <span role="status" aria-atomic="true" className="text-muted">
          {message}
        </span>
      </section>
    );
  }

  return (
    <section className="border border-border bg-surface p-4" aria-label="Save controls">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {saveExists ? <Button onClick={handleContinue}>Continue</Button> : null}
        <Button
          onClick={handleManualSave}
          disabled={gameStatus === 'not_started'}
          disabledReason="Save is available after starting an expedition."
        >
          Save
        </Button>
        <Button onClick={handleResetSave}>Reset save</Button>
      </div>
      <div role="status" aria-atomic="true">
        {message ? (
          <p className="mt-3 font-mono text-base text-muted">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
