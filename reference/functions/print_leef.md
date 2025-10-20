# print_leef

Prints records as LEEF messages

```tql
print_leef(attributes:record, vendor=str, product_name=str, product_version=str,
           event_class_id=str,
          [delimiter=str, null_value=str, flatten_separator=str]) -> str
```

## Description

[Section titled “Description”](#description)

Prints records as the attributes of a [LEEF](https://www.ibm.com/docs/en/dsm?topic=overview-leef-event-components) message.

### `attributes: record`

[Section titled “attributes: record”](#attributes-record)

The record to print as the attributes of a LEEF message

### `vendor = str`

[Section titled “vendor = str”](#vendor--str)

The vendor in the LEEF header.

### `product_name = str`

[Section titled “product\_name = str”](#product_name--str)

The product name in the LEEF header.

### `product_version = str`

[Section titled “product\_version = str”](#product_version--str)

The product version in the LEEF header.

### `event_class_id = str`

[Section titled “event\_class\_id = str”](#event_class_id--str)

The event (class) ID in the LEEF header.

### `delimiter = str (optional)`

[Section titled “delimiter = str (optional)”](#delimiter--str-optional)

This delimiter will be used to separate the key-value pairs in the attributes. It must be a single character. If the chosen delimiter is not `"\t"`, the message will be a LEEF:2.0 message, otherwise it will be LEEF:1.0.

Defaults to `"\t"`.

### `null_value = str (optional)`

[Section titled “null\_value = str (optional)”](#null_value--str-optional)

A string to use if any of the header values evaluate to null.

Defaults to an empty string.

### `flatten_separator = str (optional)`

[Section titled “flatten\_separator = str (optional)”](#flatten_separator--str-optional)

A string used to flatten nested records in `attributes`.

Defaults to `"."`.

## Examples

[Section titled “Examples”](#examples)

### Write a LEEF:1.0 message

[Section titled “Write a LEEF:1.0 message”](#write-a-leef10-message)

```tql
from {
  attributes: {
    a: 42, b: "Hello"
  }, event_class_id: "critical"
}
r = attributes.print_leef(
    vendor="Tenzir",
    product_name="Tenzir Node",
    product_version="5.5.0",
    event_class_id=event_class_id)
select r
write_lines
```

```txt
LEEF:1.0|Tenzir Node|5.5.0|critical|a=42  b=Hello
```

### Reformat a nested LEEF message

[Section titled “Reformat a nested LEEF message”](#reformat-a-nested-leef-message)

```tql
from "my.log" {
  read_syslog // produces the expected shape for `write_syslog`
}
message = message.parse_leef()
message = message.attributes.print_leef(
  vendor=message.vendor,
  product_name=message.product_name,
  product_version=message.product_version,
  event_class_id=message.event_class_id,
  delimiter="^"
)
write_syslog
```

## See Also

[Section titled “See Also”](#see-also)

[`parse_leef`](/reference/functions/parse_leef), [`read_leef`](/reference/operators/read_leef), [`read_syslog`](/reference/operators/read_syslog), [`write_syslog`](/reference/operators/write_syslog)