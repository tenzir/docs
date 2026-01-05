This is an [Astro](https://astro.build/)
[Starlight](https://starlight.astro.build/) project hosting the documentation
for Tenzir (https://tenzir.com).

## Project Architecture

- Content: `/src/content/docs/` contains documentation in `.md` and `.mdx`
  formats.
- Components: Astro components in `/src/components/`, reusable content partials
  in `/src/partials/`.
- Static Assets: Images in `/src/assets/` (processed) or `/public/` (served
  as-is).
- Configuration: `/astro.config.mjs`
- Styling: Custom CSS in `/src/styles/`
- Sidebar: manually managed in `/src/sidebar.ts`. Add new pages here.
- Topics: `/src/topics.yaml` defines the navigation topic hierarchy.

## Content Authoring

When writing or editing documentation content, invoke the `docs:authoring` skill
for Diátaxis framework guidance, file format details, and writing style.

For comprehensive contributor documentation including local development setup,
image optimization, and diagram workflows, see
[Documentation Guide](/guides/contribution/documentation).

### Headings and Titles

Use **sentence case** for all headings and page titles. Capitalize only the
first word, the first word after a colon, and proper nouns (product names,
acronyms like OCSF or MCP).

## Partials

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

- **Changelog**: Run `pnpm generate:changelog` to fetch from `tenzir/news` repo.
  Generated files: `src/content/docs/changelog/`, `src/sidebar-changelog.ts`.
  The stub file `src/content/docs/changelog/index.mdx` is tracked but should not
  show as modified locally. Run this once after cloning:
  ```bash
  git update-index --skip-worktree src/content/docs/changelog/index.mdx
  ```
- **Docs Map**: Run `pnpm generate:docs-map` to create the documentation map.
  Generated file: `public/sitemap.md`.
- **Excalidraw Diagrams**: Run `pnpm generate:excalidraw` to convert `.excalidraw`
  source files to SVG. In markdown, reference diagrams as `![alt](foo.excalidraw)`.
  The remark plugin inlines the corresponding `foo.excalidraw.svg` directly into
  HTML for CSS dark mode support. Generated SVGs are gitignored.

### Linting

- Run `pnpm lint` to check markdownlint, ESLint, and Prettier.
- Run `pnpm lint:fix` to apply automatic fixes across all linters.
- Link checking runs separately in CI via `pnpm build:linkcheck`.

### Reviewing Pull Requests

When reviewing a PR as the GitHub @claude bot, follow these guidelines:

- Keep your feedback terse. Use concise and actionable instructions.
- Prefer bullet lists. Use examples only where needed to improve clarity.
- Avoid overly verbose explanations. Focus on the most important points.
