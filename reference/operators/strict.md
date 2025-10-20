# strict

Treats all warnings as errors.

```tql
strict { … }
```

## Description

[Section titled “Description”](#description)

The `strict` operator takes a pipeline as an argument and treats all warnings emitted by the execution of the pipeline as errors. This is useful when you want to stop a pipeline on warnings or unexpected diagnostics.

## Examples

[Section titled “Examples”](#examples)

### Stop the pipeline on any warnings when sending logs

[Section titled “Stop the pipeline on any warnings when sending logs”](#stop-the-pipeline-on-any-warnings-when-sending-logs)

```tql
subscribe "log-feed"
strict {
  to_google_cloud_logging …
}
```

## See Also

[Section titled “See Also”](#see-also)

[`assert`](/reference/operators/assert)