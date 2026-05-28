import { useState } from 'react';
import { ActiveGameLayout } from '@components/ActiveGameLayout';
import { AudioEffects } from '@components/AudioEffects';
import { EventCard } from '@components/EventCard';
import { MainMenu } from '@components/MainMenu';
import { NewExpeditionSetup } from '@components/NewExpeditionSetup';
import { SettingsModal } from '@components/SettingsModal';
import { hasSave, loadGameFromStorage } from '@game/systems/saveSystem';
import { useExpeditionStore, type StartExpeditionOptions } from '@stores/expeditionStore';

type AppScreen = 'main_menu' | 'setup' | 'active_game';

export function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>('main_menu');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveAvailable, setSaveAvailable] = useState(() =>
    typeof window === 'undefined' ? false : hasSave(window.localStorage),
  );
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const startGame = useExpeditionStore((state) => state.startGame);

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

  if (gameStatus === 'not_started' && appScreen !== 'setup') {
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

  if (gameStatus === 'not_started' && appScreen === 'setup') {
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
        onSaveExistsChange={setSaveAvailable}
        onSaveReset={handleSaveReset}
        onSettings={() => setSettingsOpen(true)}
      />
      <AudioEffects />
      <EventCard />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaveReset={handleSaveReset}
      />
    </main>
  );
}
