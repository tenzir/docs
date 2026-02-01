---
paths: src/content/docs/**/*
---

# See Also Sections and Cross-References

See Also sections help users discover related documentation. When editing any
documentation page, consider adding or updating these links.

## Required Imports

Add imports after the frontmatter based on what you need:

```mdx
import Op from '@components/see-also/Op.astro';
import Fn from '@components/see-also/Fn.astro';
import Guide from '@components/see-also/Guide.astro';
import Tutorial from '@components/see-also/Tutorial.astro';
import Explanation from '@components/see-also/Explanation.astro';
import Integration from '@components/see-also/Integration.astro';
```

## Component Usage

| Component       | Purpose                    | Example                                              |
| --------------- | -------------------------- | ---------------------------------------------------- |
| `<Op>`          | Link to operator reference | `<Op>where</Op>`                                     |
| `<Fn>`          | Link to function reference | `<Fn>count</Fn>`                                     |
| `<Guide>`       | Link to guide              | `<Guide>data-shaping/filter-and-select-data</Guide>` |
| `<Tutorial>`    | Link to tutorial           | `<Tutorial>learn-idiomatic-tql</Tutorial>`           |
| `<Explanation>` | Link to explanation        | `<Explanation>language/operators</Explanation>`      |
| `<Integration>` | Link to integration        | `<Integration>kafka</Integration>`                   |

## See Also Format

Use a bullet list with one component per line:

```mdx
## See Also

- <Op>operator_name</Op>
- <Fn>function_name</Fn>
- <Guide>category/guide-slug</Guide>
- <Tutorial>tutorial-slug</Tutorial>
- <Explanation>category/explanation-slug</Explanation>
- <Integration>vendor/integration-slug</Integration>
```

## Ordering

Maintain this order within See Also sections:

1. Operators (`<Op>`)
2. Functions (`<Fn>`)
3. Guides (`<Guide>`)
4. Tutorials (`<Tutorial>`)
5. Explanations (`<Explanation>`)
6. Integrations (`<Integration>`)

## Reciprocal Cross-References

When editing guides, tutorials, or explanations that link to operators or
functions, update the reference pages to include reciprocal See Also links.

1. Identify operators/functions mentioned in the content (look for backtick-
   wrapped names like `` `where` `` or `` `count` ``)
2. Open each referenced file in `src/content/docs/reference/operators/` or
   `src/content/docs/reference/functions/`
3. Add the appropriate See Also component if not already present

Example: If `guides/data-shaping/filter-and-select-data.mdx` uses `where`,
`drop`, and `select`, update each operator's reference page:

```mdx
## See Also

- <Op>drop</Op>
- <Op>select</Op>
- <Guide>data-shaping/filter-and-select-data</Guide>
```

## Finding Relevant Content

When adding See Also links, look in these directories for related content:

- `src/content/docs/guides/` - How-to guides for common tasks
- `src/content/docs/tutorials/` - Step-by-step learning tutorials
- `src/content/docs/explanations/` - Conceptual explanations

Link to content that helps users understand or apply the operator/function.

## File Extension

Pages using See Also components must use the `.mdx` extension.
