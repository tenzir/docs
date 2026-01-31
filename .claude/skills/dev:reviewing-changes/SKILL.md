---
name: dev:reviewing-changes
description: Review methodology for code changes with confidence scoring. Use when spawning reviewer agents, rating issue severity (P1-P4), or scoring review confidence.
hooks:
  PreToolUse:
    - matcher: "*"
      hooks:
        - type: command
          command: "/Users/mavam/.claude/plugins/cache/tenzir/dev/4.0.0/scripts/create-review-dir.sh"
          once: true
---

# Reviewing Changes

Review code changes with confidence-scored findings. This skill defines the
methodology for specialized reviewers.

## Two Rating Dimensions

### Severity Rating

Rate each finding's impact independently from confidence:

| Severity | Emoji | Impact                                          |
| -------- | ----- | ----------------------------------------------- |
| P1       | 🔴    | Critical — security, data loss, crashes         |
| P2       | 🟠    | Important — broken features, significant bugs   |
| P3       | 🟡    | Minor — edge cases, small bugs, inconsistencies |
| P4       | ⚪    | Trivial — cosmetic, style, optional             |

### Confidence Scoring

Score certainty that the finding is real on a 0-100 scale:

| Score    | Certainty | Meaning                   |
| -------- | --------- | ------------------------- |
| 91-100   | Very high | Definitely an issue       |
| 81-90    | High      | Almost certainly an issue |
| 71-80    | Moderate  | Likely an issue           |
| Below 70 | Low       | Possibly a false positive |

Only report findings with confidence 80 or higher.

### Independence of Dimensions

Confidence measures certainty; severity measures impact. Examples:

- P1 + 95% = Critical issue, definitely real
- P1 + 75% = Potentially critical, needs investigation
- P4 + 95% = Trivial issue, definitely real
- P4 + 60% = Trivial issue, might be wrong

### Scoring Criteria

- **Reproducibility**: Can the issue be demonstrated? (+15)
- **Impact severity**: How much does it affect users? (+20)
- **Clear violation**: Does it break a documented rule? (+20)
- **Frequency**: How often will users encounter it? (+15)
- **Fix complexity**: Is the fix straightforward? (+10)
- **Evidence strength**: How concrete is the evidence? (+20)

Deduct points for:

- Speculative concerns without concrete evidence (-20)
- Edge cases unlikely to occur in practice (-15)
- Style preferences not backed by convention (-15)
- Issues the codebase already handles elsewhere (-10)
- Concern doesn't apply to this project context (-20 to -40)

## Output Format

Write findings to a markdown file in the review directory.

### Issue IDs

Each finding gets a unique ID with a 3-letter prefix and sequence number:

| Reviewer    | Prefix | Example |
| ----------- | ------ | ------- |
| security    | SEC    | SEC-1   |
| arch        | ARC    | ARC-1   |
| tests       | TST    | TST-1   |
| ux          | UXD    | UXD-1   |
| readability | RDY    | RDY-1   |
| docs        | DOC    | DOC-1   |
| performance | PRF    | PRF-1   |
| github      | GIT    | GIT-1   |

Number findings sequentially starting at 1.

### File Structure

    # <Aspect> Review

    ## Summary

    Brief overall assessment (2-3 sentences).

    ## Findings

    ### SEC-1 · P1 · SQL injection vulnerability · 95%

    - **File**: `path/to/file.ts:45-52`
    - **Issue**: User input passed directly to SQL query
    - **Reasoning**: Variable `userInput` from request body is string-concatenated
      into the SQL query at line 47 without sanitization or parameterization.
    - **Evidence**:
      ```ts
      const query = "SELECT * FROM users WHERE id = " + userInput;
      ```
      This pattern allows arbitrary SQL injection via the `id` parameter.
    - **Suggestion**: Use parameterized queries with `$1` placeholder.

    ### SEC-2 · P3 · Missing null check · 85%

    - **File**: `path/to/file.ts:120`
    - **Issue**: Function assumes `config.timeout` is always defined
    - **Reasoning**: `config` comes from user input via `loadConfig()` which returns
      partial objects. The `timeout` property is optional per the type definition.
    - **Evidence**:
      ```ts
      const delay = config.timeout * 1000; // crashes if timeout is undefined
      ```
      Type shows: `interface Config { timeout?: number }` — optional field.
    - **Suggestion**: Add nullish coalescing: `(config.timeout ?? 30) * 1000`

### Required Fields

Each finding **must** include:

| Field          | Purpose                                            |
| -------------- | -------------------------------------------------- |
| **File**       | Location with line numbers                         |
| **Issue**      | What's wrong (one sentence)                        |
| **Reasoning**  | Why this is a problem (logical argument)           |
| **Evidence**   | Concrete proof (code snippet, type info, behavior) |
| **Suggestion** | How to fix it                                      |

The `### {ID} · P{n} · title · {n}%` header pattern enables tracking and filtering.

### Evidence Quality

Confidence score directly reflects evidence strength:

| Confidence | Evidence Quality                                      |
| ---------- | ----------------------------------------------------- |
| 91-100     | Definitive proof (code snippet + demonstrated impact) |
| 81-90      | Strong evidence (code shows the pattern clearly)      |
| 71-80      | Moderate (reasoning sound but evidence indirect)      |

If you cannot provide concrete evidence, reconsider whether to report the finding.

## Actionability Criteria

A finding is actionable when:

1. The issue is specific and locatable (file, line, function)
2. The suggestion provides a concrete fix, not vague advice
3. The fix can be applied without major refactoring
4. The benefit outweighs the implementation cost

Avoid reporting:

- Hypothetical future problems
- Matters of personal taste
- Issues outside the changed code

## Review Scope

Focus on **changed code**. Do not emit findings for:

- Files outside the review scope
- Unchanged code unless directly related to the changes
