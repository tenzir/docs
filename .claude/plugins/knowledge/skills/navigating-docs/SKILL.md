---
name: navigating-docs
description: Navigate Tenzir documentation. Use when writing TQL pipelines, choosing operators or functions, configuring integrations, understanding Tenzir architecture, or looking up how to accomplish tasks with Tenzir.
---

# Navigating Tenzir Documentation

This skill provides semantic indexes for discovering and navigating Tenzir documentation efficiently without loading all content upfront.

## Quick Reference Process

When you need documentation:

1. **Identify the domain**:
   - TQL operator/function? → `index/operators.yaml` or `index/functions.yaml`
   - Integration setup? → `index/integrations.yaml`
   - How-to task? → `index/guides.yaml`
   - Conceptual understanding? → `index/concepts.yaml`
   - Learning TQL? → `index/tutorials.yaml`

2. **Search the index**:
   - Match `keywords` against the user's query terms
   - Check `use_when` for task-based matching
   - Look at `category` for functional grouping
   - Use `example` for quick syntax reference

3. **Decide on reading depth**:
   - Quick answer → Use index `summary` and `example`
   - Need parameters → Read full doc's Description section
   - Need examples → Read full doc's Examples section
   - Complex implementation → Read entire document

## Documentation Structure

Documentation lives at `src/content/docs/` relative to the repository root:

| Section      | Index File                                     | When to Consult            |
| ------------ | ---------------------------------------------- | -------------------------- |
| Operators    | [operators.yaml](./index/operators.yaml)       | Writing TQL pipelines      |
| Functions    | [functions.yaml](./index/functions.yaml)       | Using TQL functions        |
| Guides       | [guides.yaml](./index/guides.yaml)             | Step-by-step how-tos       |
| Integrations | [integrations.yaml](./index/integrations.yaml) | Third-party connectors     |
| Concepts     | [concepts.yaml](./index/concepts.yaml)         | Understanding architecture |
| Tutorials    | [tutorials.yaml](./index/tutorials.yaml)       | Learning TQL               |

## Index Format

Each index uses this structure:

```yaml
metadata:
  docs_root: src/content/docs
  generated: <timestamp>
  source_commit: <git-hash>

categories:  # or sections/vendors/topics
  - name: "Category Name"
    description: "What this category contains"
    operators:  # or functions/guides/integrations/concepts
      - name: operator_name
        path: reference/operators/operator_name.md  # relative to docs_root
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

## Reading Full Documentation

When the index summary isn't sufficient, read the actual documentation file:

```
src/content/docs/<path-from-index>
```

For example, if an index entry has `path: reference/operators/from.md`, read:
`src/content/docs/reference/operators/from.md`

## Common Workflows

### Finding an Operator

1. Read `index/operators.yaml`
2. Search by keyword or category
3. Check `example` for quick syntax
4. If needed, read full doc at `src/content/docs/<path>`

### Accomplishing a Task

1. Read `index/guides.yaml`
2. Find guide by section or keyword
3. Read the full guide for step-by-step instructions

### Understanding a Concept

1. Read `index/concepts.yaml`
2. Find relevant topic
3. Read the full explanation

### Setting Up an Integration

1. Read `index/integrations.yaml`
2. Find by vendor or keyword
3. Read full integration doc for setup instructions

## Summaries

For conceptual overviews, read these summaries before diving into full documentation:

| Summary                                              | Contents                                        |
| ---------------------------------------------------- | ----------------------------------------------- |
| [architecture.md](./summaries/architecture.md)       | Pipeline, Node, Platform concepts               |
| [tql-language.md](./summaries/tql-language.md)       | TQL syntax, types, expressions, execution model |
| [common-patterns.md](./summaries/common-patterns.md) | Frequently used idioms and best practices       |

Use summaries when:

- User asks about Tenzir architecture or how components relate
- User needs TQL language overview before writing pipelines
- User wants idiomatic patterns without reading full tutorials

## Tips

- **Start with the index** - Don't read full docs until you've identified the right one
- **Use keywords** - Match user query terms against `keywords` arrays
- **Check examples** - The `example` field often answers simple "how do I" questions
- **Follow paths** - Index `path` fields are relative to `src/content/docs/`
- **Read summaries first** - For conceptual questions, summaries provide quick context
