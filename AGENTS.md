This is an [Astro](https://astro.build/)
[Starlight](https://starlight.astro.build/) project hosting the documentation
for Tenzir (https://tenzir.com).

## Project Architecture

- File Structure: `/src/content/docs/` contains all documentation pages.
- Components: Custom components live in `/src/components/`, partials in
  `/src/partials/`.
- Static Assets: Images and files go in `/src/assets/` or `/public/`.
- Configuration: `/astro.config.mjs`
- Styling: Custom CSS in `/src/styles/`
- Sidebar: manually managed in `/src/sidebar.ts`.

## Workflow

### Building and Testing

- Do not use `pnpm dev` to start a dev server, as the user most likely runs an
  instance and you'll get a colliding port.
- Instead, use `pnpm build` to build the site and inspect the generated (HTML)
  files in the `/build` directory.

### Linting

- Run `pnpm lint` to execute every linter, including markdownlint, ESLint,
  Prettier, and the link checker.
- Run `pnpm lint:fix` to apply automatic fixes across all linters before you
  commit.

### Reviewing Pull Requests

When reviewing a PR as the GitHub @claude bot, follow these guidelines:

- Keep your feedback terse. Use concise and actionable instructions.
- Prefer bullet lists. Use examples only where needed to improve clarity.
- Avoid overly verbose explanations. Focus on the most important points.
