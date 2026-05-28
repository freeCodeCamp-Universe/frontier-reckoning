import { useEffect, useId, useRef, useState } from 'react';
import { ActiveGameLayout } from '@components/ActiveGameLayout';
import { AudioEffects } from '@components/AudioEffects';
import { EventCard } from '@components/EventCard';
import { MainMenu } from '@components/MainMenu';
import { NewExpeditionSetup } from '@components/NewExpeditionSetup';
import { SettingsModal } from '@components/SettingsModal';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import {
  clearSaveFromStorage,
  hasSave,
  loadGameFromStorage,
} from '@game/systems/saveSystem';
import { useExpeditionStore, type StartExpeditionOptions } from '@stores/expeditionStore';

type AppScreen = 'main_menu' | 'setup' | 'active_game';

export function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>(() =>
    useExpeditionStore.getState().gameStatus === 'not_started'
      ? 'main_menu'
      : 'active_game',
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [returnToMenuOpen, setReturnToMenuOpen] = useState(false);
  const [saveAvailable, setSaveAvailable] = useState(() =>
    typeof window === 'undefined' ? false : hasSave(window.localStorage),
  );
  const startGame = useExpeditionStore((state) => state.startGame);
  const resetGame = useExpeditionStore((state) => state.resetGame);

  const handleStart = (options: StartExpeditionOptions) => {
    startGame(options);
    setAppScreen('active_game');
    setSaveAvailable(true);
  };

  const handleContinue = () => {
    const result = loadGameFromStorage(window.localStorage);

    if (result.status === 'loaded') {
      useExpeditionStore.setState(result.save.state);
      setAppScreen('active_game');
      setSaveAvailable(true);
    }
  };

  const handleSaveReset = () => {
    setSaveAvailable(false);
    setAppScreen('main_menu');
  };

  const handleRestart = () => {
    resetGame();
    clearSaveFromStorage(window.localStorage);
    setSaveAvailable(false);
    setAppScreen('setup');
  };

  const handleReturnToMenu = () => {
    setSaveAvailable(hasSave(window.localStorage));
    setReturnToMenuOpen(false);
    setAppScreen('main_menu');
  };

  if (appScreen === 'main_menu') {
    return (
      <main className="min-h-screen bg-canvas px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <MainMenu
          canContinue={saveAvailable}
          onContinue={handleContinue}
          onNewExpedition={() => setAppScreen('setup')}
          onSettings={() => setSettingsOpen(true)}
        />
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSaveReset={handleSaveReset}
        />
      </main>
    );
  }

  if (appScreen === 'setup') {
    return (
      <main className="min-h-screen bg-canvas px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <NewExpeditionSetup
          onBack={() => setAppScreen('main_menu')}
          onStart={handleStart}
        />
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSaveReset={handleSaveReset}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <ActiveGameLayout
        onRestart={handleRestart}
        onReturnToMenu={() => setReturnToMenuOpen(true)}
        onSaveExistsChange={setSaveAvailable}
        onSettings={() => setSettingsOpen(true)}
      />
      <AudioEffects />
      <EventCard />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaveReset={handleSaveReset}
      />
      <ReturnToMenuConfirmationModal
        isOpen={returnToMenuOpen}
        onCancel={() => setReturnToMenuOpen(false)}
        onConfirm={handleReturnToMenu}
      />
    </main>
  );
}

function ReturnToMenuConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/90 px-4 py-6"
      data-testid="return-to-menu-confirmation-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <Card
        as="div"
        role="dialog"
        aria-modal="true"
        aria-label="Return to menu confirmation"
        aria-describedby={descriptionId}
        className="w-full max-w-md p-5"
      >
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl font-bold">Return to Menu?</h2>
          <p id={descriptionId} className="mt-2 text-base text-muted">
            The current expedition can be continued later if saves exist.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button ref={cancelButtonRef} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="ghost">
            Return to Menu
          </Button>
        </div>
      </Card>
    </div>
  );
}
