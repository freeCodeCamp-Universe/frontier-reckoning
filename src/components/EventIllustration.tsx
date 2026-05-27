import type { GameEvent } from '@game/types/event';
import { cx } from '@components/ui/styles';
import {
  getEventIllustrationKind,
  type EventIllustrationKind,
} from '@game/systems/eventIllustrations';

export function EventIllustration({
  event,
  className,
}: {
  event: Pick<GameEvent, 'categories' | 'type' | 'title'>;
  className?: string;
}) {
  const kind = getEventIllustrationKind(event);
  const label = `Event illustration: ${kind.replace('_', ' ')}`;

  return (
    <figure
      className={cx(
        'overflow-hidden border border-border bg-canvas text-highlight',
        className,
      )}
    >
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 640 220"
        className="h-40 w-full"
      >
        <rect width="640" height="220" fill="rgb(var(--color-canvas))" />
        <rect y="155" width="640" height="65" fill="rgb(var(--color-panel))" />
        <circle cx="548" cy="48" r="26" fill="rgb(var(--color-cta))" opacity="0.8" />
        <path
          d="M0 162c74-38 112-18 176-42 79-30 134-58 230-17 82 35 139 10 234 44v73H0Z"
          fill="rgb(var(--color-surface))"
        />
        <IllustrationScene kind={kind} />
      </svg>
    </figure>
  );
}

function IllustrationScene({ kind }: { kind: EventIllustrationKind }) {
  switch (kind) {
    case 'storm':
      return <StormScene />;
    case 'sickness':
      return <SicknessScene />;
    case 'trader':
      return <TraderScene />;
    case 'bandit':
      return <BanditScene />;
    case 'river':
      return <RiverScene />;
    case 'hunting':
      return <HuntingScene />;
    case 'wagon_damage':
      return <WagonDamageScene />;
    case 'campfire':
      return <CampfireScene />;
    case 'town':
      return <TownScene />;
    case 'discovery':
      return <DiscoveryScene />;
  }
}

function StormScene() {
  return (
    <>
      <path d="M70 48h170l-35 38h82l-142 92 35-64h-85Z" fill="rgb(var(--color-cta))" />
      <path d="M328 42h170M352 76h215M290 112h188" stroke="rgb(var(--color-danger))" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
      <Rain />
    </>
  );
}

function SicknessScene() {
  return (
    <>
      <Wagon x={72} y={118} broken={false} />
      <circle cx="396" cy="92" r="28" fill="rgb(var(--color-danger-deep))" stroke="rgb(var(--color-danger))" strokeWidth="5" />
      <path d="M396 70v44M374 92h44" stroke="rgb(var(--color-danger))" strokeWidth="10" strokeLinecap="round" />
      <path d="M452 130c28-34 70-34 98 0" stroke="rgb(var(--color-muted))" strokeWidth="8" strokeLinecap="round" fill="none" />
    </>
  );
}

function TraderScene() {
  return (
    <>
      <Wagon x={68} y={118} broken={false} />
      <path d="M380 146h120l-14-58h-92Z" fill="rgb(var(--color-frontier-bark))" stroke="rgb(var(--color-cta))" strokeWidth="5" />
      <path d="M392 88h96l-17-27h-62Z" fill="rgb(var(--color-cta))" />
      <circle cx="424" cy="126" r="11" fill="rgb(var(--color-highlight))" />
      <circle cx="468" cy="126" r="11" fill="rgb(var(--color-success))" />
    </>
  );
}

function BanditScene() {
  return (
    <>
      <path d="M92 152c62-34 116-34 178 0" stroke="rgb(var(--color-muted))" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M405 74l34 74h-68Z" fill="rgb(var(--color-danger-deep))" stroke="rgb(var(--color-danger))" strokeWidth="5" />
      <path d="M405 95v35M388 112h34" stroke="rgb(var(--color-danger))" strokeWidth="8" strokeLinecap="round" />
      <path d="M482 122l75-34M482 122l75 34" stroke="rgb(var(--color-cta))" strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function RiverScene() {
  return (
    <>
      <path d="M0 178c74-45 147 35 222-10 93-55 172 33 274-18 48-24 97-18 144 10v60H0Z" fill="rgb(var(--color-highlight))" opacity="0.65" />
      <path d="M74 178c52-21 86 22 142 0M284 174c55-24 91 19 146-3M486 174c41-16 71 6 103-2" stroke="rgb(var(--color-foreground))" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <Wagon x={68} y={106} broken={false} />
    </>
  );
}

function HuntingScene() {
  return (
    <>
      <path d="M112 154c44-55 96-55 140 0" stroke="rgb(var(--color-success))" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="410" cy="114" r="32" fill="none" stroke="rgb(var(--color-cta))" strokeWidth="6" />
      <path d="M410 72v84M368 114h84" stroke="rgb(var(--color-cta))" strokeWidth="5" strokeLinecap="round" />
      <path d="M475 132c22-25 59-25 83 0l-18 16h-46Z" fill="rgb(var(--color-frontier-bark))" />
    </>
  );
}

function WagonDamageScene() {
  return (
    <>
      <Wagon x={120} y={116} broken />
      <path d="M430 84l50 50M480 84l-50 50" stroke="rgb(var(--color-danger))" strokeWidth="10" strokeLinecap="round" />
      <path d="M380 158h178" stroke="rgb(var(--color-cta))" strokeWidth="7" strokeLinecap="round" strokeDasharray="16 14" />
    </>
  );
}

function CampfireScene() {
  return (
    <>
      <path d="M286 171l34-75 34 75Z" fill="rgb(var(--color-danger))" />
      <path d="M306 171l31-52 31 52Z" fill="rgb(var(--color-cta))" />
      <path d="M250 176h170" stroke="rgb(var(--color-frontier-bark))" strokeWidth="10" strokeLinecap="round" />
      <path d="M96 150h86M458 150h86" stroke="rgb(var(--color-muted))" strokeWidth="8" strokeLinecap="round" />
    </>
  );
}

function TownScene() {
  return (
    <>
      <path d="M110 164V96l55-38 55 38v68Z" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-highlight))" strokeWidth="5" />
      <path d="M286 164V78h128v86Z" fill="rgb(var(--color-panel))" stroke="rgb(var(--color-cta))" strokeWidth="5" />
      <path d="M468 164v-54l44-30 44 30v54Z" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-success))" strokeWidth="5" />
      <path d="M324 164v-42h52v42" fill="rgb(var(--color-canvas))" />
    </>
  );
}

function DiscoveryScene() {
  return (
    <>
      <path d="M120 160c70-82 145-82 215 0" stroke="rgb(var(--color-success))" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M420 70l20 40 44 7-32 31 8 44-40-21-40 21 8-44-32-31 44-7Z" fill="rgb(var(--color-cta))" />
      <path d="M112 138l82-46 82 46" stroke="rgb(var(--color-highlight))" strokeWidth="7" strokeLinecap="round" fill="none" />
    </>
  );
}

function Wagon({ x, y, broken }: { x: number; y: number; broken: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 34h122l-16-52H18Z" fill="rgb(var(--color-frontier-bark))" stroke="rgb(var(--color-cta))" strokeWidth="5" />
      <path d="M17-18c17-42 72-42 89 0" fill="none" stroke="rgb(var(--color-foreground))" strokeWidth="8" />
      <circle cx="28" cy="45" r="17" fill="rgb(var(--color-canvas))" stroke="rgb(var(--color-highlight))" strokeWidth="6" />
      <circle cx="94" cy="45" r="17" fill="rgb(var(--color-canvas))" stroke={broken ? 'rgb(var(--color-danger))' : 'rgb(var(--color-highlight))'} strokeWidth="6" />
      {broken ? <path d="M80 31l28 28M108 31 80 59" stroke="rgb(var(--color-danger))" strokeWidth="5" strokeLinecap="round" /> : null}
    </g>
  );
}

function Rain() {
  return (
    <>
      {[110, 180, 250, 330, 410, 490, 560].map((x, index) => (
        <path
          key={x}
          d={`M${x} ${118 + (index % 2) * 12}l-26 42`}
          stroke="rgb(var(--color-highlight))"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
    </>
  );
}
