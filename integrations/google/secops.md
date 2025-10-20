# SecOps

[Google Security Operations (SecOps)](https://cloud.google.com/security/products/security-operations) is Google’s security operations platform that enables detection, investigation and response to incidents. Tenzir can send events to Google SecOps using the [unstructured logs ingestion API](https://cloud.google.com/chronicle/docs/reference/ingestion-api#unstructuredlogentries).

![Google Security Operations](/_astro/secops.DocXpfno_19DKCs.svg)

## Examples

[Section titled “Examples”](#examples)

### Send an event to Google SecOps

[Section titled “Send an event to Google SecOps”](#send-an-event-to-google-secops)

```tql
from {log: "31-Mar-2025 01:35:02.187 client 0.0.0.0#4238: query: tenzir.com IN A + (255.255.255.255)"}
to_google_secops \
  customer_id="00000000-0000-0000-00000000000000000",
  private_key=secret("my_secops_key"),
  client_email="somebody@example.com",
  log_text=log,
  log_type="BIND_DNS",
  region="europe"
```