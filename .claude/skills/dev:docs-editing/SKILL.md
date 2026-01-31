---
name: dev:docs-editing
description: Edit Tenzir documentation. Use when writing, updating, or validating docs in .docs/.
hooks:
  PreToolUse:
    - matcher: "*"
      hooks:
        - type: command
          command: "/Users/mavam/.claude/plugins/cache/tenzir/dev/4.1.0/scripts/detect-change-scope.sh"
          once: true
---

# Editing Documentation

Operational workflow for creating and editing Tenzir documentation.

## 1. Determine what to document

Use one of these sources to identify documentation scope:

- **Arguments**: If specific instructions were provided, use them
- **Injected scope**: Check for scope information from the `detect-change-scope.sh`
  hook that runs at skill invocation
- **Manual detection**: If no changes detected, ask the user for git history
  context or a specific topic

## 2. Check for existing documentation

Search `.docs/` for relevant pages:

- If **updating**: Read current content first to understand existing structure
- If **creating**: Find similar pages as templates

## 3. Write the documentation

Create or update files in `.docs/src/content/docs/`.

After writing, review for cross-cutting updates:

- `/reference` changes may need corresponding `/guides` updates
- New features often need a guide showing practical usage
- New concepts in `/explanations` should link to relevant `/guides`
- `/integrations` often have cross-cutting concerns

Follow "See Also" links at the bottom of pages and update downstream
documentation if needed.

## 4. Report results

Summarize what was done:

1. **Files created/modified**: List each file with its path in `.docs/`
2. **Sections updated**: Which Diataxis sections were touched
