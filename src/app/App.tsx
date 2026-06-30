import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
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
import {
  closeModalDialog,
  openModalDialog,
  supportsNativeModalDialog,
  trapFocus,
} from '@utils/dialog';

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

  const handleNewGame = () => {
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
        onNewGame={handleNewGame}
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    if (dialog) {
      openModalDialog(dialog);
    }
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (dialog) {
        closeModalDialog(dialog);
      }
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    trapFocus(event, dialogRef.current);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      open={supportsNativeModalDialog() ? undefined : true}
      aria-label="Return to menu confirmation"
      aria-describedby={descriptionId}
      aria-modal="true"
      className="fixed inset-0 z-[60] m-0 h-auto max-h-none w-auto max-w-none overflow-visible border-0 bg-transparent p-0 text-foreground backdrop:bg-canvas/90"
      data-testid="return-to-menu-confirmation-backdrop"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
      onKeyDown={handleDialogKeyDown}
    >
      <Card
        as="div"
        className="flex min-h-screen items-center justify-center border-0 bg-transparent p-4"
      >
        <Card
          as="div"
          className="w-full max-w-md p-5"
          onMouseDown={(event) => event.stopPropagation()}
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
      </Card>
    </dialog>
  );
}
