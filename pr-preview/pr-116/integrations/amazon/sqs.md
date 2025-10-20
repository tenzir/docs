# SQS

[Amazon Simple Queuing Service (SQS)](https://aws.amazon.com/sqs/) is a managed message queue for microservices, distributed systems, and serverless applications.

Tenzir can interact with SQS by sending messages to and reading messages from SQS queues.

![SQS](/pr-preview/pr-116/_astro/sqs.CmbjyY_r_19DKCs.svg)

When reading from SQS queues, you cannot specify individual messages. Instead, you determine the maximum number of messages you wish to retrieve, up to a limit of 10.

If the parameter `poll_interval` is non-zero, the pipeline automatically performs [long polling](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html). This means that you may receive messages in bursts, according to your specified poll interval.

Tenzir pipelines that read from an SQS queue automatically send a deletion request after having received the messages.

URL Support

The URL scheme `sqs://` dispatches to [`load_sqs`](/reference/operators/load_sqs) and [`save_sqs`](/reference/operators/save_sqs) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Configuration

[Section titled “Configuration”](#configuration)

Follow the [standard configuration instructions](/integrations/amazon) to authenticate with your AWS credentials.

## Examples

[Section titled “Examples”](#examples)

### Send a message to an SQS queue

[Section titled “Send a message to an SQS queue”](#send-a-message-to-an-sqs-queue)

```tql
from {foo: 42}
to "sqs://my-queue" {
  write_json
}
```

### Receive messages from an SQS queue

[Section titled “Receive messages from an SQS queue”](#receive-messages-from-an-sqs-queue)

```tql
from "sqs://my-queue", poll_interval=5s {
  read_json
}
```

```tql
{foo: 42}
```