import type { Root } from "mdast";
import type { MdxjsEsm } from "mdast-util-mdx";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const partialsDir = resolve(__dirname, "../partials");
const generatedDir = resolve(__dirname, "../generated");
const outputFile = resolve(generatedDir, "partial-headings.json");

// Cache of partial file -> headings
const partialHeadingsCache = new Map<string, HeadingInfo[]>();

// Map of page slug -> partial headings to inject
const pagePartialHeadings = new Map<string, HeadingInfo[]>();

interface HeadingInfo {
  depth: number;
  slug: string;
  text: string;
}

/**
 * Remark plugin that scans for partial imports and collects their headings.
 * Writes a JSON mapping file that route middleware can use to inject TOC items.
 */
export const remarkPartialHeadings: Plugin<[], Root> = function () {
  return (tree, file) => {
    // Collect import mappings: component name -> file path
    const imports = new Map<string, string>();

    // Find all MDX imports from the partials directory
    visit(tree, "mdxjsEsm", (node: MdxjsEsm) => {
      const code = node.value;
      // Match: import Name from '@partials/...' or '../partials/...'
      const match = code.match(
        /import\s+(\w+)\s+from\s+['"](@partials\/|\.\.?\/.*partials\/)([^'"]+)['"]/,
      );
      if (match) {
        const componentName = match[1];
        const partialPath = match[3];
        const fullPath = resolve(partialsDir, partialPath);
        imports.set(componentName, fullPath);
      }
    });

    if (imports.size === 0) return;

    // Find where each partial is used and collect its headings
    const pageHeadings: HeadingInfo[] = [];

    visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement) => {
      if (!node.name) return;

      const partialPath = imports.get(node.name);
      if (!partialPath) return;

      // Get headings from cache or extract them
      let headings = partialHeadingsCache.get(partialPath);
      if (!headings) {
        try {
          const content = readFileSync(partialPath, "utf-8");
          headings = extractHeadings(content);
          partialHeadingsCache.set(partialPath, headings);
        } catch {
          headings = [];
        }
      }

      pageHeadings.push(...headings);
    });

    if (pageHeadings.length > 0 && file.path) {
      // Convert file path to route slug
      const contentDocsDir = resolve(__dirname, "../content/docs");
      const relativePath = relative(contentDocsDir, file.path);
      // Remove .mdx extension and convert to slug format
      const slug = relativePath
        .replace(/\.mdx?$/, "")
        .replace(/\/index$/, "")
        .replace(/\\/g, "/");

      pagePartialHeadings.set(slug, pageHeadings);

      // Write updated map after each file (last write wins with complete data)
      writePartialHeadingsMap();
    }
  };
};

/**
 * Extract headings from MDX content using regex.
 */
function extractHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim();
    headings.push({
      depth: match[1].length,
      slug: slugify(text),
      text: text,
    });
  }

  return headings;
}

/**
 * Convert heading text to a URL-friendly slug.
 * Matches Starlight's slugify behavior.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`{}()[\]]/g, "") // Remove code markers and brackets
    .replace(/\s*=\s*/g, "--") // " = " -> "--" (matches Starlight)
    .replace(/\s*->\s*/g, "--") // " -> " -> "--"
    .replace(/\s+/g, "-") // spaces -> single dash
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

/**
 * Write the collected mappings to a JSON file.
 * Call this after all files have been processed.
 */
export function writePartialHeadingsMap(): void {
  const data: Record<string, HeadingInfo[]> = {};
  for (const [slug, headings] of pagePartialHeadings) {
    data[slug] = headings;
  }

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(outputFile, JSON.stringify(data, null, 2));
}
