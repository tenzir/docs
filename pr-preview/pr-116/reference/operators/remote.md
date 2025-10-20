# remote

Forces a pipeline to run remotely at a node.

```tql
remote { … }
```

## Description

[Section titled “Description”](#description)

The `remote` operator takes a pipeline as an argument and forces it to run at a Tenzir Node.

This operator has no effect when running a pipeline through the API or Tenzir Platform.

## Examples

[Section titled “Examples”](#examples)

### Get the version of a node

[Section titled “Get the version of a node”](#get-the-version-of-a-node)

```tql
remote {
  version
}
```

## See Also

[Section titled “See Also”](#see-also)

[`local`](/reference/operators/local)