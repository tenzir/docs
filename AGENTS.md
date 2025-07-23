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

## Tenzir Query Language (TQL)

This repository has a lot of TQL code examples.

- Always wrap TQL code in a ```tql Markdown code block.
- Two subsequent ```tql code blocks represent the pipeline definittion and its
  output.

### Validation

The following is only possible when a `tenzir` binary is avilable in your
`$PATH`.

- Validate all TQL that you generate by passing the pipeline definition to the
  `tenzir` binary, e.g., `tenzir 'from {x:42}'`.
- The `tenzir` binary produces the pipeline output on stdout in TQL, unless you
  use a different operator that changes the format, such as the `write_*`
  operator family. When the output is TQL, wrap the output in an immediately
  following `tql` code block as well. If the output is not TQL, attempt to find
  the best fitting Markdown code language. E.g., when the pipeline ends in
  `write_json`, use `json`.
- For more structured or bigger pipelines, consider writing the definition into
  a dedicated file, e.g., `pipeline.tql`, and then passing it to the `tenzir`
  binary. For example, `tenzir -f pipeline.tql`.

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

### Reviewing Pull Requests

When reviewing a PR as the GitHub @claude bot, follow these guidelines:

- Keep your feedback terse. Use concise and actionable instructions.
- Prefer bullet lists. Use examples only where needed to improve clarity.
- Avoid overly verbose explanations. Focus on the most important points.

## Formatting

The `.claude/format-hook.sh` automatically handles formatting for all file edits:

- **Markdown files** (.md, .mdx, .mdoc): Formatted with `markdownlint` and `prettier`
- **Code files** (.js, .jsx, .ts, .tsx, .astro): Formatted with `prettier`
- **Config files** (.json, .yaml, .yml): Formatted with `prettier`

No manual formatting commands are needed as the hook runs automatically after each edit.
