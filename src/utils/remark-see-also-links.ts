import type { Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that extracts links from See Also components and exposes them
 * for validation by starlight-links-validator.
 *
 * The See Also components (Op, Fn, Guide, Tutorial, Explanation) use slot
 * content rather than props for the link target:
 *
 *   <Tutorial>analyze-zeek-logs</Tutorial>
 *
 * The starlight-links-validator can only validate component props, not slot
 * content. This plugin bridges the gap by extracting the slot content and
 * adding it as a data-href attribute that the validator can check.
 */

const seeAlsoComponents: Record<string, string> = {
  Op: "/reference/operators/",
  Fn: "/reference/functions/",
  Guide: "/guides/",
  Tutorial: "/tutorials/",
  Explanation: "/explanations/",
};

export const remarkSeeAlsoLinks: Plugin<[], Root> = () => (tree) => {
  visit(
    tree,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: MdxJsxFlowElement | MdxJsxTextElement) => {
      if (!node.name) return;
      const prefix = seeAlsoComponents[node.name];
      if (!prefix) return;

      // Extract text content from children (slot content)
      const slug = mdastToString(node).trim();
      if (!slug) return;

      // Transform :: to / for namespaced items (e.g., context::enrich)
      const path = slug.replace(/::/g, "/");
      const href = `${prefix}${path}`;

      // Add data-href attribute for the link validator
      node.attributes = node.attributes || [];
      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "data-href",
        value: href,
      });
    },
  );
};
