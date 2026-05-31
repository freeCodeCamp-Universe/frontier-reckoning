import { useEffect, useRef } from 'react';
import {
  audioSystem,
  getAudioSceneForGameStatus,
} from '@game/systems/audioSystem';
import { useSettings } from '@/hooks/useSettings';
import { useExpeditionStore } from '@stores/expeditionStore';
import { getStoredAudioEnabled, playAudioCue } from '@utils/audio';

export function AudioEffects() {
  const currentEvent = useExpeditionStore((state) => state.currentEvent);
  const eventResolved = useExpeditionStore((state) => state.eventResolved);
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const [settings] = useSettings();
  const previousEventId = useRef<string | null>(null);
  const previousGameStatus = useRef(gameStatus);

  useEffect(() => {
    return () => audioSystem.mute();
  }, []);

  useEffect(() => {
    audioSystem.updateSettings({
      soundEnabled: settings.soundEnabled,
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
    });
  }, [settings.soundEnabled, settings.musicVolume, settings.sfxVolume]);

  useEffect(() => {
    audioSystem.requestSceneAudio(
      getAudioSceneForGameStatus(gameStatus, currentEvent?.type),
    );
  }, [currentEvent?.type, gameStatus, settings.soundEnabled]);

  useEffect(() => {
    const handleUserInteraction = () => {
      audioSystem.registerUserInteraction();
      audioSystem.requestSceneAudio(
        getAudioSceneForGameStatus(gameStatus, currentEvent?.type),
      );
    };

    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [currentEvent?.type, gameStatus]);

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
