import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { EventIllustration } from '@components/EventIllustration';
import { cx } from '@components/ui/styles';
import { getChoiceAvailability, getChoiceLabel } from '@game/systems/eventSystem';
import { useExpeditionStore } from '@stores/expeditionStore';
import { useSettings } from '@/hooks/useSettings';

export function EventCard() {
  const dialogRef = useRef<HTMLElement>(null);
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

    const focusableElements = getFocusableElements(dialogRef.current);
    const firstFocusableElement = focusableElements[0] ?? dialogRef.current;

    firstFocusableElement.focus();
  }, [currentEvent, eventResolved]);

  if (!currentEvent) {
    return null;
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(dialogRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusableElement) {
      event.preventDefault();
      lastFocusableElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 px-5 py-8"
      role="presentation"
    >
      <Card
        as="section"
        ref={dialogRef}
        tabIndex={-1}
        className={cx(
          'w-full max-w-2xl p-5',
          settings.reducedMotion ? null : 'fr-event-card-enter',
        )}
        aria-labelledby="event-title"
        aria-describedby="event-description"
        role="dialog"
        aria-modal="true"
        onKeyDown={handleDialogKeyDown}
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
            <Badge variant="success">Event resolved</Badge>
            {eventOutcomeText ? (
              <p className="mt-3 text-muted">{eventOutcomeText}</p>
            ) : null}
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
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('aria-hidden'));
}
