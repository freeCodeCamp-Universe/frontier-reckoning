import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card, CardEyebrow } from '@components/ui/Card';
import { resetSaveData, type TextSpeed } from '@game/systems/settingsSystem';
import { useExpeditionStore } from '@stores/expeditionStore';
import { stopAmbience } from '@utils/audio';
import { useSettings } from '@/hooks/useSettings';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveReset?: () => void;
};

const textSpeedOptions: Array<{ value: TextSpeed; label: string }> = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

export function SettingsModal({ isOpen, onClose, onSaveReset }: SettingsModalProps) {
  const [settings, updateSettings] = useSettings();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const resetGame = useExpeditionStore((state) => state.resetGame);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled'));

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });

    if (!enabled) {
      stopAmbience();
    }
  };

  const handleResetSave = () => {
    resetSaveData(window.localStorage);
    resetGame();
    onSaveReset?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 px-4 py-6"
      role="presentation"
    >
      <Card
        as="div"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleDialogKeyDown}
        className="max-h-full w-full max-w-3xl overflow-y-auto p-5"
      >
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardEyebrow>settings</CardEyebrow>
            <h2 id={titleId} className="mt-1 text-3xl font-bold">
              Frontier Settings
            </h2>
            <p id={descriptionId} className="mt-2 text-base text-muted">
              Adjust audio, motion, save, and display preferences.
            </p>
          </div>
          <Button ref={closeButtonRef} onClick={onClose} aria-label="Close settings">
            Close
          </Button>
        </div>

        <div className="mt-5 grid gap-5">
          <fieldset className="border border-border bg-panel p-4">
            <legend className="px-1 font-mono text-base text-muted">Audio</legend>
            <label className="flex items-center justify-between gap-4">
              <span className="font-bold">Sound</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(event) => handleSoundToggle(event.target.checked)}
                aria-label="Sound on or off"
                className="size-5"
              />
            </label>
            <VolumeControl
              id="music-volume"
              label="Music volume"
              value={settings.musicVolume}
              disabled={!settings.soundEnabled}
              onChange={(musicVolume) => updateSettings({ musicVolume })}
            />
            <VolumeControl
              id="sfx-volume"
              label="SFX volume"
              value={settings.sfxVolume}
              disabled={!settings.soundEnabled}
              onChange={(sfxVolume) => updateSettings({ sfxVolume })}
            />
          </fieldset>

          <fieldset className="border border-border bg-panel p-4">
            <legend className="px-1 font-mono text-base text-muted">Gameplay</legend>
            <label className="flex items-center justify-between gap-4">
              <span className="font-bold">Reduced motion</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(event) =>
                  updateSettings({ reducedMotion: event.target.checked })
                }
                aria-label="Reduced motion"
                className="size-5"
              />
            </label>

            <label htmlFor="text-speed" className="mt-4 block font-bold">
              Text speed
            </label>
            <select
              id="text-speed"
              value={settings.textSpeed}
              onChange={(event) =>
                updateSettings({ textSpeed: event.target.value as TextSpeed })
              }
              className="mt-2 w-full border border-border bg-canvas px-3 py-3 text-foreground outline-none focus:border-highlight"
            >
              {textSpeedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="mt-4 flex items-center justify-between gap-4">
              <span className="font-bold">Autosave</span>
              <input
                type="checkbox"
                checked={settings.autosaveEnabled}
                onChange={(event) =>
                  updateSettings({ autosaveEnabled: event.target.checked })
                }
                aria-label="Autosave on or off"
                className="size-5"
              />
            </label>

            <label className="mt-4 flex items-center justify-between gap-4">
              <span className="font-bold">Difficulty display</span>
              <input
                type="checkbox"
                checked={settings.difficultyDisplay}
                onChange={(event) =>
                  updateSettings({ difficultyDisplay: event.target.checked })
                }
                aria-label="Difficulty display"
                className="size-5"
              />
            </label>
          </fieldset>

          <Card as="section" variant="danger" aria-label="Save data">
            <h3 className="text-2xl font-bold">Save Data</h3>
            <p className="mt-2 text-base text-muted">
              Clear the saved expedition from this browser.
            </p>
            <Badge variant="danger" className="mt-4">
              Permanent
            </Badge>
            <Button onClick={handleResetSave} className="mt-4" variant="danger">
              Reset save data
            </Button>
          </Card>
        </div>
      </Card>
    </div>
  );
}

function VolumeControl({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="font-bold">
          {label}
        </label>
        <span className="font-mono text-base text-muted">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full"
      />
    </div>
  );
}
