# now

Gets the current wallclock time.

```tql
now() -> time
```

## Description

[Section titled “Description”](#description)

The `now` function returns the current wallclock time.

## Examples

[Section titled “Examples”](#examples)

### Get the time in UTC

[Section titled “Get the time in UTC”](#get-the-time-in-utc)

```tql
let $now = now()
from { x: $now }
```

```tql
{x: 2024-10-28T13:27:33.957987}
```

### Compute a field with the current time

[Section titled “Compute a field with the current time”](#compute-a-field-with-the-current-time)

```tql
subscribe "my-topic"
select ts=now()
```

```tql
{ts: 2024-10-30T15:03:04.85298}
{ts: 2024-10-30T15:03:06.31878}
{ts: 2024-10-30T15:03:07.59813}
```

## See Also

[Section titled “See Also”](#see-also)

[`from_epoch`](/reference/functions/from_epoch), [`since_epoch`](/reference/functions/since_epoch)