# save_gcs

Saves bytes to a Google Cloud Storage object.

```tql
save_gcs uri:string, [anonymous=bool]
```

## Description

[Section titled “Description”](#description)

The `save_gcs` operator connects to a GCS bucket to save raw bytes to a GCS object.

The connector tries to retrieve the appropriate credentials using Google’s [Application Default Credentials](https://google.aip.dev/auth/4110).

### `uri: string`

[Section titled “uri: string”](#uri-string)

The path to the GCS object.

The syntax is `gs://<bucket-name>/<full-path-to-object>(?<options>)`. The `<options>` are query parameters. Per the [Arrow documentation](https://arrow.apache.org/docs/r/articles/fs.html#connecting-directly-with-a-uri), the following options exist:

> For GCS, the supported parameters are `scheme`, `endpoint_override`, and `retry_limit_seconds`.

### `anonymous = bool (optional)`

[Section titled “anonymous = bool (optional)”](#anonymous--bool-optional)

Ignore any predefined credentials and try to use anonymous credentials.

## Examples

[Section titled “Examples”](#examples)

Write JSON to an object `test.json` in `bucket`, but using a different GCS-compatible endpoint:

```tql
write_json
save_gcs "gs://bucket/test.json?endpoint_override=gcs.mycloudservice.com"
```

## See Also

[Section titled “See Also”](#see-also)

[`load_gcs`](/reference/operators/load_gcs)