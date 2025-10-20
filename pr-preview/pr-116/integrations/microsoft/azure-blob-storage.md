# Azure Blob Storage

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) is Azure’s object storage service. Tenzir can treat it like a local filesystem to read and write files.

![Azure Blob Storage](/pr-preview/pr-116/_astro/azure-blob-storage.Sc3L-GkA_19DKCs.svg)

URL Support

The URL scheme `abfs[s]://` dispatches to [`load_azure_blob_storage`](/reference/operators/load_azure_blob_storage) and [`save_azure_blob_storage`](/reference/operators/save_azure_blob_storage) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Write an event to a file in a container

[Section titled “Write an event to a file in a container”](#write-an-event-to-a-file-in-a-container)

```tql
from {foo: 42}
to "abfss://user@container/path/to/file.json"
```

### Read events from a file in a container

[Section titled “Read events from a file in a container”](#read-events-from-a-file-in-a-container)

```tql
from "abfss://user@container/path/to/file.json"
```

```tql
{foo: 42}
```