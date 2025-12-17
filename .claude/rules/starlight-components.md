---
paths: src/components/**/*
---

# Starlight Components

Starlight provides built-in components for common documentation patterns. Prefer
these instead of creating custom implementations.

**Import from:** `@astrojs/starlight/components`

## Available Components

### Aside (Callouts)

Styled boxes for notes, tips, cautions, and warnings.

```mdx
import { Aside } from '@astrojs/starlight/components';

<Aside>Default note content.</Aside>
<Aside type="tip">Helpful tip.</Aside>
<Aside type="caution">Be careful.</Aside>
<Aside type="danger">Critical warning.</Aside>
```

Customization: `src/assets/styles.css` styles `.starlight-aside--*` variants with
Tenzir semantic colors (lightblue for note, green for tip, yellow for caution,
red for danger).

### Badge

Small status labels.

```mdx
import { Badge } from '@astrojs/starlight/components';

<Badge text="New" variant="tip" />
<Badge text="Deprecated" variant="caution" />
```

Variants: `note`, `tip`, `caution`, `danger`, `success`, `default`

Sizes: `small`, `medium`, `large`

Customization: Styled in `src/assets/styles.css` with Tenzir colors and uppercase
text transform.

### Card & CardGrid

Content boxes for highlighting information.

```mdx
import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Feature A" icon="star">Description here.</Card>
  <Card title="Feature B" icon="rocket">Another description.</Card>
</CardGrid>
```

Card props: `title` (required), `icon` (optional, uses Starlight icons)

Customization: `.sl-markdown-content .card` in `src/assets/styles.css` adds Tenzir
border radius, hover effects, and spacing.

### LinkCard

Prominent links with title and optional description.

```mdx
import { LinkCard } from '@astrojs/starlight/components';

<LinkCard title="Getting Started" href="/tutorials/" description="Learn the basics." />
```

Props: `title`, `href` (required), `description` (optional)

**Custom wrapper:** `src/components/LinkCard.astro` extends the Starlight component
with:

- `meta`: Small text in top-right corner (e.g., date)
- `badges`: Array of `{text, variant}` objects displayed in bottom-right
- `icon`: Starlight icon displayed on the left

### LinkButton

Call-to-action buttons.

```mdx
import { LinkButton } from '@astrojs/starlight/components';

<LinkButton href="/start/">Get Started</LinkButton>
<LinkButton href="/docs/" variant="secondary">Documentation</LinkButton>
<LinkButton href="/api/" variant="minimal" icon="external">API</LinkButton>
```

Variants: `primary` (default), `secondary`, `minimal`

Props: `href`, `variant`, `icon`, `iconPlacement` (`start` or `end`)

Customization: `.sl-link-button` in `src/assets/styles.css` applies Tenzir button
styling with proper light/dark mode colors.

### Tabs & TabItem

Tabbed content panels.

```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
  <TabItem label="CLI">CLI instructions here.</TabItem>
  <TabItem label="Docker">Docker instructions here.</TabItem>
</Tabs>
```

TabItem props: `label` (required), `icon` (optional)

Tabs props: `syncKey` (sync tab selection across pages)

Customization: `starlight-tabs` in `src/assets/styles.css` follows Tenzir tab bar
design system with 48px height and styled indicators.

### Steps

Styled numbered lists for step-by-step guides.

```mdx
import { Steps } from '@astrojs/starlight/components';

<Steps>
1. First step
2. Second step
3. Third step
</Steps>
```

No props. Wrap a standard Markdown ordered list.

### FileTree

Display directory structures.

```mdx
import { FileTree } from '@astrojs/starlight/components';

<FileTree>
- src/
  - components/
    - **Header.astro** (highlighted)
  - pages/
- astro.config.mjs
</FileTree>
```

Use `**name**` to highlight entries. Add trailing `/` for directories.

### Icon

Display icons from Starlight's built-in set.

```mdx
import { Icon } from '@astrojs/starlight/components';

<Icon name="star" size="1.5rem" color="var(--tnz-primary-500)" />
```

Props: `name` (required), `size`, `color`, `label` (accessibility)

### Code

Dynamic code blocks with syntax highlighting.

```mdx
import { Code } from '@astrojs/starlight/components';

<Code code={someVariable} lang="tql" />
```

Use when code content is dynamic. For static code, use fenced code blocks.

## Guidelines

1. **Prefer Starlight components over custom implementations.** They integrate
   with the theme, support dark mode, and receive upstream updates.

2. **Check for extended wrappers.** Some components like `LinkCard` have custom
   wrappers in `src/components/` with additional features.

3. **Use Tenzir design tokens** when extending styles. Import from
   `src/assets/css/` and use `--tnz-*` variables.

4. **Avoid duplicating functionality.** Before creating a new component, check if
   a Starlight component or existing custom component already covers the use case.
