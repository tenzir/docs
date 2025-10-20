# Suricata

[Suricata](https://suricata.io/) is network monitor with a rule matching engine to detect threats. Use Tenzir to acquire, process, and store Suricata logs.

![Suricata](/pr-preview/pr-116/_astro/suricata.DtM9yz2q_19DKCs.svg)

## Examples

[Section titled “Examples”](#examples)

### Ingest EVE JSON logs into a node

[Section titled “Ingest EVE JSON logs into a node”](#ingest-eve-json-logs-into-a-node)

[EVE JSON](https://docs.suricata.io/en/latest/output/eve/eve-json-output.html) is the log format in which Suricata generates events.

A typical Suricata configuration looks like this:

suricata.yaml

```yaml
outputs:
  # Extensible Event Format (nicknamed EVE) event log in JSON format
  - eve-log:
      enabled: yes
      filetype: regular #regular|syslog|unix_dgram|unix_stream|redis
      filename: eve.json
```

The `filetype` setting determines how you’d process the log file and defaults to `regular`.

Onboard Suricata EVE JSON logs via the [`read_suricata`](/reference/operators/read_suricata) operator as follows:

```tql
load_file "/path/to/eve.json"
read_suricata
publish "suricata"
```

If your set `filetype` to `unix_stream`, you need to create a Unix domain socket first, e.g., like this:

```bash
nc -U -l /tmp/eve.socket
```

Then use the same pipeline as above; Tenzir automatically detects the file type.