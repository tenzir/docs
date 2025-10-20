# repeat

Repeats the input a number of times.

```tql
repeat [count:int]
```

## Description

[Section titled “Description”](#description)

The `repeat` operator relays the input without any modification, and repeats its inputs a specified number of times. It is primarily used for testing and when working with generated data.

Potentially High Memory Usage

Whithout specifying `count`, the operator produces events indefinitely.

### `count: int (optional)`

[Section titled “count: int (optional)”](#count-int-optional)

The number of times to repeat the input data.

If not specified, the operator repeats its input indefinitely.

## Examples

[Section titled “Examples”](#examples)

### Repeat input indefinitely

[Section titled “Repeat input indefinitely”](#repeat-input-indefinitely)

Given the following events:

```tql
{number: 1, "text": "one"}
{number: 2, "text": "two"}
```

The `repeat` operator will repeat them indefinitely, in order:

```tql
repeat
```

```tql
{number: 1, "text": "one"}
{number: 2, "text": "two"}
{number: 1, "text": "one"}
{number: 2, "text": "two"}
{number: 1, "text": "one"}
{number: 2, "text": "two"}
// …
```

### Repeat the first event 5 times

[Section titled “Repeat the first event 5 times”](#repeat-the-first-event-5-times)

```tql
head 1
repeat 5
```

```tql
{number: 1, "text": "one"}
{number: 1, "text": "one"}
{number: 1, "text": "one"}
{number: 1, "text": "one"}
{number: 1, "text": "one"}
```