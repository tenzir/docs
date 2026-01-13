#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";

const DOCS_DIR = "src/content/docs";
const OUTPUT_FILE = "public/sitemap.md";
const BASE_URL = "https://docs.tenzir.com";

// Parse command line arguments
const args = process.argv.slice(2);
const mapMode = args.includes("--map");
const fullMode = args.includes("--full");

if (!mapMode && !fullMode) {
  console.error("Usage: generate-docs.mjs --map | --full [--output <file>]");
  console.error("  --map   Generate sitemap with headings only");
  console.error("  --full  Generate single file with full content");
  process.exit(1);
}

const outputIndex = args.indexOf("--output");
const customOutput =
  outputIndex !== -1 && args[outputIndex + 1]
    ? args[outputIndex + 1]
    : fullMode
      ? "tenzir-docs.md"
      : OUTPUT_FILE;

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
 * Demote all headings in markdown content by a specified number of levels.
 * E.g., demoteBy=1 turns # into ##, ## into ###, etc.
 */
function demoteHeadings(content, demoteBy) {
  if (demoteBy <= 0) return content;
  return content.replace(/^(#{1,6})\s/gm, (match, hashes) => {
    const newLevel = Math.min(hashes.length + demoteBy, 6);
    return "#".repeat(newLevel) + " ";
  });
}

/**
 * Format a document's full content for the bundle.
 */
function formatDocFull(doc, headingLevel) {
  let content = doc.body || "";
  // Demote headings so they fit under the section hierarchy
  // headingLevel is where this doc's title will be (e.g., 2 for ##)
  // Body headings should be children of the title, so demote by (headingLevel - 1)
  // E.g., if title is H2, body H2s become H3s (demote by 1)
  content = demoteHeadings(content, headingLevel - 1);
  return content.trim();
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
          body: fullMode ? body : null,
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
function formatDocEntry(doc, level) {
  const url = `${BASE_URL}/${doc.path}.md`;
  const headingPrefix = "#".repeat(level);
  let entry = `${headingPrefix} [${doc.title}](${url})\n\n`;

  if (doc.headings && doc.headings.length > 0) {
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
        output += formatDocEntry(subItem, level + 1);
      }
    }
  } else if (item.path) {
    output += formatDocEntry(item, level);
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
 * Format a section with full content for bundle mode.
 */
function formatSectionFull(item, level = 2) {
  let output = "";
  const headingPrefix = "#".repeat(level);

  if (item.label && item.items) {
    output += `${headingPrefix} ${item.label}\n\n`;
    for (const subItem of item.items) {
      if (subItem.label && subItem.items) {
        // Nested group
        output += formatSectionFull(subItem, level + 1);
      } else if (subItem.path) {
        output += formatDocEntryFull(subItem, level + 1);
      }
    }
  } else if (item.path) {
    output += formatDocEntryFull(item, level);
  }

  return output;
}

/**
 * Format a document entry with full content for bundle mode.
 */
function formatDocEntryFull(doc, level) {
  const headingPrefix = "#".repeat(level);
  let entry = `${headingPrefix} ${doc.title}\n\n`;

  if (doc.body) {
    entry += formatDocFull(doc, level) + "\n\n";
  }

  return entry;
}

/**
 * Generate the documentation map.
 */
async function generateDocsMap() {
  const docsRoot = path.join(process.cwd(), DOCS_DIR);
  const outputPath = path.join(process.cwd(), customOutput);

  console.log(
    `Generating docs ${fullMode ? "bundle" : "map"} to ${customOutput}...`,
  );

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

  // Add OCSF reference from generated sidebar (if it exists).
  // We use a simple regex to extract the sidebar object rather than a full
  // TypeScript parser for simplicity (KISS). This is fragile but sufficient
  // for our controlled input.
  const ocsfSidebarPath = path.join(
    process.cwd(),
    "src/sidebar-ocsf.generated.ts",
  );
  try {
    const ocsfContent = await fs.readFile(ocsfSidebarPath, "utf-8");
    const ocsfMatch = ocsfContent.match(
      /export const ocsfSidebar = (\{[\s\S]*?\});/,
    );
    if (ocsfMatch) {
      const ocsfSidebar = new Function(`return ${ocsfMatch[1]}`)();
      const ocsfDocs = await processSidebarItem(ocsfSidebar, docsRoot);
      if (ocsfDocs) {
        // Insert before Workflows (at the end, before last item)
        const workflowsIdx = sections.reference.findIndex(
          (item) => item.label === "Workflows",
        );
        if (workflowsIdx !== -1) {
          sections.reference.splice(workflowsIdx, 0, ocsfDocs);
        } else {
          sections.reference.push(ocsfDocs);
        }
      }
    }
  } catch (error) {
    // Skip if file doesn't exist (not generated yet), but warn on other errors
    if (error.code !== "ENOENT") {
      console.warn(`Warning: Failed to process OCSF sidebar: ${error.message}`);
    }
  }

  // Generate output
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, " UTC");
  let output;
  let totalDocs = 0;

  if (fullMode) {
    // Full mode: single file with all content
    output = `# Tenzir Documentation

> Auto-generated from https://docs.tenzir.com
>
> Last updated: ${now}

`;

    for (const [name, items] of Object.entries(sections)) {
      if (!items || items.length === 0) continue;

      const title = name.charAt(0).toUpperCase() + name.slice(1);
      output += `# ${title}\n\n`;

      for (const item of items) {
        if (item.label && item.items) {
          output += formatSectionFull(item, 2);
          totalDocs += countDocs(item);
        } else if (item.path) {
          output += formatDocEntryFull(item, 2);
          totalDocs++;
        }
      }
    }
  } else {
    // Map mode: sitemap with headings only
    output = `# Tenzir Documentation Map

> Last updated: ${now}

`;

    for (const [name, items] of Object.entries(sections)) {
      if (!items || items.length === 0) continue;

      const title = name.charAt(0).toUpperCase() + name.slice(1);
      const sectionIndexUrl = `${BASE_URL}/${name}.md`;
      output += `## [${title}](${sectionIndexUrl})\n\n`;

      for (const item of items) {
        if (item.label && item.items) {
          output += formatSection(item);
          totalDocs += countDocs(item);
        } else if (item.path) {
          output += formatDocEntry(item, 3);
          totalDocs++;
        }
      }
    }
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
 * Extract imported/declared variable names from sidebar.ts content.
 */
function extractSidebarVariables(content) {
  const variables = new Set();
  // Named imports: import { foo, bar } from "..."
  const namedImports = /import\s*\{([^}]+)\}\s*from/g;
  let match;
  while ((match = namedImports.exec(content)) !== null) {
    for (const name of match[1].split(",")) {
      const trimmed = name.trim().split(/\s+as\s+/).pop().trim();
      if (trimmed) variables.add(trimmed);
    }
  }
  // Default imports: import foo from "..."
  const defaultImports = /import\s+(\w+)\s+from/g;
  while ((match = defaultImports.exec(content)) !== null) {
    variables.add(match[1]);
  }
  // Const declarations: const foo = ...
  const constDecls = /^const\s+(\w+)\s*=/gm;
  while ((match = constDecls.exec(content)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
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

  const arrayContent = match[1];

  // Auto-stub all imported/declared variables to avoid ReferenceError
  const variables = extractSidebarVariables(content);
  const stubs = variables.map((v) => `const ${v} = null;`).join("\n    ");
  const wrappedCode = `
    ${stubs}
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
