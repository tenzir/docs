import { strict as assert } from "node:assert";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toString } from "mdast-util-to-string";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { remarkInlinePartials } from "../src/utils/remark-inline-partials";

// This script verifies that inline partials expand headings, hoist imports,
// and substitute props so the TOC uses the final heading text. Run it after
// changes to the partials pipeline or when headings in partials stop appearing.

const rootDir = mkdtempSync(join(tmpdir(), "inline-partials-"));
const partialsDir = join(rootDir, "partials");

try {
  mkdirSync(partialsDir, { recursive: true });

  writeFileSync(
    join(partialsDir, "Base.mdx"),
    "### `base = string`\n\nBase content.",
  );
  writeFileSync(
    join(partialsDir, "Child.mdx"),
    [
      'import Base from "./Base.mdx";',
      "",
      "<Base />",
      "",
      "### `child = number`",
    ].join("\n"),
  );
  writeFileSync(
    join(partialsDir, "UsesComponent.mdx"),
    [
      'import InlineSVG from "@components/InlineSVG.astro";',
      "",
      "<InlineSVG />",
      "",
      "### `with svg`",
    ].join("\n"),
  );
  writeFileSync(
    join(partialsDir, "WithProps.mdx"),
    ["### {props.Name}"].join("\n"),
  );
  writeFileSync(
    join(partialsDir, "Wrapper.mdx"),
    [
      'import WithProps from "./WithProps.mdx";',
      "",
      "<WithProps Name={props.Name} />",
    ].join("\n"),
  );

  const docPath = join(rootDir, "doc.mdx");
  const docContent = [
    'import Child from "@partials/Child.mdx";',
    'import UsesComponent from "@partials/UsesComponent.mdx";',
    'import Wrapper from "@partials/Wrapper.mdx";',
    "",
    "# Doc",
    "",
    "<Child />",
    "",
    "<UsesComponent />",
    "",
    '<Wrapper Name="Gadget" />',
  ].join("\n");

  const processor = remark()
    .use(remarkMdx)
    .use(remarkInlinePartials, { partialsDir });
  const file = new VFile({ path: docPath, value: docContent });
  const tree = processor.parse(file);
  const transformed = processor.runSync(tree, file);

  const headingTexts: string[] = [];
  visit(transformed, "heading", (node) => {
    headingTexts.push(toString(node));
  });

  assert(headingTexts.includes("base = string"));
  assert(headingTexts.includes("child = number"));
  assert(headingTexts.includes("with svg"));
  assert(headingTexts.includes("Gadget"));
  assert(!headingTexts.includes('"Gadget"'));

  const jsxNames: string[] = [];
  visit(transformed, "mdxJsxFlowElement", (node: { name?: string }) => {
    if (node.name) jsxNames.push(node.name);
  });

  assert(!jsxNames.includes("Child"));
  assert(!jsxNames.includes("UsesComponent"));
  assert(!jsxNames.includes("Wrapper"));
  assert(!jsxNames.includes("WithProps"));

  const importValues: string[] = [];
  visit(transformed, "mdxjsEsm", (node: { value?: string }) => {
    if (typeof node.value === "string") importValues.push(node.value);
  });

  assert(
    importValues.some((value) => value.includes("@components/InlineSVG.astro")),
  );

  const expressionValues: string[] = [];
  visit(transformed, ["mdxTextExpression", "mdxFlowExpression"], (node) => {
    const exprNode = node as { value?: string };
    if (typeof exprNode.value === "string") {
      expressionValues.push(exprNode.value);
    }
  });

  assert(expressionValues.every((value) => !value.includes("props.")));
} finally {
  rmSync(rootDir, { recursive: true, force: true });
}
