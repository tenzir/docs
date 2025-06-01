# Tenzir Design System Implementation Summary

## Overview

We've successfully implemented a comprehensive design system for the Tenzir documentation site that aligns with the Uno CSS configuration used in the main Tenzir application. The design system uses the `--tnz-` prefix for all custom properties to maintain a clear namespace.

## What Was Implemented

### 1. Core Design Tokens (`/src/assets/styles.css`)

- **Typography**: Font families (Inter Variable for sans, JetBrains Mono Variable for mono)
- **Font Sizes**: From `--tnz-text-xxs` (10px) to `--tnz-text-4xl` (36px)
- **Border Radius**: Standard radius of 5px with variants (sm, md, lg)
- **Shadows**: Four shadow levels (xs, s, m, s-light)
- **Color Palette**:
  - Primary colors (50-600)
  - Neutral colors (50-800, plus `dim`)
  - Semantic colors (red, green, yellow, lightblue, purple, pink, orange)

### 2. Starlight Integration

The design system maps Tenzir tokens to Starlight's expected CSS variables:
- Font families map to `--sl-font` and `--sl-font-mono`
- Colors map to Starlight's color system
- Text sizes map to Starlight's typography scale
- Supports both light and dark modes with proper color inversions

### 3. Utility Classes (`/src/assets/css/design-tokens.css`)

Created a comprehensive set of utility classes for:
- Typography (size, weight, family, color)
- Spacing (padding, margin)
- Layout (flexbox, grid, display)
- Borders (width, style, radius, color)
- Backgrounds
- Shadows
- Transitions
- Responsive variants (sm, md, lg breakpoints)

### 4. Component Updates

Updated existing components to use the design system:
- **ReferenceCard.astro**: Now uses `--tnz-` variables for typography, spacing, and shadows
- **TenzirFooter.astro**: Updated to use design system font sizes
- Created **ExampleCard.astro**: A demonstration component showing best practices

## Usage Guidelines

### In Component Styles
```css
.my-component {
  font-family: var(--tnz-font-sans);
  font-size: var(--tnz-text-lg);
  color: var(--tnz-primary-500);
  border-radius: var(--tnz-radius);
  box-shadow: var(--tnz-shadow-s);
}
```

### With Utility Classes
```html
<div class="tnz-p-4 tnz-bg-neutral-100 tnz-rounded tnz-shadow-s">
  <h3 class="tnz-text-lg tnz-font-semibold tnz-text-neutral-800">
    Title
  </h3>
</div>
```

## Migration Path

When updating existing components:
1. Replace hardcoded colors with `--tnz-` color variables
2. Replace hardcoded font sizes with `--tnz-text-*` variables
3. Replace `5px` border radius with `var(--tnz-radius)`
4. Use shadow variables instead of custom box-shadow values
5. Consider using utility classes for common layout patterns

## Benefits

1. **Consistency**: All components now use the same design tokens
2. **Maintainability**: Changes to the design system propagate automatically
3. **Alignment**: Documentation site matches the main Tenzir application's design
4. **Developer Experience**: Clear naming conventions and comprehensive utilities
5. **Theme Support**: Seamless light/dark mode switching

## Next Steps

To fully leverage the design system:
1. Audit remaining components for hardcoded values
2. Create additional utility classes as needed
3. Document component patterns and best practices
4. Consider creating a visual style guide page
5. Set up linting rules to enforce design token usage

## Technical Notes

- The design system is loaded via `astro.config.mjs` in the `customCss` array
- CSS custom properties ensure runtime theming capabilities
- Utility classes provide Tailwind-like developer experience without the build complexity
- All values are derived from the original Uno CSS configuration for consistency