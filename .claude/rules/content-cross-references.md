---
paths:
  - src/content/docs/guides/**/*
  - src/content/docs/tutorials/**/*
  - src/content/docs/explanations/**/*
---

# Cross-Reference Updates for Guides, Tutorials, and Explanations

When editing files in guides, tutorials, or explanations, check if the content
links to operator or function reference pages. If so, update those reference
pages to include a reciprocal See Also link.

## How to Update Reference Pages

1. Identify operators/functions linked in the content (look for backtick-wrapped
   names like `` `where` `` or `` `count` ``)
2. Open each referenced file in `src/content/docs/reference/operators/` or
   `src/content/docs/reference/functions/`
3. Add the appropriate See Also component if not already present

Example: If `guides/data-shaping/filter-and-select-data.mdx` uses `where`, `drop`,
and `select`, update each operator's reference page:

```mdx
## See Also

- <Op>drop</Op>
- <Op>select</Op>
- <Guide>data-shaping/filter-and-select-data</Guide>
```

## Component Reference

| Content Type | Component       | Slug Format                 |
| ------------ | --------------- | --------------------------- |
| Guide        | `<Guide>`       | `category/guide-slug`       |
| Tutorial     | `<Tutorial>`    | `tutorial-slug`             |
| Explanation  | `<Explanation>` | `category/explanation-slug` |
| Integration  | `<Integration>` | `vendor/integration-slug`   |

## Required Imports

Ensure the reference page imports the component:

```mdx
import Guide from '@components/see-also/Guide.astro';
import Tutorial from '@components/see-also/Tutorial.astro';
import Explanation from '@components/see-also/Explanation.astro';
import Integration from '@components/see-also/Integration.astro';
```

## Ordering

In See Also sections, maintain this order:

1. Operators (`<Op>`)
2. Functions (`<Fn>`)
3. Guides (`<Guide>`)
4. Tutorials (`<Tutorial>`)
5. Explanations (`<Explanation>`)
6. Integrations (`<Integration>`)
