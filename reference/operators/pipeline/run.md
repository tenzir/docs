# pipeline::run

Starts a pipeline in the node and waits for it to complete.

```tql
pipeline::run { … }, [id=string]
```

## Description

[Section titled “Description”](#description)

The `pipeline::run` operator starts a hidden managed pipeline in the node, and returns when the pipeline has finished.

Note that pipelines may emit diagnostics after they have finished.

Subject to Change

This operator primarily exists for testing purposes, where it is often required to run pipelines with an explicitly specified pipeline id.

### `{ … }`

[Section titled “{ … }”](#-)

The pipeline to execute. This pipeline runs as a separate managed pipeline within the node.

### `id = string (optional)`

[Section titled “id = string (optional)”](#id--string-optional)

Sets the pipeline’s ID explicitly, instead of assigning a random ID. This corresponds to the `id` field in the output of `pipeline::list`, and the `pipeline_id` field in the output of `metrics` and `diagnostics`.

## Examples

[Section titled “Examples”](#examples)

### Run a pipeline in the background and wait for it to complete

[Section titled “Run a pipeline in the background and wait for it to complete”](#run-a-pipeline-in-the-background-and-wait-for-it-to-complete)

```tql
pipeline::run {
  every 1min {
    version
  }
  select version
  write_lines
  save_stdout
}
```

## See Also

[Section titled “See Also”](#see-also)

[`pipeline::detach`](/reference/operators/pipeline/detach), [`pipeline::list`](/reference/operators/pipeline/list)