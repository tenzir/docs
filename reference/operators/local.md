# local

Forces a pipeline to run locally.

```tql
local { … }
```

## Description

[Section titled “Description”](#description)

The `local` operator takes a pipeline as an argument and forces it to run at a client process.

This operator has no effect when running a pipeline through the API or Tenzir Platform.

## Examples

[Section titled “Examples”](#examples)

### Do an expensive sort locally

[Section titled “Do an expensive sort locally”](#do-an-expensive-sort-locally)

```tql
export
where @name.starts_with("suricata")
local {
  sort timestamp
}
write_ndjson
save_file "eve.json"
```

## See Also

[Section titled “See Also”](#see-also)

[`remote`](/reference/operators/remote)