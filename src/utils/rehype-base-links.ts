import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface RehypeBaseLinksOptions {
  base?: string;
}

/**
 * Rehype plugin that prepends the base path to internal links.
 *
 * Transforms: /path -> /base/path
 * Skips: external links, anchor links, protocol links, relative paths
 */
export const rehypeBaseLinks: Plugin<[RehypeBaseLinksOptions?], Root> = (
  options = {},
) => {
  const base = (options.base || "").replace(/\/$/, "");

  if (!base) {
    return () => {};
  }

  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (typeof href !== "string" || !href) return;

      // Skip: anchors, external, protocol, relative, already prefixed
      if (
        href.startsWith("#") ||
        href.startsWith("//") ||
        /^[a-z][a-z0-9+.-]*:/i.test(href) ||
        !href.startsWith("/") ||
        href.startsWith(`${base}/`) ||
        href === base
      ) {
        return;
      }

      node.properties.href = base + href;
    });
  };
};

export default rehypeBaseLinks;
