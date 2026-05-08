import { Button } from '@components/ui/Button';
import { getChoiceLabel } from '@game/systems/eventSystem';
import { useExpeditionStore } from '@stores/expeditionStore';

export function EventCard() {
  const currentEvent = useExpeditionStore((state) => state.currentEvent);
  const eventResolved = useExpeditionStore((state) => state.eventResolved);
  const resolveCurrentEvent = useExpeditionStore((state) => state.resolveCurrentEvent);
  const continueFromEvent = useExpeditionStore((state) => state.continueFromEvent);

  if (!currentEvent) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 px-5 py-8"
      role="presentation"
    >
      <section
        className="w-full max-w-2xl border border-border bg-surface p-5"
        aria-labelledby="event-title"
        role="dialog"
        aria-modal="true"
      >
        <p className="font-mono text-base capitalize text-highlight">
          {currentEvent.type.replace('_', ' ')}
        </p>
        <h2 id="event-title" className="mt-2 text-3xl font-bold">
          {currentEvent.title}
        </h2>
        <p className="mt-4 text-muted">{currentEvent.description}</p>

        {eventResolved ? (
          <div className="mt-5 border border-border bg-panel p-4">
            <p className="font-mono text-base text-success">Event resolved</p>
            <Button onClick={continueFromEvent} className="mt-4">
              Continue
            </Button>
          </div>
        ) : currentEvent.choices?.length ? (
          <div className="mt-5 grid gap-3">
            {currentEvent.choices.map((choice) => (
              <Button
                key={choice.id}
                onClick={() => resolveCurrentEvent(choice.id)}
                className="justify-start text-left"
              >
                {getChoiceLabel(choice)}
              </Button>
            ))}
          </div>
        ) : (
          <Button onClick={() => resolveCurrentEvent()} className="mt-5">
            Resolve Event
          </Button>
        )}
      </section>
    </div>
  );
}
