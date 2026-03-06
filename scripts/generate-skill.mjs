#!/usr/bin/env node

/**
 * Generates progressive-disclosure Agent Skills from built markdown output in dist/.
 *
 * Output structure:
 *   tenzir/
 *   ├── SKILL.md
 *   ├── guides/
 *   ├── tutorials/
 *   └── ...
 *
 *   ocsf/
 *   ├── SKILL.md
 *   ├── index.md
 *   ├── introduction.md
 *   └── ...
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DOCS_URL_PREFIX = /^https?:\/\/docs\.tenzir\.com/;
const OCSF_ROOT = "reference/ocsf";

// Reference stays intentionally shallow in the main skill because operators,
// functions, and OCSF each have their own progressive disclosure.
const SECTION_MAX_LEVEL = {
  Guides: 4,
  Tutorials: 4,
  Explanations: 4,
  Integrations: 4,
  Reference: 3,
};

const SKILL_TARGETS = [
  {
    name: "tenzir",
    description: "Data pipeline engine for security teams",
    includeSourcePath(sourcePath) {
      return !isOcsfSourcePath(sourcePath);
    },
    mapSourcePath(sourcePath) {
      return sourcePath;
    },
  },
  {
    name: "ocsf",
    description: "Open Cybersecurity Schema Framework reference",
    includeSourcePath(sourcePath) {
      return isOcsfSourcePath(sourcePath);
    },
    mapSourcePath(sourcePath) {
      if (sourcePath === `${OCSF_ROOT}.md`) return "index.md";
      if (sourcePath.startsWith(`${OCSF_ROOT}/`)) {
        return sourcePath.slice(`${OCSF_ROOT}/`.length);
      }
      return null;
    },
  },
];

function isOcsfSourcePath(sourcePath) {
  return (
    sourcePath === `${OCSF_ROOT}.md` || sourcePath.startsWith(`${OCSF_ROOT}/`)
  );
}

function getHeadingLevel(line) {
  const match = line.match(/^(#{1,6})\s/);
  return match ? match[1].length : 0;
}

function extractHeadingText(line) {
  const linkMatch = line.match(/^#{1,6}\s+\[([^\]]+)\]/);
  if (linkMatch) return linkMatch[1];

  const plainMatch = line.match(/^#{1,6}\s+(.+)$/);
  return plainMatch ? plainMatch[1] : null;
}

function extractHeadingHref(line) {
  const match = line.match(/^#{1,6}\s+\[[^\]]+\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

function normalizeRelativePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function normalizeDocsHref(href) {
  if (!href) return href;
  return href.replace(DOCS_URL_PREFIX, "");
}

function toSourceMarkdownPath(href) {
  if (!href) return null;

  const normalized = normalizeDocsHref(href);

  if (!normalized.startsWith("/")) return null;

  const pathPart = normalized.slice(1).split("#")[0].split("?")[0];
  return pathPart.endsWith(".md") ? pathPart : null;
}

function getNodeSourcePath(node) {
  return toSourceMarkdownPath(extractHeadingHref(node.heading ?? ""));
}

function isBulletLine(line) {
  return line.startsWith("- ") || line.startsWith("  - ");
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start]?.trim() === "") start++;
  while (end > start && lines[end - 1]?.trim() === "") end--;

  return lines.slice(start, end);
}

function hasMeaningfulContent(lines) {
  return lines.some((line) => line.trim() !== "" && !isBulletLine(line));
}

function parseHeadingTree(markdown) {
  const root = {
    heading: null,
    level: 0,
    contentLines: [],
    children: [],
  };
  const stack = [root];

  for (const line of markdown.split("\n")) {
    const level = getHeadingLevel(line);
    if (level === 0) {
      stack.at(-1).contentLines.push(line);
      continue;
    }

    while (stack.at(-1).level >= level) {
      stack.pop();
    }

    const node = {
      heading: line,
      level,
      contentLines: [],
      children: [],
    };
    stack.at(-1).children.push(node);
    stack.push(node);
  }

  return root;
}

function filterNode(node, { includeSourcePath, maxDepth }) {
  if (node.level > maxDepth) return null;

  const sourcePath = getNodeSourcePath(node);
  if (sourcePath && !includeSourcePath(sourcePath)) return null;

  const children = node.children
    .map((child) => filterNode(child, { includeSourcePath, maxDepth }))
    .filter(Boolean);

  if (
    !children.length &&
    !hasMeaningfulContent(node.contentLines) &&
    !sourcePath
  ) {
    return null;
  }

  return {
    ...node,
    children,
  };
}

function findNodeBySourcePath(node, sourcePath) {
  if (getNodeSourcePath(node) === sourcePath) return node;

  for (const child of node.children) {
    const match = findNodeBySourcePath(child, sourcePath);
    if (match) return match;
  }

  return null;
}

function rewriteLinkDestination(href, target, fromPath) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  const normalized = normalizeDocsHref(href);

  if (!normalized.startsWith("/")) {
    return href;
  }

  const hashIndex = normalized.indexOf("#");
  const queryIndex = normalized.indexOf("?");
  const suffixIndex =
    hashIndex > -1 && queryIndex > -1
      ? Math.min(hashIndex, queryIndex)
      : hashIndex > -1
        ? hashIndex
        : queryIndex > -1
          ? queryIndex
          : normalized.length;

  const pathname = normalized.slice(0, suffixIndex);
  const suffix = normalized.slice(suffixIndex);
  const sourcePath = pathname.slice(1);

  if (!sourcePath.endsWith(".md")) {
    return href;
  }

  if (!target.includeSourcePath(sourcePath)) {
    return null;
  }

  const mappedPath = target.mapSourcePath(sourcePath);
  if (!mappedPath) {
    return null;
  }

  const fromDir =
    path.posix.dirname(fromPath) === "." ? "" : path.posix.dirname(fromPath);
  const relative =
    path.posix.relative(fromDir || ".", mappedPath) || mappedPath;
  return `${relative}${suffix}`;
}

function rewriteLinks(text, target, fromPath) {
  return text.replace(
    /(!?)\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, bang, label, href) => {
      const rewrittenHref = rewriteLinkDestination(href, target, fromPath);
      if (rewrittenHref === null) {
        return bang ? `![${label}]` : label;
      }
      return `${bang}[${label}](${rewrittenHref})`;
    },
  );
}

function rewriteContent(text, target, fromPath) {
  return rewriteLinks(
    text.replace(/^> Documentation index:.*\n?/gm, ""),
    target,
    fromPath,
  );
}

function renderNode(
  node,
  target,
  { levelOffset = 0, fromPath = "SKILL.md" } = {},
) {
  const lines = [];

  if (node.heading) {
    const level = Math.max(1, Math.min(6, node.level + levelOffset));
    const headingText = rewriteContent(node.heading, target, fromPath).replace(
      /^#{1,6}/,
      "#".repeat(level),
    );
    lines.push(headingText, "");
  }

  const contentLines = trimBlankLines(
    node.contentLines
      .filter((line) => !isBulletLine(line))
      .map((line) => rewriteContent(line, target, fromPath)),
  );
  if (contentLines.length > 0) {
    lines.push(...contentLines, "");
  }

  for (const child of node.children) {
    const renderedChild = renderNode(child, target, { levelOffset, fromPath });
    if (renderedChild) {
      lines.push(renderedChild);
    }
  }

  return lines.join("\n");
}

function createFrontmatter(target) {
  return `---
name: ${target.name}
description: ${target.description}
---

`;
}

function generateTenzirSkillMd(sitemapRoot, target) {
  const titleNode = sitemapRoot.children.find((child) => child.level === 1);
  if (!titleNode) {
    throw new Error("Could not find the sitemap title in dist/sitemap.md.");
  }

  const filteredTitleNode = {
    ...titleNode,
    children: titleNode.children
      .map((section) => {
        const sectionName = extractHeadingText(section.heading ?? "");
        const maxDepth = sectionName ? SECTION_MAX_LEVEL[sectionName] : null;
        if (!maxDepth) return null;
        return filterNode(section, {
          includeSourcePath: target.includeSourcePath,
          maxDepth,
        });
      })
      .filter(Boolean),
  };

  return `${createFrontmatter(target)}${renderNode(filteredTitleNode, target).replace(/\n{3,}/g, "\n\n")}`;
}

function generateOcsfSkillMd(sitemapRoot, target) {
  const ocsfNode = findNodeBySourcePath(sitemapRoot, `${OCSF_ROOT}.md`);
  if (!ocsfNode) {
    throw new Error("Could not find the OCSF section in dist/sitemap.md.");
  }

  const renderedOcsfNode = renderNode(ocsfNode, target, {
    levelOffset: -2,
    fromPath: "SKILL.md",
  }).replace(/\n{3,}/g, "\n\n");

  const intro = [
    "# OCSF Documentation Map",
    "",
    "Open Cybersecurity Schema Framework reference extracted from the Tenzir documentation.",
    "",
  ].join("\n");

  return `${createFrontmatter(target)}${intro}${renderedOcsfNode}`;
}

function collectMarkdownFiles(dir, rootDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath, rootDir));
      continue;
    }

    if (!entry.name.endsWith(".md")) continue;

    files.push(normalizeRelativePath(path.relative(rootDir, fullPath)));
  }

  return files;
}

function writeSkillFiles(distPath, outputDir, target, sourcePaths) {
  let count = 0;

  for (const sourcePath of sourcePaths) {
    const destPath = target.mapSourcePath(sourcePath);
    if (!destPath) continue;

    const sourceFile = path.join(distPath, sourcePath);
    const destFile = path.join(outputDir, destPath);
    const content = fs.readFileSync(sourceFile, "utf-8");
    const rewritten = rewriteContent(content, target, destPath);

    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.writeFileSync(destFile, rewritten);
    count++;
  }

  return count;
}

function fmt(n) {
  return n.toLocaleString("en-US");
}

export function buildSkills({ cwd = process.cwd() } = {}) {
  const distPath = path.join(cwd, "dist");
  const sitemapPath = path.join(distPath, "sitemap.md");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      "dist/ directory not found. Run 'bun run build:full' first.",
    );
  }

  if (!fs.existsSync(sitemapPath)) {
    throw new Error(
      "dist/sitemap.md not found. Run 'bun run build:full' first.",
    );
  }

  const sitemap = fs.readFileSync(sitemapPath, "utf-8");
  const sitemapRoot = parseHeadingTree(sitemap);
  const markdownFiles = collectMarkdownFiles(distPath).filter(
    (filePath) => filePath !== "sitemap.md",
  );

  const results = [];

  for (const target of SKILL_TARGETS) {
    const outputDir = path.join(cwd, target.name);
    const sourcePaths = markdownFiles.filter((filePath) =>
      target.includeSourcePath(filePath),
    );

    if (sourcePaths.length === 0) {
      throw new Error(
        `No markdown files found for the '${target.name}' skill.`,
      );
    }

    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    const skillMd =
      target.name === "tenzir"
        ? generateTenzirSkillMd(sitemapRoot, target)
        : generateOcsfSkillMd(sitemapRoot, target);
    const skillPath = path.join(outputDir, "SKILL.md");
    fs.writeFileSync(skillPath, skillMd);

    const fileCount = writeSkillFiles(distPath, outputDir, target, sourcePaths);
    const tokens = Math.round(skillMd.length / 4);

    console.warn(
      `Generated ${target.name}/SKILL.md (${fmt(skillMd.length)} chars, ~${fmt(tokens)} tokens)`,
    );
    console.warn(`Copied ${fmt(fileCount)} markdown files to ${target.name}/`);
    console.warn(`Validate with: skills-ref validate ${target.name}\n`);

    results.push({
      name: target.name,
      outputDir,
      fileCount,
      tokens,
    });
  }

  return results;
}

function main() {
  const results = buildSkills();
  for (const result of results) {
    console.warn(`Skill ready at: ${result.outputDir}/`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main();
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
