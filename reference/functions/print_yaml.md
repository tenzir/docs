# print_yaml

Prints a value as a YAML document.

```tql
print_yaml( input:any, [include_document_markers=bool] )
```

## Description

[Section titled “Description”](#description)

### `input:any`

[Section titled “input:any”](#inputany)

The value to print as YAML.

### `include_document_markers = bool (optional)`

[Section titled “include\_document\_markers = bool (optional)”](#include_document_markers--bool-optional)

Includes the “start of document” and “end of document” markers in the result.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

```tql
from {x: { x: 0, y: 1 } }, { x: [0,1,2,] }
x = x.print_yaml()
```

```tql
{
  x: "x: 0\ny: 1",
}
{
  x: "- 0\n- 1\n- 2",
}
```

## See Also

[Section titled “See Also”](#see-also)

[`write_yaml`](/reference/operators/write_yaml), [`parse_yaml`](/reference/functions/parse_yaml)