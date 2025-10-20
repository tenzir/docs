# tail

Limits the input to the last `n` events.

```tql
tail [n:int]
```

## Description

[Section titled “Description”](#description)

Forwards the last `n` events and discards the rest.

`tail n` is a shorthand notation for [`slice begin=-n`](/reference/operators/slice).

### `n: int (optional)`

[Section titled “n: int (optional)”](#n-int-optional)

The number of events to keep.

Defaults to `10`.

## Examples

[Section titled “Examples”](#examples)

### Get the last 10 results

[Section titled “Get the last 10 results”](#get-the-last-10-results)

```tql
export
tail
```

### Get the last 5 results

[Section titled “Get the last 5 results”](#get-the-last-5-results)

```tql
export
tail 5
```

## See Also

[Section titled “See Also”](#see-also)

[`head`](/reference/operators/head), [`slice`](/reference/operators/slice)