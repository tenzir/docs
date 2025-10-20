# FTP

Tenzir supports the [File Transfer Protocol (FTP)](https://en.wikipedia.org/wiki/File_Transfer_Protocol), both downloading and uploading files.

![FTP](/_astro/ftp.zkl0U-rL_19DKCs.svg)

FTP consists of two separate TCP connections, one control and one data connection. This can be tricky for some firewalls and may require special attention.

URL Support

The URL schemes `ftp://` and `ftps://` dispatch to [`load_ftp`](/reference/operators/load_ftp) and [`save_ftp`](/reference/operators/save_ftp) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Download a file from an FTP server

[Section titled “Download a file from an FTP server”](#download-a-file-from-an-ftp-server)

```tql
from "ftp://user:pass@ftp.example.org/path/to/file.json"
```

### Upload events to an FTP server

[Section titled “Upload events to an FTP server”](#upload-events-to-an-ftp-server)

```tql
from {
  x: 42,
  y: "foo",
}
to "ftp://user:pass@ftp.example.org/a/b/c/events.json.gz"
```