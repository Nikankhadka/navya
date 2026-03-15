# Navya Design System & Agent Guidelines

This document is the absolute single source of truth for the **Navya** application's design language, aesthetic foundation, and UI engineering standards. As an agent or developer working on this project, your goal is to build a top 0.1% consumer mobile application. Every component, margin, color, and interaction must precisely follow these guidelines to ensure a synchronous, visually stunning, and premium user experience.

---

## 1. Core Aesthetic Principles (Tailwind First)

We use **NativeWind v4** (Tailwind CSS) for all styling. **Do not** use `StyleSheet.create` or inline styles.

- **Premium Dark Mode First**: The application relies on deep, inky backgrounds contrasted with vibrant accents and glowing elements.
- **Intentional Negative Space**: UIs should breathe. Do not cram elements together. Group related information closely, but separate distinct sections with generous spacing classes (`p-xl`, `gap-xxl`, `mb-xxxl`).
- **Tactility & Depth**: Interfaces should feel physical. Elements that can be tapped must respond visually. Hover and press states are mandatory. We use layered elevation (background → surface → card) and subtle, tinted shadows to create depth, avoiding flat-looking gray shadows.
- **Rhythmic Typography**: Information hierarchy is driven by size, weight, and perfectly tuned contrast. Use bold/extrabold display fonts for emotional impact (titles, numbers) and readable sans-serif fonts for utility.

---

## 2. Color Palette & Theming (Tailwind Classes)

Do **not** use raw hex codes. Always use Tailwind utility classes (e.g. `bg-bg`, `text-accent`, `border-border`).

### Backgrounds & Surfaces
Used to establish the physical layers of the app, from the back wall to the foreground objects.
- `Colors.bg` (`#0A0A0F`): The absolute background of the app. Purest dark layer.
- `Colors.surface` (`#12121A`): Secondary background layer, used for bottom sheets, modals, or distinct visual groupings within a screen.
- `Colors.card` (`#1A1A26`): The standard foreground container for actionable or grouped items (e.g., a meal log entry, a stat card).
- `Colors.cardHover` (`#1F1F30`): The pressed/active state of a card.

### Borders & Dividers
Used for subtle separation. They should barely be noticeable until you look for them.
- `Colors.border` (`#2A2A3A`): Standard divider lines, input borders, and card outlines.
- `Colors.borderLight` (`#353548`): Used when a border needs slightly more emphasis against a `card` background.

### Brand & Accents
The primary identity of Navya. Used for primary actions, active states, and focus rings.
- `Colors.accent` (`#7C5CFC`): Primary brand color (Vibrant Purple).
- `Colors.accentSoft` (`#4F3AA8`): Darker purple for pressed states or gradient transitions.
- `Colors.accentMuted` (`rgba(124, 92, 252, 0.15)`): Used for secondary button backgrounds, selected pill backgrounds, or subtle highlights.

### Semantic Colors
Used universally to convey meaning (success, warning, error, info). Always pair the base color with its muted variant for backgrounds to maintain readability without overwhelming the dark theme.
- **Green (Success/Growth/Carbs)**: `green` (`#2FE5A3`), `greenMuted` (`rgba(47, 229, 163, 0.12)`)
- **Orange (Warning/Calories/Energy)**: `orange` (`#FF7A3D`), `orangeMuted` (`rgba(255, 122, 61, 0.12)`)
- **Red (Error/Destructive/Fat)**: `red` (`#FF4D6D`), `redMuted` (`rgba(255, 77, 109, 0.12)`)
- **Blue (Info/Water/Protein)**: `blue` (`#4DA6FF`), `blueMuted` (`rgba(77, 166, 255, 0.12)`)

### Text & Iconography
Strict contrast hierarchy for perfect legibility.
- `Colors.text` (`#F0F0FF`): Primary label text, headers, and active input text. High emphasis.
- `Colors.textSecondary` (`#B8B8D0`): Secondary information, subtitles. Medium emphasis.
- `Colors.muted` (`#8888AA`): Tertiary text, captions, inactive states. Low emphasis.
- `Colors.dim` (`#555570`): Input placeholders, disabled text, decorative icons. Lowest emphasis.

### Gradients
Gradients provide a 0.1% premium feel when used sparingly on primary buttons or hero graphics.
- `gradientAccent`: `['#7C5CFC', '#4F3AA8']`
- `gradientGreen`: `['#2FE5A3', '#1AB87E']`
- `gradientOrange`: `['#FF7A3D', '#E5562A']`
- `gradientDark`: `['#1A1A26', '#12121A']`

---

## 3. Typography System (`Typography`)

Typography is the backbone of the UI. Never use arbitrary font sizes.

### Font Families
- **Display (`fontDisplay`)**: Used for large numbers, hero titles, and the app brand. `Georgia` (iOS) / `serif` (Android) provides an elegant, editorial contrast to the modern app interface.
- **Body (`fontBody`)**: Used for everything else. Clean, geometric system sans-serif (`System` on iOS, `sans-serif` on Android).
- **Mono (`fontMono`)**: Used for code, precise data alignment (timers, specific metric displays).

### Sizes & Usage
- `display` (36px): Hero titles (e.g., "Navya" on login), massive stat numbers.
- `xxxl` (30px): Main screen headers.
- `xxl` (24px): Prominent section headers, large module titles.
- `xl` (20px): Standard section headers, modal titles.
- `lg` (17px): Primary button text, emphasized body text.
- `md` (15px): Default body text, form input text, standard list items.
- `sm` (13px): Secondary text, list subtitles, pill labels.
- `xs` (11px): Uppercase overlines, bottom tab labels, fine-print.

### Weights & Styling Rules
- **Regular (400)**: Standard body text.
- **Medium (500)**: Secondary labels, slightly emphasized body text.
- **Semibold (600)**: Buttons, table headers, important data points.
- **Bold (700)**: Section headers, screen titles, strong emphasis.
- **Extrabold (800)**: Exclusively for `display` text to give it architectural weight.
- **Letter Spacing**: Add `letterSpacing: 1` to uppercase `xs` text (e.g., "OR CONTINUE WITH") for a sophisticated look.

---

## 4. Spacing & Grid System (`Spacing`)

Spacing must strictly follow the 4pt/8pt grid system. Do not deviate.

- `xs` (4px): Space between an icon and text, or a label and its input.
- `sm` (8px): Inside small components (e.g., padding inside a pill).
- `md` (12px): Standard inner component padding. Space between list items.
- `lg` (16px): Default padding for standard buttons, cards, and text inputs.
- `xl` (20px): Outer screen margins (left/right padding of the layout).
- `xxl` (24px): Standard gap between distinct sections on a screen.
- `xxxl` (32px+): Hero section spacing, massive vertical gaps for visual grouping.

---

## 5. Shape, Borders & Elevation (`Radius` & `Shadow`)

### Border Radius
- `sm` (8px): Small UI elements like checkboxes, small badges.
- `md` (12px): Inner imagery, small nested cards.
- `lg` (16px): Primary standard for **Inputs**, **Buttons**, and **Standard Cards**.
- `xl` (20px): Large hero cards, bottom sheets, modals.
- `full` (999px): Avatars, pill-shaped tags, circular icon buttons.

### Elevation (Shadows)
In a dark theme, shadows must be tinted with the background or accent color, never pure black/gray (unless it's the absolute base shadow).
- `Shadow.sm`: Used for floating pills or sticky headers.
- `Shadow.md`: Used for active standard cards, primary buttons, or small modals. Features a subtle purple (`#7C5CFC`) glow.
- `Shadow.lg`: Used for heavy layered elements like bottom sheets, major featured cards. Creates a distinct atmospheric glow.

---

## 6. UI Component Construction Guidelines

When building or refactoring components, enforce these rules:

### Inputs (`<Input />`)
- **Structure**: Floating or standard top label (`Typography.size.sm`, `Colors.muted`, `marginBottom: Spacing.xs`).
- **Container**: `backgroundColor: Colors.card`, `borderWidth: 1`, `borderColor: Colors.border`, `borderRadius: Radius.lg`.
- **Text**: `color: Colors.text`, `fontSize: Typography.size.md`.
- **States**: 
  - *Focus*: `borderColor: Colors.accent`, apply `Shadow.sm` (glow).
  - *Error*: `borderColor: Colors.red`.

### Buttons (`<Button />`)
- **Primary**: Solid background (`Colors.accent` or `gradientAccent`). `Typography.weight.bold`, `Typography.size.lg`. White/Light text.
- **Secondary**: `backgroundColor: Colors.cardHover` or `Colors.surface`, `borderWidth: 1`, `borderColor: Colors.border`. Used for alternative actions (e.g., Apple/Google OAuth).
- **Ghost**: Transparent background. `color: Colors.accent` or `Colors.textSecondary`. Used for "Forgot Password" or tertiary actions.
- **Interactivity**: Must use `TouchableOpacity` or `Pressable` with `activeOpacity={0.8}` or a slight scale-down animation (`transform: [{ scale: 0.98 }]`).

### Cards (`<Card />`)
- **Structure**: `backgroundColor: Colors.card`, `borderRadius: Radius.lg` or `Radius.xl`.
- **Borders**: Highly recommended to use a subtle `1px` border (`Colors.border`) to distinctly separate the card from the true dark background (`Colors.bg`).
- **Content Padding**: Usually `Spacing.lg` or `Spacing.xl`.

### Section Dividers
- Never use a hard white line. Always use `Colors.border`.
- If including text in a divider (e.g., "OR"), use `Typography.size.xs`, `Colors.muted`, `fontWeight: 'bold'`, `letterSpacing: 1`.

---

## 7. Agent/Developer Action Checklist

Before submitting code, you **must** verify the following:
1. **No Hardcoded Values**: Are there any hardcoded hex codes (`#123`), font sizes (`14`), or margins (`10`)? **Reject them.** Import the standard tokens.
2. **Contrast Polish**: Does the text pop off the background perfectly? (e.g., `text` on `bg`, `textSecondary` for descriptions).
3. **Breathing Room**: Do the components feel squished? Apply `Spacing.xxl` between major groupings.
4. **Interactive Feedback**: Do actionable items respond to touch? Do buttons have loading states if they trigger async operations?
5. **Architectural Alignment**: Does the screen look like a cutting-edge 2026 application? Does it use the specified radiuses (`Radius.lg`/`xl`)?

*End of Document. Adhere to these principles perfectly.*
