import { useState } from 'react';
import { CampScreen } from '@components/CampScreen';
import { EventCard } from '@components/EventCard';
import { EndingScreen } from '@components/EndingScreen';
import { PhaserGame } from '@components/PhaserGame';
import { GameLogPanel } from '@components/GameLogPanel';
import { MainMenu } from '@components/MainMenu';
import { NewExpeditionSetup } from '@components/NewExpeditionSetup';
import { PartyPanel } from '@components/PartyPanel';
import { ResourceDashboard } from '@components/ResourceDashboard';
import { RiverEventScreen } from '@components/RiverEventScreen';
import { SaveControls } from '@components/SaveControls';
import { TownScreen } from '@components/TownScreen';
import { Button } from '@components/ui/Button';
import { hasSave, loadGameFromStorage } from '@game/systems/saveSystem';
import { useExpeditionStore, type StartExpeditionOptions } from '@stores/expeditionStore';

type AppScreen = 'main_menu' | 'setup' | 'active_game';

export function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>('main_menu');
  const [saveAvailable, setSaveAvailable] = useState(() =>
    typeof window === 'undefined' ? false : hasSave(window.localStorage),
  );
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const startGame = useExpeditionStore((state) => state.startGame);
  const advanceDay = useExpeditionStore((state) => state.advanceDay);
  const enterCamp = useExpeditionStore((state) => state.enterCamp);

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

  if (gameStatus === 'not_started' && appScreen !== 'setup') {
    return (
      <main className="min-h-screen bg-canvas px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <MainMenu
          canContinue={saveAvailable}
          onContinue={handleContinue}
          onNewExpedition={() => setAppScreen('setup')}
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <header className="border border-border bg-surface p-5">
            <p className="font-mono text-base text-highlight">frontier command desk</p>
            <h1 className="mt-2 text-4xl font-bold tracking-normal sm:text-5xl">
              Frontier Reckoning
            </h1>
            <p className="mt-3 max-w-3xl text-muted">
              Guide the caravan through towns, rivers, camp decisions, and hard trail
              weather.
            </p>
          </header>

          <div className="border border-border bg-surface p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={advanceDay}
                  disabled={gameStatus !== 'traveling'}
                  disabledReason="Travel is available only while the expedition is traveling."
                  className="sm:min-w-44"
                >
                  Travel One Day
                </Button>
                <Button
                  onClick={enterCamp}
                  disabled={gameStatus !== 'traveling'}
                  disabledReason="Camp can be made only while the expedition is traveling."
                  className="sm:min-w-36"
                >
                  Make Camp
                </Button>
              </div>
              <p className="font-mono text-base text-muted" aria-live="polite">
                {gameStatus === 'not_started'
                  ? 'Awaiting launch command'
                  : gameStatus === 'victory'
                    ? 'Victory screen'
                    : gameStatus === 'game_over'
                      ? 'Game over screen'
                      : 'Active game'}
              </p>
            </div>
          </div>

          <SaveControls />

          <EndingScreen />

          <ResourceDashboard />

          <CampScreen />

          <RiverEventScreen />

          <TownScreen />

          <PartyPanel />

          <PhaserGame />
        </div>
        <aside className="flex flex-col gap-6">
          <GameLogPanel />
        </aside>
      </section>
      <EventCard />
    </main>
  );
}
