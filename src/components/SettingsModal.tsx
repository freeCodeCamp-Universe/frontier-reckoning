import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, Volume2, VolumeX, X } from 'lucide-react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import {
  audioSystem,
  getAudioSceneForGameStatus,
} from '@game/systems/audioSystem';
import { Card } from '@components/ui/Card';
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
  { value: 'instant', label: 'Instant' },
];

export function SettingsModal({ isOpen, onClose, onSaveReset }: SettingsModalProps) {
  const [settings, updateSettings] = useSettings();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const resetGame = useExpeditionStore((state) => state.resetGame);
  const gameStatus = useExpeditionStore((state) => state.gameStatus);
  const currentEvent = useExpeditionStore((state) => state.currentEvent);

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
    audioSystem.registerUserInteraction();
    updateSettings({ soundEnabled: enabled });

    if (!enabled) {
      stopAmbience();
    } else {
      audioSystem.updateSettings({
        soundEnabled: true,
        musicVolume: settings.musicVolume,
        sfxVolume: settings.sfxVolume,
      });
      audioSystem.requestSceneAudio(
        getAudioSceneForGameStatus(gameStatus, currentEvent?.type),
      );
    }
  };

  const handleResetSave = () => {
    resetSaveData(window.localStorage);
    resetGame();
    onSaveReset?.();
    setResetConfirmOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 px-4 py-6"
      data-testid="settings-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card
        as="div"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        aria-describedby={descriptionId}
        onKeyDown={handleDialogKeyDown}
        className="max-h-full w-full max-w-3xl overflow-y-auto p-5"
      >
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Frontier Controls
            </h2>
            <p id={descriptionId} className="mt-2 text-base text-muted">
              Adjust audio, motion, save, and display preferences.
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close settings"
            className="self-start px-3"
            size="sm"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <div className="mt-5 grid gap-5">
          <fieldset className="border border-border bg-panel p-4">
            <legend className="px-1 font-mono text-base text-muted">Audio</legend>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold">Sound</span>
              <Button
                aria-label="Sound on or off"
                aria-pressed={settings.soundEnabled}
                onClick={() => handleSoundToggle(!settings.soundEnabled)}
                size="sm"
                variant={settings.soundEnabled ? 'secondary' : 'ghost'}
              >
                {settings.soundEnabled ? (
                  <Volume2 aria-hidden="true" className="size-5" />
                ) : (
                  <VolumeX aria-hidden="true" className="size-5" />
                )}
                {settings.soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>
            <VolumeControl
              id="music-volume"
              label="Music volume"
              value={settings.musicVolume}
              onChange={(musicVolume) => updateSettings({ musicVolume })}
            />
            <VolumeControl
              id="sfx-volume"
              label="SFX volume"
              value={settings.sfxVolume}
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

            <TextSpeedDropdown
              value={settings.textSpeed}
              onChange={(textSpeed) => updateSettings({ textSpeed })}
            />

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

          <Card
            as="section"
            variant="panel"
            aria-label="Save data"
            className="flex justify-center"
          >
            <Button
              onClick={() => setResetConfirmOpen(true)}
              className="border-danger-deep bg-danger-deep text-danger hover:border-danger hover:bg-danger-deep hover:text-foreground"
            >
              Reset Save Data
            </Button>
          </Card>
        </div>
      </Card>
      <ResetSaveConfirmationModal
        isOpen={resetConfirmOpen}
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={handleResetSave}
      />
    </div>
  );
}

function VolumeControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
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
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full"
      />
    </div>
  );
}

function ResetSaveConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/90 px-4 py-6"
      data-testid="reset-save-confirmation-backdrop"
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
        aria-label="Reset save data confirmation"
        aria-describedby={descriptionId}
        className="w-full max-w-md p-5"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-2xl font-bold">Are you sure?</h3>
            <p id={descriptionId} className="mt-2 text-base text-muted">
              This will clear the saved expedition from this browser.
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            onClick={onCancel}
            aria-label="Close reset confirmation"
            className="shrink-0 px-3"
            size="sm"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Confirm reset
          </Button>
        </div>
      </Card>
    </div>
  );
}

function TextSpeedDropdown({
  value,
  onChange,
}: {
  value: TextSpeed;
  onChange: (value: TextSpeed) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    textSpeedOptions.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedOption = textSpeedOptions[selectedIndex];

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const chooseOption = (index: number) => {
    const option = textSpeedOptions[index];

    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveActiveOption = (direction: 1 | -1) => {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex + direction + textSpeedOptions.length) % textSpeedOptions.length,
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement | HTMLUListElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      moveActiveOption(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      moveActiveOption(-1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (open) {
        chooseOption(activeIndex);
      } else {
        setOpen(true);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative mt-4">
      <span className="block font-bold" id={`${listboxId}-label`}>
        Text speed
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Text speed"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          setOpen((currentOpen) => !currentOpen);
          setActiveIndex(selectedIndex);
        }}
        onKeyDown={handleKeyDown}
        className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 border border-border bg-canvas px-3 py-3 text-left text-foreground outline-none focus:border-highlight"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 motion-safe:transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={`${listboxId}-label`}
          aria-activedescendant={`${listboxId}-${textSpeedOptions[activeIndex].value}`}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="absolute z-10 mt-2 max-h-64 w-full overflow-auto border border-border bg-panel p-1"
        >
          {textSpeedOptions.map((option, index) => (
            <li
              key={option.value}
              id={`${listboxId}-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                chooseOption(index);
              }}
              className={`cursor-pointer border px-3 py-2 font-mono text-base ${
                index === activeIndex
                  ? 'border-highlight bg-canvas text-highlight'
                  : 'border-transparent text-muted'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
