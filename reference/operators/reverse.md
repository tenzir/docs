# reverse

Reverses the event order.

```tql
reverse
```

## Description

[Section titled “Description”](#description)

`reverse` is a shorthand notation for [`slice stride=-1`](/reference/operators/slice).

Potentially High Memory Usage

Use caution when applying this operator to large inputs. It currently buffers all data in memory. Out-of-core processing is on our roadmap.

## Examples

[Section titled “Examples”](#examples)

### Reverse a stream of events

[Section titled “Reverse a stream of events”](#reverse-a-stream-of-events)

```tql
from {x: 1}, {x: 2}, {x: 3}
reverse
```

```tql
{x: 3}
{x: 2}
{x: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`sort`](/reference/operators/sort)