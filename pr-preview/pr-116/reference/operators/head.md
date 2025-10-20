# head

Limits the input to the first `n` events.

```tql
head [n:int]
```

## Description

[Section titled “Description”](#description)

Forwards the first `n` events and discards the rest.

`head n` is a shorthand notation for [`slice end=n`](/reference/operators/slice).

### `n: int (optional)`

[Section titled “n: int (optional)”](#n-int-optional)

The number of events to keep.

Defaults to `10`.

## Examples

[Section titled “Examples”](#examples)

### Get the first 10 events

[Section titled “Get the first 10 events”](#get-the-first-10-events)

```tql
head
```

### Get the first 5 events

[Section titled “Get the first 5 events”](#get-the-first-5-events)

```tql
head 5
```

## See Also

[Section titled “See Also”](#see-also)

[`slice`](/reference/operators/slice), [`tail`](/reference/operators/tail)