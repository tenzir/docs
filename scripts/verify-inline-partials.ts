import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toString as mdastToString } from "mdast-util-to-string";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { remarkInlinePartials } from "../src/utils/remark-inline-partials";
import { remarkSeeAlsoLinks } from "../src/utils/remark-see-also-links";

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
    join(partialsDir, "RetainedReference.mdx"),
    "### `retained = component`",
  );
  writeFileSync(
    join(partialsDir, "SpreadRetainedReference.mdx"),
    "### `spread-retained = component`",
  );
  const semanticLinkPartial = "- <Op>{props.Operator}</Op>";
  const semanticLinkPartialPath = join(partialsDir, "WithSemanticLink.mdx");
  writeFileSync(semanticLinkPartialPath, semanticLinkPartial);
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
    'import RetainedReference from "@partials/RetainedReference.mdx";',
    'import SpreadRetainedReference from "@partials/SpreadRetainedReference.mdx";',
    'import WithSemanticLink from "@partials/WithSemanticLink.mdx";',
    "",
    "# Doc",
    "",
    "<Child />",
    "",
    "<UsesComponent />",
    "",
    '<Wrapper Name="Gadget" />',
    "",
    "<RetainedReference />",
    "",
    "<Slot content={RetainedReference} />",
    "",
    "<SpreadRetainedReference />",
    "",
    "<Slot {...{content: SpreadRetainedReference}} />",
    "",
    '<WithSemanticLink Operator="where" />',
  ].join("\n");

  const processor = remark()
    .use(remarkMdx)
    .use(remarkInlinePartials, { partialsDir })
    .use(remarkSeeAlsoLinks);
  const file = new VFile({ path: docPath, value: docContent });
  const tree = processor.parse(file);
  const transformed = processor.runSync(tree, file);

  const headingTexts: string[] = [];
  visit(transformed, "heading", (node) => {
    headingTexts.push(mdastToString(node));
  });

  assert(headingTexts.includes("base = string"));
  assert(headingTexts.includes("child = number"));
  assert(headingTexts.includes("with svg"));
  assert(headingTexts.includes("Gadget"));
  assert(headingTexts.includes("retained = component"));
  assert(headingTexts.includes("spread-retained = component"));
  assert(!headingTexts.includes('"Gadget"'));

  const jsxNames: string[] = [];
  visit(transformed, "mdxJsxFlowElement", (node: { name?: string }) => {
    if (node.name) jsxNames.push(node.name);
  });

  assert(!jsxNames.includes("Child"));
  assert(!jsxNames.includes("UsesComponent"));
  assert(!jsxNames.includes("Wrapper"));
  assert(!jsxNames.includes("WithProps"));
  assert(!jsxNames.includes("RetainedReference"));
  assert(!jsxNames.includes("SpreadRetainedReference"));

  const importValues: string[] = [];
  visit(transformed, "mdxjsEsm", (node: { value?: string }) => {
    if (typeof node.value === "string") importValues.push(node.value);
  });

  assert(
    importValues.some((value) => value.includes("@components/InlineSVG.astro")),
  );
  assert(
    importValues.some((value) =>
      value.includes(
        'RetainedReference from "@partials/RetainedReference.mdx"',
      ),
    ),
  );
  assert(
    importValues.some((value) =>
      value.includes(
        'SpreadRetainedReference from "@partials/SpreadRetainedReference.mdx"',
      ),
    ),
  );

  const expressionValues: string[] = [];
  visit(transformed, ["mdxTextExpression", "mdxFlowExpression"], (node) => {
    const exprNode = node as { value?: string };
    if (typeof exprNode.value === "string") {
      expressionValues.push(exprNode.value);
    }
  });

  assert(expressionValues.every((value) => !value.includes("props.")));
  assert(!expressionValues.includes('"where"'));

  const dataHrefs: string[] = [];
  visit(
    transformed,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: {
      attributes?: Array<{ name?: string; value?: string }>;
      name?: string;
    }) => {
      if (node.name !== "Op") return;

      const dataHref = node.attributes?.find(
        (attribute) => attribute.name === "data-href",
      );
      if (typeof dataHref?.value === "string") {
        dataHrefs.push(dataHref.value);
      }
    },
  );

  assert(dataHrefs.includes("/reference/operators/where"));
  assert(dataHrefs.every((href) => !href.includes('"')));
} finally {
  rmSync(rootDir, { recursive: true, force: true });
}
