# Tenzir Documentation

This repository hosts the documentation of [Tenzir](https://tenzir.com).

## 🚧 WORK IN PROGRESS 🚧

The content in this repository is not yet authoritative. If you look for the
Tenzir documentation, go to [docs.tenzir.com](https://docs.tenzir.com).

We are in the process of migrating our docs from Docusaurus to Starlight. You
can find a preview of the new documentation at
[tenzir.github.io/docs](https://tenzir.github.io/docs).

## ☑️ TODOs

### Structure

- [x] Split nav at the top
- [x] Render API docs based on OpenAPI spec
- [x] Generate a sitemap at build time
- [x] Publish to GitHub Pages
- [x] Implement broken links check
- [x] Upgrade to Starlight 0.32 and re-implement Starlight Utils
- [x] Make logo href be tenzir.com
- [x] Rename _Documentation_ to _Docs_ in header
- [x] Tweak `index.mdx` title
- [x] Consider https://github.com/rehypejs/rehype-external-links
- [ ] Fix Markdoc partial support (https://github.com/withastro/astro/issues/13575)
- [x] Use [breadcrumbs](https://docs.astro-breadcrumbs.kasimir.dev/)
- [x] Add Plausible analytics

### CI / Automation

- [x] Update `tenzir.yaml.example` via CI
- [x] Update OpenAPI spec via CI
- [x] Update `tql.tmLanguage.json` via CI
- [x] Add Markdown linting CI job
- [x] Add CI job that ensures that changelog is not edited manually
- [x] Add CI job for eslint
- [x] Add CI job for prettier

### Style

- [x] Hoist SVGs and apply auto-darkmode
- [x] TQL syntax highlighting
- [x] Fix sliding top nav bar on Firefox
- [x] Fix sizing calculator iframe height (CSS?)
- [x] Fix github-{light,dark} syntax theme selection
- [x] Fix Integrations tab not being bold font inside
- [x] Do CSS magic to fuse subsequent TQL code blocks
- [x] Apply CSS and get a facelift
- [ ] Style Asides to match design system
- [x] Add our favicon

### Changelog

- [x] Figure out if changesets work
- [x] Come up with a distributed changelog editing workflow
- [x] Write script to update Changelog pages in this repo
- [x] Create CI job in tenzir/tenzir
- [x] Create CI job in tenzir/platform

### Content

- [x] Landing page
- [x] FAQs
- [x] Integrations
- [x] Explanations
- [x] Tutorials
- [x] Guides
  - [ ] Quickstart
- [x] Reference
  - [x] Language
  - [x] Operators
  - [x] Functions
  - [x] Configuration
  - [x] Platform CLI
  - [x] Glossary

### Legal

- [x] SBOM at `/sbom`
- [x] Privacy Statement (or link to it)

### 🚀 Relaunch

- [x] Fix all broken links and uncomment link checking in CI
- [ ] Remove `new.` subdomain in `site` variable in `astro.config.mjs`

## ✊ Usage

Our
[documentation](https://new.docs.tenzir.com/guides/contribution/documentation/)
has up-to-date instructions on how to build, view, and edit content in this
repository.

### Link Checking

This project includes automated link checking to ensure all internal and external links are valid:

- **Local testing**: Run `pnpm lint:linkcheck` to check for broken links locally
- **CI integration**: Link checking runs automatically on all builds and pull requests
- **Scheduled checks**: Weekly automated link checking runs on Sundays to catch broken external links
- **Error reporting**: Broken links cause builds to fail and create GitHub issues automatically

The link checker validates:

- Internal page references
- Anchor links within pages
- External URLs (with appropriate exclusions)
- Relative links between documentation files

To disable link checking for specific paths, update the `exclude` array in the `starlightLinksValidator` configuration in `astro.config.mjs`.
