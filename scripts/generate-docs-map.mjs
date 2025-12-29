#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";

const DOCS_DIR = "src/content/docs";
const OUTPUT_FILE = "public/sitemap.md";
const BASE_URL = "https://docs.tenzir.com";

// Reference subcategories that should only show links (no H2s)
const REFERENCE_ONLY_PATHS = [
  "reference/operators",
  "reference/functions",
  "reference/claude-plugins",
];

/**
 * Parse frontmatter from markdown content.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { title: null, content };
  }

  const frontmatterStr = match[1];
  const body = match[2];

  const titleMatch = frontmatterStr.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1] : null;

  return { title, content: body };
}

/**
 * Extract H2 and H3 headings from markdown content as nested structure.
 */
function extractHeadings(content) {
  const headings = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  let currentH2 = null;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    let heading = match[2].trim();
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
 * Resolve a sidebar path to file info.
 */
async function resolveDocPath(docPath, docsRoot) {
  // Try different extensions
  const extensions = [".mdx", ".md"];
  const variants = [
    docPath, // direct file
    `${docPath}/index`, // index file in directory
  ];

  for (const variant of variants) {
    for (const ext of extensions) {
      const filePath = path.join(docsRoot, `${variant}${ext}`);
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, "utf-8");
        const { title, content: body } = parseFrontmatter(content);

        const isReferenceOnly = REFERENCE_ONLY_PATHS.some((p) =>
          docPath.startsWith(p),
        );
        const headings = isReferenceOnly ? [] : extractHeadings(body);

        return {
          path: docPath,
          title: title || path.basename(docPath),
          headings,
        };
      } catch {
        // Try next variant
      }
    }
  }

  console.warn(`  Warning: Could not resolve ${docPath}`);
  return null;
}

/**
 * Process a sidebar item (can be string, object with label/items, or object with link).
 */
async function processSidebarItem(item, docsRoot) {
  if (typeof item === "string") {
    return await resolveDocPath(item, docsRoot);
  }

  if (typeof item === "object" && item !== null) {
    // Skip API sidebar groups (they're auto-generated)
    if (item.type === "group" || item.operations) {
      return null;
    }

    // Item with link (e.g., { label: "Operators", link: "reference/operators" })
    if (item.link) {
      const doc = await resolveDocPath(item.link, docsRoot);
      if (doc) {
        doc.title = item.label || doc.title;
      }
      return doc;
    }

    // Group with items
    if (item.items) {
      const docs = [];
      for (const subItem of item.items) {
        const doc = await processSidebarItem(subItem, docsRoot);
        if (doc) {
          if (Array.isArray(doc)) {
            docs.push(...doc);
          } else {
            docs.push(doc);
          }
        }
      }

      // Check if first item is an index/overview page (parent path of other items)
      let indexLink = null;
      let items = docs;
      if (docs.length > 1 && docs[0].path) {
        const firstPath = docs[0].path;
        const isIndexPage = docs
          .slice(1)
          .some((d) => d.path && d.path.startsWith(firstPath + "/"));
        if (isIndexPage) {
          indexLink = `${BASE_URL}/${firstPath}.md`;
          items = docs.slice(1); // Remove index page from items
        }
      }

      return {
        label: item.label,
        link: indexLink,
        items,
      };
    }
  }

  return null;
}

/**
 * Format a document entry as markdown.
 */
function formatDocEntry(doc) {
  const url = `${BASE_URL}/${doc.path}.md`;
  let entry = `- [${doc.title}](${url})`;

  if (doc.headings && doc.headings.length > 0) {
    entry += "\n";
    for (const h2 of doc.headings) {
      entry += `  - ${h2.text}\n`;
      for (const h3 of h2.children) {
        entry += `    - ${h3}\n`;
      }
    }
  } else {
    entry += "\n";
  }

  return entry;
}

/**
 * Format a section (group of docs or nested groups).
 */
function formatSection(item, level = 3) {
  let output = "";
  const headingPrefix = "#".repeat(level);

  if (item.label && item.items) {
    if (item.link) {
      output += `${headingPrefix} [${item.label}](${item.link})\n\n`;
    } else {
      output += `${headingPrefix} ${item.label}\n\n`;
    }
    for (const subItem of item.items) {
      if (subItem.label && subItem.items) {
        // Nested group
        output += formatSection(subItem, level + 1);
      } else if (subItem.path) {
        output += formatDocEntry(subItem);
      }
    }
  } else if (item.path) {
    output += formatDocEntry(item);
  }

  return output;
}

/**
 * Walk a directory and collect all docs.
 */
async function walkDirectory(dir, basePath, docsRoot) {
  const docs = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return docs;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDocs = await walkDirectory(
        path.join(dir, entry.name),
        `${basePath}/${entry.name}`,
        docsRoot,
      );
      docs.push(...subDocs);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      // Skip index files
      if (entry.name === "index.md" || entry.name === "index.mdx") continue;

      const docPath = `${basePath}/${entry.name.replace(/\.(mdx?)$/, "")}`;
      const doc = await resolveDocPath(docPath, docsRoot);
      if (doc) {
        docs.push(doc);
      }
    }
  }

  return docs;
}

/**
 * Generate the documentation map.
 */
async function generateDocsMap() {
  const docsRoot = path.join(process.cwd(), DOCS_DIR);
  const outputPath = path.join(process.cwd(), OUTPUT_FILE);

  console.log("Generating docs map...");

  // Read the file and extract the exports
  const sidebarContent = await fs.readFile(
    path.join(process.cwd(), "src/sidebar.ts"),
    "utf-8",
  );

  // Parse the sidebar exports (simplified - works for this structure)
  const sections = {
    guides: await extractAndProcess("guides", sidebarContent, docsRoot),
    tutorials: await extractAndProcess("tutorials", sidebarContent, docsRoot),
    explanations: await extractAndProcess(
      "explanations",
      sidebarContent,
      docsRoot,
    ),
    reference: await extractAndProcess("reference", sidebarContent, docsRoot),
    integrations: await extractAndProcess(
      "integrations",
      sidebarContent,
      docsRoot,
    ),
  };

  // Add operators, functions, and claude-plugins by walking directories
  const operatorsDir = path.join(docsRoot, "reference/operators");
  const functionsDir = path.join(docsRoot, "reference/functions");
  const claudePluginsDir = path.join(docsRoot, "reference/claude-plugins");

  const operators = await walkDirectory(
    operatorsDir,
    "reference/operators",
    docsRoot,
  );
  const functions = await walkDirectory(
    functionsDir,
    "reference/functions",
    docsRoot,
  );
  const claudePlugins = await walkDirectory(
    claudePluginsDir,
    "reference/claude-plugins",
    docsRoot,
  );

  // Sort alphabetically
  operators.sort((a, b) => a.title.localeCompare(b.title));
  functions.sort((a, b) => a.title.localeCompare(b.title));
  claudePlugins.sort((a, b) => a.title.localeCompare(b.title));

  // Insert into reference section (with links to index pages)
  if (operators.length > 0) {
    sections.reference.unshift({
      label: "Operators",
      link: `${BASE_URL}/reference/operators.md`,
      items: operators,
    });
  }
  if (functions.length > 0) {
    // Insert after operators
    const insertIdx = operators.length > 0 ? 1 : 0;
    sections.reference.splice(insertIdx, 0, {
      label: "Functions",
      link: `${BASE_URL}/reference/functions.md`,
      items: functions,
    });
  }
  if (claudePlugins.length > 0) {
    // Find and replace the Claude Marketplace entry with expanded version
    const marketplaceIdx = sections.reference.findIndex(
      (item) => item.path === "reference/claude-plugins",
    );
    if (marketplaceIdx !== -1) {
      sections.reference.splice(marketplaceIdx, 1, {
        label: "Claude Marketplace",
        link: `${BASE_URL}/reference/claude-plugins.md`,
        items: claudePlugins,
      });
    } else {
      sections.reference.push({
        label: "Claude Marketplace",
        link: `${BASE_URL}/reference/claude-plugins.md`,
        items: claudePlugins,
      });
    }
  }

  // Generate output
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, " UTC");
  let output = `# Tenzir Documentation Map

> Auto-generated from sidebar configuration. Do not edit manually.
> Last updated: ${now}

`;

  let totalDocs = 0;

  for (const [name, items] of Object.entries(sections)) {
    if (!items || items.length === 0) continue;

    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const sectionIndexUrl = `${BASE_URL}/${name}.md`;
    output += `## [${title}](${sectionIndexUrl})\n\n`;

    let hasOutputItems = false;
    for (const item of items) {
      if (item.label && item.items) {
        if (hasOutputItems) {
          output += "\n"; // Add blank line before section if preceded by content
        }
        output += formatSection(item);
        totalDocs += countDocs(item);
        hasOutputItems = true;
      } else if (item.path) {
        output += formatDocEntry(item);
        totalDocs++;
        hasOutputItems = true;
      }
    }
    output += "\n";
  }

  await fs.writeFile(outputPath, output);
  console.log(`Generated ${outputPath} (${totalDocs} pages)`);
}

/**
 * Count docs in a section.
 */
function countDocs(item) {
  if (item.path) return 1;
  if (item.items) {
    return item.items.reduce((sum, i) => sum + countDocs(i), 0);
  }
  return 0;
}

/**
 * Extract and process a sidebar section.
 */
async function extractAndProcess(name, content, docsRoot) {
  // Find the export for this section
  const exportRegex = new RegExp(
    `export const ${name} = \\[([\\s\\S]*?)\\];(?=\\s*(?:export|$))`,
    "m",
  );
  const match = content.match(exportRegex);

  if (!match) {
    console.warn(`Could not find export for ${name}`);
    return [];
  }

  // Parse the array content (simplified JS parsing)
  const arrayContent = match[1];

  // Use Function constructor to evaluate (safe since we control the input)
  // First, we need to handle the imports
  const wrappedCode = `
    const nodeAPISidebarGroup = { type: "group", label: "API" };
    const platformAPISidebarGroup = { type: "group", label: "API" };
    return [${arrayContent}];
  `;

  try {
    const items = new Function(wrappedCode)();
    const processed = [];

    for (const item of items) {
      const result = await processSidebarItem(item, docsRoot);
      if (result) {
        processed.push(result);
      }
    }

    return processed;
  } catch (err) {
    console.error(`Error parsing ${name}:`, err.message);
    return [];
  }
}

generateDocsMap().catch((err) => {
  console.error("Error generating docs map:", err);
  process.exit(1);
});
