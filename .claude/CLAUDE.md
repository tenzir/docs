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


## Partials

Import reusable content from `/src/partials/`:

```mdx
import ParsingOptions from '@partials/operators/ParsingOptions.mdx';

<ParsingOptions />
```

Partials are inlined during Markdown processing, so their headings participate
in the page TOC and automatic anchor links. Only default imports that resolve
inside `/src/partials/` are inlined; other component imports behave normally.

## Workflow

By default, use `bun run dev` to start a development server in the background
for live preview during development.

Only use `bun run build` when you actually need to inspect build artifacts.
Output goes to `dist/`.

### Generated Content

Some content is auto-generated and excluded from linting:

- **Changelog**: Run `bun run generate:changelog` to fetch from `tenzir/news` repo.
  Generated files: `src/content/docs/changelog/`, `src/sidebar-changelog.ts`.
  The stub file `src/content/docs/changelog/index.mdx` is tracked but should not
  show as modified locally. Run this once after cloning:
  ```bash
  git update-index --skip-worktree src/content/docs/changelog/index.mdx
  ```
- **Excalidraw Diagrams**: Run `bun run generate:excalidraw` to convert `.excalidraw`
  source files to SVG. In markdown, reference diagrams as `![alt](foo.excalidraw)`.
  The remark plugin inlines the corresponding `foo.excalidraw.svg` directly into
  HTML for CSS dark mode support. Generated SVGs are gitignored.
- **LLM Documentation**: Enabled via `LLMS_TXT=true`. The local starlight-llms-txt
  plugin implements the [llmstxt.org](https://llmstxt.org/) standard, generating
  `/llms.txt` (documentation map with page descriptions and headings),
  `/llms-full.txt` (complete documentation bundle), and per-page `.md` files.
  These outputs are for LLM consumption and not tracked in git.
- **OCSF Reference**: Run `bun run generate:ocsf` for latest version or
  `bun run generate:ocsf:all` for all versions. Fetches schema from schema.ocsf.io
  and articles from ocsf/ocsf-docs. Generated files: `src/content/docs/reference/ocsf/`,
  `src/sidebar-ocsf.generated.ts`, `src/ocsf-version.mjs`.
- **Agent Skill**: Run `bun run build:skill` to generate the Tenzir agent skill.
  Requires `bun run build:full` first to generate per-page markdown files in `dist/`.
  Generated files: `tenzir-skill/SKILL.md`, `tenzir-skill/<doc-hierarchy>/`.

### Linting

- Run `bun run lint` to check markdownlint, ESLint, and Prettier.
- Run `bun run lint:fix` to apply automatic fixes across all linters.
- Link checking runs separately in CI via `bun run build:linkcheck`.

### Reviewing Pull Requests

When reviewing a PR as the GitHub @claude bot, follow these guidelines:

- Keep your feedback terse. Use concise and actionable instructions.
- Prefer bullet lists. Use examples only where needed to improve clarity.
- Avoid overly verbose explanations. Focus on the most important points.
