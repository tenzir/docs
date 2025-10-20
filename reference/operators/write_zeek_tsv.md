# write_zeek_tsv

Transforms event stream into Zeek Tab-Separated Value byte stream.

```tql
write_zeek_tsv [set_separator=str, empty_field=str, unset_field=str, disable_timestamp_tags=bool]
```

## Description

[Section titled “Description”](#description)

The [Zeek](https://zeek.org) network security monitor comes with its own tab-separated value (TSV) format for representing logs. This format includes additional header fields with field names, type annotations, and additional metadata.

The `write_zeek_tsv` operator (re)generates the TSV metadata based on Tenzir’s internal schema. Tenzir’s data model is a superset of Zeek’s, so the conversion into Zeek TSV may be lossy. The Zeek types `count`, `real`, and `addr` map to the respective Tenzir types `uint64`, `double`, and `ip`.

### `set_separator = str (optional)`

[Section titled “set\_separator = str (optional)”](#set_separator--str-optional)

Specifies the set separator.

Defaults to `\x09`.

### `empty_field = str (optional)`

[Section titled “empty\_field = str (optional)”](#empty_field--str-optional)

Specifies the separator for empty fields.

Defaults to `(empty)`.

### `unset_field = str (optional)`

[Section titled “unset\_field = str (optional)”](#unset_field--str-optional)

Specifies the separator for unset “null” fields.

Defaults to `-`.

### `disable_timestamp_tags = bool (optional)`

[Section titled “disable\_timestamp\_tags = bool (optional)”](#disable_timestamp_tags--bool-optional)

Disables the `#open` and `#close` timestamp tags.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

### Write pipelines results in Zeek TSV format

[Section titled “Write pipelines results in Zeek TSV format”](#write-pipelines-results-in-zeek-tsv-format)

```tql
subscribe "zeek-logs"
where duration > 2s and id.orig_p != 80
write_zeek_tsv
save_file "filtered_conn.log"
```

## See Also

[Section titled “See Also”](#see-also)

[`read_zeek_json`](/reference/operators/read_zeek_json), [`read_zeek_tsv`](/reference/operators/read_zeek_tsv)