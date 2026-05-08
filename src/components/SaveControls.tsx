import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import {
  clearSaveFromStorage,
  hasSave,
  loadGameFromStorage,
  saveGameToStorage,
} from '@game/systems/saveSystem';
import { useExpeditionStore } from '@stores/expeditionStore';

export function SaveControls() {
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
    setMessage('Game saved.');
  };

  const handleContinue = () => {
    const result = loadGameFromStorage(window.localStorage);

    if (result.status === 'loaded') {
      useExpeditionStore.setState(result.save.state);
      setMessage('Save loaded.');
      return;
    }

    if (result.status === 'unsupported') {
      setMessage(`Unsupported save version ${result.saveVersion}.`);
      return;
    }

    if (result.status === 'invalid') {
      clearSaveFromStorage(window.localStorage);
      resetGame();
      setSaveExists(false);
      setMessage('Invalid save ignored. Starting fresh.');
      return;
    }

    setMessage('No save found.');
  };

  const handleResetSave = () => {
    clearSaveFromStorage(window.localStorage);
    resetGame();
    setSaveExists(false);
    setMessage('Save reset.');
  };

  return (
    <section className="border border-border bg-surface p-4" aria-label="Save controls">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {saveExists ? <Button onClick={handleContinue}>Continue</Button> : null}
        <Button onClick={handleManualSave} disabled={gameStatus === 'not_started'}>
          Save
        </Button>
        <Button onClick={handleResetSave}>Reset save</Button>
      </div>
      {message ? (
        <p className="mt-3 font-mono text-base text-muted" aria-live="polite">
          {message}
        </p>
      ) : null}
    </section>
  );
}
