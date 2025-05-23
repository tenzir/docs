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
- [x] Rename *Documentation* to *Docs* in header
- [x] Tweak `index.mdx` title
- [x] Consider https://github.com/rehypejs/rehype-external-links
- [ ] Fix Markdoc partial support (https://github.com/withastro/astro/issues/13575)
- [ ] Use [breadcrumbs](https://docs.astro-breadcrumbs.kasimir.dev/) for
      functions and operators
- [x] Add Plausible analytics

### CI / Automation

- [x] Update `tenzir.yaml.example` via CI
- [x] Update OpenAPI spec via CI
- [x] Update `tql.tmLanguage.json` via CI
- [ ] Add Markdown linting CI job

### Style

- [x] Hoist SVGs and apply auto-darkmode
- [x] TQL syntax highlighting
- [x] Fix sliding top nav bar on Firefox
- [x] Fix sizing calculator iframe height (CSS?)
- [ ] Fix github-{light,dark} syntax theme selection
- [x] Fix Integrations tab not being bold font inside
- [ ] Do CSS magic to fuse subsequent TQL code blocks
- [x] Apply CSS and get a facelift
- [ ] Style Asides to match design system
- [x] Add our favicon

### Changelog

- [x] Figure out if changesets work
- [x] Come up with a distributed changelog editing workflow
- [x] Write script to update Changelog pages in this repo
- [ ] Create CI job in tenzir/tenzir
- [ ] Create CI job in tenzir/platform

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
- [ ] Privacy Statement (or link to it)

### 🚀 Relaunch

- [ ] Fix all broken links and uncomment link checking in CI
- [ ] Remove `new.` subdomain in `site` variable in `astro.config.mjs`

## ✊ Usage

Our
[documentation](https://new.docs.tenzir.com/guides/contribution/documentation/)
has up-to-date instructions on how to build, view, and edit content in this
repository.
