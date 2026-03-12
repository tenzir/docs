# Content

The `docs/` directory includes the primary documentation content.

## Linking conventions

Always wrap operator and function names in markdown links, even when mentioned
multiple times in the same document. Use backticks with the link:
[`publish`](/reference/operators/publish), [`round`](/reference/functions/round).

When first introducing a technology that has an `/integrations` page, link to it
in the text: [Kafka](/integrations/kafka), [Splunk](/integrations/splunk).

## Consecutive code blocks

Consecutive TQL code blocks render as a merged visual unit where the second
block shows an "OUTPUT" label. Only use consecutive blocks when the first is a
pipeline and the second shows its output. Otherwise, add a paragraph between
blocks to separate them visually.

## First paragraph guidelines

The first paragraph of every doc appears in AI skill summaries and search
results. Orient the reader to the document type and what they'll gain.

**Pattern by document type:**

| Type        | Pattern                          | Example                                           |
| ----------- | -------------------------------- | ------------------------------------------------- |
| Guide       | "This guide shows you how to..." | "This guide shows you how to fetch data from..."  |
| Tutorial    | "This tutorial teaches you..."   | "This tutorial teaches you to write idiomatic..." |
| Explanation | "This page explains..."          | "This page explains TQL's type system..."         |
| Reference   | "This reference documents..."    | "This reference documents configuration..."       |

**Rules:**

1. **State the document type**: Help readers know they're in the right place.
2. **Explain what they'll learn or achieve**: Add "You'll learn..." or similar.
3. **Complete sentences before lists**: Don't end the paragraph with a colon.
4. **Be specific**: Include key terms readers might search for.

## Semantic cross-references and See Also sections

Semantic components such as `<Op>` and `<Fn>` create consistent inline links to
related documentation. You can use them inline in prose or in a See Also
section. When editing any documentation page, consider adding or updating these
links.

### Imports

These components are auto-imported when you use them in `.mdx` files. You can
still import them explicitly if you prefer.

```mdx
import Op from '@components/see-also/Op.astro';
import Fn from '@components/see-also/Fn.astro';
import Guide from '@components/see-also/Guide.astro';
import Tutorial from '@components/see-also/Tutorial.astro';
import Explanation from '@components/see-also/Explanation.astro';
import Integration from '@components/see-also/Integration.astro';
import Reference from '@components/see-also/Reference.astro';
```

### Component usage

| Component       | Purpose                    | Example                                              |
| --------------- | -------------------------- | ---------------------------------------------------- |
| `<Op>`          | Link to operator reference | `<Op>where</Op>`                                     |
| `<Fn>`          | Link to function reference | `<Fn>count</Fn>`                                     |
| `<Guide>`       | Link to guide              | `<Guide>data-shaping/filter-and-select-data</Guide>` |
| `<Tutorial>`    | Link to tutorial           | `<Tutorial>learn-idiomatic-tql</Tutorial>`           |
| `<Explanation>` | Link to explanation        | `<Explanation>language/operators</Explanation>`      |
| `<Integration>` | Link to integration        | `<Integration>kafka</Integration>`                   |
| `<Reference>`   | Link to a reference page   | `<Reference>test-framework</Reference>`              |

### Inline usage

Use these components directly in sentences when they help readers jump to the
relevant reference:

```mdx
Use <Op>where</Op> with <Fn>count</Fn> to filter events before you aggregate
results.
```

### See Also Format

Use a bullet list with one component per line:

```mdx
## See Also

- <Op>operator_name</Op>
- <Fn>function_name</Fn>
- <Guide>category/guide-slug</Guide>
- <Tutorial>tutorial-slug</Tutorial>
- <Explanation>category/explanation-slug</Explanation>
- <Reference>reference-slug</Reference>
- <Integration>vendor/integration-slug</Integration>
```

### Ordering

Maintain this order within See Also sections:

1. Operators (`<Op>`)
2. Functions (`<Fn>`)
3. Guides (`<Guide>`)
4. Tutorials (`<Tutorial>`)
5. Explanations (`<Explanation>`)
6. References (`<Reference>`)
7. Integrations (`<Integration>`)

### Reciprocal Cross-References

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

### Finding Relevant Content

When adding See Also links, look in these directories for related content:

- `src/content/docs/guides/` - How-to guides for common tasks
- `src/content/docs/tutorials/` - Step-by-step learning tutorials
- `src/content/docs/explanations/` - Conceptual explanations

Link to content that helps users understand or apply the operator/function.

### File extension

Pages using semantic components must use the `.mdx` extension.
