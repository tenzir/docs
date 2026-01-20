#!/usr/bin/env node

/**
 * Generates the full Tenzir Agent Skill with progressive disclosure.
 *
 * Output structure:
 *   tenzir/
 *   ├── SKILL.md           # Condensed sitemap with first-paragraph excerpts
 *   ├── guides/            # Full documentation hierarchy
 *   ├── tutorials/
 *   └── ...
 *
 * Requires:
 *   - dist/ directory with sitemap.md (run 'bun run build:full')
 *
 * The enhanced sitemap.md now contains:
 *   - YAML frontmatter
 *   - Section descriptions
 *   - Page descriptions (first paragraphs)
 *   - H2/H3 bullet lists (internal structure)
 *
 * This script:
 *   - Rewrites URLs to relative paths
 *   - Filters depth per section (Reference stops at level 3)
 *   - Strips H2/H3 bullet lists (keeps only headings + descriptions)
 *   - Copies markdown files for offline access
 */

import fs from "node:fs";
import path from "node:path";

const SKILL_NAME = "tenzir";

// Max heading level to include per section
// ## = level 2 (section header), ### = level 3, #### = level 4
// "2 levels" means ### + #### (levels 3-4), "1 level" means ### only (level 3)
const SECTION_MAX_LEVEL = {
  Guides: 4, // 2 levels: ### categories + #### children
  Tutorials: 4, // 2 levels
  Explanations: 4, // 2 levels
  Integrations: 4, // 2 levels
  Reference: 3, // 1 level: ### only (has its own progressive disclosure)
};

function rewriteLink(text) {
  return text.replace(/https:\/\/docs\.tenzir\.com\//g, "");
}

function getHeadingLevel(line) {
  const match = line.match(/^(#{2,6})\s/);
  return match ? match[1].length : 0;
}

function extractSectionName(line) {
  const linkMatch = line.match(/^#{2,6}\s+\[([^\]]+)\]/);
  if (linkMatch) return linkMatch[1];

  const plainMatch = line.match(/^#{2,6}\s+(.+)$/);
  if (plainMatch) return plainMatch[1];

  return null;
}

function isBulletLine(line) {
  return line.startsWith("- ") || line.startsWith("  - ");
}

function validateMarkdownFilesExist(sitemapPath, distPath) {
  const sitemap = fs.readFileSync(sitemapPath, "utf-8");
  const lines = sitemap.split("\n");

  // Extract first page link to check if .md files exist
  for (const line of lines) {
    const match = line.match(/\]\((https:\/\/docs\.tenzir\.com\/[^)]+\.md)\)/);
    if (match) {
      const relativePath = match[1].replace("https://docs.tenzir.com/", "");
      const filePath = path.join(distPath, relativePath);
      return fs.existsSync(filePath);
    }
  }
  return false;
}

/**
 * Generate SKILL.md from enhanced sitemap.md
 *
 * The enhanced sitemap already contains:
 * - YAML frontmatter
 * - Intro text
 * - Section descriptions
 * - Page descriptions (first paragraphs)
 * - H2/H3 bullet lists
 *
 * This function:
 * - Rewrites URLs to relative paths
 * - Filters depth per section
 * - Strips H2/H3 bullet lists (keeps headings + descriptions)
 */
function generateSkillMd(sitemapPath) {
  const sitemap = fs.readFileSync(sitemapPath, "utf-8");
  const lines = sitemap.split("\n");

  const output = [];
  let currentSection = null;
  let maxDepth = 0;
  const seenSections = new Set();
  let skipUntilNextHeading = false;

  for (const line of lines) {
    // Skip bullet lists (H2/H3 internal structure)
    if (isBulletLine(line)) continue;

    const level = getHeadingLevel(line);

    // Handle non-heading lines
    if (level === 0) {
      // Skip content following filtered headings
      if (skipUntilNextHeading) continue;

      // Rewrite URLs in any line
      output.push(rewriteLink(line));
      continue;
    }

    // Reset skip flag when we hit any heading
    skipUntilNextHeading = false;

    // Level 2: section headers (## Guides, ## Reference, etc.)
    if (level === 2) {
      const sectionName = extractSectionName(line);

      if (!sectionName || seenSections.has(sectionName)) continue;
      if (!SECTION_MAX_LEVEL[sectionName]) continue;

      seenSections.add(sectionName);
      currentSection = sectionName;
      maxDepth = SECTION_MAX_LEVEL[sectionName];

      output.push(rewriteLink(line));
      continue;
    }

    if (!currentSection) continue;

    // Filter by depth - skip this heading AND its content
    if (level > maxDepth) {
      skipUntilNextHeading = true;
      continue;
    }

    const processedLine = rewriteLink(line);
    if (output.includes(processedLine)) continue;

    output.push(processedLine);
  }

  // Clean up: remove consecutive blank lines
  let result = output.join("\n");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
}

function copyMarkdownFiles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;

  let count = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      count += copyMarkdownFiles(srcPath, destPath);
    } else if (entry.name.endsWith(".md")) {
      // Copy and rewrite URLs
      let content = fs.readFileSync(srcPath, "utf-8");
      content = rewriteLink(content);
      fs.writeFileSync(destPath, content);
      count++;
    }
  }

  return count;
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      removeEmptyDirs(path.join(dir, entry.name));
    }
  }

  // Check again after recursive cleanup
  const remaining = fs.readdirSync(dir);
  if (remaining.length === 0) {
    fs.rmdirSync(dir);
  }
}

// Main
const cwd = process.cwd();
const distPath = path.join(cwd, "dist");
const sitemapPath = path.join(distPath, "sitemap.md");
const outputDir = path.join(cwd, SKILL_NAME);
const contentDir = outputDir;

// Check prerequisites
if (!fs.existsSync(distPath)) {
  console.error(`Error: dist/ directory not found`);
  console.error("Run 'bun run build:full' first.");
  process.exit(1);
}

if (!fs.existsSync(sitemapPath)) {
  console.error(`Error: dist/sitemap.md not found`);
  console.error("Run 'bun run build:full' first.");
  process.exit(1);
}

// Check that per-page markdown files exist
if (!validateMarkdownFilesExist(sitemapPath, distPath)) {
  console.error(`Error: Per-page markdown files not found in dist/`);
  console.error("Run 'bun run build:full' first to generate them.");
  process.exit(1);
}

// Clean and create output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(contentDir, { recursive: true });

// Generate SKILL.md from enhanced sitemap
const skillMd = generateSkillMd(sitemapPath);
const skillPath = path.join(outputDir, "SKILL.md");
fs.writeFileSync(skillPath, skillMd);

const tokens = Math.round(skillMd.length / 4);
const fmt = (n) => n.toLocaleString("en-US");
console.warn(
  `Generated ${SKILL_NAME}/SKILL.md (${fmt(skillMd.length)} chars, ~${fmt(tokens)} tokens)`,
);

// Copy and rewrite reference files
const fileCount = copyMarkdownFiles(distPath, contentDir);
removeEmptyDirs(contentDir);

console.warn(`Copied ${fmt(fileCount)} markdown files to ${SKILL_NAME}/`);
console.warn(`\nSkill ready at: ${outputDir}/`);
console.warn(`Validate with: skills-ref validate ${SKILL_NAME}`);
