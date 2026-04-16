# Forest Motion

## Intent

Navya should feel like a premium fitness product shaped by natural materials and quiet depth, not a generic dark SaaS dashboard. The right adaptation is:

- Apple: restraint, hierarchy, calm transitions, and cinematic entry moments
- Nothing: segmented signal language, precise UI rhythm, and subtle hardware-like accents
- Nature: bark, soil, moss, water, parchment, and warm contrast instead of purple gradients

## Token Direction

Use the shared theme primitives in `src/constants/theme.ts` as the source of truth.

- Base canvas: `canopyBlack`, `wetSoil`, `barkBrown`
- Surfaces: `surface`, `card`, `cardHover`, `forestGlass`
- Primary action and selection: `accent` / `youngLeaf`
- Secondary progress and steady-state success: `green` / `fern`
- Energy and high-attention CTA: `orange` / `wildflowerAmber`
- Hydration and info: `blue` / `riverBlue`
- Text: `text` / `parchment`, `textSecondary` / `softLichen`, `muted`, `dim`

## Material Rules

- Cards should feel matte and layered, not glossy.
- Hero cards can use quiet glow or subtle internal contrast, but avoid full-screen candy gradients.
- Chips, tabs, and progress rails should use segmented or etched treatment where possible.
- Accent color should not flood the whole layout; use it to guide the eye.

## Motion Rules

- default enter timing: `Motion.quick` to `Motion.slow`
- hero modules: subtle fade + settle
- progress: segmented fills instead of sweeping neon bars
- sheets: rise from bottom with clean scrim
- celebrations: under `Motion.celebration`
- reduced motion: keep hierarchy changes, remove ornamental drift

## Shared Components

Current shared primitives to build on:

- `Card`
- `Button`
- `Input`
- `Badge`
- `SectionHeader`
- `EmptyState`
- `MetricTile`
- `QuickActionChip`
- `SheetHandle`
- `MacroRing`
- `ProgressBar`

## Page-Level Rules

- one dominant hero or next-action module per page
- support default, loading, empty, disabled, success, and error states where relevant
- keep thumb-first actions visible
- never hide destructive actions behind secret gestures
- preserve demo mode as a first-class experience

## Near-Term Reserved Slots

Design space should stay open for these slices without adding new routes:

- workout history in `/(tabs)/workout`
- weekly coach summary in `/(tabs)/coach` and preview on `/(tabs)/index`
- barcode-assisted capture in `/(tabs)/nutrition` behind a flag
- real adherence and aggregate stats in `/(tabs)/profile` and `/(tabs)/index`
