# load_balance

Routes the data to one of multiple subpipelines.

```tql
load_balance over:list { … }
```

## Description

[Section titled “Description”](#description)

The `load_balance` operator spawns a nested pipeline for each element in the given list. Incoming events are distributed to exactly one of the nested pipelines. This operator may reorder the event stream.

### `over: list`

[Section titled “over: list”](#over-list)

This must be a `$`-variable, previously declared with `let`. For example, to load balance over a list of ports, use `let $cfg = [8080, 8081, 8082]` followed by `load_balance $cfg { … }`.

### `{ … }`

[Section titled “{ … }”](#-)

The nested pipeline to spawn. This pipeline can use the same variable as passed to `over`, which will be resolved to one of the list items. The following example spawns three nested pipelines, where `$port` is bound to `8080`, `8081` and `8082`, respectively.

```tql
let $cfg = [8080, 8081, 8082]
load_balance $cfg {
  let $port = $cfg
  // … continue here
}
```

The given subpipeline must end with a sink. This limitation might be removed in future versions.

## Examples

[Section titled “Examples”](#examples)

### Route data to multiple TCP ports

[Section titled “Route data to multiple TCP ports”](#route-data-to-multiple-tcp-ports)

```tql
let $cfg = ["192.168.0.30:8080", "192.168.0.30:8081"]


subscribe "input"
load_balance $cfg {
  write_json
  save_tcp $cfg
}
```

### Route data to multiple Splunk endpoints

[Section titled “Route data to multiple Splunk endpoints”](#route-data-to-multiple-splunk-endpoints)

```tql
let $cfg = [{
  ip: 192.168.0.30,
  token: "example-token-1234",
}, {
  ip: 192.168.0.31,
  token: "example-token-5678",
}]


subscribe "input"
load_balance $cfg {
  let $endpoint = string($cfg.ip) + ":8080"
  to_splunk $endpoint, hec_token=$cfg.token
}
```