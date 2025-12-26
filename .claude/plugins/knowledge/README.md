# Knowledge Plugin

This Claude Code plugin provides AI-optimized navigation for Tenzir documentation.

## What It Does

The `navigating-docs` skill enables Claude to efficiently find and recommend
documentation without loading all content upfront. It uses:

- **YAML indexes** - Cataloged entries with keywords, summaries, and use_when triggers
- **Summaries** - Conceptual overviews for architecture, TQL language, and patterns
- **Progressive disclosure** - Index → Summary → Full doc as needed

## Directory Structure

```
.claude/plugins/knowledge/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
└── skills/
    └── navigating-docs/
        ├── SKILL.md         # Main skill entry point
        ├── index/           # YAML catalogs
        │   ├── operators.yaml
        │   ├── functions.yaml
        │   ├── guides.yaml
        │   ├── integrations.yaml
        │   ├── concepts.yaml
        │   └── tutorials.yaml
        └── summaries/       # Conceptual overviews
            ├── architecture.md
            ├── tql-language.md
            └── common-patterns.md
```

## Regenerating Indexes

The indexes are generated from documentation using `skill-teacher`:

```bash
cd docs/synthesis
uv run skill-teacher generate-index   # Rebuild YAML indexes
uv run skill-teacher validate         # Verify correctness
```

Regenerate when documentation changes significantly (new operators, categories, etc.).

## How Claude Uses This

1. Claude reads `SKILL.md` when the skill is activated
2. Based on user query, Claude reads the appropriate index file
3. Claude matches keywords/use_when to find relevant entries
4. For quick answers: use index summary and example
5. For implementation: read full doc at `src/content/docs/<path>`

## Summaries

Summaries provide conceptual context without reading full documentation:

- `architecture.md` - Pipeline, Node, Platform concepts
- `tql-language.md` - TQL syntax, types, expressions, execution model
- `common-patterns.md` - Frequently used idioms and best practices

## Index Entry Format

Each entry contains:

```yaml
- name: operator_name
  path: reference/operators/operator_name.mdx
  summary: "One-line description"
  category: "Category"
  example: 'operator_name arg1, arg2'
  use_when:
    - "when to use this operator"
  keywords:
    - relevant
    - search
    - terms
```

## Future Distribution

This plugin is currently local to the docs repository. It will eventually be
distributed via `tenzir/claude-plugins` for use in other repositories.
