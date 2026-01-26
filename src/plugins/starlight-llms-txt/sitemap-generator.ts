import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { starlightLlmsTxtContext } from "virtual:starlight-llms-txt/context";
import type { APIContext } from "astro";
// Sidebar imports
import {
  explanations,
  guides,
  integrations,
  reference,
  tutorials,
} from "../../sidebar";
// Changelog topics
import { changelogTopics } from "../../sidebar-changelog.generated";
import { entryToSimpleMarkdown } from "./entry-to-markdown";
import type { SidebarItem } from "./types";
import { ensureTrailingSlash, getSiteTitle, isDefaultLocale } from "./utils";

/** Section descriptions matching the original generate-docs.mjs format. */
const SECTION_DESCRIPTIONS: Record<string, string> = {
  guides: `Practical step-by-step explanations to help you achieve a specific goal.
Start here when you're trying to get something done.`,
  tutorials: `Learning-oriented lessons that take you through a series of steps.
Start here when you want to get started with Tenzir.`,
  explanations: `Big-picture explanations of higher-level concepts.
Start here to build understanding of a particular topic.`,
  reference: `Nitty-gritty technical descriptions of how Tenzir works.
Start here when you need detailed information about building blocks.`,
  integrations: `Turn-key packages and native connectors for security tools.
Start here to connect Tenzir with Splunk, Elastic, CrowdStrike, etc.`,
  changelog: `Release notes and version history for all Tenzir projects.`,
};

/**
 * Reference index paths that get special handling:
 * - Skip H2/H3 heading extraction (too verbose for sitemap)
 * - Expand to list all child docs alphabetically
 *
 * These are index pages linking to many individual items (operators,
 * functions, plugins) rather than narrative content with useful headings.
 */
const REFERENCE_INDEX_PATHS = [
  "reference/operators",
  "reference/functions",
  "reference/claude-plugins",
];

interface HeadingNode {
  text: string;
  children: string[];
}

interface DocEntry {
  id: string;
  title: string;
  description: string | null;
  headings: HeadingNode[];
  url: string;
}

interface SidebarGroup {
  label: string;
  link?: string;
  description?: string | null;
  items: (DocEntry | SidebarGroup)[];
}

/**
 * Extract the first paragraph from markdown content.
 */
function extractDescription(markdown: string): string | null {
  const lines = markdown.split("\n");
  const paragraph: string[] = [];

  for (const line of lines) {
    // Skip headings
    if (line.startsWith("#")) break;
    // Skip code blocks
    if (line.startsWith("```")) break;
    // Skip lists
    if (line.startsWith("- ") || line.startsWith("* ")) break;
    if (/^\d+\.\s/.test(line)) break;
    // Skip images
    if (line.startsWith("![")) break;
    // Skip components/HTML
    if (line.startsWith("<")) break;
    // Skip blockquotes
    if (line.startsWith(">")) continue;
    // Skip admonitions
    if (line.startsWith(":::")) continue;

    // Skip empty lines before content
    if (paragraph.length === 0 && line.trim() === "") continue;

    // End of paragraph
    if (line.trim() === "" && paragraph.length > 0) break;

    paragraph.push(line.trim());
  }

  if (paragraph.length === 0) return null;

  let text = paragraph.join(" ");
  // Strip markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Strip bold/italic
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  // Strip inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  return text.trim() || null;
}

/**
 * Extract H2 and H3 headings from markdown content.
 */
function extractHeadings(markdown: string): HeadingNode[] {
  const headings: HeadingNode[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  let currentH2: HeadingNode | null = null;

  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    let heading = match[2].trim();
    // Clean up heading text
    heading = heading.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    heading = heading.replace(/`([^`]+)`/g, "$1");

    if (level === 2) {
      currentH2 = { text: heading, children: [] };
      headings.push(currentH2);
    } else if (level === 3 && currentH2) {
      currentH2.children.push(heading);
    }
  }

  return headings;
}

/**
 * Resolve a doc path to a DocEntry.
 */
async function resolveDocEntry(
  docPath: string,
  docsCollection: CollectionEntry<"docs">[],
  context: APIContext,
  baseUrl: string,
): Promise<DocEntry | null> {
  // Find the doc in the collection
  const doc = docsCollection.find(
    (d) => d.id === docPath || d.id === `${docPath}/index`,
  );

  if (!doc) {
    return null;
  }

  // Get rendered markdown for description and headings
  const markdown = await entryToSimpleMarkdown(doc, context);

  const isReferenceOnly = REFERENCE_INDEX_PATHS.some((p) =>
    docPath.startsWith(p),
  );

  return {
    id: docPath,
    title: doc.data.title,
    description: extractDescription(markdown),
    headings: isReferenceOnly ? [] : extractHeadings(markdown),
    url: `${baseUrl}/${docPath}.md`,
  };
}

/**
 * Expand a directory path to list all child docs.
 */
async function expandDirectoryDocs(
  basePath: string,
  docsCollection: CollectionEntry<"docs">[],
  context: APIContext,
  baseUrl: string,
): Promise<DocEntry[]> {
  const docs: DocEntry[] = [];
  // Find all docs in collection that start with basePath but are not the index
  const matchingDocs = docsCollection.filter(
    (doc) =>
      doc.id.startsWith(`${basePath}/`) && doc.id !== `${basePath}/index`,
  );
  for (const doc of matchingDocs) {
    const entry = await resolveDocEntry(
      doc.id,
      docsCollection,
      context,
      baseUrl,
    );
    if (entry) docs.push(entry);
  }
  // Sort alphabetically by title
  docs.sort((a, b) => a.title.localeCompare(b.title));
  return docs;
}

/**
 * Process a sidebar item into a structured format.
 */
async function processSidebarItem(
  item: SidebarItem,
  docsCollection: CollectionEntry<"docs">[],
  context: APIContext,
  baseUrl: string,
): Promise<DocEntry | SidebarGroup | null> {
  if (typeof item === "string") {
    return resolveDocEntry(item, docsCollection, context, baseUrl);
  }

  if (typeof item === "object" && item !== null) {
    // Skip API sidebar groups (placeholder labels from starlight-openapi)
    if (item.label?.startsWith("Symbol(")) {
      return null;
    }
    if ("type" in item && (item as { type?: string }).type === "group") {
      return null;
    }
    if ("operations" in item) {
      return null;
    }

    // Item with link only (e.g., { label: "Operators", link: "reference/operators" })
    if (item.link && !item.items) {
      // Check if this is an expandable path
      if (REFERENCE_INDEX_PATHS.includes(item.link)) {
        const indexDoc = await resolveDocEntry(
          item.link,
          docsCollection,
          context,
          baseUrl,
        );
        const childDocs = await expandDirectoryDocs(
          item.link,
          docsCollection,
          context,
          baseUrl,
        );
        return {
          label: item.label,
          link: indexDoc?.url,
          description: indexDoc?.description,
          items: childDocs,
        };
      }

      const doc = await resolveDocEntry(
        item.link,
        docsCollection,
        context,
        baseUrl,
      );
      if (doc) {
        doc.title = item.label || doc.title;
      }
      return doc;
    }

    // Group with items
    if (item.items) {
      const processedItems: (DocEntry | SidebarGroup)[] = [];

      for (const subItem of item.items) {
        const result = await processSidebarItem(
          subItem,
          docsCollection,
          context,
          baseUrl,
        );
        if (result) {
          processedItems.push(result);
        }
      }

      // Check if first item is an index page
      let groupLink: string | undefined;
      let groupDescription: string | null = null;
      let items = processedItems;

      if (processedItems.length > 1 && "id" in processedItems[0]) {
        const firstDoc = processedItems[0] as DocEntry;
        const isIndexPage = processedItems.slice(1).some((d) => {
          if ("id" in d) {
            return (d as DocEntry).id.startsWith(`${firstDoc.id}/`);
          }
          return false;
        });

        if (isIndexPage) {
          groupLink = firstDoc.url;
          groupDescription = firstDoc.description;
          items = processedItems.slice(1);
        }
      }

      return {
        label: item.label,
        link: groupLink,
        description: groupDescription,
        items,
      };
    }
  }

  return null;
}

/**
 * Format a document entry as markdown.
 */
function formatDocEntry(doc: DocEntry, level: number): string {
  const headingPrefix = "#".repeat(level);
  let entry = `${headingPrefix} [${doc.title}](${doc.url})\n\n`;

  if (doc.description) {
    entry += `${doc.description}\n\n`;
  }

  if (doc.headings.length > 0) {
    for (const h2 of doc.headings) {
      entry += `- ${h2.text}\n`;
      for (const h3 of h2.children) {
        entry += `  - ${h3}\n`;
      }
    }
    entry += "\n";
  }

  return entry;
}

/**
 * Format a sidebar group as markdown.
 */
function formatSection(
  item: DocEntry | SidebarGroup,
  level: number = 3,
): string {
  let output = "";
  const headingPrefix = "#".repeat(level);

  if ("items" in item) {
    // It's a group
    const group = item as SidebarGroup;
    if (group.link) {
      output += `${headingPrefix} [${group.label}](${group.link})\n\n`;
    } else {
      output += `${headingPrefix} ${group.label}\n\n`;
    }

    if (group.description) {
      output += `${group.description}\n\n`;
    }

    for (const subItem of group.items) {
      output += formatSection(subItem, level + 1);
    }
  } else {
    // It's a doc entry
    output += formatDocEntry(item as DocEntry, level);
  }

  return output;
}

/**
 * Format changelog section with shallow depth (project links only).
 */
function formatChangelogSection(baseUrl: string): string {
  let output = `## [Changelog](${baseUrl}/changelog.md)\n\n`;
  output += `${SECTION_DESCRIPTIONS.changelog}\n\n`;

  // Extract main project topics (skip Timeline)
  const projects = changelogTopics.filter((t) => t.label !== "Timeline");

  for (const project of projects) {
    output += `- [${project.label}](${baseUrl}/${project.link}.md)\n`;
  }

  output += "\n";
  return output;
}

/**
 * Generate the sitemap markdown content.
 */
export async function generateSitemap(context: APIContext): Promise<string> {
  const site = new URL(
    ensureTrailingSlash(starlightLlmsTxtContext.base),
    context.site,
  );
  const baseUrl = site.href.replace(/\/$/, "");

  // Get all docs
  const docsCollection = await getCollection(
    "docs",
    (doc) => isDefaultLocale(doc) && !doc.data.draft,
  );

  // Process each section
  const sections: Record<string, SidebarItem[]> = {
    guides,
    tutorials,
    explanations,
    reference,
    integrations,
  };

  const processedSections: Record<string, (DocEntry | SidebarGroup)[]> = {};

  for (const [name, items] of Object.entries(sections)) {
    const processed: (DocEntry | SidebarGroup)[] = [];
    for (const item of items) {
      const result = await processSidebarItem(
        item,
        docsCollection,
        context,
        baseUrl,
      );
      if (result) {
        processed.push(result);
      }
    }
    processedSections[name] = processed;
  }

  // Build output
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, " UTC");
  const title = getSiteTitle();
  const description = starlightLlmsTxtContext.description
    ? `> ${starlightLlmsTxtContext.description}`
    : "";

  const segments: string[] = [`# ${title} Documentation Map`];

  if (description) {
    segments.push(description);
  }

  segments.push(`> Last updated: ${now}`);

  // Add intro text
  segments.push(`Tenzir is a data pipeline engine for security teams. Run pipelines to collect,
parse, transform, and route security data. Deploy nodes on-prem or in the cloud,
and manage them via the Tenzir Platform.`);

  // Add sections
  for (const [name, items] of Object.entries(processedSections)) {
    if (!items || items.length === 0) continue;

    const sectionTitle = name.charAt(0).toUpperCase() + name.slice(1);
    const sectionUrl = `${baseUrl}/${name}.md`;
    let sectionOutput = `## [${sectionTitle}](${sectionUrl})\n\n`;

    if (SECTION_DESCRIPTIONS[name]) {
      sectionOutput += `${SECTION_DESCRIPTIONS[name]}\n\n`;
    }

    for (const item of items) {
      sectionOutput += formatSection(item);
    }

    segments.push(sectionOutput.trim());
  }

  // Add changelog section
  segments.push(formatChangelogSection(baseUrl).trim());

  return `${segments.join("\n\n")}\n`;
}
