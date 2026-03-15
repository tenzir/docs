# Partials

Use partials in `src/partials/` for reusable documentation fragments.

## Basic usage

Import a partial with the `@partials/` alias and render it as a component:

```mdx
import ParsingOptions from '@partials/operators/ParsingOptions.mdx';

<ParsingOptions />
```

Prefer a default import that resolves inside `src/partials/`. Those imports are
inlined during Markdown processing.

## How inline partials behave

The inline partials pipeline expands partial content into the page, so:

- Headings from partials participate in the page TOC.
- Automatic anchor links work for those headings.
- Prop substitutions affect the final heading text that appears in the TOC.
- Imports for non-partial components used inside partials are hoisted and kept
  in the page.

Only default imports that resolve inside `src/partials/` are inlined. Other
component imports behave normally.

## When to use a partial

Use a partial when the same documentation fragment appears in multiple pages,
especially for repeated option lists, shared parameter descriptions, or common
integration details.

## Validation

After changing a partial or the inline-partials pipeline, run:

```sh
bun run test:inline-partials
```

This verifies that headings are inlined and props substitutions match TOC text.
