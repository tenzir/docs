# import

Imports events into a Tenzir node.

```tql
import
```

## Description

[Section titled “Description”](#description)

The `import` operator persists events in a Tenzir node.

This operator is the dual to [`export`](/reference/operators/export).

## Examples

[Section titled “Examples”](#examples)

### Import Zeek connection logs in TSV format

[Section titled “Import Zeek connection logs in TSV format”](#import-zeek-connection-logs-in-tsv-format)

```tql
load_file "conn.log"
read_zeek_tsv
import
```

## See Also

[Section titled “See Also”](#see-also)

[`export`](/reference/operators/export), [`publish`](/reference/operators/publish)