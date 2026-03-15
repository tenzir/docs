# Tenzir Documentation

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

## Agent references

Keep additional agent guidance in `.agents/` at the repository root instead of
nested `AGENTS.md` files. Read the relevant reference before you edit that area.

- [`.agents/references/content.md`](.agents/references/content.md): read when
  editing pages under `src/content/docs/`. Covers content authoring rules,
  including semantic cross-references such as `<Op>where</Op>`,
  `<Fn>count</Fn>`, `<Guide>data-shaping/filter-and-select-data</Guide>`, and
  See Also sections. In `.mdx` pages, prefer these semantic links over plain
  markdown links unless you need custom link text, emphasis, or a specific
  anchor target.
- [`.agents/references/components.md`](.agents/references/components.md): read
  when editing or creating files under `src/components/`. Covers Starlight
  built-in components, custom wrappers, and usage guidance.
- [`.agents/references/partials.md`](.agents/references/partials.md): read when
  editing files under `src/partials/`. Covers partial authoring and the
  inline-partials pipeline.
- [`.agents/references/reference-index-pages.md`](.agents/references/reference-index-pages.md):
  read when adding, removing, or renaming pages under
  `src/content/docs/reference/functions/` or
  `src/content/docs/reference/operators/`. Covers how to update function and
  operator index pages.

## Workflow

By default, use `bun run dev` to start a development server in the background
for live preview during development.

Only use `bun run build` when you actually need to inspect build artifacts.
Output goes to `dist/`.

### Generated Content

Some content is auto-generated and excluded from linting:

- **Changelog**: Run `bun run generate:changelog` to fetch from `tenzir/news` repo.
  The generator only publishes projects listed in `src/changelog-projects.json`,
  which is the authoritative source for changelog project inclusion, ordering,
  and metadata. Generated files: `src/content/docs/changelog/`,
  `src/changelog-landing.generated.ts`, `src/sidebar-changelog.generated.ts`,
  and `src/unified-timeline-data.generated.ts`. The tracked
  `src/content/docs/changelog/index.mdx` page is a stable shell and should not
  change during local builds.
- **Excalidraw Diagrams**: Run `bun run generate:excalidraw` to convert `.excalidraw`
  source files to SVG. In markdown, reference diagrams as `![alt](foo.excalidraw)`.
  The remark plugin inlines the corresponding `foo.excalidraw.svg` directly into
  HTML for CSS dark mode support. Generated SVGs are gitignored.
- **LLM Documentation**: Enabled via `LLMS_TXT=true`. The local starlight-llms-txt
  plugin implements the [llmstxt.org](https://llmstxt.org/) standard, generating
  `/llms.txt` (documentation map with page descriptions and headings),
  `/llms-full.txt` (complete documentation bundle), and per-page `.md` files.
  These outputs are for LLM consumption and not tracked in git.
- **Agent Skill**: Run `bun run build:skill` to generate the Tenzir agent skill.
  Requires `bun run build:full` first to generate per-page markdown files in `dist/`.
  Generated files: `tenzir-skill/SKILL.md`, `tenzir-skill/<doc-hierarchy>/`.

### Linting

- Run `bun run lint` to check markdownlint, ESLint, and Prettier.
- Run `bun run lint:fix` to apply automatic fixes across all linters.
- Link checking runs separately in CI via `bun run build:linkcheck`.
