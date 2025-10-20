# slice

Keeps a range of events within the interval `[begin, end)` stepping by `stride`.

```tql
slice [begin=int, end=int, stride=int]
```

## Description

[Section titled “Description”](#description)

The `slice` operator selects a range of events from the input. The semantics of the operator match Python’s array slicing.

Potentially High Memory Usage

Take care when using this operator with large inputs.

### `begin = int (optional)`

[Section titled “begin = int (optional)”](#begin--int-optional)

The beginning (inclusive) of the range to keep. Use a negative number to count from the end.

### `end = int (optional)`

[Section titled “end = int (optional)”](#end--int-optional)

The end (exclusive) of the range to keep. Use a negative number to count from the end.

### `stride = int (optional)`

[Section titled “stride = int (optional)”](#stride--int-optional)

The number of elements to advance before the next element. Use a negative number to count from the end, effectively reversing the stream.

## Examples

[Section titled “Examples”](#examples)

### Get the second 100 events

[Section titled “Get the second 100 events”](#get-the-second-100-events)

```tql
slice begin=100, end=200
```

### Get the last 5 events

[Section titled “Get the last 5 events”](#get-the-last-5-events)

```tql
slice begin=-5
```

### Skip the last 10 events

[Section titled “Skip the last 10 events”](#skip-the-last-10-events)

```tql
slice end=-10
```

### Return the last 50 events, except for the last 2

[Section titled “Return the last 50 events, except for the last 2”](#return-the-last-50-events-except-for-the-last-2)

```tql
slice begin=-50, end=-2
```

### Skip the first and the last event

[Section titled “Skip the first and the last event”](#skip-the-first-and-the-last-event)

```tql
slice begin=1, end=-1
```

### Return every second event starting from the tenth

[Section titled “Return every second event starting from the tenth”](#return-every-second-event-starting-from-the-tenth)

```tql
slice begin=9, stride=2
```

### Return all but the last five events in reverse order

[Section titled “Return all but the last five events in reverse order”](#return-all-but-the-last-five-events-in-reverse-order)

```tql
slice end=-5, stride=-1
```

## See Also

[Section titled “See Also”](#see-also)

[`head`](/reference/operators/head), [`tail`](/reference/operators/tail)