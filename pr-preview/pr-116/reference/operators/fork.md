# fork

Executes a subpipeline with a copy of the input.

```tql
fork { … }
```

## Description

[Section titled “Description”](#description)

The `fork` operator executes a subpipeline with a copy of its input, that is: whenever an event arrives, it is sent both to the given pipeline and forwarded at the same time to the next operator.

### `{ … }`

[Section titled “{ … }”](#-)

The pipeline to execute. Must have a sink.

## Examples

[Section titled “Examples”](#examples)

### Publish incoming events while importing them simultaneously

[Section titled “Publish incoming events while importing them simultaneously”](#publish-incoming-events-while-importing-them-simultaneously)

```tql
fork {
  publish "imported-events"
}
import
```