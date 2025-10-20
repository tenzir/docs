# from_file

Reads one or multiple files from a filesystem.

```tql
from_file url:string, [watch=bool, remove=bool, rename=string->string, path_field=field] { … }
```

## Description

[Section titled “Description”](#description)

The `from_file` operator reads files from local filesystems or cloud storage, with support for glob patterns, automatic format detection, and file monitoring.

### `url: string`

[Section titled “url: string”](#url-string)

URL or local filesystem path where data should be read from.

The characters `*` and `**` have a special meaning. `*` matches everything except `/`. `**` matches everything including `/`. The sequence `/**/` can also match nothing. For example, `foo/**/bar` matches `foo/bar`.

The URL can include additional options. For `s3://`, the options that can be included in the URI as query parameters are `region`, `scheme`, `endpoint_override`, `allow_bucket_creation`, and `allow_bucket_deletion`. For `gs://`, the supported parameters are `scheme`, `endpoint_override`, and `retry_limit_seconds`.

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

Pipeline to use for parsing the file. By default, this pipeline is derived from the path of the file, and will not only handle parsing but also decompression if applicable. This is using the same logic as [`from`](/reference/operators/from).

## Examples

[Section titled “Examples”](#examples)

### Read every `.csv` file from S3

[Section titled “Read every .csv file from S3”](#read-every-csv-file-from-s3)

```tql
from_file "s3://my-bucket/**.csv"
```

### Read every `.json` file in `/data` as Suricata EVE JSON

[Section titled “Read every .json file in /data as Suricata EVE JSON”](#read-every-json-file-in-data-as-suricata-eve-json)

```tql
from_file "/data/**.json" {
  read_suricata
}
```

### Read all files from S3 continuously and delete them afterwards

[Section titled “Read all files from S3 continuously and delete them afterwards”](#read-all-files-from-s3-continuously-and-delete-them-afterwards)

```tql
from_file "s3://my-bucket/**", watch=true, remove=true
```

### Move files to a directory, preserving filenames

[Section titled “Move files to a directory, preserving filenames”](#move-files-to-a-directory-preserving-filenames)

```tql
// The trailing slash automatically appends the original filename
from_file "/input/*.json", rename=path => "/output/"
```

## See Also

[Section titled “See Also”](#see-also)

[`from`](/reference/operators/from), [`load_file`](/reference/operators/load_file)