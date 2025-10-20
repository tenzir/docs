# fields

Retrieves all fields stored at a node.

```tql
fields
```

## Description

[Section titled “Description”](#description)

The `fields` operator shows a list of all fields stored at a node across all available schemas.

## Examples

[Section titled “Examples”](#examples)

### Get the top-5 most frequently used fields across schemas

[Section titled “Get the top-5 most frequently used fields across schemas”](#get-the-top-5-most-frequently-used-fields-across-schemas)

```tql
fields
summarize field, count=count_distinct(schema), schemas=distinct(schema)
sort -count
head 5
```