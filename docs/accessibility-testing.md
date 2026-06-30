# Accessibility Testing

Frontier Reckoning uses two automated accessibility checks:

- `eslint-plugin-jsx-a11y` for static React/JSX accessibility linting.
- `@axe-core/playwright` for browser-level accessibility scans in Playwright.

Automation does not replace keyboard, screen reader, zoom/reflow, reduced-motion, or contrast review. Use it as a fast regression check before manual auditing.

## Run Accessibility Linting

```bash
npm run lint:a11y
```

This runs ESLint against React TSX files with the JSX accessibility recommended rule set. It checks for common issues such as invalid ARIA attributes, missing labels, invalid roles, inaccessible anchors, positive `tabIndex`, and mouse-only interaction patterns.

The regular lint command also includes the accessibility rules:

```bash
npm run lint
```

## Run Axe Browser Checks

```bash
npm run test:a11y
```

This runs the Playwright accessibility spec in `tests/e2e/accessibility.spec.ts`. The first scan covers the main menu because it is the app entry point and should remain free of automatically detectable WCAG A/AA violations.

The test uses axe tags for WCAG 2.0/2.1 A and AA plus WCAG 2.2 AA checks supported by axe:

```ts
new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
```

## When To Add More Axe Tests

Add focused scans when changing:

- Main menu and setup forms
- Settings or confirmation dialogs
- Event dialogs
- Camp, town, or river screens
- Save controls and dynamic status messages
- Canvas-adjacent fallback content

Keep each scan stable by navigating to a deterministic state before running axe. Prefer testing one meaningful screen state per test instead of scanning a long, changing gameplay flow.

## Recommended Local Check

Before opening a pull request that changes frontend UI, run:

```bash
npm run lint:a11y
npm run test:a11y
```

For broader release checks, continue to run:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```
