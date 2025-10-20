# from_velociraptor

Submits VQL to a Velociraptor server and returns the response as events.

```tql
from_velociraptor [request_name=string, org_id=string, max_rows=int,
                   subscribe=string, query=string, max_wait=duration, profile=string]
```

## Description

[Section titled “Description”](#description)

The `from_velociraptor` input operator provides a request-response interface to a [Velociraptor](https://docs.velociraptor.app) server:

![Velociraptor](/_astro/velociraptor.excalidraw.DqyMhvp8_19DKCs.svg)

The pipeline operator is the client and it establishes a connection to a Velociraptor server. The client request contains a query written in the [Velociraptor Query Language (VQL)](https://docs.velociraptor.app/docs/vql), a SQL-inspired language with a `SELECT .. FROM .. WHERE` structure.

You can either send a raw VQL query via `from_velociraptor query "<vql>"` to a server and processs the response, or hook into a continuous feed of artifacts via `from_velociraptor subscribe <artifact>`. Whenever a hunt runs that contains this artifact, the server will forward it to the pipeline and emit the artifact payload in the response field `HuntResults`.

All Velociraptor client-to-server communication is mutually authenticated and encrypted via TLS certificates. This means you must provide client-side certificate, which you can generate as follows. (Velociraptor ships as a static binary that we refer to as `velociraptor-binary` here.)

1. Create a server configuration `server.yaml`:

   ```bash
   velociraptor-binary config generate > server.yaml
   ```

2. Create an API client:

   ```bash
   velociraptor-binary -c server.yaml config api_client name tenzir client.yaml
   ```

   Copy the generated `client.yaml` to your Tenzir plugin configuration directory as `velociraptor.yaml` so that the operator can find it:

   ```bash
   cp client.yaml /etc/tenzir/plugin/velociraptor.yaml
   ```

3. Run the frontend with the server configuration:

   ```bash
   velociraptor-binary -c server.yaml frontend
   ```

Now you are ready to run VQL queries!

### `request_name = string (optional)`

[Section titled “request\_name = string (optional)”](#request_name--string-optional)

An identifier for the request to the Velociraptor server.

Defaults to a randoum UUID.

### `org_id = string (optional)`

[Section titled “org\_id = string (optional)”](#org_id--string-optional)

The ID of the Velociraptor organization.

Defaults to `"root"`.

### `query = string (optional)`

[Section titled “query = string (optional)”](#query--string-optional)

The [VQL](https://docs.velociraptor.app/docs/vql) query string.

### `max_rows = int (optional)`

[Section titled “max\_rows = int (optional)”](#max_rows--int-optional)

The maxium number of rows to return in a the stream gRPC messages returned by the server.

Defaults to `1000`.

### `subscribe = string (optional)`

[Section titled “subscribe = string (optional)”](#subscribe--string-optional)

Subscribes to a flow artifact.

This option generates a larger VQL expression under the hood that creates one event per flow and artifact. The response contains a field `HuntResult` that contains the result of the hunt.

### `max_wait = duration (optional)`

[Section titled “max\_wait = duration (optional)”](#max_wait--duration-optional)

Controls how long to wait before releasing a partial result set.

Defaults to `1s`.

### `profile = string (optional)`

[Section titled “profile = string (optional)”](#profile--string-optional)

Specifies the configuration profile for the Velociraptor instance. This enables connecting to multiple Velociraptor instances from the same Tenzir node.

To use profiles, edit your `velociraptor.yaml` configuration like this, where `<config>` refers to the contents of the configuration file created by Velociraptor, and `<profile>` to the desired profile name.

```yaml
---
title: before
---


<config>


---
title: after
---


profiles:
  <profile>:
    <config>
```

If profiles are defined, the operator defaults to the first profile.

## Examples

[Section titled “Examples”](#examples)

### Show all processes

[Section titled “Show all processes”](#show-all-processes)

```tql
from_velociraptor query="select * from pslist()"
```

### Subscribe to a hunt flow containing the `Windows` artifact

[Section titled “Subscribe to a hunt flow containing the Windows artifact”](#subscribe-to-a-hunt-flow-containing-the-windows-artifact)

```tql
from_velociraptor subscribe="Windows"
```