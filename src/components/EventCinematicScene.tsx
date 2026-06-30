import type {
  EventSceneConfig,
  EventSceneFigure,
  EventSceneMood,
  EventSceneProp,
} from '@game/systems/eventIllustrations';

type SceneProps = {
  config: EventSceneConfig;
};

const moodSky: Record<EventSceneMood, [string, string, string]> = {
  campfire: ['var(--color-highlight)', 'var(--color-panel)', 'var(--color-canvas)'],
  danger: ['var(--color-danger)', 'var(--color-panel)', 'var(--color-canvas)'],
  dust: ['var(--color-cta)', 'var(--color-frontier-trail)', 'var(--color-canvas)'],
  market: ['var(--color-cta)', 'var(--color-parchment-dark)', 'var(--color-panel)'],
  moon: ['var(--color-highlight)', 'var(--color-panel)', 'var(--color-canvas)'],
  prairie: ['var(--color-cta)', 'var(--color-parchment-dark)', 'var(--color-panel)'],
  sick: ['var(--color-danger)', 'var(--color-panel)', 'var(--color-canvas)'],
  storm: ['var(--color-muted)', 'var(--color-border)', 'var(--color-canvas)'],
  sunset: ['var(--color-cta)', 'var(--color-danger)', 'var(--color-canvas)'],
  water: ['var(--color-highlight)', 'var(--color-success-deep)', 'var(--color-canvas)'],
};

export function EventCinematicScene({ config }: SceneProps) {
  const sceneId = config.id.replaceAll('-', '_');
  const testId =
    config.id === 'snakebite'
      ? 'rattlesnake-strike-illustration'
      : `${config.id}-illustration`;
  const [skyTop, skyMid, skyBottom] = moodSky[config.mood];
  const isNight = config.light === 'moon' || config.mood === 'moon';
  const hasFire = config.props.includes('campfire') || config.light === 'fire';
  const hasWater = config.props.includes('river');
  const hasDust =
    config.mood === 'dust' ||
    config.mood === 'prairie' ||
    config.mood === 'sunset' ||
    config.props.includes('dust_wall');

  return (
    <g data-event-scene-id={config.id} data-testid={testId}>
      <defs>
        <linearGradient id={`${sceneId}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={`rgb(${skyTop})`} stopOpacity="0.34" />
          <stop offset="48%" stopColor={`rgb(${skyMid})`} stopOpacity="0.46" />
          <stop offset="100%" stopColor={`rgb(${skyBottom})`} stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id={`${sceneId}-ground`} x1="0" x2="1" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--color-frontier-trail))"
            stopOpacity="0.58"
          />
          <stop offset="56%" stopColor="rgb(var(--color-panel))" stopOpacity="0.88" />
          <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="1" />
        </linearGradient>
        <radialGradient id={`${sceneId}-warm`} cx="58%" cy="48%" r="58%">
          <stop offset="0%" stopColor="rgb(var(--color-cta))" stopOpacity="0.58" />
          <stop offset="44%" stopColor="rgb(var(--color-danger))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${sceneId}-cold`} cx="20%" cy="22%" r="55%">
          <stop offset="0%" stopColor="rgb(var(--color-foreground))" stopOpacity="0.36" />
          <stop offset="48%" stopColor="rgb(var(--color-highlight))" stopOpacity="0.14" />
          <stop offset="100%" stopColor="rgb(var(--color-highlight))" stopOpacity="0" />
        </radialGradient>
        <filter id={`${sceneId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            floodColor="rgb(var(--color-canvas))"
            floodOpacity="0.7"
            stdDeviation="3"
          />
        </filter>
        <filter id={`${sceneId}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur result="blur" stdDeviation="2" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .fr-cinematic-dust {
              animation: fr-cinematic-dust-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-cinematic-fire {
              animation: fr-cinematic-fire-flicker 2.8s ease-in-out infinite alternate;
              transform-origin: 320px 160px;
            }

            .fr-cinematic-water {
              animation: fr-cinematic-water-shimmer 4.8s ease-in-out infinite alternate;
            }

            .fr-cinematic-glow {
              animation: fr-cinematic-glow-pulse 4.8s ease-in-out infinite alternate;
            }

            .fr-cinematic-fog {
              animation: fr-cinematic-fog-drift 4.8s ease-in-out infinite alternate;
            }

            .fr-cinematic-grass {
              animation: fr-cinematic-grass-shift 4.8s ease-in-out infinite alternate;
              transform-origin: bottom center;
            }

            @keyframes fr-cinematic-dust-drift {
              from { transform: translateX(-16px); opacity: 0.16; }
              to { transform: translateX(22px); opacity: 0.34; }
            }

            @keyframes fr-cinematic-fire-flicker {
              from { transform: scaleY(0.9); opacity: 0.72; }
              to { transform: scaleY(1.08); opacity: 1; }
            }

            @keyframes fr-cinematic-water-shimmer {
              from { opacity: 0.36; }
              to { opacity: 0.68; }
            }

            @keyframes fr-cinematic-glow-pulse {
              from { opacity: 0.42; }
              to { opacity: 0.74; }
            }

            @keyframes fr-cinematic-fog-drift {
              from { transform: translateX(-12px); opacity: 0.12; }
              to { transform: translateX(18px); opacity: 0.28; }
            }

            @keyframes fr-cinematic-grass-shift {
              from { transform: skewX(-1deg); opacity: 0.48; }
              to { transform: skewX(3deg); opacity: 0.7; }
            }

            @media (prefers-reduced-motion: reduce) {
              .fr-cinematic-dust,
              .fr-cinematic-fire,
              .fr-cinematic-water,
              .fr-cinematic-glow,
              .fr-cinematic-fog,
              .fr-cinematic-grass {
                animation: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width="640" height="220" fill={`url(#${sceneId}-sky)`} />
      {isNight ? <NightSky /> : <SunsetLight sceneId={sceneId} />}
      <Horizon mood={config.mood} />
      <rect y="148" width="640" height="72" fill={`url(#${sceneId}-ground)`} />
      {hasWater ? <Water sceneId={sceneId} /> : null}
      <Trail focus={config.focus} />
      {hasDust ? <Dust /> : null}
      {config.mood === 'moon' || config.mood === 'sick' ? <Fog /> : null}
      <PropsLayer props={config.props} sceneId={sceneId} />
      <FiguresLayer figures={config.figures} sceneId={sceneId} />
      {hasFire ? <Campfire sceneId={sceneId} /> : null}
      <ForegroundBrush />
    </g>
  );
}

function SunsetLight({ sceneId }: { sceneId: string }) {
  return (
    <>
      <circle
        className="fr-cinematic-glow"
        cx="508"
        cy="42"
        r="112"
        fill={`url(#${sceneId}-warm)`}
      />
      <circle cx="514" cy="45" r="23" fill="rgb(var(--color-cta))" opacity="0.62" />
    </>
  );
}

function NightSky() {
  return (
    <>
      <circle cx="124" cy="42" r="96" fill="rgb(var(--color-highlight))" opacity="0.12" />
      <circle cx="124" cy="42" r="20" fill="rgb(var(--color-foreground))" opacity="0.5" />
      <g className="fr-cinematic-glow">
        {[68, 116, 174, 238, 305, 372, 445, 512, 574].map((x, index) => (
          <circle
            key={x}
            cx={x}
            cy={24 + (index % 4) * 18}
            r={index % 3 === 0 ? 2 : 1.2}
            fill="rgb(var(--color-foreground))"
            opacity="0.7"
          />
        ))}
      </g>
    </>
  );
}

function Horizon({ mood }: { mood: EventSceneMood }) {
  const stormOpacity = mood === 'storm' ? 0.7 : 0.42;

  return (
    <>
      <path
        d="M0 126 69 88l56 25 65-50 79 59 71-39 61 41 82-56 74 45 83-30v137H0Z"
        fill="rgb(var(--color-highlight))"
        opacity="0.14"
      />
      <path
        d="M0 145c70-28 128-30 175-7 59 29 111 20 156-10 64-43 139-38 226 10 32 18 60 21 83 10v72H0Z"
        fill="rgb(var(--color-surface))"
        opacity={stormOpacity}
      />
    </>
  );
}

function Trail({ focus }: { focus: EventSceneConfig['focus'] }) {
  if (focus === 'camp' || focus === 'supplies' || focus === 'market') {
    return null;
  }

  return (
    <path
      d="M290 220c10-38 33-62 69-74 43-14 65-33 66-58"
      fill="none"
      stroke="rgb(var(--color-cta))"
      strokeLinecap="round"
      strokeWidth={focus === 'trail' ? 18 : 10}
      opacity="0.32"
    />
  );
}

function Water({ sceneId }: { sceneId: string }) {
  return (
    <path
      className="fr-cinematic-water"
      d="M366 145c55-16 123-12 203 12-73 22-139 24-199 6-18-6-20-13-4-18Z"
      fill="rgb(var(--color-highlight))"
      opacity="0.46"
      stroke={`url(#${sceneId}-cold)`}
      strokeWidth="5"
    />
  );
}

function Dust() {
  return (
    <g className="fr-cinematic-dust" fill="rgb(var(--color-parchment))" opacity="0.22">
      <ellipse cx="177" cy="154" rx="48" ry="9" />
      <ellipse cx="284" cy="145" rx="40" ry="8" />
      <ellipse cx="468" cy="151" rx="46" ry="8" />
    </g>
  );
}

function Fog() {
  return (
    <g className="fr-cinematic-fog" fill="rgb(var(--color-muted))" opacity="0.18">
      <ellipse cx="162" cy="126" rx="120" ry="12" />
      <ellipse cx="412" cy="136" rx="154" ry="14" />
    </g>
  );
}

function PropsLayer({ props, sceneId }: { props: EventSceneProp[]; sceneId: string }) {
  return (
    <g>
      {props.includes('wagon') ? <WagonSilhouette x={62} y={94} scale={0.9} /> : null}
      {props.includes('broken_wagon') ? (
        <WagonSilhouette x={66} y={106} scale={0.9} broken />
      ) : null}
      {props.includes('campfire') ? null : null}
      {props.includes('crates') ||
      props.includes('supplies') ||
      props.includes('food') ? (
        <Supplies x={300} y={132} food={props.includes('food')} />
      ) : null}
      {props.includes('ammo') ? <AmmoBox x={194} y={142} sceneId={sceneId} /> : null}
      {props.includes('medicine') ? <Medicine x={424} y={132} /> : null}
      {props.includes('tools') || props.includes('wagon_repair') ? (
        <Tools x={420} y={146} />
      ) : null}
      {props.includes('signpost') ? <Signpost x={438} y={92} /> : null}
      {props.includes('bridge') ? <Bridge /> : null}
      {props.includes('river') ? <Creek /> : null}
      {props.includes('animal_tracks') || props.includes('warning_tracks') ? (
        <Tracks danger={props.includes('warning_tracks')} />
      ) : null}
      {props.includes('claw_marks') ? <ClawMarks /> : null}
      {props.includes('snake') ? <Snake /> : null}
      {props.includes('handcart') ? <Handcart /> : null}
      {props.includes('pump') ? <Pump /> : null}
      {props.includes('cards') ? <Cards /> : null}
      {props.includes('herbs') ? <Herbs /> : null}
      {props.includes('lantern') ? <Lantern x={398} y={112} sceneId={sceneId} /> : null}
      {props.includes('prayer') ? <PrayerCoal /> : null}
      {props.includes('fire_map') ? <MapProp /> : null}
      {props.includes('rope') ? <Rope /> : null}
      {props.includes('dust_wall') ? <DustWall /> : null}
      {props.includes('bandit') ? <DangerEyes /> : null}
    </g>
  );
}

function FiguresLayer({
  figures,
  sceneId,
}: {
  figures: EventSceneFigure[];
  sceneId: string;
}) {
  return (
    <g filter={`url(#${sceneId}-shadow)`}>
      {figures.includes('arguing_pair') ? (
        <>
          <Figure x={188} y={92} gesture="point" />
          <Figure x={430} y={92} gesture="defend" />
        </>
      ) : null}
      {figures.includes('mechanic') ? <Figure x={232} y={108} gesture="kneel" /> : null}
      {figures.includes('scout') ? <Figure x={248} y={88} gesture="look" /> : null}
      {figures.includes('hunter') ? <Figure x={152} y={112} gesture="aim" /> : null}
      {figures.includes('guide') ? <Figure x={292} y={86} gesture="offer" /> : null}
      {figures.includes('stranger') || figures.includes('lookout') ? (
        <Figure x={450} y={98} gesture="stand" />
      ) : null}
      {figures.includes('traveler') ? <Figure x={222} y={100} gesture="stand" /> : null}
      {figures.includes('thief') ? <Figure x={544} y={98} gesture="sneak" /> : null}
      {figures.includes('rider') ? <Rider x={506} y={104} /> : null}
      {figures.includes('bandit') ? <Rider x={548} y={110} /> : null}
      {figures.includes('family') ? (
        <>
          <Figure x={426} y={108} gesture="stand" small />
          <Figure x={462} y={112} gesture="stand" small />
          <Figure x={493} y={122} gesture="stand" small />
        </>
      ) : null}
      {figures.includes('child') ? (
        <Figure x={410} y={120} gesture="stand" small />
      ) : null}
      {figures.includes('sick') ? <SickFigure /> : null}
      {figures.includes('seated') ? (
        <>
          <SeatedFigure x={222} y={134} />
          <SeatedFigure x={398} y={134} />
        </>
      ) : null}
      {figures.includes('singer') ? (
        <Figure x={304} y={116} gesture="instrument" />
      ) : null}
      {figures.includes('onlookers') ? (
        <>
          <Figure x={82} y={122} gesture="stand" small />
          <Figure x={548} y={122} gesture="stand" small />
        </>
      ) : null}
      {figures.includes('cardsharp') ? <Figure x={444} y={100} gesture="offer" /> : null}
    </g>
  );
}

function Figure({
  gesture,
  small = false,
  x,
  y,
}: {
  gesture:
    | 'aim'
    | 'defend'
    | 'instrument'
    | 'kneel'
    | 'look'
    | 'offer'
    | 'point'
    | 'sneak'
    | 'stand';
  small?: boolean;
  x: number;
  y: number;
}) {
  const scale = small ? 0.72 : gesture === 'kneel' ? 0.82 : 1;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="rgb(var(--color-canvas))">
      <ellipse cx="30" cy="92" rx="38" ry="7" opacity="0.42" />
      <circle cx="29" cy="14" r="8" />
      <path d="M16 27c12-8 29-8 43 0l-9 45H25Z" />
      <path d="M24 70h10l-8 32H14Z" />
      <path d="M45 70h10l15 30H59Z" />
      {gesture === 'point' ? (
        <path
          className="fr-cinematic-glow"
          d="M55 35l72 24"
          stroke="rgb(var(--color-canvas))"
          strokeLinecap="round"
          strokeWidth="7"
        />
      ) : null}
      {gesture === 'defend' ? (
        <path
          d="M19 36-25 43"
          stroke="rgb(var(--color-canvas))"
          strokeLinecap="round"
          strokeWidth="7"
        />
      ) : null}
      {gesture === 'aim' ? (
        <path
          d="M55 34l82-15"
          stroke="rgb(var(--color-canvas))"
          strokeLinecap="round"
          strokeWidth="7"
        />
      ) : null}
      {gesture === 'look' ? <path d="M53 33l52-17 4 7-51 19Z" /> : null}
      {gesture === 'offer' ? (
        <path
          d="M55 37l46 19"
          stroke="rgb(var(--color-canvas))"
          strokeLinecap="round"
          strokeWidth="7"
        />
      ) : null}
      {gesture === 'instrument' ? (
        <>
          <path
            d="M54 35c22 4 39 15 53 30"
            stroke="rgb(var(--color-canvas))"
            strokeLinecap="round"
            strokeWidth="6"
          />
          <path
            d="M91 53l20 16M99 45l18 14"
            stroke="rgb(var(--color-canvas))"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </>
      ) : null}
      {gesture === 'sneak' ? (
        <path
          d="M17 35-20 52M55 35l40 14"
          stroke="rgb(var(--color-canvas))"
          strokeLinecap="round"
          strokeWidth="7"
        />
      ) : null}
      {gesture === 'kneel' ? (
        <path
          d="M23 69l-25 21M48 70l33 13"
          stroke="rgb(var(--color-canvas))"
          strokeLinecap="round"
          strokeWidth="8"
        />
      ) : null}
    </g>
  );
}

function SeatedFigure({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="rgb(var(--color-canvas))">
      <ellipse cx="24" cy="53" rx="30" ry="6" opacity="0.4" />
      <circle cx="24" cy="12" r="7" />
      <path d="M12 24c10-7 26-7 36 0l-8 30H20Z" />
      <path d="M18 52h9l-12 18H5Z" />
      <path d="M35 52h9l17 14H48Z" />
    </g>
  );
}

function SickFigure() {
  return (
    <g transform="translate(330 134)" fill="rgb(var(--color-canvas))">
      <ellipse cx="45" cy="38" rx="68" ry="9" opacity="0.45" />
      <path d="M0 22h95l-16 28H11Z" fill="rgb(var(--color-canvas))" />
      <circle cx="22" cy="16" r="9" />
      <path
        d="M36 13h55"
        stroke="rgb(var(--color-muted))"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.54"
      />
    </g>
  );
}

function WagonSilhouette({
  broken = false,
  scale,
  x,
  y,
}: {
  broken?: boolean;
  scale: number;
  x: number;
  y: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="rgb(var(--color-canvas))"
      opacity="0.82"
    >
      <path d="M0 44h126l-15-48H18Z" />
      <path
        d="M18-3c17-36 75-36 92 0"
        fill="none"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="8"
      />
      <circle cx="28" cy="53" r="15" />
      <circle cx="98" cy="53" r="15" />
      <path
        d="M-15 50h160"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {broken ? (
        <path
          d="M82 39l30 30M112 39 82 69"
          stroke="rgb(var(--color-danger))"
          strokeLinecap="round"
          strokeWidth="5"
        />
      ) : null}
    </g>
  );
}

function Supplies({ food, x, y }: { food: boolean; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse
        cx="54"
        cy="54"
        rx="82"
        ry="10"
        fill="rgb(var(--color-canvas))"
        opacity="0.34"
      />
      <path
        d="M0 22h72v34H0Z"
        fill="rgb(var(--color-frontier-bark))"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="5"
      />
      <path
        d="M83 12c24-12 49-4 59 17l-11 29H88Z"
        fill="rgb(var(--color-parchment))"
        opacity="0.72"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="4"
      />
      {food ? (
        <path
          d="M8 45c22-14 44-14 66 0"
          stroke="rgb(var(--color-parchment-dark))"
          strokeLinecap="round"
          strokeWidth="6"
        />
      ) : null}
    </g>
  );
}

function AmmoBox({ sceneId, x, y }: { sceneId: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 20h72v35H0Z"
        fill="rgb(var(--color-frontier-bark))"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="5"
      />
      <path d="M11 12h49l8 10H4Z" fill="rgb(var(--color-parchment-dark))" />
      {[17, 34, 51].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={38}
          r="4"
          fill="rgb(var(--color-cta))"
          filter={`url(#${sceneId}-glow)`}
        />
      ))}
    </g>
  );
}

function Medicine({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        cx="28"
        cy="24"
        r="22"
        fill="rgb(var(--color-danger-deep))"
        stroke="rgb(var(--color-danger))"
        strokeWidth="5"
      />
      <path
        d="M28 10v28M14 24h28"
        stroke="rgb(var(--color-danger))"
        strokeLinecap="round"
        strokeWidth="7"
      />
    </g>
  );
}

function Tools({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      stroke="rgb(var(--color-muted))"
      strokeLinecap="round"
      strokeWidth="7"
    >
      <path d="M0 45 53 0M14 0l39 45M75 8v50" />
      <path d="M64 8h22" strokeWidth="5" />
    </g>
  );
}

function Signpost({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M34 0v96"
        stroke="rgb(var(--color-frontier-bark))"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M0 12h78l-13 24H0Z"
        fill="rgb(var(--color-parchment-dark))"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="4"
      />
      <path
        d="M11 24h34M48 24h10"
        stroke="rgb(var(--color-canvas))"
        strokeLinecap="round"
        strokeWidth="3"
        opacity="0.66"
      />
    </g>
  );
}

function Bridge() {
  return (
    <g fill="none" strokeLinecap="round">
      <path
        d="M340 130c68-45 154-45 240 0"
        stroke="rgb(var(--color-frontier-bark))"
        strokeWidth="9"
      />
      <path
        d="M354 146h210"
        stroke="rgb(var(--color-parchment-dark))"
        strokeDasharray="16 10"
        strokeWidth="7"
      />
      <path
        d="M372 118v52M425 105v65M480 105v65M535 118v52"
        stroke="rgb(var(--color-frontier-bark))"
        strokeWidth="5"
      />
    </g>
  );
}

function Creek() {
  return (
    <path
      d="M365 160c48-20 98-16 151 12 38 20 79 20 124 0v48H347c41-12 48-31 18-60Z"
      fill="rgb(var(--color-highlight))"
      opacity="0.3"
    />
  );
}

function Tracks({ danger }: { danger: boolean }) {
  return (
    <g
      fill={danger ? 'rgb(var(--color-canvas))' : 'rgb(var(--color-muted))'}
      opacity={danger ? 0.74 : 0.48}
    >
      {[0, 1, 2, 3].map((index) => (
        <ellipse
          key={index}
          cx={88 + index * 36}
          cy={174 + (index % 2) * 12}
          rx="10"
          ry="5"
          transform={`rotate(-20 ${88 + index * 36} ${174 + (index % 2) * 12})`}
        />
      ))}
    </g>
  );
}

function ClawMarks() {
  return (
    <g
      stroke="rgb(var(--color-danger))"
      strokeLinecap="round"
      strokeWidth="6"
      opacity="0.58"
    >
      <path d="M273 144l-32 34M292 147l-32 38M312 152l-30 36" />
    </g>
  );
}

function Snake() {
  return (
    <g>
      <path
        d="M219 164c-2-31 52-39 76-18 20 18-3 39-38 35-26-3-27-21-8-27 18-6 34 9 21 22"
        fill="none"
        stroke="rgb(var(--color-frontier-bark))"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path
        d="M304 145c18-17 39-20 63-7"
        fill="none"
        stroke="rgb(var(--color-frontier-bark))"
        strokeLinecap="round"
        strokeWidth="12"
      />
      <path d="M361 137l25-15 9 16-28 9Z" fill="rgb(var(--color-frontier-bark))" />
      <circle cx="383" cy="132" r="2.5" fill="rgb(var(--color-cta))" />
    </g>
  );
}

function Handcart() {
  return (
    <g transform="translate(92 124)" fill="rgb(var(--color-canvas))" opacity="0.76">
      <path d="M0 35h82l-12-32H11Z" />
      <circle cx="20" cy="45" r="11" />
      <circle cx="66" cy="45" r="11" />
      <path
        d="M76 20l48-26"
        stroke="rgb(var(--color-canvas))"
        strokeLinecap="round"
        strokeWidth="7"
      />
    </g>
  );
}

function Pump() {
  return (
    <g
      transform="translate(414 112)"
      fill="none"
      stroke="rgb(var(--color-canvas))"
      strokeLinecap="round"
      strokeWidth="8"
    >
      <path d="M34 2v84M15 86h46M34 10c35 0 42 24 18 39" />
      <path d="M18 17h54M56 49h31" strokeWidth="6" />
    </g>
  );
}

function Cards() {
  return (
    <g transform="translate(304 144)">
      <rect
        x="0"
        y="0"
        width="36"
        height="50"
        fill="rgb(var(--color-parchment))"
        opacity="0.76"
        transform="rotate(-12 18 25)"
      />
      <rect
        x="28"
        y="-4"
        width="36"
        height="50"
        fill="rgb(var(--color-parchment-dark))"
        opacity="0.7"
        transform="rotate(8 46 21)"
      />
      <circle cx="20" cy="20" r="4" fill="rgb(var(--color-danger))" />
    </g>
  );
}

function Herbs() {
  return (
    <g
      transform="translate(322 132)"
      fill="none"
      stroke="rgb(var(--color-success))"
      strokeLinecap="round"
      opacity="0.62"
    >
      <path
        d="M0 48c10-31 28-48 55-50M22 48c5-25 19-41 42-49M43 48c10-23 27-35 50-36"
        strokeWidth="5"
      />
      <path d="M22 23 7 12M43 19l16-14M63 17l15-13" strokeWidth="3" />
    </g>
  );
}

function Lantern({ sceneId, x, y }: { sceneId: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} filter={`url(#${sceneId}-glow)`}>
      <circle cx="18" cy="25" r="31" fill="rgb(var(--color-cta))" opacity="0.18" />
      <rect
        x="9"
        y="10"
        width="18"
        height="32"
        rx="5"
        fill="rgb(var(--color-canvas))"
        stroke="rgb(var(--color-cta))"
        strokeWidth="3"
      />
      <path
        d="M10 10c4-13 14-13 17 0"
        fill="none"
        stroke="rgb(var(--color-cta))"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </g>
  );
}

function PrayerCoal() {
  return (
    <g transform="translate(300 154)">
      <path
        d="M0 22h82"
        stroke="rgb(var(--color-frontier-bark))"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <circle cx="42" cy="14" r="9" fill="rgb(var(--color-cta))" opacity="0.7" />
      <path
        d="M42-18v22M31-7h22"
        stroke="rgb(var(--color-muted))"
        strokeLinecap="round"
        strokeWidth="4"
        opacity="0.5"
      />
    </g>
  );
}

function MapProp() {
  return (
    <g transform="translate(348 146)">
      <path
        d="M0 0h74l-9 43H-6Z"
        fill="rgb(var(--color-parchment))"
        opacity="0.78"
        stroke="rgb(var(--color-canvas))"
        strokeWidth="4"
      />
      <path
        d="M9 29c17-18 34-18 51 0M21 10h31"
        stroke="rgb(var(--color-frontier-bark))"
        strokeLinecap="round"
        strokeWidth="3"
        opacity="0.7"
      />
    </g>
  );
}

function Rope() {
  return (
    <path
      d="M190 124c0 28-3 47-8 58M188 150c20 2 35-7 46-27"
      fill="none"
      stroke="rgb(var(--color-parchment-dark))"
      strokeLinecap="round"
      strokeWidth="6"
      opacity="0.68"
    />
  );
}

function DustWall() {
  return (
    <g fill="rgb(var(--color-cta))" opacity="0.22">
      <path d="M0 62c112-44 227-30 346 43 80 49 178 62 294 39v76H0Z" />
      <ellipse cx="180" cy="104" rx="160" ry="20" />
      <ellipse cx="450" cy="124" rx="170" ry="24" />
    </g>
  );
}

function DangerEyes() {
  return (
    <g className="fr-cinematic-glow">
      <ellipse cx="536" cy="111" rx="8" ry="4" fill="rgb(var(--color-cta))" />
      <ellipse cx="563" cy="111" rx="8" ry="4" fill="rgb(var(--color-cta))" />
      <circle cx="538" cy="111" r="2" fill="rgb(var(--color-canvas))" />
      <circle cx="561" cy="111" r="2" fill="rgb(var(--color-canvas))" />
    </g>
  );
}

function Campfire({ sceneId }: { sceneId: string }) {
  return (
    <g className="fr-cinematic-fire" filter={`url(#${sceneId}-glow)`}>
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
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M292 183h61"
        stroke="rgb(var(--color-canvas))"
        strokeLinecap="round"
        strokeWidth="5"
        opacity="0.8"
      />
    </g>
  );
}

function Rider({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="rgb(var(--color-canvas))" opacity="0.78">
      <ellipse cx="24" cy="60" rx="42" ry="7" opacity="0.4" />
      <path d="M0 38c18-20 45-20 63 0l-14 18H13Z" />
      <circle cx="26" cy="18" r="7" />
      <path d="M22 25h18l-8 26H20Z" />
      <path
        d="M13 52-2 75M46 52l18 22"
        stroke="rgb(var(--color-canvas))"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </g>
  );
}

function ForegroundBrush() {
  return (
    <g
      className="fr-cinematic-grass"
      fill="none"
      stroke="rgb(var(--color-success))"
      strokeLinecap="round"
      opacity="0.42"
    >
      <path
        d="M38 202c-8-30-4-52 14-67M68 202c-11-34-7-60 11-80M590 202c-8-29-3-50 14-64M558 202c-10-32-7-57 10-74"
        strokeWidth="5"
      />
      <path d="M51 165l-18-9M79 158l17-14M603 165l20-10M569 160l-17-9" strokeWidth="3" />
    </g>
  );
}
