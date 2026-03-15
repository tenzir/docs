# Updating reference index pages

When you add, remove, or rename a function or operator reference page, update
the corresponding index page.

## Locations

| Reference type | Index page                                 |
| -------------- | ------------------------------------------ |
| Functions      | `src/content/docs/reference/functions.mdx` |
| Operators      | `src/content/docs/reference/operators.mdx` |

## Required updates

Each index page has two locations that you must update:

1. **Frontmatter list**: The YAML `functions:` or `operators:` array at the top
   of the file. Add, remove, or update the entry with `name`, `description`,
   `example`, and `path` fields.

   ```yaml
   - name: 'function_name'
     description: 'Brief description of what it does.'
     example: 'function_name(arg)'
     path: 'reference/functions/function_name'
   ```

2. **CardGrid section**: The corresponding `<ReferenceCard>` in the
   appropriate category section. Match the format of existing cards.

   ````mdx
   <ReferenceCard title="function_name" description="Brief description." href="/reference/functions/function_name">

   ```tql
   function_name(arg)
   ```

   </ReferenceCard>
   ````

## Ordering

Order entries alphabetically within their category section.
