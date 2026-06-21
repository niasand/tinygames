# Tango Unlimited Design System

## 1. Atmosphere & Identity

Tango Unlimited should feel like a focused puzzle table: quiet, legible, and tactile. The signature is a crisp square board floating on a soft neutral surface, with the two game marks carrying the only strong color.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/page | `--tango-surface-page` | `var(--mantine-color-gray-0)` | n/a | App background |
| Surface/board | `--tango-surface-board` | `var(--mantine-color-white)` | n/a | Board shell and cells |
| Surface/cell-hover | `--tango-surface-cell-hover` | `var(--mantine-color-gray-1)` | n/a | Hover state for playable cells |
| Surface/cell-locked | `--tango-surface-cell-locked` | `var(--mantine-color-gray-0)` | n/a | Prefilled locked cells |
| Text/primary | Mantine `dark.9` | Mantine token | n/a | Headings and primary copy |
| Text/secondary | Mantine `dimmed` | Mantine token | n/a | Legal and helper copy |
| Border/default | Mantine `gray.3` | Mantine token | n/a | Field and paper borders |
| Accent/action | Mantine `indigo` | Mantine token | n/a | Primary action, focus ring, moon mark |
| Accent/sun | Mantine `yellow` | Mantine token | n/a | Sun mark and flawless badge |
| Accent/complete | Mantine `teal.6` | Mantine token | n/a | Completion modal background |
| Constraint/icon | `--tango-constraint-color` | `var(--mantine-color-gray-6)` | n/a | Equal and X rule markers |
| Focus/ring | `--tango-focus-ring` | `var(--mantine-color-indigo-5)` | n/a | Keyboard focus outline |

### Rules

- The board marks are the only saturated colors on the main screen.
- Interactive states use Mantine indigo or the documented focus token.
- No raw color literals in component CSS; extend this table first.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| H1 | `clamp(1.875rem, 7vw, 2.125rem)` | 700 | 1.1 | 0 | App title |
| Body/lg | Mantine `lg` | 700 | default | 0 | Main tagline |
| Body | Mantine default | 400 | default | 0 | Description copy |
| Body/sm | Mantine `xs` | 400 | default | 0 | Legal copy |
| Numeric | Mantine default + tabular nums | 400 | default | 0 | Timer, seed URL |

### Font Stack

- Primary: Mantine default system sans stack.
- Mono: system monospace only for copied technical values if needed.

### Rules

- Main copy should stay under roughly 65 characters per line.
- Numeric UI uses tabular figures where alignment matters.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a base of 4px via Mantine spacing tokens.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Constraint icon halo |
| Mantine `xs` | 10px | Compact controls |
| Mantine `sm` | 12px | Board padding |
| Mantine `md` | 16px | Header gap and timer padding |
| Mantine `lg` | 20px | Section separation |
| Mantine `xl` | 32px | Page padding |

### Grid

- Main content width: Mantine `Container size="xs"`.
- Board: 6 by 6 square grid inside a fixed 1:1 aspect-ratio container.
- Mobile header: two-column row, title left and account action right.
- Extra-small header: preserve the account action as an icon-sized control with an accessible label.

### Rules

- Fixed-format UI such as the board must use stable dimensions.
- Long technical strings, including board URLs, must wrap inside the content width.

## 5. Components

### App Shell

- **Structure**: `main` container, responsive header, game board, actions, supporting copy.
- **Spacing**: Mantine `xl` page padding, `lg` section rhythm.
- **States**: mobile header must not wrap controls onto a second accidental row.
- **Accessibility**: app content lives inside a `main` landmark.

### Board Cell

- **Structure**: semantic `button` for playable cells and disabled button for locked cells.
- **Variants**: empty, sun, moon, locked, constrained.
- **Spacing**: full-cell icon centered within a 6 by 6 grid.
- **States**: default, hover, active, focus-visible, disabled.
- **Accessibility**: every cell exposes row, column, current mark, and locked/playable state through its label.
- **Motion**: active press uses a short transform-only scale.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 120-150ms | ease-out | Cell hover, press, focus |
| Standard | 200ms | ease-in-out | Existing modal transition |

### Rules

- Interactive elements must have hover, active, and focus states.
- Use `transform`, `opacity`, and color changes only for micro-interactions.
- Respect native button keyboard behavior rather than recreating it in JavaScript.

## 7. Depth & Surface

### Strategy

Mixed, with Mantine shadows only for the floating board and modal surfaces. Cell-level depth uses tonal shifts and focus outlines.

| Level | Value | Usage |
|-------|-------|-------|
| Board | Mantine `shadow="md"` | Main puzzle surface |
| Constraint halo | `0 0 0 var(--space-1) var(--tango-surface-board)` | Keep rule icons legible between cells |
| Focus | `0 0 0 2px var(--tango-focus-ring)` | Keyboard focus on cells |
