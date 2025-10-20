# save_sqs

Saves bytes to [Amazon SQS](https://docs.aws.amazon.com/sqs/) queues.

```tql
save_sqs queue:str, [poll_time=duration]
```

## Description

[Section titled “Description”](#description)

[Amazon Simple Queue Service (Amazon SQS)](https://docs.aws.amazon.com/sqs/) is a fully managed message queuing service to decouple and scale microservices, distributed systems, and serverless applications. The `save_sqs` operator writes bytes as messages into an SQS queue.

The `save_sqs` operator uses long polling, which helps reduce your cost of using SQS by reducing the number of empty responses when there are no messages available to return in reply to a message request. Use the `poll_time` option to adjust the timeout.

The operator requires the following AWS permissions:

* `sqs:GetQueueUrl`
* `sqs:SendMessage`

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

Write JSON messages from a source feed to the SQS queue `tenzir`:

```tql
subscribe "to-sqs"
write_json
save_sqs "tenzir"
```

## See Also

[Section titled “See Also”](#see-also)

[`load_sqs`](/reference/operators/load_sqs)