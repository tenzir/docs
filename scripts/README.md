# Scripts Directory

This directory contains utility scripts for maintaining the documentation.

## Scripts

### `sync-changelog.mjs`

Syncs changelog content from the `tenzir/news` repository and generates sidebar
configuration.

**Usage:**

```bash
pnpm sync:changelog
```

### `sync-openapi.sh`

Fetches OpenAPI specs from upstream repositories:

- `openapi.node.yaml` from `tenzir/tenzir`

**Usage:**

```bash
pnpm sync:openapi
```

### `fix-starlight-llms-txt.js`

Post-install script that fixes Starlight LLMS integration.

**Usage:**

Runs automatically during `pnpm install` via the `postinstall` hook.
