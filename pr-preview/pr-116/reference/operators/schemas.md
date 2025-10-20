# schemas

Retrieves all schemas for events stored at a node.

```tql
schemas
```

## Description

[Section titled “Description”](#description)

The `schemas` operator shows all schemas of all events stored at a node.

Note that there may be multiple schema definitions with the same name, but a different set of fields, e.g., because the imported data’s schema changed over time.

## Examples

[Section titled “Examples”](#examples)

### See all available definitions for a given schema

[Section titled “See all available definitions for a given schema”](#see-all-available-definitions-for-a-given-schema)

```tql
schemas
where name == "suricata.alert"
```