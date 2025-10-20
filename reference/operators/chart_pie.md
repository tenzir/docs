# chart_pie

Plots events on an pie chart.

```tql
chart_pie x|label=field, y|value=any, [group=any]
```

## Description

[Section titled “Description”](#description)

Visualizes events with an pie chart on the [Tenzir Platform](https://app.tenzir.com).

### `x|label = field`

[Section titled “x|label = field”](#xlabel--field)

Name of each slice on the chart.

### `y|value = any`

[Section titled “y|value = any”](#yvalue--any)

Value of each slice on the chart. Multiple data points for the same group can be be aggregated using an [aggregation function](/reference/functions#aggregation).

Multiple `y` values and their labels can be specified by using the record syntax: `{name: value, ...}`.

For example, `y = {"Avg. Load": mean(load)}` calculates the [mean](/reference/functions/mean) of the `load` field and labels it as `Avg. Load`.

### `group = any (optional)`

[Section titled “group = any (optional)”](#group--any-optional)

Optional expression to group the aggregations with.

## Examples

[Section titled “Examples”](#examples)

### Chart count of events imported for every unique schema

[Section titled “Chart count of events imported for every unique schema”](#chart-count-of-events-imported-for-every-unique-schema)

```tql
metrics "import"
where timestamp > now() - 1d
chart_pie label=schema, value=sum(events)
```

## See Also

[Section titled “See Also”](#see-also)

[`chart_area`](/reference/operators/chart_area), [`chart_bar`](/reference/operators/chart_bar), [`chart_line`](/reference/operators/chart_line)