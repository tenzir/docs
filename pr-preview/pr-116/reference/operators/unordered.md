# unordered

Removes ordering assumptions from a pipeline.

```tql
unordered { … }
```

## Description

[Section titled “Description”](#description)

The `unordered` operator takes a pipeline as an argument and removes ordering assumptions from it. This causes some operators to run faster.

Note that some operators implicitly remove ordering assumptions. For example, `sort` tells upstream operators that ordering does not matter.

## Examples

[Section titled “Examples”](#examples)

### Parse JSON unordered

[Section titled “Parse JSON unordered”](#parse-json-unordered)

```tql
unordered {
  read_json
}
```