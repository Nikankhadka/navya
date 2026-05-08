# ADR 0002: UI Stack Decision

## Decision

Use `Tamagui` as the primary UI foundation for Navya.

## Why

- Navya is a mobile-first Expo app
- the current custom UI layer is acceptable for early scaffolding but not ideal for long-term scale
- Tamagui is a better fit than `shadcn/ui` or Radix because it is native-friendly and supports Expo well
- migration can happen incrementally without a full rewrite

## Rejected Alternatives

### Shadcn UI

Rejected because it is web-first and not the right primary abstraction for React Native screens.

### Radix UI

Rejected because it solves web primitive concerns well, but does not provide the right native-first foundation for this app.

### Keep The Current Custom Layer

Rejected as the long-term direction because it increases maintenance burden and encourages repeated reinvention of shared primitives.

## Consequence

Future shared UI work should move toward Tamagui primitives and tokens, with the current `src/components/ui` layer treated as transitional.
