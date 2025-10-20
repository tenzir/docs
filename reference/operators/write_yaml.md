# write_yaml

Transforms the input event stream to YAML byte stream.

```tql
write_yaml
```

## Description

[Section titled “Description”](#description)

Transforms the input event stream to YAML byte stream.

## Examples

[Section titled “Examples”](#examples)

### Convert a JSON file into a YAML file

[Section titled “Convert a JSON file into a YAML file”](#convert-a-json-file-into-a-yaml-file)

```tql
load_file "input.json"
read_json
write_yaml
save_file "output.yaml"
```

## See Also

[Section titled “See Also”](#see-also)

[`read_yaml`](/reference/operators/read_yaml), [`parse_yaml`](/reference/functions/parse_yaml), [`print_yaml`](/reference/functions/print_yaml)