# skill-teacher

Generate Claude Code skills from Tenzir documentation.

## Overview

This tool transforms documentation into AI-optimized navigation indexes for the
Claude Code `navigating-docs` skill. It extracts metadata, keywords, and
summaries from markdown files and generates YAML catalogs.

## Usage

```bash
# Generate YAML indexes from documentation
uv run skill-teacher generate-index

# Validate generated content (checks paths, structure, summaries)
uv run skill-teacher validate

# Full rebuild (index + summaries + validation)
uv run skill-teacher regenerate --all
```

## Generated Output

Output goes to `.claude/plugins/knowledge/skills/navigating-docs/`:

```
index/
├── operators.yaml    # TQL operators catalog
├── functions.yaml    # TQL functions catalog
├── guides.yaml       # How-to guides catalog
├── integrations.yaml # Third-party integrations
├── concepts.yaml     # Conceptual explanations
└── tutorials.yaml    # Learning tutorials
```

Each index entry contains:

- `name`, `path`, `summary` - Basic identification
- `category` - Functional grouping
- `example` - Quick syntax reference
- `keywords` - Search terms extracted from content
- `use_when` - Task-based triggers for matching

## Development

```bash
cd synthesis
uv sync
uv run pytest -v  # Run tests
uv run skill-teacher --help
```

## How It Works

1. **Frontmatter extraction** - Parses YAML frontmatter for title, category, example
2. **Structure extraction** - Finds headings and code blocks for context
3. **Keyword extraction** - Extracts meaningful terms, filters stop words
4. **Use-when generation** - Creates task-based triggers from category and summary
5. **Index generation** - Groups entries by category/section and writes YAML

## When to Regenerate

Regenerate indexes when:

- New operators or functions are added
- Documentation structure changes significantly
- Categories are reorganized
- Integration pages are added/removed
