# pass

Does nothing with the input.

```tql
pass
```

## Description

[Section titled “Description”](#description)

The `pass` operator relays the input without any modification. Outside of testing and debugging, it is only used when an empty pipeline needs to created, as `{}` is a record, while `{ pass }` is a pipeline.

## Examples

[Section titled “Examples”](#examples)

### Forward the input without any changes

[Section titled “Forward the input without any changes”](#forward-the-input-without-any-changes)

```tql
pass
```

### Do nothing every 10s

[Section titled “Do nothing every 10s”](#do-nothing-every-10s)

```tql
every 10s {
  pass
}
```