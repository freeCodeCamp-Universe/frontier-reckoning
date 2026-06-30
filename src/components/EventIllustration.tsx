import type { GameEvent } from '@game/types/event';
import { cx } from '@components/ui/styles';
import { EventCinematicScene } from '@components/EventCinematicScene';
import {
  getEventSceneConfig,
  getEventIllustrationKind,
  type EventIllustrationKind,
} from '@game/systems/eventIllustrations';

export function EventIllustration({
  event,
  className,
}: {
  event: Pick<GameEvent, 'categories' | 'type' | 'title'> &
    Partial<Pick<GameEvent, 'id'>>;
  className?: string;
}) {
  const kind = getEventIllustrationKind(event);
  const sceneConfig = getEventSceneConfig(event.id);

  return (
    <figure
      className={cx(
        'overflow-hidden border border-border bg-canvas text-highlight',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
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
        {sceneConfig ? (
          <EventCinematicScene config={sceneConfig} />
        ) : (
          <IllustrationScene kind={kind} />
        )}
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
    case 'ridge_scouting':
      return <RidgeScoutingScene />;
    case 'bad_water':
      return <BadWaterScene />;
    case 'predator_hunt':
      return <PredatorHuntScene />;
    case 'stolen_tack':
      return <StolenTackScene />;
    case 'night_watch_song':
      return <NightWatchSongScene />;
    case 'rattlesnake_strike':
      return <RattlesnakeStrikeScene />;
    case 'guide_for_ammo':
      return <GuideForAmmoScene />;
    case 'ration_dispute':
      return <RationDisputeScene />;
    case 'discovery':
      return <DiscoveryScene />;
  }
}

function StormScene() {
  return (
    <>
      <path d="M70 48h170l-35 38h82l-142 92 35-64h-85Z" fill="rgb(var(--color-cta))" />
      <path
        d="M328 42h170M352 76h215M290 112h188"
        stroke="rgb(var(--color-danger))"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <Rain />
    </>
  );
}

function SicknessScene() {
  return (
    <>
      <Wagon x={72} y={118} broken={false} />
      <circle
        cx="396"
        cy="92"
        r="28"
        fill="rgb(var(--color-danger-deep))"
        stroke="rgb(var(--color-danger))"
        strokeWidth="5"
      />
      <path
        d="M396 70v44M374 92h44"
        stroke="rgb(var(--color-danger))"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M452 130c28-34 70-34 98 0"
        stroke="rgb(var(--color-muted))"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function TraderScene() {
  return (
    <>
      <Wagon x={68} y={118} broken={false} />
      <path
        d="M380 146h120l-14-58h-92Z"
        fill="rgb(var(--color-frontier-bark))"
        stroke="rgb(var(--color-cta))"
        strokeWidth="5"
      />
      <path d="M392 88h96l-17-27h-62Z" fill="rgb(var(--color-cta))" />
      <circle cx="424" cy="126" r="11" fill="rgb(var(--color-highlight))" />
      <circle cx="468" cy="126" r="11" fill="rgb(var(--color-success))" />
    </>
  );
}

function BanditScene() {
  return (
    <>
      <path
        d="M92 152c62-34 116-34 178 0"
        stroke="rgb(var(--color-muted))"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M405 74l34 74h-68Z"
        fill="rgb(var(--color-danger-deep))"
        stroke="rgb(var(--color-danger))"
        strokeWidth="5"
      />
      <path
        d="M405 95v35M388 112h34"
        stroke="rgb(var(--color-danger))"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M482 122l75-34M482 122l75 34"
        stroke="rgb(var(--color-cta))"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </>
  );
}

function RiverScene() {
  return (
    <>
      <path
        d="M0 178c74-45 147 35 222-10 93-55 172 33 274-18 48-24 97-18 144 10v60H0Z"
        fill="rgb(var(--color-highlight))"
        opacity="0.65"
      />
      <path
        d="M74 178c52-21 86 22 142 0M284 174c55-24 91 19 146-3M486 174c41-16 71 6 103-2"
        stroke="rgb(var(--color-foreground))"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <Wagon x={68} y={106} broken={false} />
    </>
  );
}

function HuntingScene() {
  return (
    <>
      <path
        d="M112 154c44-55 96-55 140 0"
        stroke="rgb(var(--color-success))"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="410"
        cy="114"
        r="32"
        fill="none"
        stroke="rgb(var(--color-cta))"
        strokeWidth="6"
      />
      <path
        d="M410 72v84M368 114h84"
        stroke="rgb(var(--color-cta))"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M475 132c22-25 59-25 83 0l-18 16h-46Z"
        fill="rgb(var(--color-frontier-bark))"
      />
    </>
  );
}

function WagonDamageScene() {
  return (
    <>
      <Wagon x={120} y={116} broken />
      <path
        d="M430 84l50 50M480 84l-50 50"
        stroke="rgb(var(--color-danger))"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M380 158h178"
        stroke="rgb(var(--color-cta))"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="16 14"
      />
    </>
  );
}

function CampfireScene() {
  return (
    <>
      <path d="M286 171l34-75 34 75Z" fill="rgb(var(--color-danger))" />
      <path d="M306 171l31-52 31 52Z" fill="rgb(var(--color-cta))" />
      <path
        d="M250 176h170"
        stroke="rgb(var(--color-frontier-bark))"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M96 150h86M458 150h86"
        stroke="rgb(var(--color-muted))"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </>
  );
}

function TownScene() {
  return (
    <>
      <path
        d="M110 164V96l55-38 55 38v68Z"
        fill="rgb(var(--color-surface))"
        stroke="rgb(var(--color-highlight))"
        strokeWidth="5"
      />
      <path
        d="M286 164V78h128v86Z"
        fill="rgb(var(--color-panel))"
        stroke="rgb(var(--color-cta))"
        strokeWidth="5"
      />
      <path
        d="M468 164v-54l44-30 44 30v54Z"
        fill="rgb(var(--color-surface))"
        stroke="rgb(var(--color-success))"
        strokeWidth="5"
      />
      <path d="M324 164v-42h52v42" fill="rgb(var(--color-canvas))" />
    </>
  );
}

function DiscoveryScene() {
  return (
    <>
      <path
        d="M120 160c70-82 145-82 215 0"
        stroke="rgb(var(--color-success))"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M420 70l20 40 44 7-32 31 8 44-40-21-40 21 8-44-32-31 44-7Z"
        fill="rgb(var(--color-cta))"
      />
      <path
        d="M112 138l82-46 82 46"
        stroke="rgb(var(--color-highlight))"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function RidgeScoutingScene() {
  return (
    <g data-testid="ridge-scouting-illustration">
      <defs>
        <linearGradient id="ridge-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.5" />
          <stop offset="42%" stopColor="rgb(var(--color-cta))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="ridge-water" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.05" />
          <stop offset="48%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.7" />
          <stop
            offset="100%"
            stopColor="rgb(var(--color-foreground))"
            stopOpacity="0.15"
          />
        </linearGradient>
        <radialGradient id="ridge-sun-glow" cx="82%" cy="22%" r="48%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.7" />
          <stop offset="58%" stopColor="rgb(var(--color-cta))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(var(--color-cta))" stopOpacity="0" />
        </radialGradient>
        <filter id="ridge-soften" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <style>
          {`
            .fr-ridge-cloud {
              animation: fr-ridge-cloud-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-ridge-dust {
              animation: fr-ridge-dust-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-ridge-water {
              animation: fr-ridge-water-shimmer 3.8s ease-in-out infinite alternate;
            }

            @keyframes fr-ridge-cloud-drift {
              from { transform: translateX(-8px); opacity: 0.28; }
              to { transform: translateX(14px); opacity: 0.45; }
            }

            @keyframes fr-ridge-dust-drift {
              from { transform: translateX(0); opacity: 0.18; }
              to { transform: translateX(18px); opacity: 0.34; }
            }

            @keyframes fr-ridge-water-shimmer {
              from { opacity: 0.42; }
              to { opacity: 0.76; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-ridge-cloud,
              .fr-ridge-dust,
              .fr-ridge-water {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#ridge-sky)" />
      <circle cx="528" cy="38" r="92" fill="url(#ridge-sun-glow)" />
      <circle cx="534" cy="42" r="22" fill="rgb(var(--color-cta))" opacity="0.72" />

      <g className="fr-ridge-cloud" fill="rgb(var(--color-foreground))" opacity="0.28">
        <path
          d="M61 52c18-16 38-15 55 0 19-9 40-6 55 8 20-8 40-4 56 10H43c4-8 10-14 18-18Z"
          filter="url(#ridge-soften)"
        />
        <path
          d="M404 70c14-12 31-12 45 0 17-8 37-4 47 10h-111c4-5 10-8 19-10Z"
          filter="url(#ridge-soften)"
        />
      </g>

      <g
        fill="none"
        stroke="rgb(var(--color-canvas))"
        strokeLinecap="round"
        strokeWidth="4"
        opacity="0.5"
      >
        <path d="M102 44c10-10 21-10 31 0" />
        <path d="M126 52c8-8 17-8 25 0" />
        <path d="M514 79c7-7 15-7 22 0" />
      </g>

      <path
        d="M0 126 67 86l54 23 58-51 74 62 72-47 54 45 72-69 94 78 95-38v131H0Z"
        fill="rgb(var(--color-highlight))"
        opacity="0.16"
      />
      <path
        d="M0 142c42-18 79-30 111-36 42-8 64 13 99 8 47-7 70-49 115-47 49 2 78 51 129 49 49-2 83-33 132-23 18 4 36 11 54 21v106H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.62"
      />
      <path
        d="M0 160c84-35 142-26 194-14 69 15 114-20 173-12 76 10 119 39 273-5v91H0Z"
        fill="rgb(var(--color-panel))"
        opacity="0.82"
      />

      <path
        className="fr-ridge-water"
        d="M410 129c42-10 95-8 151 6-48 16-97 18-151 6-13-3-13-9 0-12Z"
        fill="url(#ridge-water)"
      />

      <path
        d="M208 218c4-31 28-44 73-51 49-7 62-18 43-31-11-7-35-13-70-18"
        fill="none"
        stroke="rgb(var(--color-cta))"
        strokeLinecap="round"
        strokeWidth="8"
        opacity="0.38"
      />
      <path
        d="M213 218c4-26 28-36 68-43 62-10 66-23 9-39"
        fill="none"
        stroke="rgb(var(--color-canvas))"
        strokeLinecap="round"
        strokeWidth="3"
        opacity="0.5"
      />

      <g className="fr-ridge-dust" fill="rgb(var(--color-cta))" opacity="0.24">
        <ellipse cx="285" cy="162" rx="34" ry="7" />
        <ellipse cx="343" cy="150" rx="24" ry="5" />
        <ellipse cx="386" cy="143" rx="18" ry="4" />
      </g>

      <path
        d="M0 196c78-31 145-42 214-38 83 5 143 35 218 27 78-8 131-40 208-41v76H0Z"
        fill="rgb(var(--color-canvas))"
      />
      <path
        d="M0 187c79-22 150-29 216-21 89 10 143 36 218 27 75-9 130-35 206-33"
        fill="none"
        stroke="rgb(var(--color-cta))"
        strokeLinecap="round"
        strokeWidth="4"
        opacity="0.34"
      />

      <g transform="translate(188 113)" fill="rgb(var(--color-canvas))">
        <ellipse cx="22" cy="82" rx="32" ry="6" opacity="0.45" />
        <circle cx="27" cy="18" r="8" />
        <path d="M16 30c12-8 25-8 36 0l-8 45H24Z" />
        <path d="M22 72h9l-6 29h-10Z" />
        <path d="M38 72h9l10 28H46Z" />
        <path d="M47 30l48-13 3 7-48 17Z" />
        <path d="M88 13h29v15H88Z" />
        <path
          d="M22 33 4 53"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M45 34 60 55"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function BadWaterScene() {
  return (
    <g data-testid="bad-water-illustration">
      <defs>
        <linearGradient id="bad-water-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.36" />
          <stop
            offset="48%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.18"
          />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="bad-water-creek" x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-success-deep))"
            stopOpacity="0.82"
          />
          <stop offset="48%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.28" />
          <stop
            offset="100%"
            stopColor="rgb(var(--color-frontier-trail))"
            stopOpacity="0.64"
          />
        </linearGradient>
        <linearGradient id="bad-water-oil" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0" />
          <stop offset="46%" stopColor="rgb(var(--color-cta))" stopOpacity="0.5" />
          <stop offset="70%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(var(--color-success))" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="bad-water-glare" cx="52%" cy="20%" r="58%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(var(--color-cta))" stopOpacity="0" />
        </radialGradient>
        <clipPath id="bad-water-creek-clip">
          <path d="M261 92c-27 24-17 47 27 69 57 29 41 51-45 59h397V90c-56-8-101-7-135 5-54 18-80 7-121-8-45-17-83-15-123 5Z" />
        </clipPath>
        <filter id="bad-water-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.55"
          />
        </filter>
        <style>
          {`
            .fr-bad-water-sheen {
              animation: fr-bad-water-sheen 4.8s ease-in-out infinite alternate;
            }

            .fr-bad-water-ripple {
              animation: fr-bad-water-ripple 4.6s ease-in-out infinite alternate;
            }

            .fr-bad-water-insect {
              animation: fr-bad-water-insect 3.6s ease-in-out infinite alternate;
            }

            @keyframes fr-bad-water-sheen {
              from { transform: translateX(-18px); opacity: 0.22; }
              to { transform: translateX(22px); opacity: 0.48; }
            }

            @keyframes fr-bad-water-ripple {
              from { transform: translateY(0); opacity: 0.22; }
              to { transform: translateY(3px); opacity: 0.46; }
            }

            @keyframes fr-bad-water-insect {
              from { transform: translate(0, 0); opacity: 0.42; }
              to { transform: translate(8px, -4px); opacity: 0.72; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-bad-water-sheen,
              .fr-bad-water-ripple,
              .fr-bad-water-insect {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#bad-water-sky)" />
      <circle cx="492" cy="28" r="88" fill="url(#bad-water-glare)" />
      <circle cx="502" cy="31" r="19" fill="rgb(var(--color-cta))" opacity="0.5" />

      <path
        d="M0 139c66-21 126-25 180-12 43 11 77 7 121-11 66-27 139-16 196 8 50 21 96 18 143 0v96H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.74"
      />
      <path
        d="M0 161c66-26 135-31 207-15 68 15 123 4 171-11 72-23 158-10 262 15v70H0Z"
        fill="rgb(var(--color-panel))"
      />

      <g opacity="0.38" fill="rgb(var(--color-canvas))">
        <path d="M70 130h92l-9-28H83Z" />
        <path
          d="M88 102c10-28 54-28 65 0"
          fill="none"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
        />
        <circle cx="91" cy="136" r="11" />
        <circle cx="145" cy="136" r="11" />
        <path
          d="M176 134h72M208 134v-36M191 98h36"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <path
        d="M261 92c-27 24-17 47 27 69 57 29 41 51-45 59h397V90c-56-8-101-7-135 5-54 18-80 7-121-8-45-17-83-15-123 5Z"
        fill="rgb(var(--color-frontier-trail))"
        opacity="0.72"
      />
      <path
        d="M280 95c-35 27-25 48 31 70 54 21 45 38-27 55h356V105c-55-6-97-2-126 11-55 25-86 13-130-5-41-17-76-22-104-16Z"
        fill="url(#bad-water-creek)"
        opacity="0.9"
      />

      <g clipPath="url(#bad-water-creek-clip)">
        <path
          className="fr-bad-water-sheen"
          d="M296 117c56-13 110-8 160 15 47 21 99 19 156-6"
          fill="none"
          stroke="url(#bad-water-oil)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          className="fr-bad-water-ripple"
          d="M330 143c30-8 57-5 83 8M472 137c35-9 69-7 101 7M388 184c38-9 78-8 119 3"
          fill="none"
          stroke="rgb(var(--color-parchment))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.28"
        />
        <path
          d="M304 112c38 10 70 10 97 0M439 161c34 13 73 14 116 3"
          fill="none"
          stroke="rgb(var(--color-success))"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.22"
        />
      </g>

      <g
        fill="rgb(var(--color-frontier-bark))"
        opacity="0.95"
        filter="url(#bad-water-shadow)"
      >
        <ellipse cx="277" cy="119" rx="21" ry="9" />
        <ellipse cx="548" cy="154" rx="30" ry="11" />
        <ellipse cx="384" cy="199" rx="38" ry="12" />
        <ellipse cx="456" cy="104" rx="18" ry="7" />
      </g>
      <g fill="rgb(var(--color-muted))" opacity="0.42">
        <ellipse cx="274" cy="116" rx="15" ry="5" />
        <ellipse cx="545" cy="150" rx="20" ry="6" />
        <ellipse cx="383" cy="194" rx="25" ry="6" />
      </g>

      <path
        d="M0 197c52-19 101-24 147-14 50 11 92 12 126 2 36-10 69-4 99 18v17H0Z"
        fill="rgb(var(--color-frontier-trail))"
        opacity="0.8"
      />
      <path
        d="M0 208c74-17 132-18 174-3 36 13 76 13 120 0 42-13 78-9 108 12v3H0Z"
        fill="rgb(var(--color-canvas))"
        opacity="0.58"
      />

      <g transform="translate(159 166) rotate(-18)" filter="url(#bad-water-shadow)">
        <ellipse
          cx="33"
          cy="38"
          rx="35"
          ry="7"
          fill="rgb(var(--color-canvas))"
          opacity="0.38"
        />
        <path
          d="M13 18h50l-7 29H21Z"
          fill="rgb(var(--color-panel))"
          stroke="rgb(var(--color-muted))"
          strokeWidth="5"
        />
        <path
          d="M17 14c10-13 34-13 44 0"
          fill="none"
          stroke="rgb(var(--color-muted))"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M25 47c18 7 35 7 52 0"
          stroke="rgb(var(--color-success))"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      <g
        fill="none"
        stroke="rgb(var(--color-success))"
        strokeLinecap="round"
        opacity="0.42"
      >
        <path d="M84 180c-5-18-2-30 9-37" strokeWidth="4" />
        <path d="M105 184c-7-19-5-34 7-45" strokeWidth="4" />
        <path d="M132 181c-3-15 1-27 12-35" strokeWidth="4" />
        <path d="M87 156l-13-8M108 153l14-10M138 158l13-8" strokeWidth="3" />
      </g>

      <g className="fr-bad-water-insect" fill="rgb(var(--color-canvas))" opacity="0.65">
        <circle cx="424" cy="84" r="2.4" />
        <path
          d="M419 82l-7-5M429 82l7-5M420 87l-8 3M428 87l8 3"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="504" cy="122" r="2" />
        <path
          d="M500 120l-6-4M508 120l6-4M500 124l-6 4M508 124l6 4"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function PredatorHuntScene() {
  return (
    <g data-testid="predator-hunt-illustration">
      <defs>
        <linearGradient id="predator-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.18" />
          <stop
            offset="48%"
            stopColor="rgb(var(--color-danger-deep))"
            stopOpacity="0.18"
          />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.74" />
        </linearGradient>
        <radialGradient id="predator-dusk-glow" cx="74%" cy="18%" r="62%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.3" />
          <stop offset="48%" stopColor="rgb(var(--color-danger))" stopOpacity="0.1" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="predator-ground" x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-frontier-bark))"
            stopOpacity="0.58"
          />
          <stop offset="58%" stopColor="rgb(var(--color-panel))" stopOpacity="0.88" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <filter id="predator-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.8"
          />
        </filter>
        <filter id="predator-eye-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="predator-ground-clip">
          <path d="M0 153c58-23 111-29 160-17 59 15 107 11 144-10 53-30 119-32 197-5 49 17 95 20 139 8v91H0Z" />
        </clipPath>
        <style>
          {`
            .fr-predator-fog {
              animation: fr-predator-fog-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-predator-eyes {
              animation: fr-predator-eye-pulse 3.8s ease-in-out infinite alternate;
            }

            .fr-predator-grass {
              animation: fr-predator-grass-shift 4.8s ease-in-out infinite alternate;
              transform-origin: bottom center;
            }

            @keyframes fr-predator-fog-drift {
              from { transform: translateX(-18px); opacity: 0.16; }
              to { transform: translateX(20px); opacity: 0.34; }
            }

            @keyframes fr-predator-eye-pulse {
              from { opacity: 0.58; }
              to { opacity: 1; }
            }

            @keyframes fr-predator-grass-shift {
              from { transform: skewX(-1deg); opacity: 0.5; }
              to { transform: skewX(3deg); opacity: 0.72; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-predator-fog,
              .fr-predator-eyes,
              .fr-predator-grass {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#predator-sky)" />
      <circle cx="500" cy="34" r="110" fill="url(#predator-dusk-glow)" />

      <path
        d="M0 119c54-38 93-31 140-50 66-27 113-48 174-13 59 33 105 20 168 3 54-14 101 3 158 42v119H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.36"
      />
      <path
        d="M0 139c63-27 117-28 162-4 55 29 103 20 148-2 72-36 137-26 195 1 47 21 92 19 135-4v90H0Z"
        fill="rgb(var(--color-panel))"
        opacity="0.72"
      />

      <g opacity="0.84" fill="rgb(var(--color-canvas))">
        <path d="M55 37h18v150H55Z" />
        <path
          d="M46 63c-20 9-35 20-46 34M70 85c32-16 58-23 78-20M63 116c-26 18-46 40-60 66"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M552 21h22v157h-22Z" />
        <path
          d="M561 55c-31 11-58 28-81 51M568 91c25-12 49-18 72-18M557 128c-22 14-38 31-48 52"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M428 46h17v129h-17Z" opacity="0.7" />
        <path
          d="M436 78c-21 11-39 24-54 41M441 98c23-10 42-13 57-9"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </g>

      <g transform="translate(382 99)" fill="rgb(var(--color-canvas))" opacity="0.58">
        <ellipse cx="35" cy="31" rx="31" ry="12" />
        <path
          d="M12 29 2 52M29 35l-3 28M46 35l4 28M62 30l11 24"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M56 18c19-23 30-25 36-8M55 17c23-8 34-5 37 9M17 17C-2-5-13-7-19 10M18 17c-23-8-34-4-37 10"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <g className="fr-predator-fog" fill="rgb(var(--color-muted))" opacity="0.18">
        <ellipse cx="164" cy="123" rx="124" ry="12" />
        <ellipse cx="408" cy="142" rx="160" ry="15" />
      </g>

      <path
        d="M0 153c58-23 111-29 160-17 59 15 107 11 144-10 53-30 119-32 197-5 49 17 95 20 139 8v91H0Z"
        fill="url(#predator-ground)"
      />
      <path
        d="M0 179c70-21 139-23 207-8 65 14 122 4 171-20 68-33 154-32 262 2v67H0Z"
        fill="rgb(var(--color-canvas))"
        opacity="0.42"
      />

      <g clipPath="url(#predator-ground-clip)">
        <path
          d="M276 148c-18 21-11 41 21 61M339 134c-6 28 9 51 44 69M463 139c-13 19-10 42 9 69"
          fill="none"
          stroke="rgb(var(--color-danger))"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M289 151l-24 19M305 156l-26 20M321 162l-27 19M357 140l-19 28M374 147l-21 29M391 155l-22 30"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.88"
        />
      </g>

      <g
        fill="rgb(var(--color-muted))"
        opacity="0.54"
        filter="url(#predator-soft-shadow)"
      >
        <ellipse cx="94" cy="177" rx="9" ry="5" transform="rotate(-22 94 177)" />
        <ellipse cx="123" cy="190" rx="9" ry="5" transform="rotate(-22 123 190)" />
        <ellipse cx="154" cy="176" rx="9" ry="5" transform="rotate(-22 154 176)" />
        <ellipse cx="184" cy="189" rx="9" ry="5" transform="rotate(-22 184 189)" />
      </g>
      <g fill="rgb(var(--color-canvas))" opacity="0.82">
        <circle cx="236" cy="176" r="5" />
        <circle cx="249" cy="170" r="4" />
        <circle cx="257" cy="181" r="4" />
        <ellipse cx="247" cy="188" rx="9" ry="5" />
        <circle cx="303" cy="188" r="5" />
        <circle cx="316" cy="181" r="4" />
        <circle cx="325" cy="192" r="4" />
        <ellipse cx="315" cy="199" rx="9" ry="5" />
      </g>

      <g
        transform="translate(132 125)"
        fill="rgb(var(--color-canvas))"
        filter="url(#predator-soft-shadow)"
      >
        <ellipse cx="47" cy="69" rx="42" ry="7" opacity="0.55" />
        <circle cx="37" cy="15" r="7" />
        <path d="M27 25c12-7 25-7 37 1l-9 38H34Z" />
        <path d="M33 60h10l-9 29H23Z" />
        <path d="M51 61h10l13 27H63Z" />
        <path d="M54 31l74-10 2 6-73 19Z" />
        <path
          d="M119 16l44 3"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M30 32 10 49"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      <g
        className="fr-predator-grass"
        fill="none"
        stroke="rgb(var(--color-success))"
        strokeLinecap="round"
        opacity="0.5"
      >
        <path d="M511 184c-7-24-2-42 15-55" strokeWidth="5" />
        <path d="M535 186c-10-27-7-49 10-66" strokeWidth="5" />
        <path d="M566 184c-7-23-3-40 13-51" strokeWidth="5" />
        <path d="M523 154l-19-8M547 148l18-14M572 156l19-10" strokeWidth="3" />
      </g>

      <g className="fr-predator-eyes" filter="url(#predator-eye-glow)">
        <ellipse cx="524" cy="111" rx="8" ry="4" fill="rgb(var(--color-cta))" />
        <ellipse cx="552" cy="111" rx="8" ry="4" fill="rgb(var(--color-cta))" />
        <circle cx="526" cy="111" r="2" fill="rgb(var(--color-canvas))" />
        <circle cx="550" cy="111" r="2" fill="rgb(var(--color-canvas))" />
      </g>
    </g>
  );
}

function StolenTackScene() {
  return (
    <g data-testid="stolen-tack-illustration">
      <defs>
        <linearGradient id="stolen-night-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.16" />
          <stop offset="46%" stopColor="rgb(var(--color-panel))" stopOpacity="0.44" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.96" />
        </linearGradient>
        <radialGradient id="stolen-moon-glow" cx="20%" cy="20%" r="54%">
          <stop offset="0%" stopColor="rgb(var(--color-foreground))" stopOpacity="0.38" />
          <stop offset="46%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.16" />
          <stop offset="100%" stopColor="rgb(var(--color-highlight))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="stolen-fire-glow" cx="71%" cy="60%" r="48%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.52" />
          <stop offset="45%" stopColor="rgb(var(--color-danger))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stolen-ground" x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-frontier-bark))"
            stopOpacity="0.5"
          />
          <stop offset="58%" stopColor="rgb(var(--color-panel))" stopOpacity="0.88" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="stolen-rail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--color-frontier-bark))" />
          <stop
            offset="50%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.72"
          />
          <stop offset="100%" stopColor="rgb(var(--color-frontier-bark))" />
        </linearGradient>
        <filter id="stolen-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.76"
          />
        </filter>
        <filter id="stolen-glint" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .fr-stolen-fog {
              animation: fr-stolen-fog-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-stolen-fire {
              animation: fr-stolen-fire-flicker 2.6s ease-in-out infinite alternate;
              transform-origin: 444px 139px;
            }

            .fr-stolen-lantern {
              animation: fr-stolen-lantern-glow 4.8s ease-in-out infinite alternate;
            }

            .fr-stolen-thief {
              animation: fr-stolen-shadow-shift 4.8s ease-in-out infinite alternate;
            }

            @keyframes fr-stolen-fog-drift {
              from { transform: translateX(-16px); opacity: 0.14; }
              to { transform: translateX(22px); opacity: 0.3; }
            }

            @keyframes fr-stolen-fire-flicker {
              from { transform: scaleY(0.92); opacity: 0.7; }
              to { transform: scaleY(1.08); opacity: 1; }
            }

            @keyframes fr-stolen-lantern-glow {
              from { opacity: 0.35; }
              to { opacity: 0.68; }
            }

            @keyframes fr-stolen-shadow-shift {
              from { transform: translateX(0); opacity: 0.62; }
              to { transform: translateX(5px); opacity: 0.82; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-stolen-fog,
              .fr-stolen-fire,
              .fr-stolen-lantern,
              .fr-stolen-thief {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#stolen-night-sky)" />
      <circle cx="120" cy="42" r="95" fill="url(#stolen-moon-glow)" />
      <circle cx="121" cy="43" r="21" fill="rgb(var(--color-foreground))" opacity="0.5" />
      <path
        d="M139 31c-7 17-4 30 10 39-22 0-35-11-35-28 0-14 9-25 25-31Z"
        fill="rgb(var(--color-canvas))"
        opacity="0.52"
      />

      <path
        d="M0 132c57-24 112-26 165-6 57 21 104 18 143-9 57-39 127-39 211 0 43 20 84 21 121 2v101H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.42"
      />
      <path
        d="M0 157c69-22 135-23 199-2 57 19 112 13 165-17 68-39 160-32 276 22v60H0Z"
        fill="url(#stolen-ground)"
      />
      <circle cx="452" cy="143" r="116" fill="url(#stolen-fire-glow)" />

      <g className="fr-stolen-fog" fill="rgb(var(--color-muted))" opacity="0.18">
        <ellipse cx="143" cy="126" rx="116" ry="12" />
        <ellipse cx="426" cy="119" rx="154" ry="14" />
      </g>

      <g opacity="0.44" fill="rgb(var(--color-canvas))">
        <path d="M402 132c18-45 85-45 103 0Z" />
        <path
          d="M380 132h150"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M409 132h15v39h-15ZM480 132h15v39h-15Z" />
      </g>

      <g className="fr-stolen-fire" filter="url(#stolen-glint)">
        <path
          d="M430 149c5-18 16-31 18-47 15 17 22 30 20 47Z"
          fill="rgb(var(--color-danger))"
          opacity="0.82"
        />
        <path
          d="M442 150c3-13 11-22 13-34 10 12 15 22 13 34Z"
          fill="rgb(var(--color-cta))"
          opacity="0.9"
        />
        <path
          d="M415 153h76"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      <g
        className="fr-stolen-thief"
        transform="translate(548 100)"
        fill="rgb(var(--color-canvas))"
        opacity="0.78"
      >
        <ellipse cx="26" cy="72" rx="35" ry="7" opacity="0.45" />
        <circle cx="23" cy="13" r="8" />
        <path d="M12 25c12-8 29-8 42 1l-8 42H25Z" />
        <path d="M24 64h9l-8 31H14Z" />
        <path d="M42 64h9l16 28H55Z" />
        <path
          d="M17 31-8 49"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M52 31 78 45"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <g fill="rgb(var(--color-canvas))" opacity="0.66">
        <ellipse cx="505" cy="170" rx="11" ry="5" transform="rotate(18 505 170)" />
        <ellipse cx="476" cy="182" rx="11" ry="5" transform="rotate(18 476 182)" />
        <ellipse cx="446" cy="172" rx="11" ry="5" transform="rotate(18 446 172)" />
        <ellipse cx="416" cy="184" rx="11" ry="5" transform="rotate(18 416 184)" />
        <ellipse cx="386" cy="175" rx="11" ry="5" transform="rotate(18 386 175)" />
      </g>

      <g filter="url(#stolen-soft-shadow)">
        <path
          d="M40 115h428c18 0 31 15 25 32l-18 54H61Z"
          fill="rgb(var(--color-canvas))"
          opacity="0.55"
        />
        <path
          d="M46 115h416"
          stroke="url(#stolen-rail)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M67 139h390"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M83 105v94M422 105v94"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </g>

      <g fill="none" strokeLinecap="round">
        <path
          d="M177 124c0 21-1 37-4 48"
          stroke="rgb(var(--color-parchment-dark))"
          strokeWidth="7"
        />
        <path
          d="M175 146c18 1 30-7 38-24"
          stroke="rgb(var(--color-parchment-dark))"
          strokeWidth="5"
          opacity="0.7"
        />
        <path
          d="M172 171c12 8 24 8 36 0"
          stroke="rgb(var(--color-parchment-dark))"
          strokeWidth="5"
          opacity="0.52"
        />
        <path
          d="M173 124l20-16"
          stroke="rgb(var(--color-danger))"
          strokeWidth="4"
          opacity="0.82"
        />
        <path
          d="M193 113l17-12"
          stroke="rgb(var(--color-foreground))"
          strokeWidth="3"
          opacity="0.8"
          filter="url(#stolen-glint)"
        />
      </g>

      <g
        fill="none"
        stroke="rgb(var(--color-muted))"
        strokeLinecap="round"
        opacity="0.68"
      >
        <path d="M247 119c0 18-6 29-17 34" strokeWidth="6" />
        <path d="M300 119c1 20-6 33-21 40" strokeWidth="6" />
        <path d="M345 119c-2 18-10 30-24 36" strokeWidth="6" />
        <path d="M227 153c28-5 50-3 66 6" strokeWidth="5" opacity="0.55" />
      </g>

      <g className="fr-stolen-lantern" filter="url(#stolen-glint)">
        <circle cx="238" cy="104" r="23" fill="rgb(var(--color-cta))" opacity="0.18" />
        <rect
          x="230"
          y="91"
          width="16"
          height="24"
          rx="4"
          fill="rgb(var(--color-canvas))"
          stroke="rgb(var(--color-cta))"
          strokeWidth="3"
        />
        <path
          d="M231 91c3-11 12-11 15 0"
          fill="none"
          stroke="rgb(var(--color-cta))"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function NightWatchSongScene() {
  return (
    <g data-testid="night-watch-song-illustration">
      <defs>
        <linearGradient id="night-song-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.18" />
          <stop offset="42%" stopColor="rgb(var(--color-panel))" stopOpacity="0.58" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.98" />
        </linearGradient>
        <radialGradient id="night-song-fire-glow" cx="50%" cy="70%" r="44%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.62" />
          <stop offset="46%" stopColor="rgb(var(--color-danger))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="night-song-star-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--color-foreground))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="rgb(var(--color-highlight))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="night-song-ground" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-surface))" stopOpacity="0.68" />
          <stop offset="56%" stopColor="rgb(var(--color-panel))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <filter id="night-song-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.72"
          />
        </filter>
        <filter id="night-song-warm-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .fr-night-song-fire {
              animation: fr-night-song-fire-flicker 2.7s ease-in-out infinite alternate;
              transform-origin: 320px 161px;
            }

            .fr-night-song-smoke {
              animation: fr-night-song-smoke-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-night-song-stars {
              animation: fr-night-song-star-shimmer 4.8s ease-in-out infinite alternate;
            }

            .fr-night-song-lit {
              animation: fr-night-song-light-pulse 3.8s ease-in-out infinite alternate;
            }

            @keyframes fr-night-song-fire-flicker {
              from { transform: scaleY(0.9) translateY(3px); opacity: 0.76; }
              to { transform: scaleY(1.08) translateY(-2px); opacity: 1; }
            }

            @keyframes fr-night-song-smoke-drift {
              from { transform: translateX(-8px); opacity: 0.14; }
              to { transform: translateX(14px); opacity: 0.31; }
            }

            @keyframes fr-night-song-star-shimmer {
              from { opacity: 0.48; }
              to { opacity: 0.9; }
            }

            @keyframes fr-night-song-light-pulse {
              from { opacity: 0.64; }
              to { opacity: 0.92; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-night-song-fire,
              .fr-night-song-smoke,
              .fr-night-song-stars,
              .fr-night-song-lit {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#night-song-sky)" />
      <g className="fr-night-song-stars">
        {[72, 118, 168, 235, 292, 358, 412, 486, 536, 590].map((x, index) => (
          <circle
            key={x}
            cx={x}
            cy={24 + (index % 4) * 18}
            r={index % 3 === 0 ? 2.2 : 1.4}
            fill="url(#night-song-star-glow)"
          />
        ))}
        <path
          d="M454 32h14M461 25v14M86 62h10M91 57v10"
          stroke="rgb(var(--color-foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      <path
        d="M0 124 67 92l53 17 64-39 81 50 71-35 63 36 82-53 75 46 84-31v137H0Z"
        fill="rgb(var(--color-highlight))"
        opacity="0.14"
      />
      <path
        d="M0 148c72-24 132-26 181-7 56 22 104 18 145-9 61-40 137-39 229 4 31 14 59 18 85 10v74H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.48"
      />
      <path
        d="M0 169c73-23 139-25 198-8 57 16 110 11 160-16 68-37 162-27 282 30v45H0Z"
        fill="url(#night-song-ground)"
      />

      <g opacity="0.46" fill="rgb(var(--color-canvas))">
        <path d="M68 127h118l-15-43H86Z" />
        <path
          d="M86 84c12-35 70-35 84 0"
          fill="none"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
        />
        <circle cx="91" cy="136" r="12" />
        <circle cx="165" cy="136" r="12" />
        <path
          d="M54 142h150"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      <circle cx="320" cy="160" r="118" fill="url(#night-song-fire-glow)" />

      <g
        className="fr-night-song-smoke"
        fill="none"
        stroke="rgb(var(--color-muted))"
        strokeLinecap="round"
        opacity="0.2"
      >
        <path d="M304 135c-23-22 24-28 4-54-13-17 3-29 22-36" strokeWidth="8" />
        <path d="M331 135c31-18-10-34 24-58 17-12 15-28-4-43" strokeWidth="7" />
        <path d="M284 145c-37-15-15-34-35-48" strokeWidth="6" />
      </g>

      <g
        className="fr-night-song-lit"
        fill="rgb(var(--color-canvas))"
        filter="url(#night-song-soft-shadow)"
      >
        <g transform="translate(216 136)">
          <ellipse cx="21" cy="52" rx="28" ry="6" opacity="0.42" />
          <circle cx="22" cy="12" r="8" />
          <path d="M10 24c9-7 25-8 36 0l-8 32H18Z" />
          <path d="M18 54h9l-7 24H10Z" />
          <path d="M34 54h9l10 23H43Z" />
        </g>
        <g transform="translate(382 135)">
          <ellipse cx="24" cy="53" rx="30" ry="6" opacity="0.42" />
          <circle cx="24" cy="12" r="8" />
          <path d="M12 24c10-7 27-7 38 1l-8 32H20Z" />
          <path d="M20 55h9l-7 24H12Z" />
          <path d="M37 55h9l11 23H47Z" />
        </g>
        <g transform="translate(294 126)">
          <ellipse cx="30" cy="68" rx="36" ry="7" opacity="0.48" />
          <circle cx="24" cy="13" r="8" />
          <path d="M12 25c12-8 29-8 42 1l-8 39H24Z" />
          <path d="M23 63h9l-8 27H14Z" />
          <path d="M41 63h9l13 26H52Z" />
          <path
            d="M51 30c20 3 36 12 48 25"
            stroke="rgb(var(--color-canvas))"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M80 42l18 15M87 35l19 15"
            stroke="rgb(var(--color-canvas))"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M9 33-11 50"
            stroke="rgb(var(--color-canvas))"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      </g>

      <g className="fr-night-song-fire" filter="url(#night-song-warm-glow)">
        <path
          d="M294 171c7-23 20-38 24-62 20 23 30 42 27 62Z"
          fill="rgb(var(--color-danger))"
          opacity="0.9"
        />
        <path
          d="M314 171c4-17 15-28 18-44 14 17 21 31 18 44Z"
          fill="rgb(var(--color-cta))"
          opacity="0.95"
        />
        <path
          d="M281 176h84"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M292 183h61"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      <g fill="none" stroke="rgb(var(--color-cta))" strokeLinecap="round" opacity="0.42">
        <path d="M405 123c11-11 22-11 33 0" strokeWidth="3" />
        <path d="M411 113c9-9 18-9 27 0" strokeWidth="2.5" />
        <path d="M419 104c6-6 12-6 18 0" strokeWidth="2" />
      </g>
    </g>
  );
}

function RattlesnakeStrikeScene() {
  return (
    <g data-testid="rattlesnake-strike-illustration">
      <defs>
        <linearGradient id="snake-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.42" />
          <stop
            offset="52%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.2"
          />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.16" />
        </linearGradient>
        <radialGradient id="snake-danger-glow" cx="42%" cy="70%" r="36%">
          <stop offset="0%" stopColor="rgb(var(--color-danger))" stopOpacity="0.42" />
          <stop offset="54%" stopColor="rgb(var(--color-cta))" stopOpacity="0.16" />
          <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="snake-ground" x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.56"
          />
          <stop
            offset="50%"
            stopColor="rgb(var(--color-frontier-trail))"
            stopOpacity="0.76"
          />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="snake-scales" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--color-frontier-bark))" />
          <stop
            offset="44%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.72"
          />
          <stop offset="100%" stopColor="rgb(var(--color-frontier-bark))" />
        </linearGradient>
        <filter id="snake-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.72"
          />
        </filter>
        <filter id="snake-hot-glint" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .fr-snake-dust {
              animation: fr-snake-dust-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-snake-rattle {
              animation: fr-snake-rattle-shake 1.4s ease-in-out infinite alternate;
              transform-origin: 244px 151px;
            }

            .fr-snake-grass {
              animation: fr-snake-grass-twitch 3.8s ease-in-out infinite alternate;
              transform-origin: bottom center;
            }

            .fr-snake-danger {
              animation: fr-snake-danger-pulse 3.4s ease-in-out infinite alternate;
            }

            @keyframes fr-snake-dust-drift {
              from { transform: translateX(-8px); opacity: 0.18; }
              to { transform: translateX(18px); opacity: 0.36; }
            }

            @keyframes fr-snake-rattle-shake {
              from { transform: rotate(-2deg); }
              to { transform: rotate(3deg); }
            }

            @keyframes fr-snake-grass-twitch {
              from { transform: skewX(-2deg); opacity: 0.48; }
              to { transform: skewX(3deg); opacity: 0.72; }
            }

            @keyframes fr-snake-danger-pulse {
              from { opacity: 0.4; }
              to { opacity: 0.76; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-snake-dust,
              .fr-snake-rattle,
              .fr-snake-grass,
              .fr-snake-danger {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#snake-sky)" />
      <circle cx="506" cy="36" r="112" fill="rgb(var(--color-cta))" opacity="0.12" />
      <path
        d="M0 124c64-22 116-24 156-6 61 27 108 14 154-9 61-31 126-25 197 8 51 24 95 25 133 3v100H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.46"
      />
      <path
        d="M0 153c69-24 137-29 204-14 61 14 112 6 154-23 59-41 153-25 282 46v58H0Z"
        fill="url(#snake-ground)"
      />
      <circle
        className="fr-snake-danger"
        cx="272"
        cy="157"
        r="92"
        fill="url(#snake-danger-glow)"
      />

      <g className="fr-snake-dust" fill="rgb(var(--color-parchment))" opacity="0.26">
        <ellipse cx="118" cy="146" rx="42" ry="9" />
        <ellipse cx="161" cy="137" rx="28" ry="7" />
        <ellipse cx="205" cy="131" rx="20" ry="5" />
      </g>

      <g
        fill="rgb(var(--color-frontier-bark))"
        opacity="0.86"
        filter="url(#snake-soft-shadow)"
      >
        <ellipse cx="386" cy="169" rx="36" ry="12" />
        <ellipse cx="470" cy="151" rx="24" ry="9" />
        <ellipse cx="103" cy="179" rx="42" ry="13" />
        <ellipse cx="555" cy="187" rx="52" ry="14" />
      </g>
      <g fill="rgb(var(--color-muted))" opacity="0.32">
        <ellipse cx="384" cy="164" rx="24" ry="6" />
        <ellipse cx="468" cy="147" rx="16" ry="5" />
        <ellipse cx="101" cy="174" rx="27" ry="7" />
      </g>

      <g
        className="fr-snake-grass"
        fill="none"
        stroke="rgb(var(--color-success))"
        strokeLinecap="round"
        opacity="0.52"
      >
        <path d="M52 186c-6-27-2-47 14-60" strokeWidth="5" />
        <path d="M79 187c-10-31-6-55 12-74" strokeWidth="5" />
        <path d="M112 185c-6-25-1-43 16-55" strokeWidth="5" />
        <path d="M433 178c-7-24-2-41 14-52" strokeWidth="5" />
        <path d="M463 177c-8-25-5-45 10-59" strokeWidth="5" />
        <path
          d="M65 151l-17-9M93 145l17-14M121 153l18-9M447 151l-16-8M475 145l16-12"
          strokeWidth="3"
        />
      </g>

      <g transform="translate(382 64)" filter="url(#snake-soft-shadow)">
        <path d="M72 0h43l-18 93H52Z" fill="rgb(var(--color-canvas))" />
        <path d="M54 91h52l14 51H67Z" fill="rgb(var(--color-frontier-bark))" />
        <path
          d="M63 139h74c5 17-6 25-30 25H64c-16 0-24-8-24-23Z"
          fill="rgb(var(--color-canvas))"
        />
        <path
          d="M59 92h51"
          stroke="rgb(var(--color-parchment-dark))"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.48"
        />
      </g>

      <g filter="url(#snake-soft-shadow)">
        <path
          d="M211 160c-1-34 56-43 80-20 20 19-5 44-42 39-29-4-30-25-10-31 20-6 38 12 24 25"
          fill="none"
          stroke="url(#snake-scales)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M301 139c18-19 39-22 63-9"
          fill="none"
          stroke="url(#snake-scales)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path d="M358 130l25-18 10 17-28 10Z" fill="rgb(var(--color-frontier-bark))" />
        <circle
          cx="382"
          cy="124"
          r="2.4"
          fill="rgb(var(--color-cta))"
          filter="url(#snake-hot-glint)"
        />
        <path
          d="M394 128l16-5M394 130l16 5"
          stroke="rgb(var(--color-danger))"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.82"
        />
        <g className="fr-snake-rattle">
          <path
            d="M215 160l-31 5"
            stroke="rgb(var(--color-parchment-dark))"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M180 165l-12-7M179 166l-10 9"
            stroke="rgb(var(--color-parchment-dark))"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </g>

      <g
        fill="none"
        stroke="rgb(var(--color-parchment-dark))"
        strokeLinecap="round"
        opacity="0.52"
      >
        <path
          d="M221 147c13 5 25 5 37 0M246 137c13 4 25 4 37-1M285 139c13 5 25 5 37 0"
          strokeWidth="3"
        />
        <path
          d="M207 168c14 7 29 7 45 1M247 179c20 4 37 1 51-10"
          strokeWidth="2.5"
          opacity="0.7"
        />
      </g>

      <path
        d="M0 201c72-20 135-22 190-7 46 13 91 10 134-7 53-21 117-17 191 12 44 17 86 16 125-2v23H0Z"
        fill="rgb(var(--color-canvas))"
        opacity="0.46"
      />
    </g>
  );
}

function GuideForAmmoScene() {
  return (
    <g data-testid="guide-for-ammo-illustration">
      <defs>
        <linearGradient id="guide-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.42" />
          <stop offset="46%" stopColor="rgb(var(--color-danger))" stopOpacity="0.16" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="guide-sunset-glow" cx="76%" cy="22%" r="58%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.72" />
          <stop offset="46%" stopColor="rgb(var(--color-cta))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="guide-ground" x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.48"
          />
          <stop
            offset="55%"
            stopColor="rgb(var(--color-frontier-trail))"
            stopOpacity="0.72"
          />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="guide-trail" x1="0" x2="1" y1="0" y2="0">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.7"
          />
          <stop offset="58%" stopColor="rgb(var(--color-cta))" stopOpacity="0.34" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.36" />
        </linearGradient>
        <filter id="guide-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.7"
          />
        </filter>
        <filter id="guide-warm-glint" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .fr-guide-dust {
              animation: fr-guide-dust-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-guide-glow {
              animation: fr-guide-sunset-pulse 5s ease-in-out infinite alternate;
            }

            .fr-guide-cloth {
              animation: fr-guide-cloth-shift 4.4s ease-in-out infinite alternate;
              transform-origin: 322px 92px;
            }

            @keyframes fr-guide-dust-drift {
              from { transform: translateX(-14px); opacity: 0.18; }
              to { transform: translateX(22px); opacity: 0.34; }
            }

            @keyframes fr-guide-sunset-pulse {
              from { opacity: 0.48; }
              to { opacity: 0.72; }
            }

            @keyframes fr-guide-cloth-shift {
              from { transform: skewX(-1deg); opacity: 0.72; }
              to { transform: skewX(3deg); opacity: 0.9; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-guide-dust,
              .fr-guide-glow,
              .fr-guide-cloth {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#guide-sky)" />
      <circle
        className="fr-guide-glow"
        cx="500"
        cy="43"
        r="116"
        fill="url(#guide-sunset-glow)"
      />
      <circle cx="507" cy="45" r="24" fill="rgb(var(--color-cta))" opacity="0.68" />

      <path
        d="M0 124 63 92l58 20 65-47 78 57 78-34 64 35 81-51 71 43 82-28v133H0Z"
        fill="rgb(var(--color-highlight))"
        opacity="0.14"
      />
      <path
        d="M0 148c73-26 133-28 180-6 59 27 111 20 154-10 64-45 141-40 230 16 27 17 52 20 76 10v62H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.52"
      />
      <path
        d="M0 167c76-23 143-25 201-6 58 19 112 10 163-25 67-46 159-35 276 34v50H0Z"
        fill="url(#guide-ground)"
      />

      <path
        d="M300 220c8-38 31-62 68-73 41-13 62-31 64-55"
        fill="none"
        stroke="url(#guide-trail)"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.62"
      />
      <path
        d="M333 220c-7-35-31-58-71-69-50-14-82-34-95-60"
        fill="none"
        stroke="url(#guide-trail)"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.48"
      />
      <path
        d="M313 220c2-29 16-49 41-61 37-18 57-39 60-65"
        fill="none"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.4"
      />

      <g opacity="0.42" fill="rgb(var(--color-canvas))">
        <path d="M72 137h114l-14-44H88Z" />
        <path
          d="M90 93c13-35 69-35 82 0"
          fill="none"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
        />
        <circle cx="94" cy="146" r="12" />
        <circle cx="166" cy="146" r="12" />
        <path
          d="M56 151h151"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      <g filter="url(#guide-soft-shadow)">
        <path
          d="M426 91v97"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M394 103h84l-12 25h-72Z"
          fill="rgb(var(--color-parchment-dark))"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="4"
        />
        <path
          d="M404 115h26M441 115h17"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M426 128 397 155M426 128l28 25"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      <g className="fr-guide-dust" fill="rgb(var(--color-parchment))" opacity="0.24">
        <ellipse cx="224" cy="160" rx="50" ry="10" />
        <ellipse cx="301" cy="149" rx="34" ry="7" />
        <ellipse cx="487" cy="146" rx="45" ry="8" />
      </g>

      <g
        transform="translate(274 83)"
        fill="rgb(var(--color-canvas))"
        filter="url(#guide-soft-shadow)"
      >
        <ellipse cx="28" cy="98" rx="40" ry="8" opacity="0.48" />
        <circle cx="28" cy="15" r="8" />
        <path d="M15 27c12-8 29-8 43 0l-9 48H24Z" />
        <path
          className="fr-guide-cloth"
          d="M49 29c17 7 26 20 27 37l-25-8Z"
          fill="rgb(var(--color-frontier-bark))"
        />
        <path d="M22 73h10l-8 34H12Z" />
        <path d="M43 73h10l16 32H58Z" />
        <path
          d="M53 35 93 54"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M16 36-22 54"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(178 118)" filter="url(#guide-soft-shadow)">
        <ellipse
          cx="55"
          cy="60"
          rx="44"
          ry="8"
          fill="rgb(var(--color-canvas))"
          opacity="0.42"
        />
        <path
          d="M17 27h63l-7 34H26Z"
          fill="rgb(var(--color-frontier-bark))"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="5"
        />
        <path d="M28 19h43l7 10H20Z" fill="rgb(var(--color-parchment-dark))" />
        <circle
          cx="33"
          cy="41"
          r="4"
          fill="rgb(var(--color-cta))"
          filter="url(#guide-warm-glint)"
        />
        <circle cx="48" cy="41" r="4" fill="rgb(var(--color-cta))" />
        <circle cx="63" cy="41" r="4" fill="rgb(var(--color-cta))" />
        <path
          d="M84 35h28"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M106 35l24-12"
          stroke="rgb(var(--color-cta))"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      <g
        fill="none"
        stroke="rgb(var(--color-success))"
        strokeLinecap="round"
        opacity="0.45"
      >
        <path d="M519 181c-8-28-4-48 14-62" strokeWidth="5" />
        <path d="M548 181c-11-31-8-55 10-72" strokeWidth="5" />
        <path d="M583 180c-7-25-2-43 15-55" strokeWidth="5" />
        <path d="M531 147l-18-10M558 143l18-14M591 151l20-10" strokeWidth="3" />
      </g>
    </g>
  );
}

function RationDisputeScene() {
  return (
    <g data-testid="ration-dispute-illustration">
      <defs>
        <linearGradient id="ration-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.34" />
          <stop offset="48%" stopColor="rgb(var(--color-danger))" stopOpacity="0.14" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0.38" />
        </linearGradient>
        <radialGradient id="ration-lantern-glow" cx="58%" cy="55%" r="46%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.58" />
          <stop offset="48%" stopColor="rgb(var(--color-danger))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ration-ground" x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-frontier-trail))"
            stopOpacity="0.62"
          />
          <stop offset="58%" stopColor="rgb(var(--color-panel))" stopOpacity="0.88" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="ration-sack" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-parchment))" stopOpacity="0.9" />
          <stop
            offset="100%"
            stopColor="rgb(var(--color-parchment-dark))"
            stopOpacity="0.72"
          />
        </linearGradient>
        <filter id="ration-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="3"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.72"
          />
        </filter>
        <filter id="ration-warm-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .fr-ration-dust {
              animation: fr-ration-dust-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-ration-lantern {
              animation: fr-ration-lantern-flicker 3.4s ease-in-out infinite alternate;
            }

            .fr-ration-gesture {
              animation: fr-ration-gesture-pulse 4.2s ease-in-out infinite alternate;
              transform-origin: 236px 119px;
            }

            @keyframes fr-ration-dust-drift {
              from { transform: translateX(-12px); opacity: 0.16; }
              to { transform: translateX(18px); opacity: 0.32; }
            }

            @keyframes fr-ration-lantern-flicker {
              from { opacity: 0.46; }
              to { opacity: 0.76; }
            }

            @keyframes fr-ration-gesture-pulse {
              from { transform: rotate(-1deg); }
              to { transform: rotate(2deg); }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-ration-dust,
              .fr-ration-lantern,
              .fr-ration-gesture {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill="url(#ration-sky)" />
      <circle
        className="fr-ration-lantern"
        cx="374"
        cy="121"
        r="116"
        fill="url(#ration-lantern-glow)"
      />
      <path
        d="M0 132c62-25 119-28 170-8 60 23 112 17 157-14 63-43 140-37 232 17 31 18 58 21 81 10v83H0Z"
        fill="rgb(var(--color-surface))"
        opacity="0.5"
      />
      <path
        d="M0 160c76-23 145-24 207-4 59 19 113 10 162-22 67-44 157-34 271 32v54H0Z"
        fill="url(#ration-ground)"
      />

      <g opacity="0.38" fill="rgb(var(--color-canvas))">
        <path d="M468 121h105l-13-40h-78Z" />
        <path
          d="M485 81c12-32 62-32 74 0"
          fill="none"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
        />
        <circle cx="488" cy="130" r="11" />
        <circle cx="555" cy="130" r="11" />
        <path
          d="M452 135h139"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      <g className="fr-ration-dust" fill="rgb(var(--color-parchment))" opacity="0.2">
        <ellipse cx="226" cy="159" rx="55" ry="10" />
        <ellipse cx="334" cy="147" rx="48" ry="9" />
        <ellipse cx="458" cy="151" rx="42" ry="8" />
      </g>

      <g transform="translate(281 124)" filter="url(#ration-soft-shadow)">
        <ellipse
          cx="52"
          cy="60"
          rx="86"
          ry="11"
          fill="rgb(var(--color-canvas))"
          opacity="0.36"
        />
        <path
          d="M8 35h78v32H8Z"
          fill="rgb(var(--color-frontier-bark))"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="5"
        />
        <path
          d="M24 13h48l11 22H13Z"
          fill="rgb(var(--color-frontier-bark))"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="4"
        />
        <path
          d="M95 24c22-13 48-8 58 15l-14 31H99Z"
          fill="url(#ration-sack)"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="4"
        />
        <path
          d="M107 35c15 8 27 8 38 0M116 53h21"
          stroke="rgb(var(--color-frontier-bark))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.58"
        />
        <path
          d="M-10 54c24-17 48-18 72-3"
          stroke="rgb(var(--color-parchment-dark))"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M-1 47c12 5 23 5 33 0M31 47c12 5 23 5 33 0"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      <g
        transform="translate(177 92)"
        fill="rgb(var(--color-canvas))"
        filter="url(#ration-soft-shadow)"
      >
        <ellipse cx="39" cy="95" rx="42" ry="8" opacity="0.48" />
        <circle cx="36" cy="15" r="8" />
        <path d="M22 27c13-8 31-8 45 1l-9 47H31Z" />
        <path d="M31 73h10l-9 34H20Z" />
        <path d="M53 73h10l16 32H67Z" />
        <path
          className="fr-ration-gesture"
          d="M61 35l80 26"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M24 35-7 53"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <g
        transform="translate(410 91)"
        fill="rgb(var(--color-canvas))"
        filter="url(#ration-soft-shadow)"
      >
        <ellipse cx="37" cy="96" rx="42" ry="8" opacity="0.48" />
        <circle cx="37" cy="15" r="8" />
        <path d="M22 27c13-8 31-8 45 1l-8 47H31Z" />
        <path d="M31 73h10l-9 34H20Z" />
        <path d="M53 73h10l17 32H68Z" />
        <path
          d="M25 36-18 42"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M62 36l28-21"
          stroke="rgb(var(--color-canvas))"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <g fill="rgb(var(--color-canvas))" opacity="0.66">
        <g transform="translate(84 121)">
          <ellipse cx="22" cy="59" rx="28" ry="6" opacity="0.42" />
          <circle cx="22" cy="12" r="7" />
          <path d="M11 24c10-7 24-7 34 0l-7 31H18Z" />
          <path d="M18 53h8l-7 23H10Z" />
          <path d="M33 53h8l10 22H41Z" />
        </g>
        <g transform="translate(530 122)">
          <ellipse cx="22" cy="58" rx="28" ry="6" opacity="0.42" />
          <circle cx="22" cy="12" r="7" />
          <path d="M11 24c10-7 24-7 34 0l-7 31H18Z" />
          <path d="M18 53h8l-7 23H10Z" />
          <path d="M33 53h8l10 22H41Z" />
        </g>
      </g>

      <g filter="url(#ration-warm-glow)">
        <rect
          x="361"
          y="94"
          width="19"
          height="30"
          rx="5"
          fill="rgb(var(--color-canvas))"
          stroke="rgb(var(--color-cta))"
          strokeWidth="3"
        />
        <path
          d="M363 94c3-13 14-13 17 0"
          fill="none"
          stroke="rgb(var(--color-cta))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="371" cy="114" r="20" fill="rgb(var(--color-cta))" opacity="0.16" />
      </g>
    </g>
  );
}

function Wagon({ x, y, broken }: { x: number; y: number; broken: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 34h122l-16-52H18Z"
        fill="rgb(var(--color-frontier-bark))"
        stroke="rgb(var(--color-cta))"
        strokeWidth="5"
      />
      <path
        d="M17-18c17-42 72-42 89 0"
        fill="none"
        stroke="rgb(var(--color-foreground))"
        strokeWidth="8"
      />
      <circle
        cx="28"
        cy="45"
        r="17"
        fill="rgb(var(--color-canvas))"
        stroke="rgb(var(--color-highlight))"
        strokeWidth="6"
      />
      <circle
        cx="94"
        cy="45"
        r="17"
        fill="rgb(var(--color-canvas))"
        stroke={broken ? 'rgb(var(--color-danger))' : 'rgb(var(--color-highlight))'}
        strokeWidth="6"
      />
      {broken ? (
        <path
          d="M80 31l28 28M108 31 80 59"
          stroke="rgb(var(--color-danger))"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ) : null}
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
