import { strict as assert } from "node:assert";
import { extractDescription } from "../src/plugins/starlight-llms-txt/excerpt-utils";

const fluentBitMarkdown =
  "[Fluent Bit](https://fluentbit.io) is a an open source observability pipeline. Tenzir embeds Fluent Bit, exposing all its [inputs](https://docs.fluentbit.io/manual/pipeline/inputs) via [`from_fluent_bit`](/reference/operators/from_fluent_bit.md) and [outputs](https://docs.fluentbit.io/manual/pipeline/outputs) via [`to_fluent_bit`](/reference/operators/to_fluent_bit.md)\n\nThis makes Tenzir effectively a superset of Fluent Bit.";

assert.equal(
  extractDescription(fluentBitMarkdown),
  "Fluent Bit is a an open source observability pipeline. Tenzir embeds Fluent Bit, exposing all its inputs via `from_fluent_bit` and outputs via `to_fluent_bit`",
);

const inlineCodeMarkdown =
  "This page explains how `context::enrich` works with **`chart_area`** in excerpt text.\n\n## Details";

assert.equal(
  extractDescription(inlineCodeMarkdown),
  "This page explains how `context::enrich` works with `chart_area` in excerpt text.",
);
