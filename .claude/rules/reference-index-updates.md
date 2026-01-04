---
paths:
  - src/content/docs/reference/functions/**/*
  - src/content/docs/reference/operators/**/*
---

# Updating Reference Index Pages

When adding, removing, or renaming function or operator reference pages, update
the corresponding index page.

## Index Page Locations

| Reference Type | Index Page                                 |
| -------------- | ------------------------------------------ |
| Functions      | `src/content/docs/reference/functions.mdx` |
| Operators      | `src/content/docs/reference/operators.mdx` |

## What to Update

Each index page has two locations that need updating:

1. **Frontmatter list**: The YAML `functions:` or `operators:` array at the top
   of the file. Add/remove/update the entry with `name`, `description`,
   `example`, and `path` fields.

2. **CardGrid section**: The corresponding `<ReferenceCard>` in the appropriate
   category section. Match the format of existing cards.

## Entry Format

### Frontmatter

```yaml
- name: 'function_name'
  description: 'Brief description of what it does.'
  example: 'function_name(arg)'
  path: 'reference/functions/function_name'
```

### CardGrid

````mdx
<ReferenceCard title="function_name" description="Brief description." href="/reference/functions/function_name">

```tql
function_name(arg)
````

</ReferenceCard>
```

## Alphabetical Ordering

Entries should be ordered alphabetically within their category section.
