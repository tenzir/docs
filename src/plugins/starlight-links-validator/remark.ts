import "mdast-util-mdx-jsx";

import nodePath from "node:path";
import { fileURLToPath } from "node:url";

import GitHubSlugger, { slug } from "github-slugger";
import type { Nodes } from "hast";
import { fromHtml } from "hast-util-from-html";
import { hasProperty } from "hast-util-has-property";
import isAbsoluteUrl from "is-absolute-url";
import type { Root } from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from "mdast-util-mdx-jsx";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { DataMap } from "vfile";
import { ensureTrailingSlash, stripLeadingSlash } from "./path";
import type {
  StarlightLinksValidatorOptions,
  StarlightLinksValidatorRemarkConfig,
  ValidationErrorType,
} from "./types";

const builtInComponents: StarlightLinksValidatorOptions["components"] = [
  ["LinkButton", "href"],
  ["LinkCard", "href"],
];

const data: ValidationData = new Map();

export const remarkStarlightLinksValidator: Plugin<
  [StarlightLinksValidatorRemarkConfig],
  Root
> = (config) => {
  const { base, options, srcDir } = config;

  const linkComponents: Record<string, string> = Object.fromEntries(
    [...builtInComponents, ...options.components].map(([name, attribute]) => [
      name,
      attribute,
    ]),
  );

  return (tree, file) => {
    if (!file.path) {
      return;
    }

    if (file.data.astro?.frontmatter?.draft) {
      return;
    }

    const path = file.history[0];
    if (!path) {
      throw new Error("Missing file path to validate links.");
    }

    const slugger = new GitHubSlugger();
    const id = normalizeId(base, srcDir, path);
    const pageSlug =
      typeof file.data.astro?.frontmatter?.slug === "string"
        ? file.data.astro.frontmatter.slug
        : undefined;

    const fileHeadings: string[] = ["_top"];
    const fileLinks: Link[] = [];
    const fileDefinitions = new Map<string, string>();

    extractFrontmatterLinks(file.data.astro?.frontmatter, fileLinks, config);

    visit(tree, "definition", (node) => {
      fileDefinitions.set(node.identifier, node.url);
    });

    visit(
      tree,
      [
        "heading",
        "html",
        "link",
        "linkReference",
        "mdxJsxFlowElement",
        "mdxJsxTextElement",
      ],
      (node) => {
        switch (node.type) {
          case "heading": {
            if (node.data?.hProperties?.id) {
              fileHeadings.push(String(node.data.hProperties.id));
              break;
            }

            const content = mdastToString(node);
            if (content.length === 0) {
              break;
            }

            fileHeadings.push(slugger.slug(content).replace(/-$/, ""));
            break;
          }

          case "link": {
            const link = getLinkToValidate(node.url, config);
            if (link) {
              fileLinks.push(link);
            }
            break;
          }

          case "linkReference": {
            const definition = fileDefinitions.get(node.identifier);
            if (!definition) {
              break;
            }
            const link = getLinkToValidate(definition, config);
            if (link) {
              fileLinks.push(link);
            }
            break;
          }

          case "mdxJsxFlowElement": {
            for (const attribute of node.attributes) {
              if (isMdxIdAttribute(attribute)) {
                fileHeadings.push(attribute.value);
              }
            }

            if (!node.name) {
              break;
            }

            const componentProp = linkComponents[node.name];
            if (node.name !== "a" && !componentProp) {
              break;
            }

            for (const attribute of node.attributes) {
              if (
                attribute.type !== "mdxJsxAttribute" ||
                attribute.name !== (componentProp ?? "href") ||
                typeof attribute.value !== "string"
              ) {
                continue;
              }

              const link = getLinkToValidate(attribute.value, config);
              if (link) {
                fileLinks.push(link);
              }
            }
            break;
          }

          case "mdxJsxTextElement": {
            for (const attribute of node.attributes) {
              if (isMdxIdAttribute(attribute)) {
                fileHeadings.push(attribute.value);
              }
            }
            break;
          }

          case "html": {
            const htmlTree = fromHtml(node.value, { fragment: true });
            visit(htmlTree, (htmlNode: Nodes) => {
              if (
                hasProperty(htmlNode, "id") &&
                typeof htmlNode.properties.id === "string"
              ) {
                fileHeadings.push(htmlNode.properties.id);
              }

              if (
                htmlNode.type === "element" &&
                htmlNode.tagName === "a" &&
                hasProperty(htmlNode, "href") &&
                typeof htmlNode.properties.href === "string"
              ) {
                const link = getLinkToValidate(
                  htmlNode.properties.href,
                  config,
                );
                if (link) {
                  fileLinks.push(link);
                }
              }
            });
            break;
          }
        }
      },
    );

    data.set(getValidationDataId(base, id, pageSlug), {
      file: path,
      headings: fileHeadings,
      links: fileLinks,
    });
  };
};

export function clearValidationData() {
  data.clear();
}

export function getValidationData(): ValidationData {
  return data;
}

function getLinkToValidate(
  link: string,
  { options, site }: StarlightLinksValidatorRemarkConfig,
): Link | undefined {
  const linkToValidate: Link = { raw: link };

  if (!isAbsoluteUrl(link)) {
    return linkToValidate;
  }

  try {
    const url = new URL(link);

    if (site && options.sameSitePolicy !== "ignore" && url.origin === site) {
      if (options.sameSitePolicy === "error") {
        return { ...linkToValidate, error: "same-site" };
      }
      let transformed = link.replace(url.origin, "");
      if (!transformed) {
        transformed = "/";
      }
      return { ...linkToValidate, transformed };
    }

    if (!options.errorOnLocalLinks) {
      return undefined;
    }

    return url.hostname === "localhost" || url.hostname === "127.0.0.1"
      ? { ...linkToValidate, error: "local-link" }
      : undefined;
  } catch {
    return undefined;
  }
}

function getValidationDataId(base: string, id: string, pageSlug?: string) {
  if (pageSlug) {
    return nodePath.posix.join(
      stripLeadingSlash(base),
      stripLeadingSlash(ensureTrailingSlash(pageSlug)),
    );
  }

  return id;
}

function normalizeId(base: string, srcDir: URL, filePath: string) {
  const path = nodePath
    .relative(nodePath.join(fileURLToPath(srcDir), "content/docs"), filePath)
    .replace(/\.\w+$/, "")
    .replace(/(^|[/\\])index$/, "")
    .replace(/[/\\]?$/, "/")
    .split(/[/\\]/)
    .map((segment) => slug(segment))
    .join("/");

  if (base !== "/") {
    return nodePath.posix.join(stripLeadingSlash(base), path);
  }

  return path;
}

function isMdxIdAttribute(
  attribute: MdxJsxAttribute | MdxJsxExpressionAttribute,
): attribute is MdxIdAttribute {
  return (
    attribute.type === "mdxJsxAttribute" &&
    attribute.name === "id" &&
    typeof attribute.value === "string"
  );
}

function extractFrontmatterLinks(
  frontmatter: Frontmatter,
  fileLinks: Link[],
  config: StarlightLinksValidatorRemarkConfig,
) {
  if (!frontmatter) {
    return;
  }

  if (isFrontmatterWithHeroActions(frontmatter)) {
    for (const action of frontmatter.hero.actions) {
      const link = getLinkToValidate(action.link, config);
      if (link) {
        fileLinks.push(link);
      }
    }
  }

  if (isFrontmatterPrevNextLink(frontmatter, "prev")) {
    const link = getLinkToValidate(frontmatter.prev.link, config);
    if (link) {
      fileLinks.push(link);
    }
  }

  if (isFrontmatterPrevNextLink(frontmatter, "next")) {
    const link = getLinkToValidate(frontmatter.next.link, config);
    if (link) {
      fileLinks.push(link);
    }
  }
}

function isFrontmatterWithHeroActions(
  frontmatter: Frontmatter,
): frontmatter is Frontmatter & { hero: FrontmatterHeroActions } {
  return (
    frontmatter !== undefined &&
    "hero" in frontmatter &&
    typeof frontmatter.hero === "object" &&
    frontmatter.hero !== null &&
    "actions" in frontmatter.hero
  );
}

function isFrontmatterPrevNextLink<T extends "prev" | "next">(
  frontmatter: Frontmatter,
  type: T,
): frontmatter is Frontmatter & Record<T, FrontmatterPrevNextLink> {
  return (
    frontmatter !== undefined &&
    type in frontmatter &&
    typeof frontmatter[type] === "object" &&
    frontmatter[type] !== null &&
    "link" in frontmatter[type]
  );
}

export interface Link {
  error?: ValidationErrorType;
  raw: string;
  transformed?: string;
}

export type ValidationData = Map<
  string,
  {
    file: string;
    headings: string[];
    links: Link[];
  }
>;

interface MdxIdAttribute {
  name: "id";
  type: "mdxJsxAttribute";
  value: string;
}

type Frontmatter = DataMap["astro"]["frontmatter"];

interface FrontmatterHeroActions {
  actions: { link: string }[];
}

interface FrontmatterPrevNextLink {
  link: string;
}
