---
title: remote
category: Internals
example: 'remote { … }'
---


Forces a pipeline to run remotely at a node.

```tql
remote { … }
```

## Description

The `remote` operator takes a pipeline as an argument and forces it to run at a
Tenzir Node.

This operator has no effect when running a pipeline through the API or Tenzir
Platform.

## Examples

### Get the version of a node

```tql
remote {
  version
}
```

## See Also

[`local`](/reference/operators/local)
