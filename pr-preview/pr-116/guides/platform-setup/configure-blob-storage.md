# Configure blob storage

The **blob storage** service exists for exchanging files between the platform and nodes. It facilitates not only downloading data from nodes, but also uploading files from your browser to the platform.

For example, when you click the *Download* button in the Explorer, you see various formats in which you can download the data, such as JSON, CSV, Parquet, and more. Once you initiate the download, a pipeline writes the requested data into the platform’s blob storage. Similarly, when you drag files into the Explorer, you upload them to the blob storage for use as pipeline inputs by nodes.

The following variables control the blob storage service:

```sh
TENZIR_PLATFORM_DOWNLOADS_ENDPOINT=
TENZIR_PLATFORM_INTERNAL_BUCKET_NAME=
TENZIR_PLATFORM_INTERNAL_ACCESS_KEY_ID=
TENZIR_PLATFORM_INTERNAL_SECRET_ACCESS_KEY=
```

When you use S3 or another external blob storage, you must create the bucket and provide a valid access key with read and write permissions on the bucket.

When you use the bundled seaweed instance, you can set these values to arbitrary strings. The bundled Seaweed container automatically provides a bucket with the specified name and access key.