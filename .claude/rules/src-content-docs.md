---
paths: src/content/docs/**/*
---

## Content Authoring

When writing or editing documentation content, invoke the `dev:docs-authoring`
skill for Diátaxis framework guidance, file format details, and writing style.

### Linking Conventions

Always wrap operator and function names in markdown links, even when mentioned
multiple times in the same document. Use backticks with the link:
[`publish`](/reference/operators/publish), [`round`](/reference/functions/round).

When first introducing a technology that has an `/integrations` page, link to it
in the text: [Kafka](/integrations/kafka), [Splunk](/integrations/splunk).

### Consecutive Code Blocks

Consecutive TQL code blocks render as a merged visual unit where the second
block shows an "OUTPUT" label. Only use consecutive blocks when the first is a
pipeline and the second shows its output. Otherwise, add a paragraph between
blocks to separate them visually.

### First Paragraph Guidelines

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
