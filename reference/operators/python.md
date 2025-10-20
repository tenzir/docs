# python

Executes Python code against each event of the input.

```tql
python code:string, [requirements=string]
python file=string, [requirements=string]
```

Requirements

A Python 3 (>=3.10) interpreter must be present in the `PATH` environment variable of the `tenzir` or `tenzir-node` process.

## Description

[Section titled “Description”](#description)

The `python` operator executes user-provided Python code against each event of the input.

By default, the Tenzir node executing the pipeline creates a virtual environment into which the `tenzir` Python package is installed. This behavior can be turned off in the node configuration using the `plugin.python.create-venvs` boolean option.

Performance

The `python` operator implementation applies the provided Python code to each input row, one by one. We use [PyArrow](https://arrow.apache.org/docs/python/index.html) to convert the input values to native Python data types and back to the Tenzir data model after the transformation. This does have a noticeable performance impact compared to native TQL operations.

### `code: string`

[Section titled “code: string”](#code-string)

The provided Python code describes an event-to-event transformation, i.e., it is executed once for each input event and produces exactly output event.

An implicitly defined `self` variable represents the event. Modify it to alter the output of the operator. Fields of the event can be accessed with the dot notation. For example, if the input event contains fields `a` and `b` then the Python code can access and modify them using `self.a` and `self.b`. Similarly, new fields are added by assigning to `self.fieldname` and existing fields can be removed by deleting them from `self`. When new fields are added, it is required that the new field has the same type for every row of the event.

### `file: string`

[Section titled “file: string”](#file-string)

Instead of providing the code inline, the `file` option allows for passing a path to a file containing the code the operator executes per event.

### `requirements = string (optional)`

[Section titled “requirements = string (optional)”](#requirements--string-optional)

The `requirements` flag can be used to pass additional package dependencies in the pip format. When it is used, the argument is passed on to `pip install` in a dedicated virtual environment.

The string is passed verbatim to `pip install`. To add multiple dependencies, separate them with a space: `requirements="foo bar"`.

## Secrets

[Section titled “Secrets”](#secrets)

By default, the `python` operator does not accept secrets. If you want to allow usage of secrets in the `code` argument, you can enable the configuration option `tenzir.allow-secrets-in-escape-hatches`.

## Examples

[Section titled “Examples”](#examples)

### Insert or modify a field

[Section titled “Insert or modify a field”](#insert-or-modify-a-field)

Set field `x` to `"hello, world"`

```tql
python "self.x = 'hello, world'"
```

### Remove all fields from an event

[Section titled “Remove all fields from an event”](#remove-all-fields-from-an-event)

Clear the contents of `self` to remove the implicit input values from the output:

```tql
python "
  self.clear()
"
```

### Insert a new field

[Section titled “Insert a new field”](#insert-a-new-field)

Define a new field `x` as the square root of the field `y`, and remove `y` from the output:

```tql
python "
  import math
  self.x = math.sqrt(self.y)
  del self.y
"
```

### Make use of third party packages

[Section titled “Make use of third party packages”](#make-use-of-third-party-packages)

```tql
python r#"
  import requests
  requests.post("http://imaginary.api/receive", data=self)
"#, requirements="requests=^2.30"
```

## See Also

[Section titled “See Also”](#see-also)

[`shell`](/reference/operators/shell)