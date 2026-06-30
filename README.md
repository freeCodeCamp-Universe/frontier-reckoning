# Frontier Reckoning

Frontier Reckoning is a browser-based frontier survival strategy game. You lead a small caravan across a long trail, manage scarce supplies, make event choices, stop in towns, cross rivers, camp, hunt, and try to reach the destination before the wagon, supplies, or party give out.

This app focuses on the core loop, deterministic systems, save/load, accessibility, lightweight original presentation, and automated test coverage. It is still an MVP, but the major placeholder systems have been upgraded into shippable first passes.

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
- eslint-plugin-jsx-a11y
- @axe-core/playwright

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
  - `Escape`: close dismissible dialogs.
  - Arrow keys: move through grouped party/difficulty controls, settings listbox options, and the hunting reticle.
- Hunting:
  - Mouse or touch: aim and shoot in the hunting range.
  - Keyboard: focus the hunting range, use arrow keys to move the reticle, and press `Space` or `Enter` to shoot.
- Trail map:
  - Canvas markers still support pointer hover/click tooltips.
  - Route landmark buttons below the canvas provide the keyboard and single-pointer alternative.
- Modal dialogs trap focus while open and return focus to the triggering control when closed.

## Settings

Open `Settings` from the main menu or active game screen. Settings are stored in localStorage and persist across reloads.

- `Sound`: master audio toggle. Audio is muted by default and starts only after user interaction.
- `Music volume`: controls menu music and scene ambience.
- `SFX volume`: controls button clicks, event alerts, hunting sounds, victory, and game over stings.
- `Reduced motion`: disables non-essential CSS animation classes and Phaser movement flourishes.
- `Text speed`: stores the preferred event text pacing for current and future presentation work.
- `Autosave`: stores whether autosave behavior should be active.
- `Difficulty display`: toggles detailed difficulty presentation.
- `Reset save data`: clears the current local save and returns the run to the main menu.

## Accessibility

Frontier Reckoning is audited against WCAG 2.2 Level A/AA expectations for the frontend surfaces in this MVP. The project includes reusable developer docs and automated checks:

- `docs/accessibility-audit-checklist.md`: practical audit checklist.
- `docs/accessibility-audit-report-template.md`: repeatable report format.
- `docs/accessibility-fix-process.md`: scoped fix workflow.
- `docs/accessibility-testing.md`: automation and axe guidance.

Current accessibility coverage includes:

- Semantic landmarks and native controls for core app actions.
- Labeled forms, grouped radio/selection controls, validation text, and connected descriptions.
- Native modal dialog patterns with accessible names, focus trapping, `Escape` handling, and focus return.
- Keyboard support for setup, event choices, settings, hunting, save/load, town actions, camp actions, river choices, and route landmark review.
- Visible focus indicators using the project focus ring color.
- Live status announcements for save/load, event outcomes, camp/town/river results, resource changes, and hunting feedback.
- Decorative SVG/icon hiding and accessible names for icon-only controls.
- Reduced-motion support for CSS and Phaser motion.
- Touch target and non-canvas alternatives for route landmark inspection.

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
- Detailed river crossing subsystem with river width, depth, current, weather, ferry/bridge availability, option requirements, cost previews, risk meter, seeded outcomes, and outcome summaries.
- Phaser trail map with parchment-style graphics, curved trail path, animated wagon marker, towns, rivers, danger zones, destination marker, marker tooltips, DOM landmark controls, visited/unknown landmark states, and day/night tint.
- Phaser hunting mini-game from camp with a 30-second timer, pointer and keyboard reticle controls, moving animals, limited ammo, food rewards, misses, predator injury risk, and Hunter role benefits.
- Expressive event effects engine covering resources, party health/morale, single-character health/status, wagon condition, game logs, day advancement, follow-up events, subsystem starts, temporary modifiers, and faction reputation placeholders.
- LocalStorage save/load with save validation and versioned migrations.
- Victory and game over summary screens.
- Seeded RNG utilities for deterministic simulations and tests.
- Game log panel with recent/all entry views and live log updates.
- Keyboard-accessible UI, modal focus handling, live announcements, text alternatives, reduced-motion support, and touch-friendly route landmark controls.
- Structured procedural Web Audio system with music, scene ambience, SFX, mute, volumes, fade handling, browser autoplay safety, and an asset replacement path.
- Lightweight SVG/CSS presentation layer for event illustrations and generated character portraits.

## Save Migration Behavior

Saves include a `saveVersion`. The current save version is maintained in `src/stores/saveMigrations.ts`.

- Versioned saves are migrated through a migration map before loading.
- The v1 to v2 migration adds settings defaults and `discoveredLandmarks`.
- Missing fields are defaulted safely after migration.
- Corrupted saves are ignored with a clear load result instead of crashing the app.
- Saves from unsupported future versions are rejected so newer save data is not silently damaged by an older app build.

## Performance And Bundle Strategy

Phaser is intentionally kept out of the initial menu/setup bundle.

- The main trail map uses `React.lazy` and loads only after the active game screen opens.
- The hunting mini-game is also lazy-loaded from camp.
- Main menu and expedition setup avoid direct Phaser imports.
- Vite builds Phaser into a separate production chunk, reducing initial app code and avoiding the earlier main-bundle warning where possible.
- Generated SVG/CSS illustrations, generated portraits, and procedural Web Audio avoid large external art/audio payloads.

## Audio Replacement Strategy

Frontier Reckoning currently uses original procedural Web Audio compositions, not copyrighted music or sound effects.

- Audio categories are defined in `src/game/systems/audioSystem.ts`.
- Current categories include menu music, trail/camp/town/storm/river ambience, button click, event alert, hunting shot, hunting hit, victory, and game over.
- To replace generated audio later, add final `.ogg` or similar files under `public/audio/placeholders/` and set the matching `src` fields in `generatedAudioAssets`.
- Keep looped ambience files short and loop-clean.
- Keep final assets normalized conservatively so the existing music and SFX volume settings remain comfortable.
- See `public/audio/placeholders/README.md` for the expected replacement filenames.

## Current Status Check

- Art and animation are no longer purely minimal: event illustrations, generated portraits, Phaser map visuals, CSS transitions, and Phaser tweens are in place.
- Hunting includes an action scene: camp launches a Phaser mini-game with reticle controls and moving animals.
- Events use a detailed effects engine.
- Rivers use a detailed crossing subsystem.
- Save migrations work and are covered by tests.
- Phaser map visuals are polished MVP quality using graphics primitives.
- Audio is structured beyond tones with procedural music, ambience, and SFX categories.
- A full settings menu exists in the main menu and active game.
- Phaser is lazy-loaded to reduce initial bundle size.

## Testing Strategy

The project uses layered test coverage:

- Unit tests cover pure systems such as travel, hunting, events, towns, rivers, scoring, map progress, save/load, and seeded RNG.
- React Testing Library tests cover core screens, accessible names, party rendering, modal behavior, keyboard flows, form accessibility, dynamic announcements, and store-driven UI flows.
- Balance simulation tests run deterministic seeded simulations to verify that the game can produce both wins and losses without invalid resource values.
- Playwright tests cover browser flows: starting a game, traveling, resolving events, camping, hunting, visiting towns, crossing rivers, saving, reloading, continuing, and reaching an ending.
- Axe checks run through Playwright for automatically detectable accessibility violations on the main menu.
- `eslint-plugin-jsx-a11y` runs against React TSX files for static accessibility regressions.

Run all unit and component tests:

```bash
npm run test
```

Run accessibility lint:

```bash
npm run lint:a11y
```

Run the axe browser accessibility check:

```bash
npm run test:a11y
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
npm run lint:a11y
npm run test
npm run test:a11y
npm run test:e2e
npm run build
```

Playwright commands start a local Vite server at `http://127.0.0.1:4173`.

## Known Limitations

- Art is generated with CSS, SVG, Phaser graphics, and procedural systems. There are no final bespoke illustration, sprite, or audio asset packs yet.
- The hunting mini-game is intentionally simple: no advanced enemy AI, weapon variety, or tracking. It supports pointer input and keyboard reticle controls, but it is not a full hunting simulation.
- Event content is broad but still MVP-scale; more authored event chains, faction consequences, and late-game variety would improve replayability.
- River crossing outcomes are deterministic when seeded and mechanically detailed, but the UI is still a compact panel rather than a cinematic scene.
- Saves are localStorage-only. There is no cloud sync, import/export save file UI, or account-based persistence.
- The game log is intentionally compact. It does not yet include journal search, category filters, or export.
- Phaser remains a large dependency, but it is split into lazy chunks so it does not load on the main menu/setup path.
