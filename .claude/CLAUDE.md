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

### First Paragraph Guidelines

The first paragraph of every doc appears in AI skill summaries and search
results. Orient the reader to the document type and what they'll gain.

**Pattern by document type:**

| Type        | Pattern                          | Example                                           |
| ----------- | -------------------------------- | ------------------------------------------------- |
| Guide       | "This guide shows you how to..." | "This guide shows you how to fetch data from..."  |
| Tutorial    | "This tutorial teaches you..."   | "This tutorial teaches you to write idiomatic..." |
| Explanation | "This page explains..."          | "This page explains TQL's type system..."         |
| Reference   | "This reference documents..."    | "This reference documents configuration..."       |

**Rules:**

1. **State the document type**: Help readers know they're in the right place.
2. **Explain what they'll learn or achieve**: Add "You'll learn..." or similar.
3. **Complete sentences before lists**: Don't end the paragraph with a colon.
4. **Be specific**: Include key terms readers might search for.

## Partials

Import reusable content from `/src/partials/`:

```mdx
import ParsingOptions from '@partials/operators/ParsingOptions.mdx';

<ParsingOptions />
```

## Workflow

### Development Server

- Use `bun run dev` to start a development server in the background for live
  preview during development.
- Use `bun run build` only when you need to inspect build artifacts. Output goes
  to `dist/`.

### Generated Content

Some content is auto-generated and excluded from linting:

- **Changelog**: Run `bun run generate:changelog` to fetch from `tenzir/news` repo.
  Generated files: `src/content/docs/changelog/`, `src/sidebar-changelog.ts`.
  The stub file `src/content/docs/changelog/index.mdx` is tracked but should not
  show as modified locally. Run this once after cloning:
  ```bash
  git update-index --skip-worktree src/content/docs/changelog/index.mdx
  ```
- **Docs Map**: Run `bun run generate:docs-map` to create the documentation map.
  Generated file: `public/sitemap.md`.
- **Excalidraw Diagrams**: Run `bun run generate:excalidraw` to convert `.excalidraw`
  source files to SVG. In markdown, reference diagrams as `![alt](foo.excalidraw)`.
  The remark plugin inlines the corresponding `foo.excalidraw.svg` directly into
  HTML for CSS dark mode support. Generated SVGs are gitignored.
- **OCSF Reference**: Run `bun run generate:ocsf` for latest version or
  `bun run generate:ocsf:all` for all versions. Fetches schema from schema.ocsf.io
  and articles from ocsf/ocsf-docs. Generated files: `src/content/docs/reference/ocsf/`,
  `src/sidebar-ocsf.generated.ts`, `src/ocsf-version.mjs`.
- **Agent Skill**: Run `bun run build:skill` to generate the Tenzir agent skill.
  Requires `bun run build:full` first to generate per-page markdown files in `dist/`.
  Generated files: `tenzir/SKILL.md`, `tenzir/references/`.

### Linting

- Run `bun run lint` to check markdownlint, ESLint, and Prettier.
- Run `bun run lint:fix` to apply automatic fixes across all linters.
- Link checking runs separately in CI via `bun run build:linkcheck`.

### Reviewing Pull Requests

When reviewing a PR as the GitHub @claude bot, follow these guidelines:

- Keep your feedback terse. Use concise and actionable instructions.
- Prefer bullet lists. Use examples only where needed to improve clarity.
- Avoid overly verbose explanations. Focus on the most important points.
