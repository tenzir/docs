import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const HEADING_WEIGHTS: Record<string, number> = {
  h2: 5,
  h3: 3,
  h4: 2,
};

/**
 * Rehype plugin that adds data-pagefind-weight to markdown headings so that
 * keyword matches in headings rank above plain body text in Pagefind search.
 *
 * Weight hierarchy (body text defaults to 1):
 *   h2 → 5, h3 → 3, h4 → 2
 *
 * The h1 (page title) is handled separately in PageTitle.astro.
 */
export const rehypeHeadingWeights: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      const weight = HEADING_WEIGHTS[node.tagName];
      if (weight !== undefined) {
        node.properties["data-pagefind-weight"] = weight;
      }
    });
  };
};

export default rehypeHeadingWeights;
