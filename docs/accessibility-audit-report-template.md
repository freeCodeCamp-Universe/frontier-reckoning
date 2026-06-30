# Accessibility Audit Report Template

Copy this template for each audit. Keep findings practical and reproducible so a developer can fix them without re-running the whole audit from scratch.

## Audit Summary

- Project: Frontier Reckoning
- Audit date:
- Auditor:
- Branch or commit:
- WCAG target: WCAG 2.2 Level A/AA
- Browsers/devices tested:
- Assistive technology tested:
- Viewports tested:
- Zoom levels tested:
- App states tested:

## Commands Run

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Results:

- Lint:
- Unit/component tests:
- End-to-end tests:
- Build:
- Manual browser checks:

## Scope

Screens, components, and flows included:

- Main menu
- New expedition setup
- Active game layout
- Event dialog
- Settings dialog
- Reset save confirmation dialog
- Return to menu confirmation dialog
- Camp and hunting
- Town
- River crossing
- Ending screens

Out of scope:

-

## Executive Summary

Overall status:

- Pass
- Pass with follow-up fixes
- Blocked by critical issues

Summary:

-

## Finding Severity

- Critical: Blocks core use of the app for keyboard, screen reader, low vision, touch, or motion-sensitive users.
- High: Blocks an important flow or creates a likely failure against WCAG 2.2 A/AA.
- Medium: Creates friction, confusion, missing context, or a partial WCAG failure.
- Low: Minor improvement, polish, or future-proofing.

## Findings

### Finding 1: Short Descriptive Title

- Severity:
- WCAG 2.2 criterion:
- Screen/component:
- File(s):
- User impact:
- Steps to reproduce:
- Expected result:
- Actual result:
- Suggested fix:
- Test coverage to add or update:
- Owner:
- Status:
- Linked issue/PR:

Evidence:

```text
Paste concise console output, accessibility tree notes, screenshots path, or reproduction notes here.
```

Bad pattern:

```tsx
<button type="button">
  <X />
</button>
```

Good pattern:

```tsx
<button type="button" aria-label="Close settings">
  <X aria-hidden="true" />
</button>
```

### Finding 2: Short Descriptive Title

- Severity:
- WCAG 2.2 criterion:
- Screen/component:
- File(s):
- User impact:
- Steps to reproduce:
- Expected result:
- Actual result:
- Suggested fix:
- Test coverage to add or update:
- Owner:
- Status:
- Linked issue/PR:

Evidence:

```text

```

## Manual Test Log

### Keyboard

- Can reach every interactive control:
- Focus order follows visual/task order:
- `Enter` and `Space` activate controls:
- `Escape` closes dismissible dialogs:
- Custom controls support expected keys:
- Focus is trapped in modal dialogs:
- Focus returns after closing dialogs:
- Essential canvas/game interactions have keyboard support or equivalent alternate flow:

Notes:

-

### Screen Reader And Accessibility Tree

- Page has correct `lang` and title:
- Landmarks are clear:
- Headings are logical:
- Controls have accessible names:
- Groups and status regions are named:
- Dialogs have names/descriptions:
- Live regions announce useful updates without excessive chatter:

Notes:

-

### Forms And Validation

- Inputs have labels:
- Errors are text-based and associated with fields:
- Required state is clear:
- Invalid fields expose `aria-invalid` when appropriate:
- Focus moves to useful error context after failed submit:

Notes:

-

### Visual And Low Vision

- Text contrast passes 4.5:1:
- Large text contrast passes 3:1:
- Non-text UI contrast passes 3:1:
- Focus indicators are visible:
- Information is not conveyed by color alone:
- Content works at 200% zoom:
- Content reflows at 320 CSS pixels:

Notes:

-

### Motion

- App setting for reduced motion works:
- `prefers-reduced-motion` works:
- No essential information depends only on animation:
- Canvas/Phaser animation is reduced or has an equivalent cue:

Notes:

-

### Pointer And Touch

- Targets are at least 24 by 24 CSS pixels:
- Adjacent targets have enough spacing:
- Pointer gestures have simple alternatives:
- Dragging is not required for core functionality unless an accessible alternative exists:

Notes:

-

## WCAG 2.2 A/AA Coverage Map

Use this as a practical mapping, not as legal certification.

- Semantic structure: 1.3.1, 2.4.6
- Page title and language: 2.4.2, 3.1.1
- Images and icons: 1.1.1, 4.1.2
- Links and controls: 2.4.4, 2.5.3, 4.1.2
- Forms and validation: 1.3.1, 3.3.1, 3.3.2, 3.3.3, 4.1.3
- Keyboard access: 2.1.1, 2.1.2, 2.1.4
- Focus indicators and focus order: 2.4.3, 2.4.7, 2.4.11, 2.4.12
- Dialogs and custom controls: 2.1.2, 2.4.3, 4.1.2
- Live regions and status messages: 4.1.3
- Contrast and non-color cues: 1.4.1, 1.4.3, 1.4.11
- Pointer targets and gestures: 2.5.1, 2.5.5, 2.5.8
- Zoom and reflow: 1.4.4, 1.4.10, 1.4.12
- Reduced motion: 2.2.2, 2.3.3
- Disabled controls: 1.3.1, 3.3.2, 4.1.2
- Keyboard shortcuts: 2.1.4

## Final Decision

- Release approved:
- Release blocked:
- Required fixes before release:
- Follow-up fixes allowed after release:
- Known limitations:

Sign-off:

- Auditor:
- Engineering owner:
- Date:
