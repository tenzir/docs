# skill-teacher

Generate Claude Code skills from Tenzir documentation.

## Usage

```bash
# Generate YAML indexes
uv run skill-teacher generate-index

# Generate summaries (uses Claude API)
uv run skill-teacher generate-summaries

# Validate generated content
uv run skill-teacher validate

# Full rebuild
uv run skill-teacher regenerate --all
```

## Development

```bash
cd synthesis
uv sync
uv run skill-teacher --help
```
