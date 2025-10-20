# timeshift

Adjusts timestamps relative to a given start time, with an optional speedup.

```tql
timeshift field:time, [start=time, speed=double]
```

## Description

[Section titled “Description”](#description)

The `timeshift` operator adjusts a series of time values by anchoring them around a given `start` time.

With `speed`, you can adjust the relative speed of the time series induced by `field` with a multiplicative factor. This has the effect of making the time series “faster” for values great than 1 and “slower” for values less than 1.

![Timeshift](/_astro/timeshift.excalidraw.BVaAeL1C_19DKCs.svg)

### `field: time`

[Section titled “field: time”](#field-time)

The field containing the timestamp values.

### `start = time (optional)`

[Section titled “start = time (optional)”](#start--time-optional)

The timestamp to anchor the time values around.

Defaults to the first non-null timestamp in `field`.

### `speed = double (optional)`

[Section titled “speed = double (optional)”](#speed--double-optional)

A constant factor to be divided by the inter-arrival time. For example, 2.0 decreases the event gaps by a factor of two, resulting a twice as fast dataflow. A value of 0.1 creates dataflow that spans ten times the original time frame.

Defaults to `1.0`.

## Examples

[Section titled “Examples”](#examples)

### Reset events to begin at Jan 1, 1984

[Section titled “Reset events to begin at Jan 1, 1984”](#reset-events-to-begin-at-jan-1-1984)

```tql
load_http "https://storage.googleapis.com/tenzir-datasets/M57/zeek-all.log.zst"
decompress "zstd"
read_zeek_tsv
timeshift ts, start=1984-01-01
```

### Scale inter-arrival times by 100x

[Section titled “Scale inter-arrival times by 100x”](#scale-inter-arrival-times-by-100x)

As above, but also make the time span of the trace 100 times longer:

```tql
load_http "https://storage.googleapis.com/tenzir-datasets/M57/zeek-all.log.zst"
decompress "zstd"
read_zeek_tsv
timeshift ts, start=1984-01-01, speed=0.01
```

## See Also

[Section titled “See Also”](#see-also)

[`delay`](/reference/operators/delay)