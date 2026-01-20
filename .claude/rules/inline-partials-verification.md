---
paths:
  - src/partials/**/*
  - src/utils/remark-inline-partials.ts
  - scripts/verify-inline-partials.ts
---

After changing partials or the inline-partials pipeline, run
`bun run test:inline-partials` to confirm headings are inlined and props
substitutions match TOC text.
