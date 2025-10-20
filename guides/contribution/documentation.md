# Documentation

The source code of the Tenzir documentation is at <https://github.com/tenzir/docs>. We use [Astro](https://astro.build) with [Starlight](https://starlight.astro.build) as our site framework.

## Quick Reference

[Section titled “Quick Reference”](#quick-reference)

### Essential Commands

[Section titled “Essential Commands”](#essential-commands)

| Command        | Action                                     |
| :------------- | :----------------------------------------- |
| `pnpm install` | Install dependencies                       |
| `pnpm dev`     | Start local dev server at `localhost:4321` |
| `pnpm build`   | Build production site to `./dist/`         |
| `pnpm preview` | Preview build locally before deploying     |

### Development Commands

[Section titled “Development Commands”](#development-commands)

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm lint:markdown`   | Lint all Markdown files                          |
| `pnpm lint:linkcheck`  | Validate all internal and external links         |
| `pnpm lint:prettier`   | Check code formatting                            |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

For anything beyond editing Markdown content, check out [Starlight’s docs](https://starlight.astro.build/) or read [Astro’s documentation](https://docs.astro.build).

For git workflow, branching strategy, and commit message conventions, see our [Git and GitHub Workflow](/guides/contribution/workflow) guide.

## Local Development

[Section titled “Local Development”](#local-development)

### First-Time Setup

[Section titled “First-Time Setup”](#first-time-setup)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/tenzir/docs.git
   cd docs
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

4. **View the site**: Browse to `http://localhost:4321/`

The development server includes:

* 🔥 Hot module reloading for instant updates
* 📝 Live Markdown rendering
* 🔍 Error reporting in the browser

### Production Build

[Section titled “Production Build”](#production-build)

Create and preview a production build:

```bash
# Build the site
pnpm build


# Preview the build
pnpm preview
```

Then browse to `http://localhost:4321/` to view the production site.

CI/CD Pipeline

Production builds are automatically created in CI. Check out our [GitHub workflow](https://github.com/tenzir/docs/blob/main/.github/workflows/docs.yaml) for implementation details.

## Link Checking

[Section titled “Link Checking”](#link-checking)

The documentation includes automated link validation to ensure all internal and external links work correctly:

### Local Link Checking

[Section titled “Local Link Checking”](#local-link-checking)

Before submitting changes, run link checking locally to catch broken links:

```bash
pnpm lint:linkcheck
```

This will build the site with link validation enabled and report any broken links found.

### CI Integration

[Section titled “CI Integration”](#ci-integration)

Link checking runs automatically in our CI pipeline:

* **All builds**: Link validation is enabled for production builds
* **Pull requests**: Link checking runs as part of the lint workflow
* **Scheduled maintenance**: Weekly link checks run every Sunday to catch broken external links

### How It Works

[Section titled “How It Works”](#how-it-works)

The link checker validates:

* Internal page references (e.g., `/guides/quickstart`)
* Anchor links within pages (e.g., `/reference/operators#aggregate`)
* External URLs (with appropriate timeout and retry logic)
* Relative links between documentation files

### Fixing Broken Links

[Section titled “Fixing Broken Links”](#fixing-broken-links)

When the link checker finds issues:

1. **Invalid internal links**: Update the link to point to the correct page path
2. **Missing anchor references**: Ensure the target heading or element exists
3. **Broken external links**: Update URLs or remove outdated references
4. **False positives**: Add exclusions to the `starlightLinksValidator` configuration in `astro.config.mjs`

The link checker will cause builds to fail if broken links are detected, ensuring the documentation maintains high quality.

## Optimize Images

[Section titled “Optimize Images”](#optimize-images)

To keep the repository size manageable, always optimize image files *before* committing them. This is especially important for formats like PNG, which can contain unnecessary metadata or use inefficient compression.

### PNG Images

[Section titled “PNG Images”](#png-images)

We recommend using [pngquant](https://pngquant.org/), a command-line utility for lossy compression of PNG files. It significantly reduces file size while preserving image quality.

To compress a PNG file in-place:

```bash
pngquant --ext .png --force --quality=65-80 image.png
```

### JPEG Images

[Section titled “JPEG Images”](#jpeg-images)

Use [jpegoptim](https://github.com/tjko/jpegoptim), a utility for optimizing JPEGs without perceptible quality loss:

```bash
jpegoptim --strip-all --max=80 image.jpg
```

Alternatively, you can use [mozjpeg](https://github.com/mozilla/mozjpeg) for even better compression ratios.

### SVG Images

[Section titled “SVG Images”](#svg-images)

Use [svgo](https://github.com/svg/svgo), a Node-based tool to optimize SVG files by removing unnecessary data:

```bash
svgo image.svg
```

This automatically rewrites the file in-place with redundant code removed and optimized structure.

## Auto-Updated Files

[Section titled “Auto-Updated Files”](#auto-updated-files)

**Important**: Some files in this repository are automatically updated by CI and should **never** be manually edited. Manual changes to these files will be overwritten the next time the [update workflow](https://github.com/tenzir/docs/blob/main/.github/workflows/update.yaml) runs.

### Automatically Updated Files

[Section titled “Automatically Updated Files”](#automatically-updated-files)

The following files are synchronized from upstream repositories:

**Tenzir Node Documentation:**

* `src/content/docs/changelog/node` is generated from individual changelog entries
* `src/content/docs/reference/functions` is synced from [tenzir/tenzir](https://github.com/tenzir/tenzir) at `docs/functions/`
* `src/content/docs/reference/operators` is synced from [tenzir/tenzir](https://github.com/tenzir/tenzir) at `docs/operators/`
* `src/content/docs/reference/functions.mdx` is generated from individual function files
* `src/content/docs/reference/operators.mdx` is generated from individual operator files
* `src/content/apis/openapi.node.yaml` is the API specification for Tenzir Node and generated from the node’s source code
* `tenzir.yaml.example` is the node’s example configuration file

**Tenzir Platform Documentation:**

* `src/content/docs/changelog/platform` is generated from individual changelog entries
* `src/content/docs/reference/platform-cli.mdx` is synced from [tenzir/platform](https://github.com/tenzir/platform) at `docs/platform-cli.mdx`

### Making Changes to Auto-Updated Content

[Section titled “Making Changes to Auto-Updated Content”](#making-changes-to-auto-updated-content)

If you need to update content in these files:

1. **For Functions/Operators**: Make changes in the [tenzir/tenzir](https://github.com/tenzir/tenzir) repository
2. **For Platform CLI**: Make changes in the [tenzir/platform](https://github.com/tenzir/platform) repository
3. **For generation logic**: Modify the scripts in `scripts/` or the update workflow

Our CI will automatically prevent pull requests that modify auto-updated files. If you encounter this error, revert your changes and make them in the appropriate upstream repository instead.

## Edit Diagrams

[Section titled “Edit Diagrams”](#edit-diagrams)

We use [Excalidraw](https://excalidraw.com) as primary tool to create sketches of architectural diagrams.

When exporting Excalidraw scenes, always **use light mode** and **choose SVG** as export format, as we have some CSS magic in place that automatically inverts colors SVGs so that they also look nicely when using dark mode.

Tenzir developers have access to our Excalidraw [Documentation collection](https://app.excalidraw.com/o/6dBWEFf9h1l/9RErQkL9e2v). For everyone else, please reach out to us on our [Discord server](/discord) to request changes to existing SVGs.

## Writing Style and Formatting

[Section titled “Writing Style and Formatting”](#writing-style-and-formatting)

This section covers the editorial and technical standards for contributing to the Tenzir documentation.

### Writing Guidelines

[Section titled “Writing Guidelines”](#writing-guidelines)

We follow the [Google Style Guide](https://developers.google.com/style) for clear and consistent technical documentation. Most notably:

* Use **active voice** in general.
* Avoid anthropomorphic language—don’t attribute human qualities to software or hardware.
* Include definite and indefinite articles (a, an, and the) in your writing. Don’t skip articles for brevity, including in headings and titles.
* In document titles and headings, use **sentence case**. Capitalize only the first word in the title, the first word in a subheading after a colon, and any proper nouns or other terms that are always capitalized a certain way.
* Capitalize product names.
* Write documentation in an **informal tone**—use common two-word contractions such as “you’re,” “don’t,” and “there’s.”
* **Define technical terms and acronyms** on first use. Don’t assume readers know specialized vocabulary.
* **Put the most important information first**. Don’t bury key details in the middle of paragraphs.
* **Use consistent terminology** throughout. Don’t use different words for the same concept (e.g., don’t alternate between “node” and “instance”).
* **Avoid unclear pronouns** like “it,” “this,” or “that” without clear antecedents. Be explicit about what you’re referring to.
* **Choose strong, specific verbs** over weak ones. Use “use” instead of “utilize,” “help” instead of “facilitate,” and “show” instead of “demonstrate.”
* **Eliminate redundant phrases**. Write “to” instead of “in order to,” “now” instead of “at this point in time,” and “because” instead of “due to the fact that.”
* **Avoid vague qualifiers** like “simply,” “just,” “easily,” or “obviously.” These don’t add clarity and may frustrate readers who find the task difficult.
* **Provide context** for why something matters. Don’t just explain what to do— explain when and why to do it.
* **Use hyperlinks judiciously**. Link to external tools, products, or resources when first mentioned, but avoid overlinking within the same document.

### Formatting Standards

[Section titled “Formatting Standards”](#formatting-standards)

Follow these conventions to maintain consistency across all documentation files.

#### General

[Section titled “General”](#general)

* Every file must end with a newline character, but avoid empty lines at the end of a file.

#### Markdown Content

[Section titled “Markdown Content”](#markdown-content)

* Break lines at **80 characters**.
* When editing Markdown, run `pnpm lint:markdown:fix` and `pnpm lint:prettier:fix` when you’re done.

#### Code

[Section titled “Code”](#code)

* Avoid empty lines within functions.
* When editing source code (`.js`, `.jsx`, `.ts`, `.tsx`, `.astro` files), run `pnpm lint:eslint:fix` when you’re done.