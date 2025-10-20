# plugins

Shows all available plugins and built-ins.

```tql
plugins
```

## Description

[Section titled “Description”](#description)

The `plugins` operator shows all available plugins and built-ins.

Tenzir is built on a modular monolith architecture. Most features are available as plugins and extensible by developers. Tenzir comes with a set of built-ins and bundled plugins. The former use the plugin API but are available as part of the core library, and the latter are plugins shipped with Tenzir.

## Schemas

[Section titled “Schemas”](#schemas)

Tenzir emits plugin information with the following schema.

### `tenzir.plugin`

[Section titled “tenzir.plugin”](#tenzirplugin)

Contains detailed information about the available plugins.

| Field          | Type           | Description                                                                                 |
| :------------- | :------------- | :------------------------------------------------------------------------------------------ |
| `name`         | `string`       | The unique, case-insensitive name of the plugin.                                            |
| `version`      | `string`       | The version identifier of the plugin, or `bundled` if the plugin has no version of its own. |
| `kind`         | `string`       | The kind of plugin. One of `builtin`, `static`, or `dynamic`.                               |
| `types`        | `list<string>` | The interfaces implemented by the plugin, e.g., `operator` or `function`.                   |
| `dependencies` | `list<string>` | Plugins that must be loaded for this plugin to function.                                    |

## Examples

[Section titled “Examples”](#examples)

### Show all currently available functions

[Section titled “Show all currently available functions”](#show-all-currently-available-functions)

```tql
plugins
where "function" in types
summarize functions=collect(name)
```