# Tenzir Design System

This directory contains the CSS design system for the Tenzir documentation site, based on the Uno CSS configuration used in the main Tenzir application.

## Overview

The design system follows a modular, composable architecture:

1. **`/src/assets/css/design-system-core.css`** - Core design tokens (CSS custom properties)
2. **`/src/assets/css/utilities.css`** - Utility classes that use the design tokens
3. **`/src/assets/styles.css`** - Global styles and Starlight integration (imports design-system-core.css)

## Design Tokens

All design tokens use the `--tnz-` prefix (for Tenzir) to avoid conflicts with Starlight's built-in variables.

### Core Variables (design-system-core.css)

#### Typography

- `--tnz-font-sans`: Inter Variable (primary font)
- `--tnz-font-mono`: JetBrains Mono Variable (code font)

#### Font Sizes

- `--tnz-text-xxs`: 0.625rem (10px)
- `--tnz-text-xs`: 0.75rem (12px)
- `--tnz-text-sm`: 0.875rem (14px)
- `--tnz-text-base`: 1rem (16px)
- `--tnz-text-lg`: 1.125rem (18px)
- `--tnz-text-xl`: 1.25rem (20px)
- `--tnz-text-2xl`: 1.5rem (24px)
- `--tnz-text-3xl`: 1.875rem (30px)
- `--tnz-text-4xl`: 2.25rem (36px)

#### Spacing Scale

- `--tnz-space-0` through `--tnz-space-8`: Consistent spacing values

#### Border Radius

- `--tnz-radius`: 5px (default)
- `--tnz-radius-sm`: 0.25rem
- `--tnz-radius-md`: 0.375rem
- `--tnz-radius-lg`: 0.5rem

#### Shadows

- `--tnz-shadow-xs`: Subtle shadow
- `--tnz-shadow-s`: Small shadow
- `--tnz-shadow-m`: Medium shadow
- `--tnz-shadow-s-light`: Light variant

#### Transitions

- `--tnz-transition-fast`: 0.15s ease
- `--tnz-transition-base`: 0.2s ease
- `--tnz-transition-slow`: 0.3s ease

#### Z-index Scale

- `--tnz-z-base` through `--tnz-z-tooltip`: Layering system

### Color Palette

#### Primary Colors

- `--tnz-primary-50` through `--tnz-primary-600`
- Main brand color: `--tnz-primary-500` (#0A54FF)

#### Neutral Colors

- `--tnz-neutral-50` through `--tnz-neutral-800`
- Special: `--tnz-dim` (#0E1017)

#### Semantic Colors

- Red: `--tnz-red-100` through `--tnz-red-600`
- Green: `--tnz-green-200` through `--tnz-green-600`
- Yellow: `--tnz-yellow-200` through `--tnz-yellow-600`
- Light Blue: `--tnz-lightblue-200` through `--tnz-lightblue-600`
- Purple: `--tnz-purple-200` through `--tnz-purple-600`
- Pink: `--tnz-pink-200` through `--tnz-pink-600`
- Orange: `--tnz-orange-200` through `--tnz-orange-600`

## Usage in Components

### In Astro Components

Use CSS variables directly in your styles:

```astro
<style>
  .my-component {
    font-family: var(--tnz-font-sans);
    font-size: var(--tnz-text-lg);
    color: var(--tnz-primary-500);
    border-radius: var(--tnz-radius);
    box-shadow: var(--tnz-shadow-s);
  }
</style>
```

### Utility Classes (utilities.css)

The utility classes use the core design tokens, ensuring consistency:

```astro
---
// Component logic here
---

<div class="tnz-p-4 tnz-bg-neutral-100 tnz-rounded tnz-shadow-s">
  <h3 class="tnz-text-lg tnz-font-semibold tnz-text-neutral-800">
    Title
  </h3>
  <p class="tnz-text-sm tnz-text-neutral-600 tnz-mt-2">
    Description text
  </p>
</div>
```

### Available Utility Classes

#### Text Utilities

- Size: `tnz-text-{size}` (xxs, xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- Font: `tnz-font-{family}` (sans, mono)
- Weight: `tnz-font-{weight}` (normal, medium, semibold, bold)
- Color: `tnz-text-{color}-{shade}`

#### Background

- `tnz-bg-{color}-{shade}`

#### Borders

- Color: `tnz-border-{color}-{shade}`
- Width: `tnz-border`, `tnz-border-0`, `tnz-border-2`
- Radius: `tnz-rounded-{size}` (none, sm, default, md, lg, full)

#### Spacing

- Padding: `tnz-p-{size}`, `tnz-px-{size}`, `tnz-py-{size}`
- Margin: `tnz-m-{size}`, `tnz-mx-{size}`, `tnz-my-{size}`, `tnz-mb-{size}`
- Sizes: 0, 1 (0.25rem), 2 (0.5rem), 3 (0.75rem), 4 (1rem), 5 (1.25rem), 6 (1.5rem), 8 (2rem)

#### Layout

- Display: `tnz-block`, `tnz-inline-block`, `tnz-flex`, `tnz-grid`, `tnz-hidden`
- Flexbox: `tnz-flex-{direction}`, `tnz-items-{align}`, `tnz-justify-{align}`
- Gap: `tnz-gap-{size}`

#### Effects

- Shadow: `tnz-shadow-{size}`
- Transition: `tnz-transition-{type}`

#### States

- Hover: `hover:tnz-{utility}`
- Focus: `focus:tnz-{utility}`

#### Responsive

- `sm:tnz-{utility}` (640px+)
- `md:tnz-{utility}` (768px+)
- `lg:tnz-{utility}` (1024px+)

## Migration Guide

When updating existing components:

1. Replace hardcoded colors with CSS variables:

   ```css
   /* Before */
   color: #0a54ff;

   /* After */
   color: var(--tnz-primary-500);
   ```

2. Replace hardcoded font sizes:

   ```css
   /* Before */
   font-size: 1.125rem;

   /* After */
   font-size: var(--tnz-text-lg);
   ```

3. Replace hardcoded border radius:

   ```css
   /* Before */
   border-radius: 5px;

   /* After */
   border-radius: var(--tnz-radius);
   ```

4. Use utility classes for common patterns:

   ```astro
   <!-- Before -->
   <div style="padding: 1rem; margin-bottom: 1rem; border-radius: 5px;">

   <!-- After -->
   <div class="tnz-p-4 tnz-mb-4 tnz-rounded">
   ```

## Best Practices

1. **Always use design tokens** for colors, typography, spacing, and shadows
2. **Prefer CSS variables** over utility classes for component-specific styles
3. **Use utility classes** for layout and common patterns
4. **Keep specificity low** by avoiding deeply nested selectors
5. **Test in both light and dark modes** as the design system supports both
6. **Never duplicate token definitions** - reference them from design-system-core.css
7. **Use the spacing scale** (`--tnz-space-*`) for consistent spacing

## Starlight Integration

The design system integrates with Starlight's theming by:

- Mapping Tenzir colors to Starlight's CSS variables in `styles.css`
- Respecting Starlight's light/dark mode switching
- Maintaining compatibility with Starlight's built-in components

Key mappings (defined in styles.css):

- `--sl-font` → `--tnz-font-sans`
- `--sl-font-mono` → `--tnz-font-mono`
- `--sl-color-accent` → `--tnz-primary-500`
- Text sizes, colors, and more

## File Structure

```
src/assets/
├── styles.css                    # Global styles, imports design-system-core
└── css/
    ├── design-system-core.css    # Core design tokens (variables only)
    ├── utilities.css             # Utility classes using the tokens
    └── README.md                 # This file
```
