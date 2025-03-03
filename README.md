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
- [ ] Create consolidated Node & Platform changelog

### CI / Automation

- [ ] Update `tenzir.yaml.example` via CI
- [ ] Update OpenAPI spec via CI
- [ ] Update changelog from tenzir/tenzir and tenzir/platform repos

### Style

- [x] Hoist SVGs and apply auto-darkmode
- [x] TQL syntax highlighting
- [ ] Fix sizing calculator iframe height (CSS?)
- [ ] Fix github-{light,dark} syntax theme selection
- [ ] Do CSS magic to fuse subsequent TQL code blocks
- [ ] Apply Tailwind CSS and get a facelift

### Content

- [x] Landing page
- [x] FAQs
- [x] Integrations
- [x] Explanations
- [x] Tutorials
- [ ] Guides
    - [x] Installation
    - [ ] Usage
    - [ ] Contribution
    - [ ] Development
- [ ] Reference

### Legal

- [ ] SBOM at `/sbom`
- [ ] Privacy Statement (or link to it)

### 🚀 Relaunch

- [ ] Fix all broken links and uncomment link checking in CI
- [ ] Replace `site` and `base` in `astro.config.mjs`

### Stretch

These don't have to be addressed prior to the relaunch, but would be nice:

- [ ] New Quickstart guide

## ✊ Usage

Begin with installing the dependencies:

```bash
pnpm install
```

Then view the docs locally:

```bash
pnpm dev
```

Here's an summary about frequently used commands:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm dev`                | Starts local dev server at `localhost:4321`      |
| `pnpm build`              | Build your production site to `./dist/`          |
| `pnpm preview`            | Preview your build locally, before deploying     |
| `pnpm astro ...`          | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help`    | Get help using the Astro CLI                     |

## 🙋 Help

Check out [Starlight’s docs](https://starlight.astro.build/), read [Astro's
documentation](https://docs.astro.build), or jump into [Tenzir's Discord
server](https://docs.tenzir.com/discord).
