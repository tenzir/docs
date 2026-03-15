import type { Root } from "mdast";
import type { MdxjsEsm } from "mdast-util-mdx";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { toString as mdastToString } from "mdast-util-to-string";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Remark plugin for semantic cross-reference components such as Op and Fn.
 *
 * These components use slot content rather than props for the link target:
 *
 *   <Op>where</Op>
 *
 * This plugin does two things:
 *
 * 1. Extracts the slot content and exposes it as a data-href attribute so the
 *    starlight-links-validator can validate the target.
 * 2. Auto-imports the semantic components when they appear in MDX content so
 *    authors can use them inline without adding boilerplate imports.
 */

interface SemanticComponentSpec {
  hrefPrefix: string;
  importPath: string;
}

const semanticComponents = {
  Op: {
    hrefPrefix: "/reference/operators/",
    importPath: "@components/see-also/Op.astro",
  },
  Fn: {
    hrefPrefix: "/reference/functions/",
    importPath: "@components/see-also/Fn.astro",
  },
  Guide: {
    hrefPrefix: "/guides/",
    importPath: "@components/see-also/Guide.astro",
  },
  Tutorial: {
    hrefPrefix: "/tutorials/",
    importPath: "@components/see-also/Tutorial.astro",
  },
  Explanation: {
    hrefPrefix: "/explanations/",
    importPath: "@components/see-also/Explanation.astro",
  },
  Integration: {
    hrefPrefix: "/integrations/",
    importPath: "@components/see-also/Integration.astro",
  },
  Reference: {
    hrefPrefix: "/reference/",
    importPath: "@components/see-also/Reference.astro",
  },
} satisfies Record<string, SemanticComponentSpec>;

type SemanticComponentName = keyof typeof semanticComponents;

export const remarkSeeAlsoLinks: Plugin<[], Root> = () => (tree) => {
  const usedComponents = new Set<SemanticComponentName>();

  visit(
    tree,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: MdxJsxFlowElement | MdxJsxTextElement) => {
      if (!node.name) return;
      if (!isSemanticComponent(node.name)) return;

      usedComponents.add(node.name);

      const slug = mdastToString(node).trim();
      if (!slug) return;

      const target = normalizeSemanticTarget(node.name, slug);
      const path = target.replace(/::/g, "/");
      const href = `${semanticComponents[node.name].hrefPrefix}${path}`;

      node.attributes = node.attributes || [];
      const hasHrefAttribute = node.attributes.some(
        (attribute) =>
          attribute.type === "mdxJsxAttribute" &&
          attribute.name === "data-href",
      );
      if (hasHrefAttribute) return;

      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "data-href",
        value: href,
      });
    },
  );

  if (usedComponents.size === 0) return;

  const existingImports = collectSemanticImports(tree);
  const missingComponents = [...usedComponents].filter(
    (name) => !existingImports.has(name),
  );
  if (missingComponents.length === 0) return;

  const importNodes = createImportNodes(missingComponents);
  if (importNodes.length === 0) return;

  const insertIndex = tree.children.findIndex(
    (child) => child.type !== "mdxjsEsm",
  );
  const targetIndex = insertIndex === -1 ? tree.children.length : insertIndex;
  tree.children.splice(targetIndex, 0, ...importNodes);
};

const isSemanticComponent = (name: string): name is SemanticComponentName =>
  Object.hasOwn(semanticComponents, name);

const normalizeSemanticTarget = (
  componentName: SemanticComponentName,
  slug: string,
): string => {
  if (componentName === "Fn") {
    return slug.replace(/\(\)$/, "");
  }
  return slug;
};

const importPattern =
  /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["'];?/gm;

function collectSemanticImports(tree: Root): Set<SemanticComponentName> {
  const imports = new Set<SemanticComponentName>();

  for (const child of tree.children) {
    if (child.type !== "mdxjsEsm" || typeof child.value !== "string") continue;

    for (const match of child.value.matchAll(importPattern)) {
      const [, localName, source] = match;
      if (!isSemanticComponent(localName)) continue;
      if (source !== semanticComponents[localName].importPath) continue;
      imports.add(localName);
    }
  }

  return imports;
}

function createImportNodes(
  componentNames: SemanticComponentName[],
): MdxjsEsm[] {
  const source = componentNames
    .map(
      (componentName) =>
        `import ${componentName} from '${semanticComponents[componentName].importPath}';`,
    )
    .join("\n");
  const parsed = remark().use(remarkMdx).parse(source) as Root;

  return parsed.children.filter(
    (child): child is MdxjsEsm => child.type === "mdxjsEsm",
  );
}
