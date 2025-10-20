# load_sqs

Loads bytes from [Amazon SQS](https://docs.aws.amazon.com/sqs/) queues.

```tql
load_sqs queue:str, [poll_time=duration]
```

## Description

[Section titled “Description”](#description)

[Amazon Simple Queue Service (Amazon SQS)](https://docs.aws.amazon.com/sqs/) is a fully managed message queuing service to decouple and scale microservices, distributed systems, and serverless applications. The `load_sqs` operator reads bytes from messages of an SQS queue.

The `load_sqs` operator uses long polling, which helps reduce your cost of using SQS by reducing the number of empty responses when there are no messages available to return in reply to a message request. Use the `poll_time` option to adjust the timeout.

The operator requires the following AWS permissions:

* `sqs:GetQueueUrl`
* `sqs:ReceiveMessage`
* `sqs:DeleteMessage`

### `queue: str`

[Section titled “queue: str”](#queue-str)

The name of the queue to use.

### `poll_time = duration (optional)`

[Section titled “poll\_time = duration (optional)”](#poll_time--duration-optional)

The long polling timeout per request.

The value must be between 1 and 20 seconds.

Defaults to `3s`.

## Examples

[Section titled “Examples”](#examples)

Read JSON messages from the SQS queue `tenzir`:

```tql
load_sqs "tenzir"
```

Read JSON messages with a 20-second long poll timeout:

```tql
load_sqs "tenzir", poll_time=20s
```

## See Also

[Section titled “See Also”](#see-also)

[`save_sqs`](/reference/operators/save_sqs)