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

## Writing Style

Adhere to the [Google Style Guide](https://developers.google.com/style) with
editorial guidelines for writing clear and consistent technical documentation.

Most notably:

- In general, use _active voice_.
- Avoid anthropomorphic language: Don't attribute human qualities to software or
  hardware.
- Include definite and indefinite articles (a, an, and the) in your writing.
  Don't skip articles for brevity, including in headings and titles.
- In document titles and headings, use sentence case. That is, capitalize only
  the first word in the title, the first word in a subheading after a colon, and
  any proper nouns or other terms that are always capitalized a certain way.
- Capitalize product names.
- Write documentation in an informal tone, e.g., use common two-word
  contractions such as "you're," "don't," and "there's."

## Workflow

### Building and Testing

- Do not use `pnpm dev` to start a dev server, as the user most likely runs an
  instance and you'll get a colliding port.
- Instead, use `pnpm build` to build the site and inspect the generated (HTML)
  files in the `/build` directory.

### Git Branching and Commit Messages

- For new features or fixes, use _topic branches_ that branch off `main` with
  a naming convention of `topic/description`, e.g., `topic/improve-spelling

- If availble, use `gh` to manage pull requests. Make sure to write a separate
  file for the PR body to avoid escaping issues.

- The first line succinctly summarizes the changes in no more than 50
  characters. It is capitalized and written in and imperative present tense:
  e.g., "Fix a bug" as opposed to "Fixes a bug" or "Fixed a bug". As a
  mnemonic, prepend "When applied, this commit will" to the commit summary and
  check if it builds a full sentence.

- The first line does not contain a dot at the end. The second line is empty.
  Optional long descriptions as full sentences begin on the third line, indented
  at 72 characters per line, explaining _why_ the change is needed, _how_ it
  addresses the underlying issue, and what _side-effects_ it might have.

## Formatting

### General

- Every file must end with a newline character, but avoid empty lines at the end
  of a file.

### Markdown Content

- Break lines at 80 characters.
- When editing Markdown, run `pnpm lint:markdown:fix` and `pnpm
lint:prettier:fix` when you're done.

### Code

- Avoid empty lines within functions.
- When editing source code (.js,.jsx,.ts,.tsx,.astro files),
  run `pnpm lint:eslint:fix` when you're done.
