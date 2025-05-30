# Changelog

This directory contains the tooling for generating the changelog pages from a
template directory structure.

## Usage

We provide a Python script to generate the changelog pages from a template
directory structure.

Then run the script with the product name and template directory `dir`:

```sh
uv run ./changelog.py --product=node <dir>
uv run ./changelog.py --product=platform <dir>
```

The template directory must contain:

- `releases/`: YAML files defining each release (e.g., `v1.2.3.yaml`)
- `changes/`: Markdown files with individual changelog entries

The script modifies files in this repository:

- MDX files in `/src/content/docs/changelog/{product}/`
- An index page listing all versions
- Updates to `/src/sidebar-changelog-{product}.ts`

### Template Structure

Each release YAML file (`releases/*.yaml`) contains:

```yaml
title: Release Title
description: |
  Optional release description.
changes:
  - change-file-basename-1
  - change-file-basename-2
```

Each change file (`changes/*.md`) contains:

```markdown
---
title: Change Title
type: feature|change|bugfix
authors: [author1, author2]
pr: 1234
---

Description of the change.
```

### Automatic "Next" Release

The script automatically generates a "next" release containing all unreferenced
changes (changes not listed in any release YAML file).

Finally, use `git status` to understand what changed compared to the previous
version.
