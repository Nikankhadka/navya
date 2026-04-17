# Navya Design System: Mist & Moss Editorial Variant

This document is the current source of truth for Navya's visual direction. The active theme is a Mist & Moss editorial refresh: cool forest surfaces, soft atmospheric depth, moss-green call-to-actions, and responsive typography tuned for mobile-first layouts that still read cleanly on tablet and desktop.

## Current Implementation Notes

- The live app currently uses React Native `StyleSheet` styling plus shared tokens in `src/constants/theme.ts`.
- `src/components/ui` remains the compatibility layer for shared primitives.
- This document does not begin the Tamagui migration. It defines the active token language the current app should use today.

## Creative Direction

- Build atmosphere, not generic dark mode.
- Favor tonal separation between surfaces over obvious borders.
- Keep the single-column mobile shell on web; tablet and desktop should feel more editorial through type and spacing, not through layout expansion.
- Preserve the current component set and screen structure unless a product need requires otherwise.

## Color System

### Foundation

- `Colors.canopyBlack`: outer frame and deepest backdrop
- `Colors.surface`: base page tone
- `Colors.surfaceContainerLowest`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh`, `surfaceContainerHighest`: the primary layering ladder for cards, nested regions, and elevated containers
- `Colors.surfaceBright`: focused input and brighter lifted states
- `Colors.surfaceVariant`: translucent floating or frosted layers

### Accent And Atmosphere

- `Colors.primary`: moss green for primary actions and active emphasis
- `Colors.primaryContainer`: darker moss for depth and CTA transitions
- `Colors.secondary`: mist blue for supporting highlights and calm emphasis
- `Colors.secondaryContainer`: cool blue-grey used for ambient glow and colder elevation

### Text

- `Colors.onSurface`: strongest readable foreground
- `Colors.onSurfaceVariant`: softer body copy and supporting text
- Avoid pure white. Use the token scale instead.

### Separation Rule

- Default to surface shifts and spacing before borders.
- If a boundary is required, use low-opacity ghost borders derived from `outlineVariant`.
- Do not introduce hard divider lines or sharp, high-contrast outlines unless accessibility clearly needs them.

## Typography

- Current font families remain in place for this phase.
- Use `Typography.size` as the mobile-safe baseline.
- Use `getTypeScale(width)` when wiring prominent text so tablet and desktop receive a modest type lift without layout changes.
- Use the line-height maps in `Typography.lineHeight` or `getLineHeightScale(width)` for large titles, body copy, and longer supporting text.
- Display and hero text should feel editorial and slightly tightened; body copy should stay calm and readable.

## Components

### Cards

- Default cards should sit on `surfaceContainer` or `surfaceContainerHigh`.
- Prefer 24px radii for standard cards.
- Elevation comes from tonal layering and cool ambient shadows, not warm drop shadows.

### Buttons

- Primary buttons use the moss gradient from `Colors.gradientAccent`.
- Secondary buttons should feel ghosted or recessed, not heavy.
- Keep text legible with `onPrimary` or `onSurface` depending on variant.

### Inputs

- Default resting state should feel recessed on `surfaceContainerLowest`.
- Focus should brighten toward `surfaceBright` with a subtle primary ghost outline.
- Labels should use the softer secondary-container text tone.

### Progress And Signals

- Progress, chips, and active indicators should lean moss or mist blue.
- Segmented signals are encouraged when they fit the existing component shape.

## Engineering Guidance

- Prefer shared tokens over hardcoded colors, font sizes, or radii.
- When touching visible screens, use the responsive type helpers for hero text, section titles, and key data values.
- Keep screen structure stable. This refresh is a visual retune, not a rebuild.
- If a future change introduces bundled fonts, document the rollout separately before changing the current typography contract.
