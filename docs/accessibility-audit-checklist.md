# Accessibility Audit Checklist

Use this checklist when reviewing Frontier Reckoning against WCAG 2.2 Level A and AA. The goal is not to memorize criterion numbers. The goal is to confirm that every screen, control, modal, canvas experience, and game-state update works for keyboard, screen reader, low vision, touch, and motion-sensitive users.

Run this checklist for new user-facing UI, large visual refactors, custom controls, Phaser/canvas changes, settings changes, and release candidates.

## Audit Setup

- Run the app locally with `npm run dev`.
- Run automated checks that already exist: `npm run lint`, `npm run test`, and `npm run test:e2e`.
- Test in a real browser with keyboard only: `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, and arrow keys for custom controls.
- Test at 200% browser zoom and at a narrow mobile viewport.
- Test with reduced motion enabled in the app settings and, when possible, the OS/browser `prefers-reduced-motion` setting.
- Use browser accessibility tools to inspect names, roles, focus order, contrast, and landmark structure.

## Screen Inventory

Audit at least these app states:

- Main menu
- New expedition setup
- Active game layout
- Event dialog
- Settings dialog
- Reset save confirmation dialog
- Return to menu confirmation dialog
- Camp screen and hunting mini-game
- Town screen
- River crossing screen
- Victory and game over screens
- Loading states, empty states, disabled states, and validation errors

## Semantic HTML

- Use native elements for native behavior: `button` for actions, `a` for navigation, `label` for form controls, `fieldset`/`legend` or a clearly named group for related controls, `table` for tabular data, and headings in a logical order.
- Prefer semantic regions such as `main`, `section`, `aside`, `header`, and `article` when they describe the content.
- Avoid adding ARIA when native HTML already communicates the role and state.
- Check that custom components such as `Button`, `Card`, and custom dropdowns preserve correct roles, names, and keyboard behavior.
- Canvas or Phaser content must have a DOM-level accessible name and an equivalent way to understand or operate essential information.

Bad:

```tsx
<div onClick={startGame}>Start Expedition</div>
```

Good:

```tsx
<Button onClick={startGame}>Start Expedition</Button>
```

Bad:

```tsx
<div role="button" tabIndex={0} onClick={saveGame}>
  Save
</div>
```

Good:

```tsx
<button type="button" onClick={saveGame}>
  Save
</button>
```

## Page Titles And Lang

- `index.html` must keep `<html lang="en">`.
- The document title must identify the app. For single-page state changes, consider whether a major route-like state needs a title update, especially if a future router is added.
- Do not put important screen identity only in decorative imagery or canvas.

Bad:

```html
<html>
  <title>App</title>
</html>
```

Good:

```html
<html lang="en">
  <title>Frontier Reckoning</title>
</html>
```

## Image Alt Text

- Informative images need concise alt text that describes the useful information.
- Decorative icons, patterns, and flourishes should be hidden with `aria-hidden="true"` or empty alt text if they are images.
- Do not repeat nearby visible text in alt text.
- SVG illustrations and generated portraits should either be decorative or have a clear accessible name when they carry gameplay meaning.

Bad:

```tsx
<img src="/wagon.png" alt="image" />
```

Good:

```tsx
<img src="/wagon.png" alt="Covered wagon on the trail" />
```

Good decorative icon:

```tsx
<Settings aria-hidden="true" className="size-5" />
<span>Settings</span>
```

## Icon-Only Controls

- Every icon-only button needs an accessible name with `aria-label` or visible text.
- Hide the icon itself with `aria-hidden="true"` unless it has useful standalone meaning.
- The accessible name should describe the action, not the icon.
- The target size should be at least 24 by 24 CSS pixels, with enough spacing to avoid accidental activation.

Bad:

```tsx
<button type="button">
  <X />
</button>
```

Good:

```tsx
<button type="button" aria-label="Close settings">
  <X aria-hidden="true" />
</button>
```

## Links

- Use links for navigation or downloads, buttons for in-place actions.
- Link text must make sense out of context. Avoid repeated vague labels such as "click here" or "learn more".
- Do not rely on color alone to identify links; provide underline, position, icon, or another non-color cue.
- External links should make their destination or behavior clear when added.

Bad:

```tsx
<a href="/docs">Click here</a>
```

Good:

```tsx
<a href="/docs/accessibility-audit-checklist.md">Accessibility audit checklist</a>
```

## Forms And Validation

- Every input, select, textarea, range, radio group, and custom form control needs a programmatic label.
- Use native form controls where possible.
- Required fields, constraints, and validation errors must be announced in text, not color alone.
- Associate errors with fields using `aria-describedby` when a field has a specific error.
- Use `aria-invalid="true"` only when the current value is invalid.
- On submit failure, move focus to the first invalid field or an error summary.

Bad:

```tsx
<input placeholder="Expedition name" />
<p className="text-danger">Required</p>
```

Good:

```tsx
<label htmlFor="expedition-name">Expedition name</label>
<input
  id="expedition-name"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'expedition-name-error' : undefined}
/>
{hasError ? (
  <p id="expedition-name-error" className="text-danger">
    Enter an expedition name.
  </p>
) : null}
```

## Skip Links

- Provide a visible-on-focus skip link when repeated navigation or header controls appear before the main task area.
- The skip target must be focusable or naturally reachable and must have a stable `id`.
- Confirm the skip link works at desktop and mobile sizes.

Bad:

```tsx
<a href="#main" className="hidden">
  Skip to main content
</a>
```

Good:

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">...</main>
```

## Keyboard Access

- All interactive controls must be reachable and operable without a mouse.
- Focus order should follow the visual and task order.
- Native buttons activate with `Enter` and `Space`. Do not break that behavior.
- Custom controls must document and implement expected keys. For listbox-style controls, test arrow keys, `Enter`, `Space`, `Escape`, and focus return.
- Keyboard users must be able to start, play, pause, exit, or skip essential game interactions. If a pointer-heavy mini-game is not fully keyboard playable, provide an accessible alternate action or equivalent outcome.

Bad:

```tsx
<div onMouseDown={chooseOption}>Fast</div>
```

Good:

```tsx
<li
  role="option"
  aria-selected={selected}
  onMouseDown={chooseOption}
  onKeyDown={handleOptionKeyDown}
>
  Fast
</li>
```

## Focus Indicators

- Every focusable element must have a visible focus indicator.
- Do not remove outlines unless replacing them with an equally visible indicator.
- Focus indicators need enough contrast against adjacent colors.
- Check focus on buttons, icon-only buttons, range inputs, custom dropdowns, modal controls, save controls, and canvas containers.

Bad:

```css
button:focus {
  outline: none;
}
```

Good:

```css
:focus-visible {
  outline: 2px solid #198eee;
  outline-offset: 4px;
}
```

## Dialogs And Modals

- Dialogs need `role="dialog"` or a native `<dialog>` pattern, `aria-modal="true"`, and an accessible name.
- Initial focus should move into the dialog when it opens.
- Focus should stay inside the dialog while it is open.
- `Escape` should close dismissible dialogs.
- Closing the dialog should return focus to the control that opened it when possible.
- Background content should not be reachable by keyboard or screen reader while a modal dialog is open.
- Nested dialogs need careful focus management and z-index ordering.

Bad:

```tsx
<div className="modal">
  <h2>Settings</h2>
</div>
```

Good:

```tsx
<section
  role="dialog"
  aria-modal="true"
  aria-labelledby="settings-title"
  onKeyDown={trapFocus}
>
  <h2 id="settings-title">Settings</h2>
</section>
```

## Live Regions

- Use live regions for important asynchronous or state-changing updates: saved game status, event outcomes, resource changes, loading states, validation summaries, and game status changes.
- Use `aria-live="polite"` for non-urgent updates and `role="alert"` only for urgent interruptions.
- Do not wrap large changing sections in live regions if they update frequently; announce a small summary instead.
- Avoid repeatedly announcing decorative or rapidly changing animation text.

Bad:

```tsx
<section aria-live="assertive">{entireGameLog}</section>
```

Good:

```tsx
<p role="status">Game saved.</p>
```

## Color Contrast

- Body text and meaningful UI text must meet at least 4.5:1 contrast.
- Large text must meet at least 3:1 contrast.
- Non-text UI indicators such as borders, focus rings, progress bars, icons, and selected states must meet at least 3:1 contrast against adjacent colors.
- Do not communicate status by color alone. Pair color with text, icon shape, position, or pattern.
- Be extra careful with muted text, danger text, selected states, disabled states, and text over generated artwork.

Bad:

```tsx
<p className="text-red-500">Food is low</p>
```

Good:

```tsx
<p className="text-danger">
  <span aria-hidden="true">!</span> Food is low.
</p>
```

## Pointer Targets

- Interactive targets should be at least 24 by 24 CSS pixels.
- Prefer larger targets for primary game actions, mobile controls, sliders, and hunting/canvas controls.
- Keep enough spacing between adjacent controls.
- Do not make only the icon clickable when the visible control includes text.

Bad:

```tsx
<button className="size-4" aria-label="Settings">
  <Settings aria-hidden="true" />
</button>
```

Good:

```tsx
<Button aria-label="Settings" className="size-10 p-0" size="sm" variant="ghost">
  <Settings aria-hidden="true" className="size-5" />
</Button>
```

## Zoom And Reflow

- At 200% zoom, content must remain readable and usable without horizontal scrolling, except for content that genuinely requires two-dimensional layout such as maps or tables.
- At 320 CSS pixels wide, controls should wrap without overlapping or clipping text.
- Do not lock content into fixed heights that hide text when zoomed.
- Long names, status text, and button labels should truncate only when the full value is available elsewhere or not essential.
- Test modals at small viewport heights to confirm scrolling works inside the modal without losing access to controls.

Bad:

```tsx
<div className="h-24 overflow-hidden">
  <button>Return to Menu and Save Expedition</button>
</div>
```

Good:

```tsx
<div className="min-h-24">
  <Button className="whitespace-normal text-left">Return to Menu</Button>
</div>
```

## Reduced Motion

- Honor both the app-level reduced motion setting and `prefers-reduced-motion`.
- Disable or shorten non-essential transitions, pulsing, parallax, canvas tweening, and entrance animations.
- Do not animate content in a way that blocks reading or gameplay.
- Essential motion should have a non-motion cue where possible.

Bad:

```tsx
<Card className="animate-bounce">Event resolved</Card>
```

Good:

```tsx
<Card className={settings.reducedMotion ? undefined : 'fr-event-card-enter'}>
  Event resolved
</Card>
```

## Disabled Controls

- Disabled controls need a visible explanation when the reason is not obvious.
- Do not hide unavailable actions if seeing the requirement helps the player understand the game.
- A disabled control should not be focusable when it uses the native `disabled` attribute, but the reason still needs to be available nearby or through `aria-describedby`.
- If the user must interact with the control to learn why it is unavailable, use `aria-disabled` and handle keyboard behavior intentionally.

Bad:

```tsx
<Button disabled>Buy</Button>
```

Good:

```tsx
<Button disabled disabledReason="Not enough money to buy food.">
  Buy
</Button>
<p className="text-danger">Not enough money to buy food.</p>
```

## Keyboard Shortcuts

- Do not require single-character shortcuts for core actions.
- Any shortcut must have a visible or documented alternative control.
- Avoid shortcuts that conflict with browser, assistive technology, or operating system shortcuts.
- If a single-character shortcut is added, provide a way to turn it off or remap it unless it is active only while a focused control expects that input.
- Shortcuts must not fire while the user is typing in an input, textarea, or editable field.

Bad:

```tsx
window.addEventListener('keydown', (event) => {
  if (event.key === 's') {
    saveGame();
  }
});
```

Good:

```tsx
window.addEventListener('keydown', (event) => {
  const target = event.target;

  if (
    event.key === 's' &&
    event.altKey &&
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) {
    saveGame();
  }
});
```

## Sign-Off

For each audited screen, record:

- Screen or component name
- Tested viewport sizes and zoom levels
- Keyboard path tested
- Screen reader or browser accessibility inspection notes
- Automated checks run
- Findings, severity, owner, and linked issue or pull request
- Any accepted limitations and the reason they are acceptable
