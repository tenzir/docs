# write_pcap

Transforms event stream to PCAP byte stream.

```tql
write_pcap
```

## Description

[Section titled “Description”](#description)

Transforms event stream to [PCAP](https://datatracker.ietf.org/doc/id/draft-gharris-opsawg-pcap-00.html) byte stream.

The structured representation of packets has the `pcap.packet` schema:

```yaml
pcap.packet:
  record:
    - linktype: uint64
    - time:
        timestamp: time
    - captured_packet_length: uint64
    - original_packet_length: uint64
    - data: string
```

PCAPNG

The current implementation does *not* support [PCAPNG](https://www.ietf.org/archive/id/draft-tuexen-opsawg-pcapng-05.html).

## Examples

[Section titled “Examples”](#examples)

### Write packet events as a PCAP file

[Section titled “Write packet events as a PCAP file”](#write-packet-events-as-a-pcap-file)

```tql
subscribe "packets"
write_pcap
save_file "/logs/packets.pcap"
```

## See Also

[Section titled “See Also”](#see-also)

[`load_nic`](/reference/operators/load_nic), [`read_pcap`](/reference/operators/read_pcap)