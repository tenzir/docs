# Cloud Storage

[Cloud Storage](https://cloud.google.com/storage) is Google’s object storage service. Tenzir can treat it like a local filesystem to read and write files.

![Google Cloud Storage](/pr-preview/pr-116/_astro/cloud-storage.IUao_ukw_19DKCs.svg)

URL Support

The URL scheme `gs://` dispatches to [`load_gcs`](/reference/operators/load_gcs) and [`save_gcs`](/reference/operators/save_gcs) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Configuration

[Section titled “Configuration”](#configuration)

You need to configure appropriate credentials using Google’s [Application Default Credentials](https://google.aip.dev/auth/4110).

## Examples

[Section titled “Examples”](#examples)

### Write an event to a file in a bucket

[Section titled “Write an event to a file in a bucket”](#write-an-event-to-a-file-in-a-bucket)

```tql
from {foo: 42}
to "gs://bucket/path/to/file.json"
```

### Read events from a file in a bucket

[Section titled “Read events from a file in a bucket”](#read-events-from-a-file-in-a-bucket)

```tql
from "gs://bucket/path/to/file.json"
```

```tql
{foo: 42}
```