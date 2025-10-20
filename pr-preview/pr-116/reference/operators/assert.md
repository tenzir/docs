# assert

Drops events and emits a warning if the invariant is violated.

```tql
assert invariant:bool, [message=any]
```

## Description

[Section titled “Description”](#description)

The `assert` operator asserts that `invariant` is `true` for events. In case an event does not satisfy the invariant, it is dropped and a warning is emitted.

Consider using `where` instead

If you only want to filter events, use `where` instead of `assert`. The `where` operator does not emit a warning when the expression evaluates to false, hence it is more suitable for normal filtering purposes. It is also much faster than `assert` in some situations due to optimizations such as predicate pushdown.

### `invariant: bool`

[Section titled “invariant: bool”](#invariant-bool)

Condition to assert being `true`.

### `message = any (optional)`

[Section titled “message = any (optional)”](#message--any-optional)

Context to associate with the assertion failure.

## Examples

[Section titled “Examples”](#examples)

### Make sure that `x != 2`

[Section titled “Make sure that x != 2”](#make-sure-that-x--2)

```tql
from {x: 1}, {x: 2}, {x: 3}
assert x != 2
```

```tql
{x: 1}
// warning: assertion failure
{x: 3}
```

### Check that a topic only contains certain events

[Section titled “Check that a topic only contains certain events”](#check-that-a-topic-only-contains-certain-events)

```tql
subscribe "network"
assert @name == "ocsf.network_activity"
// continue processing
```

## See Also

[Section titled “See Also”](#see-also)

[`assert_throughput`](/reference/operators/assert_throughput), [`where`](/reference/operators/where)