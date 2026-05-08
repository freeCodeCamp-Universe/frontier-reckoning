import { useEffect, useRef } from 'react';
import { useExpeditionStore } from '@stores/expeditionStore';
import { getStoredAudioEnabled, playAudioCue } from '@utils/audio';

export function AudioEffects() {
  const currentEvent = useExpeditionStore((state) => state.currentEvent);
  const eventResolved = useExpeditionStore((state) => state.eventResolved);
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const previousEventId = useRef<string | null>(null);
  const previousGameStatus = useRef(gameStatus);

  useEffect(() => {
    if (
      currentEvent &&
      !eventResolved &&
      previousEventId.current !== currentEvent.id
    ) {
      playAudioCue('event', getStoredAudioEnabled(window.localStorage));
      previousEventId.current = currentEvent.id;
    }

    if (!currentEvent) {
      previousEventId.current = null;
    }
  }, [currentEvent, eventResolved]);

  useEffect(() => {
    if (previousGameStatus.current !== gameStatus) {
      if (gameStatus === 'victory') {
        playAudioCue('victory', getStoredAudioEnabled(window.localStorage));
      } else if (gameStatus === 'game_over') {
        playAudioCue('game_over', getStoredAudioEnabled(window.localStorage));
      }
    }

    previousGameStatus.current = gameStatus;
  }, [gameStatus]);

  return null;
}
