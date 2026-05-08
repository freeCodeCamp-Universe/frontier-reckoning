# Frontier Reckoning

Frontier Reckoning is a browser-based frontier survival strategy game. You lead a small caravan across a long trail, manage scarce supplies, make event choices, stop in towns, cross rivers, camp, hunt, and try to reach the destination before the wagon, supplies, or party give out.

This app focuses on the core loop, deterministic systems, save/load, accessibility, and automated test coverage. It does not include final art, advanced animation, or deep combat.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Phaser 3
- Zustand
- Vitest
- React Testing Library
- Playwright

## Local Development Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## How to Play

1. Choose `New Expedition` from the main menu.
2. Enter an expedition name.
3. Select exactly four party members.
4. Choose a difficulty:
   - `Greenhorn`: more forgiving resources and prices.
   - `Trailwise`: intended MVP balance.
   - `Reckoning`: harsher events, higher costs, and tighter supplies.
5. Start the expedition.
6. Use `Travel One Day` to advance along the trail.
7. Respond to events when they appear.
8. Stop at towns to buy or sell supplies, rest, repair, recruit, or hear rumors.
9. Enter camp to rest, repair, treat party members, tell stories, ration food, or hunt.
10. Resolve river crossings when the caravan reaches milestone rivers.
11. Reach the destination for victory, or recover as long as possible before a game over condition ends the run.

## Controls

- Mouse or touch: activate buttons and select options.
- Keyboard:
  - `Tab` / `Shift+Tab`: move between controls.
  - `Enter` or `Space`: activate focused buttons and choices.
  - Event dialogs trap focus while open.
- Audio:
  - Sound effects and background ambience are muted by default.
  - Use the audio controls to enable sound effects, then optionally enable ambience.
  - Audio preferences persist in localStorage.

## Feature List

- Main menu and expedition setup flow.
- Custom expedition name.
- Party selection from six starter characters.
- Three difficulty levels.
- Travel simulation with food consumption, morale pressure, health pressure, wagon wear, and distance progress.
- Random event system with weighted events and meaningful choices.
- Camp actions, including rest, repair, treatment, stories, rationing, and hunting.
- Town milestones with shops, inns, repairs, recruiting, and rumors.
- River crossing milestone events with different risks and costs.
- Phaser trail map showing wagon progress, towns, rivers, start, and destination.
- LocalStorage save/load with save validation.
- Victory and game over summary screens.
- Seeded RNG utilities for deterministic simulations and tests.
- Game log panel showing recent major actions.
- Keyboard-accessible UI and reduced-motion support.
- Optional generated-tone audio cues for buttons, events, victory, game over, and ambience.

## Testing Strategy

The project uses layered test coverage:

- Unit tests cover pure systems such as travel, hunting, events, towns, rivers, scoring, map progress, save/load, and seeded RNG.
- React Testing Library tests cover core screens, accessible names, party rendering, event modal behavior, and store-driven UI flows.
- Balance simulation tests run deterministic seeded simulations to verify that the game can produce both wins and losses without invalid resource values.
- Playwright tests cover browser flows: starting a game, traveling, resolving events, camping, hunting, visiting towns, crossing rivers, saving, reloading, continuing, and reaching an ending.

Run all unit and component tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

Run lint:

```bash
npm run lint
```

Run the full release check manually:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Known Limitations

- Art and animation are intentionally minimal.
- Hunting is result-based and does not yet include an action scene.
- Events and river outcomes use simplified effects rather than detailed sub-systems.
- Save format migration is not implemented; unsupported old save versions are ignored with a message.
- Phaser map visuals are functional placeholders.
- Audio uses simple generated placeholder tones rather than final music or sound design.
- There is no settings menu yet.
- Bundle size is above Vite's default warning threshold because Phaser is included in the main bundle.
