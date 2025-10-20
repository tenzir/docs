# Cloud Logging

[Google Cloud Logging](https://cloud.google.com/logging) is Google’s log management solution. Tenzir can send events to Google Cloud Logging.

![Google Cloud Logging](/pr-preview/pr-116/_astro/cloud-logging.CbMzNYg2_19DKCs.svg)

## Examples

[Section titled “Examples”](#examples)

### Send an event to Google Cloud Logging

[Section titled “Send an event to Google Cloud Logging”](#send-an-event-to-google-cloud-logging)

The easiest way to send data to Cloud Logging is via Google [Applciation Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials). Assuming you have configured your node so that it finds the credentials, you can pipe any data to the [`to_google_cloud_logging`](/reference/operators/to_google_cloud_logging) operator:

```tql
from {
  content: "log message",
  timestamp: now(),
}
to_google_cloud_logging name="projects/PROJECT_ID/logs/LOG_ID",
  resource_type="global"
```