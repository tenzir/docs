---
paths: src/content/docs/reference/**/*
---

# See Also Sections in Reference Documentation

When editing operator or function reference pages, use the See Also component
format.

## Required Imports

Add imports after the frontmatter based on what you need:

```mdx
import Op from '@components/see-also/Op.astro';
import Fn from '@components/see-also/Fn.astro';
import Guide from '@components/see-also/Guide.astro';
import Tutorial from '@components/see-also/Tutorial.astro';
import Explanation from '@components/see-also/Explanation.astro';
```

## See Also Format

Use a bullet list with one component per line, in this order:

1. Operators (`<Op>`)
2. Functions (`<Fn>`)
3. Guides (`<Guide>`)
4. Tutorials (`<Tutorial>`)
5. Explanations (`<Explanation>`)

```mdx
## See Also

- <Op>operator_name</Op>
- <Fn>function_name</Fn>
- <Guide>category/guide-slug</Guide>
- <Tutorial>tutorial-slug</Tutorial>
- <Explanation>category/explanation-slug</Explanation>
```

## Component Usage

| Component       | Purpose                    | Example                                              |
| --------------- | -------------------------- | ---------------------------------------------------- |
| `<Op>`          | Link to operator reference | `<Op>where</Op>`                                     |
| `<Fn>`          | Link to function reference | `<Fn>count</Fn>`                                     |
| `<Guide>`       | Link to guide              | `<Guide>data-shaping/filter-and-select-data</Guide>` |
| `<Tutorial>`    | Link to tutorial           | `<Tutorial>learn-idiomatic-tql</Tutorial>`           |
| `<Explanation>` | Link to explanation        | `<Explanation>language/operators</Explanation>`      |

## Finding Relevant Cross-References

When adding See Also links, look in these directories for relevant content:

- `src/content/docs/guides/` - How-to guides for common tasks
- `src/content/docs/tutorials/` - Step-by-step learning tutorials
- `src/content/docs/explanations/` - Conceptual explanations

Link to content that helps users understand or apply the operator/function.

## File Extension

Reference pages using See Also components must use the `.mdx` extension.
