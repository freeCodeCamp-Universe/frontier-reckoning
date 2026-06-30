# Accessibility Fix Process

Use this process to turn an accessibility audit finding into a focused code change. Keep fixes small, testable, and tied to user impact.

This project targets WCAG 2.2 Level A/AA for practical frontend behavior across React, Tailwind, and Phaser-backed game UI.

## 1. Triage The Finding

For each finding, capture:

- A short title
- Severity: Critical, High, Medium, or Low
- Screen or component
- User impact
- Reproduction steps
- Expected and actual behavior
- Relevant WCAG 2.2 A/AA criterion
- Suggested test coverage

Prioritize in this order:

1. Keyboard blockers
2. Missing names, roles, labels, or dialog semantics
3. Validation or status messages that are not announced
4. Focus order, focus traps, and focus return
5. Contrast, target size, zoom, and reflow failures
6. Motion and shortcut issues
7. Minor wording or polish

## 2. Find The Smallest Responsible Fix

Start with native HTML before ARIA.

Bad:

```tsx
<div role="button" tabIndex={0} onClick={onSave}>
  Save game
</div>
```

Good:

```tsx
<Button onClick={onSave}>Save game</Button>
```

Use ARIA only when it fills a real semantic gap:

- `aria-label` for icon-only controls
- `aria-describedby` for extra instructions, errors, and disabled reasons
- `aria-expanded`, `aria-controls`, and `aria-haspopup` for disclosure/listbox controls
- `aria-live` or `role="status"` for important state updates
- `aria-modal`, `aria-labelledby`, and `aria-describedby` for dialogs

Do not use ARIA to cover up broken interaction. If a control behaves like a button, it should be a button unless there is a strong reason it cannot be.

## 3. Fix By Pattern

### Semantic HTML

- Replace clickable `div`/`span` elements with `button` or `a`.
- Keep heading levels meaningful within each screen.
- Use `section`/`aside` labels only when the label helps navigation.

### Icon-Only Controls

Bad:

```tsx
<Button>
  <SettingsIcon />
</Button>
```

Good:

```tsx
<Button aria-label="Settings">
  <SettingsIcon aria-hidden="true" />
</Button>
```

Test:

```tsx
expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
```

### Forms And Validation

- Add real labels with `htmlFor`.
- Keep helper and error text in the DOM.
- Connect field-specific errors with `aria-describedby`.
- Set `aria-invalid="true"` only when the field currently fails validation.

Bad:

```tsx
<input placeholder="Name" />;
{
  error ? <p className="text-danger">{error}</p> : null;
}
```

Good:

```tsx
<label htmlFor="party-name">Party name</label>
<input
  id="party-name"
  aria-invalid={Boolean(error)}
  aria-describedby={error ? 'party-name-error' : undefined}
/>
{error ? <p id="party-name-error">{error}</p> : null}
```

Test:

```tsx
expect(screen.getByLabelText('Party name')).toHaveAccessibleDescription(
  'Enter a party name.',
);
```

### Dialogs

- Move focus into the dialog on open.
- Trap focus while open.
- Close with `Escape` when the dialog is dismissible.
- Return focus to the opener when closed.
- Give the dialog a stable accessible name.

Bad:

```tsx
<div className="modal">...</div>
```

Good:

```tsx
<section
  role="dialog"
  aria-modal="true"
  aria-labelledby="event-title"
  aria-describedby="event-description"
>
  ...
</section>
```

Test:

```tsx
expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
```

### Live Regions

- Announce concise outcomes, not whole screens.
- Use `role="status"` for save confirmations and loading states.
- Use `aria-live="polite"` for changing game stats.
- Avoid `aria-live="assertive"` unless the update is urgent.

Bad:

```tsx
<div aria-live="assertive">{allGameLogEntries}</div>
```

Good:

```tsx
<p role="status">Game saved.</p>
```

### Disabled Controls

- Keep unavailable actions understandable.
- Show a visible reason when the user needs it.
- Use the existing `Button` `disabledReason` prop when it fits.

Bad:

```tsx
<Button disabled>Repair wagon</Button>
```

Good:

```tsx
<Button disabled disabledReason="You need at least 2 parts to repair the wagon.">
  Repair wagon
</Button>
<p className="text-danger">You need at least 2 parts to repair the wagon.</p>
```

### Focus Indicators

- Keep the global `:focus-visible` style visible.
- If a component has custom focus styles, confirm it still has at least a 2 CSS pixel visible indicator.
- Do not use color changes alone if the contrast is weak.

Bad:

```tsx
<button className="outline-none">Continue</button>
```

Good:

```tsx
<button className="focus-visible:outline focus-visible:outline-2">Continue</button>
```

### Reduced Motion

- Gate non-essential React animations on the app reduced motion setting.
- Keep CSS covered by the existing `prefers-reduced-motion` media query.
- For Phaser changes, add or preserve a reduced-motion branch in the game system.

Bad:

```tsx
<div className="fr-resource-pulse">Food changed</div>
```

Good:

```tsx
<div className={settings.reducedMotion ? undefined : 'fr-resource-pulse'}>
  Food changed
</div>
```

### Canvas And Phaser UI

- Give canvas-backed regions an accessible label.
- Provide DOM text for essential game state shown only in canvas.
- Provide keyboard access or an equivalent alternate flow for essential actions.
- Respect reduced motion for camera movement, tweening, pulsing, and repeated animation.

Bad:

```tsx
<canvas />
```

Good:

```tsx
<section aria-label="Trail map">
  <p className="sr-only">Trail progress: 42 percent.</p>
  <canvas aria-label="Visual trail map" />
</section>
```

## 4. Add Or Update Tests

Prefer tests that describe user-observable behavior.

Use React Testing Library for:

- Accessible names and roles
- Labels and descriptions
- Dialog presence
- Disabled reasons
- Form validation messages
- Reduced-motion rendering decisions

Use Playwright for:

- Full keyboard navigation
- Focus order and focus trapping
- Browser zoom and viewport reflow checks
- Canvas-region visibility and fallback text
- End-to-end flows through event, town, camp, river, save, and settings states

Useful examples:

```tsx
expect(screen.getByRole('button', { name: 'Close settings' })).toBeEnabled();
expect(screen.getByLabelText('Music volume')).toHaveValue('50');
expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
```

```ts
await page.keyboard.press('Tab');
await expect(page.getByRole('button', { name: 'Start Expedition' })).toBeFocused();
await page.keyboard.press('Enter');
```

## 5. Verify Manually

Before opening or merging a fix, manually verify:

- Keyboard-only operation for the affected flow
- Focus order, visible focus, and focus return
- Screen reader/accessibility tree name, role, and state
- 200% zoom
- 320 CSS pixel width
- Reduced motion
- Color contrast
- Pointer target size

Do not rely only on automated tests. Automation can miss confusing names, poor focus order, unclear instructions, motion discomfort, and visual overlap.

## 6. Pull Request Checklist

Include this in the PR description when fixing accessibility issues:

- Finding fixed:
- User impact:
- WCAG 2.2 A/AA criterion:
- Screens/components touched:
- Manual keyboard check completed:
- 200% zoom/reflow checked:
- Reduced motion checked:
- Tests added or updated:
- Commands run:

## 7. Regression Watchlist

Watch these project areas closely because they are easy to regress:

- `src/components/SettingsModal.tsx`: custom listbox, nested confirmation dialog, focus trap, `Escape`
- `src/components/EventCard.tsx`: modal focus trap, event outcomes, disabled choices
- `src/components/ActiveGameLayout.tsx`: icon-only controls, live game status, Phaser loading state
- `src/components/HuntingMiniGame.tsx` and `src/components/PhaserGame.tsx`: canvas labels, keyboard equivalents, reduced motion
- `src/components/NewExpeditionSetup.tsx`: forms, validation, party selection, disabled start states
- `src/components/SaveControls.tsx`: live save status and disabled/available states
- `src/styles.css`: focus indicators, reduced-motion media query, contrast-sensitive tokens

## 8. Definition Of Done

An accessibility fix is done when:

- The original reproduction steps no longer fail.
- The affected flow works with keyboard only.
- Names, roles, states, and descriptions are correct in the accessibility tree.
- Visual focus is clear.
- The fix works at 200% zoom and narrow viewport widths.
- Reduced motion users are not forced through unnecessary animation.
- Tests cover the regression risk.
- The audit report or linked issue is updated with the final status.
