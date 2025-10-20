# from_s3

Reads one or multiple files from Amazon S3.

```tql
from_s3 url:string, [anonymous=bool, access_key=string, secret_key=string,
  session_token=string, role=string, external_id=string, watch=bool,
  remove=bool, rename=string->string, path_field=field] { … }
```

## Description

[Section titled “Description”](#description)

The `from_s3` operator reads files from Amazon S3, with support for glob patterns, automatic format detection, and file monitoring.

By default, authentication is handled by AWS’s default credentials provider chain, which may read from multiple environment variables and credential files:

* `~/.aws/credentials` and `~/.aws/config`
* `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
* `AWS_SESSION_TOKEN`
* EC2 instance metadata service
* ECS container credentials

### `url: string`

[Section titled “url: string”](#url-string)

URL identifying the S3 location where data should be read from.

The characters `*` and `**` have a special meaning. `*` matches everything except `/`. `**` matches everything including `/`. The sequence `/**/` can also match nothing. For example, `bucket/**/data` matches `bucket/data`.

Supported URI format: `s3://[<access-key>:<secret-key>@]<bucket-name>/<full-path-to-object>(?<options>)`

Options can be appended to the path as query parameters:

* `region`: AWS region (e.g., `us-east-1`)
* `scheme`: Connection scheme (`http` or `https`)
* `endpoint_override`: Custom S3-compatible endpoint
* `allow_bucket_creation`: Allow creating buckets if they don’t exist
* `allow_bucket_deletion`: Allow deleting buckets

### `anonymous = bool (optional)`

[Section titled “anonymous = bool (optional)”](#anonymous--bool-optional)

Use anonymous credentials instead of any configured authentication.

Defaults to `false`.

### `access_key = string (optional)`

[Section titled “access\_key = string (optional)”](#access_key--string-optional)

AWS access key ID for authentication.

### `secret_key = string (optional)`

[Section titled “secret\_key = string (optional)”](#secret_key--string-optional)

AWS secret access key for authentication. Required if `access_key` is provided.

### `session_token = string (optional)`

[Section titled “session\_token = string (optional)”](#session_token--string-optional)

AWS session token for temporary credentials.

### `role = string (optional)`

[Section titled “role = string (optional)”](#role--string-optional)

IAM role to assume when accessing S3.

### `external_id = string (optional)`

[Section titled “external\_id = string (optional)”](#external_id--string-optional)

External ID to use when assuming the specified `role`.

### `watch = bool (optional)`

[Section titled “watch = bool (optional)”](#watch--bool-optional)

In addition to processing all existing files, this option keeps the operator running, watching for new files that also match the given URL. Currently, this scans the filesystem up to every 10s.

Defaults to `false`.

### `remove = bool (optional)`

[Section titled “remove = bool (optional)”](#remove--bool-optional)

Deletes files after they have been read completely.

Defaults to `false`.

### `rename = string -> string (optional)`

[Section titled “rename = string -> string (optional)”](#rename--string---string-optional)

Renames files after they have been read completely. The lambda function receives the original path as an argument and must return the new path.

If the target path already exists, the operator will overwrite the file.

The operator automatically creates any intermediate directories required for the target path. If the target path ends with a trailing slash (`/`), the original filename will be automatically appended to create the final path.

### `path_field = field (optional)`

[Section titled “path\_field = field (optional)”](#path_field--field-optional)

This makes the operator insert the path to the file where an event originated from before emitting it.

By default, paths will not be inserted into the outgoing events.

### `{ … } (optional)`

[Section titled “{ … } (optional)”](#---optional)

Pipeline to use for parsing the file. By default, this pipeline is derived from the path of the file, and will not only handle parsing but also decompression if applicable.

## Examples

[Section titled “Examples”](#examples)

### Read every JSON file from a bucket

[Section titled “Read every JSON file from a bucket”](#read-every-json-file-from-a-bucket)

```tql
from_s3 "s3://my-bucket/data/**.json"
```

### Read CSV files using explicit credentials

[Section titled “Read CSV files using explicit credentials”](#read-csv-files-using-explicit-credentials)

```tql
from_s3 "s3://my-bucket/data.csv",
  access_key=secret("AWS_ACCESS_KEY"),
  secret_key=secret("AWS_SECRET_KEY")
```

### Read from S3-compatible service with custom endpoint

[Section titled “Read from S3-compatible service with custom endpoint”](#read-from-s3-compatible-service-with-custom-endpoint)

```tql
from_s3 "s3://my-bucket/data/**.json?endpoint_override=minio.example.com:9000&scheme=http"
```

### Read files continuously and assume IAM role

[Section titled “Read files continuously and assume IAM role”](#read-files-continuously-and-assume-iam-role)

```tql
from_s3 "s3://logs/application/**.json", watch=true, role="arn:aws:iam::123456789012:role/LogReaderRole"
```

### Process files and move them to an archive bucket

[Section titled “Process files and move them to an archive bucket”](#process-files-and-move-them-to-an-archive-bucket)

```tql
from_s3 "s3://input-bucket/**.json",
  rename=(path => "archive/" + path)
```

### Add source path to events

[Section titled “Add source path to events”](#add-source-path-to-events)

```tql
from_s3 "s3://data-bucket/**.json", path_field=source_file
```

### Read Zeek logs with anonymous access

[Section titled “Read Zeek logs with anonymous access”](#read-zeek-logs-with-anonymous-access)

```tql
from_s3 "s3://public-bucket/zeek/**.log", anonymous=true {
  read_zeek_tsv
}
```

## See Also

[Section titled “See Also”](#see-also)

[`from_file`](/reference/operators/from_file), [`load_s3`](/reference/operators/load_s3), [`save_s3`](/reference/operators/save_s3)