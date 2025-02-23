# Tenzir Documenation

This repository hosts the documentation of Tenzir.

## 🚧 WORK IN PROGRESS 🚧  

The content in this repository is not authoritative. If you look for the Tenzir
documentation, go to [docs.tenzir.com](https://docs.tenzir.com). We are
currently testing Starlight as documentation framework, and if successful,
migrate over from Docusaurus.

## ☑️ TODOs

### Structure

- [x] Split nav at the top
- [x] Render API docs based on OpenAPI spec
- [x] Generate a sitemap at build time
- [x] Publish to GitHub Pages
- [x] Implement broken links check
- [ ] Create consolidated Node & Platform changelog
- [ ] Add release notes as a [blog](https://github.com/HiDeoo/starlight-blog)

### CI / Automation

- [ ] Update OpenAPI spec via CI
- [ ] Update changelog from tenzir/tenzir and tenzir/platform repos

### Style

- [x] Hoist SVGs and apply auto-darkmode
- [x] TQL syntax highlighting
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
- [ ] Reference

### 🚀 Relaunch

- [ ] Fix all broken links and uncomment link checking in CI
- [ ] Replace `site` and `base` in `astro.config.mjs`

### Stretch

These don't have to be addressed prior to the relaunch, but would be nice:

- [ ] New Quickstart guide

## ✊ Usage

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🙋 Help

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro
documentation](https://docs.astro.build), or jump into the [Tenzir Discord
server](https://docs.tenzir.com/discord).