This is an [Astro](https://astro.build/)
[Starlight](https://starlight.astro.build/) project hosting the documentation
for Tenzir (https://tenzir.com).

## Project Architecture

- Content: `/src/content/docs/` contains documentation in `.md`, `.mdx`, and
  `.mdoc` (Markdoc) formats.
- Components: Astro components in `/src/components/`, reusable content partials
  in `/src/partials/`.
- Static Assets: Images in `/src/assets/` (processed) or `/public/` (served
  as-is).
- Configuration: `/astro.config.mjs`
- Styling: Custom CSS in `/src/styles/`
- Sidebar: manually managed in `/src/sidebar.ts`. Add new pages here.

## Content Patterns

### Frontmatter

Standard pages use `title` and optionally `description`:

```yaml
---
title: Page Title
description: Optional description
---
```

Reference pages (functions, operators) include `category` and `example`:

```yaml
---
title: abs
category: Math
example: 'abs(-42)'
---
```

### Code Blocks

Use `tql` as the language identifier for Tenzir Query Language:

```tql
from {x: 42}
where x > 0
```

### Partials

Import reusable content from `/src/partials/`:

```mdx
import ParsingOptions from '@partials/operators/ParsingOptions.mdx';

<ParsingOptions />
```

## Workflow

### Development Server

- Use `pnpm dev` to start a development server in the background for live
  preview during development.
- Use `pnpm build` only when you need to inspect build artifacts. Output goes
  to `/build`.

### Generated Content

Some content is auto-generated and excluded from linting:

- **Changelog**: Run `pnpm sync:changelog` to fetch from `tenzir/news` repo.
  Generated files: `src/content/docs/changelog/`, `src/sidebar-changelog.ts`.

### Linting

- Run `pnpm lint` to check markdownlint, ESLint, and Prettier.
- Run `pnpm lint:fix` to apply automatic fixes across all linters.
- Link checking runs separately in CI via `pnpm build:linkcheck`.

### Reviewing Pull Requests

When reviewing a PR as the GitHub @claude bot, follow these guidelines:

- Keep your feedback terse. Use concise and actionable instructions.
- Prefer bullet lists. Use examples only where needed to improve clarity.
- Avoid overly verbose explanations. Focus on the most important points.
