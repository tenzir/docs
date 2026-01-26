import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { starlightLlmsTxtContext } from "virtual:starlight-llms-txt/context";
import type {
  APIRoute,
  GetStaticPaths,
  InferGetStaticParamsType,
  InferGetStaticPropsType,
} from "astro";
import micromatch from "micromatch";
// Sidebar imports for hierarchy
import {
  explanations,
  guides,
  integrations,
  reference,
  tutorials,
} from "../../../sidebar";
import { changelogTopics } from "../../../sidebar-changelog.generated";
import { entryToSimpleMarkdown } from "../entry-to-markdown";
import type { SidebarItem } from "../types";
import { ensureTrailingSlash, isDefaultLocale } from "../utils";

/** Map top-level doc IDs to their sidebar sections. */
const SECTION_SIDEBARS: Record<string, SidebarItem[]> = {
  guides,
  tutorials,
  explanations,
  reference,
  integrations,
};

interface ChildLink {
  title: string;
  url: string;
}

/**
 * Extract child links from a sidebar section for a given doc ID.
 */
function extractChildLinks(docId: string, baseUrl: string): ChildLink[] | null {
  // Check if we're looking for a top-level section
  if (docId in SECTION_SIDEBARS) {
    const sidebarItems = SECTION_SIDEBARS[docId];
    return sidebarItems
      .map((item) => {
        if (typeof item === "string") {
          const label = item.split("/").pop() || item;
          return {
            title: label.charAt(0).toUpperCase() + label.slice(1),
            url: `${baseUrl}/${item}.md`,
          };
        } else if (item.link) {
          return { title: item.label, url: `${baseUrl}/${item.link}.md` };
        } else if (item.items && item.items.length > 0) {
          // For groups, link to the first item if it's an index page
          const first = item.items[0];
          if (typeof first === "string") {
            return { title: item.label, url: `${baseUrl}/${first}.md` };
          } else if (first && "link" in first && first.link) {
            return { title: item.label, url: `${baseUrl}/${first.link}.md` };
          }
          return null;
        }
        return null;
      })
      .filter((link): link is ChildLink => link !== null);
  }

  // Check for changelog section
  if (docId === "changelog" || docId === "changelog/index") {
    const projects = changelogTopics.filter(
      (t) => t.label !== "Timeline" && t.link,
    );
    return projects.map((t) => ({
      title: t.label,
      url: `${baseUrl}/${t.link}.md`,
    }));
  }

  // For nested pages, look for matching parent in sidebar
  for (const [, sidebarItems] of Object.entries(SECTION_SIDEBARS)) {
    const children = findChildrenForPath(sidebarItems, docId, baseUrl);
    if (children) return children;
  }

  return null;
}

/**
 * Recursively find children for a specific path in the sidebar.
 */
function findChildrenForPath(
  items: SidebarItem[],
  targetPath: string,
  baseUrl: string,
): ChildLink[] | null {
  for (const item of items) {
    if (typeof item === "string") continue;
    if (!item.items) continue;

    // Check if the first item matches the target path (index page pattern)
    const firstItem = item.items[0];
    let indexPath: string | null = null;
    if (typeof firstItem === "string") {
      indexPath = firstItem;
    } else if (firstItem && "link" in firstItem && firstItem.link) {
      indexPath = firstItem.link;
    }

    if (indexPath === targetPath) {
      // Return the rest of the items as children
      return item.items
        .slice(1)
        .map((child) => {
          if (typeof child === "string") {
            const label = child.split("/").pop() || child;
            return {
              title: label.charAt(0).toUpperCase() + label.slice(1),
              url: `${baseUrl}/${child}.md`,
            };
          } else if (child.link) {
            return { title: child.label, url: `${baseUrl}/${child.link}.md` };
          } else if (child.items && child.items.length > 0) {
            const first = child.items[0];
            if (typeof first === "string") {
              return { title: child.label, url: `${baseUrl}/${first}.md` };
            } else if (first && "link" in first && first.link) {
              return { title: child.label, url: `${baseUrl}/${first.link}.md` };
            }
          }
          return null;
        })
        .filter((link): link is ChildLink => link !== null);
    }

    // Recursively check nested groups
    const nested = findChildrenForPath(item.items, targetPath, baseUrl);
    if (nested) return nested;
  }

  return null;
}

/**
 * Get child links for a page if it has children in the sidebar.
 */
function getChildLinksForPage(docId: string, baseUrl: string): ChildLink[] {
  // Normalize the doc ID (remove /index suffix)
  const normalizedId = docId.replace(/\/index$/, "");

  const children = extractChildLinks(normalizedId, baseUrl);
  return children || [];
}

export const getStaticPaths = (async () => {
  const { perPageMarkdown } = starlightLlmsTxtContext;

  // Only generate paths if the feature is enabled
  if (!perPageMarkdown.enabled) {
    return [];
  }

  // Get all documentation pages (filtered by locale and excluding drafts and excluded pages)
  const pages = await getCollection(
    "docs",
    (doc) =>
      isDefaultLocale(doc) &&
      !doc.data.draft &&
      !micromatch.isMatch(doc.id, perPageMarkdown.excludePages),
  );

  // Generate paths based on the file pattern
  const paths = pages.flatMap((doc) => {
    const slug = doc.id;

    // Handle different URL patterns
    if (perPageMarkdown.extensionStrategy === "replace") {
      // Simple .md replacement pattern
      return [
        {
          params: { slug },
          props: { doc },
        },
      ];
    } else {
      // 'append' pattern - add .html.md
      if (slug === "index") {
        return [
          {
            params: { slug: "index.html" },
            props: { doc },
          },
        ];
      } else {
        return [
          {
            params: { slug: `${slug}.html` },
            props: { doc },
          },
        ];
      }
    }
  });

  return paths;
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
type Params = InferGetStaticParamsType<typeof getStaticPaths>;

/**
 * Generates Markdown content for a single documentation page.
 */
async function generatePageMarkdown(
  doc: CollectionEntry<"docs">,
  context: Parameters<typeof entryToSimpleMarkdown>[1],
): Promise<string> {
  const segments: string[] = [];

  // Compute baseUrl early for preamble and child links
  const site = new URL(
    ensureTrailingSlash(starlightLlmsTxtContext.base),
    context.site,
  );
  const baseUrl = site.href.replace(/\/$/, "");

  // Add the page title
  segments.push(`# ${doc.data.hero?.title || doc.data.title}`);

  // Add the description if available
  const description = doc.data.hero?.tagline || doc.data.description;
  if (description) {
    segments.push(`> ${description}`);
  }

  // Add preamble if enabled
  if (starlightLlmsTxtContext.preambles) {
    segments.push(`> Documentation index: ${baseUrl}/llms.txt`);
  }

  // Convert the content to Markdown
  const markdown = await entryToSimpleMarkdown(doc, context);
  segments.push(markdown);

  // Append child links for pages that have children in the sidebar
  const childLinks = getChildLinksForPage(doc.id, baseUrl);

  if (childLinks.length > 0) {
    const linksSection = [
      "## Contents",
      "",
      ...childLinks.map((link) => `- [${link.title}](${link.url})`),
    ].join("\n");
    segments.push(linksSection);
  }

  return segments.join("\n\n");
}

/**
 * Route that generates individual Markdown files for each documentation page.
 */
export const GET: APIRoute<Props, Params> = async (context) => {
  // Generate the Markdown content using the doc from props
  const content = await generatePageMarkdown(context.props.doc, context);

  // Return the Markdown content with appropriate headers
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
