import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { EventIllustration } from '@components/EventIllustration';
import { cx } from '@components/ui/styles';
import { getChoiceAvailability, getChoiceLabel } from '@game/systems/eventSystem';
import { useExpeditionStore } from '@stores/expeditionStore';
import {
  closeModalDialog,
  getFocusableElements,
  openModalDialog,
  supportsNativeModalDialog,
  trapFocus,
} from '@utils/dialog';
import { useSettings } from '@/hooks/useSettings';

export function EventCard() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentEvent = useExpeditionStore((state) => state.currentEvent);
  const eventResolved = useExpeditionStore((state) => state.eventResolved);
  const eventOutcomeText = useExpeditionStore((state) => state.eventOutcomeText);
  const gameState = useExpeditionStore((state) => state);
  const resolveCurrentEvent = useExpeditionStore((state) => state.resolveCurrentEvent);
  const continueFromEvent = useExpeditionStore((state) => state.continueFromEvent);
  const [settings] = useSettings();

  useEffect(() => {
    if (!currentEvent || !dialogRef.current) {
      return;
    }

    const dialog = dialogRef.current;

    openModalDialog(dialog);
    const focusableElements = getFocusableElements(dialog);
    const firstFocusableElement = focusableElements[0] ?? dialog;

    firstFocusableElement.focus();

    return () => {
      closeModalDialog(dialog);
    };
  }, [currentEvent, eventResolved]);

  if (!currentEvent) {
    return null;
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    trapFocus(event, dialogRef.current);
  };

  return (
    <dialog
      ref={dialogRef}
      open={supportsNativeModalDialog() ? undefined : true}
      aria-labelledby="event-title"
      aria-describedby="event-description"
      aria-modal="true"
      className="fixed inset-0 z-50 m-0 h-auto max-h-none w-auto max-w-none overflow-visible border-0 bg-transparent p-0 text-foreground backdrop:bg-canvas/90"
      onCancel={(event) => {
        event.preventDefault();
      }}
      onKeyDown={handleDialogKeyDown}
    >
      <div className="flex min-h-screen items-center justify-center px-5 py-8">
        <Card
          as="section"
          tabIndex={-1}
          className={cx(
            'w-full max-w-2xl p-5',
            settings.reducedMotion ? null : 'fr-event-card-enter',
          )}
        >
          <EventIllustration event={currentEvent} className="mb-4" />
          <Badge variant="info">{currentEvent.type.replace('_', ' ')}</Badge>
          <h2 id="event-title" className="mt-2 text-3xl font-bold">
            {currentEvent.title}
          </h2>
          <p id="event-description" className="mt-4 text-muted">
            {currentEvent.description}
          </p>

          {eventResolved ? (
            <Card as="div" variant="success" className="mt-5">
              <div role="status" aria-atomic="true">
                <Badge variant="success">Event resolved</Badge>
                {eventOutcomeText ? (
                  <p className="mt-3 text-muted">{eventOutcomeText}</p>
                ) : null}
              </div>
              <Button onClick={continueFromEvent} className="mt-4">
                Continue
              </Button>
            </Card>
          ) : currentEvent.choices?.length ? (
            <div className="mt-5 grid gap-3">
              {currentEvent.choices.map((choice) => {
                const availability = getChoiceAvailability(gameState, choice);

                return (
                  <div key={choice.id}>
                    <Button
                      onClick={() => resolveCurrentEvent(choice.id)}
                      disabled={!availability.available}
                      disabledReason={availability.reasons.join(' ')}
                      className="w-full justify-start text-left"
                    >
                      {getChoiceLabel(choice)}
                    </Button>
                    {!availability.available ? (
                      <p className="mt-2 font-mono text-base text-danger">
                        {availability.reasons.join(' ')}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <Button onClick={() => resolveCurrentEvent()} className="mt-5">
              Resolve Event
            </Button>
          )}
        </Card>
      </div>
    </dialog>
  );
}
