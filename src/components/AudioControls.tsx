import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import {
  getStoredAmbienceEnabled,
  getStoredAudioEnabled,
  playAudioCue,
  setStoredAmbienceEnabled,
  setStoredAudioEnabled,
  startAmbience,
  stopAmbience,
} from '@utils/audio';

export function AudioControls() {
  const [audioEnabled, setAudioEnabled] = useState(() =>
    typeof window === 'undefined' ? false : getStoredAudioEnabled(window.localStorage),
  );
  const [ambienceEnabled, setAmbienceEnabled] = useState(() =>
    typeof window === 'undefined' ? false : getStoredAmbienceEnabled(window.localStorage),
  );

  useEffect(() => {
    if (audioEnabled && ambienceEnabled) {
      startAmbience(true);
      return;
    }

    stopAmbience();
  }, [audioEnabled, ambienceEnabled]);

  const toggleAudio = () => {
    const nextAudioEnabled = !audioEnabled;

    setAudioEnabled(nextAudioEnabled);
    setStoredAudioEnabled(window.localStorage, nextAudioEnabled);

    if (!nextAudioEnabled) {
      stopAmbience();
    } else {
      playAudioCue('button', true);
    }
  };

  const toggleAmbience = () => {
    const nextAmbienceEnabled = !ambienceEnabled;

    setAmbienceEnabled(nextAmbienceEnabled);
    setStoredAmbienceEnabled(window.localStorage, nextAmbienceEnabled);

    if (audioEnabled && nextAmbienceEnabled) {
      startAmbience(true);
    } else {
      stopAmbience();
    }
  };

  return (
    <section className="border border-border bg-surface p-4" aria-label="Audio controls">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={toggleAudio}
          aria-pressed={audioEnabled}
          aria-label={audioEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        >
          Sound effects {audioEnabled ? 'on' : 'off'}
        </Button>
        <Button
          onClick={toggleAmbience}
          aria-pressed={ambienceEnabled}
          disabled={!audioEnabled}
          disabledReason="Enable sound effects before turning on ambience."
          aria-label={ambienceEnabled ? 'Disable background ambience' : 'Enable background ambience'}
        >
          Ambience {ambienceEnabled ? 'on' : 'off'}
        </Button>
      </div>
    </section>
  );
}
