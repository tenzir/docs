#!/usr/bin/env node

/**
 * Generates the full Tenzir Agent Skill with progressive disclosure.
 *
 * Output structure:
 *   tenzir/
 *   ├── SKILL.md           # Condensed sitemap with first-paragraph excerpts
 *   └── references/        # Full documentation hierarchy
 *
 * Requires:
 *   - dist/ directory with sitemap.md (run 'LLMS_TXT=true pnpm build')
 */

import fs from "fs";
import path from "path";

const SKILL_NAME = "tenzir";

const FRONTMATTER = `---
name: ${SKILL_NAME}
description: >
  The complete Tenzir documentation. Covers deployment, configuration,
  the Tenzir Query Language (TQL), operators, functions, formats,
  connectors, integrations, and the Tenzir Platform.
license: CC-BY-4.0
metadata:
  author: tenzir
  docs: https://docs.tenzir.com
---`;

const INTRO = `# Tenzir Documentation

Tenzir is a data pipeline engine for security teams. Run pipelines to collect,
parse, transform, and route security data. Deploy nodes on-prem or in the cloud,
and manage them via the Tenzir Platform.`;

const SECTION_DESCRIPTIONS = {
  Guides: `Practical step-by-step explanations to help you achieve a specific goal.
Start here when you're trying to get something done.`,
  Tutorials: `Learning-oriented lessons that take you through a series of steps.
Start here when you want to get started with Tenzir.`,
  Explanations: `Big-picture explanations of higher-level concepts.
Start here to build understanding of a particular topic.`,
  Reference: `Nitty-gritty technical descriptions of how Tenzir works.
Start here when you need detailed information about building blocks.`,
  Integrations: `Turn-key packages and native connectors for security tools.
Start here to connect Tenzir with Splunk, Elastic, CrowdStrike, etc.`,
};

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
  return text.replace(/https:\/\/docs\.tenzir\.com\//g, "references/");
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

function extractLinkPath(line) {
  const match = line.match(/\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

/**
 * Extract the first paragraph from a markdown file.
 * Skips frontmatter, title, and import statements.
 */
function extractDescription(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let inFrontmatter = false;
  let foundTitle = false;
  let paragraph = [];

  for (const line of lines) {
    // Skip frontmatter
    if (line.trim() === "---") {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) continue;

    // Skip import statements
    if (line.startsWith("import ")) continue;

    // Skip the title (first heading)
    if (!foundTitle && line.startsWith("# ")) {
      foundTitle = true;
      continue;
    }

    // Skip empty lines before content
    if (paragraph.length === 0 && line.trim() === "") continue;

    // Skip headings, code blocks, lists, images, components, blockquotes, admonitions
    if (line.startsWith("#")) break;
    if (line.startsWith("```")) break;
    if (line.startsWith("- ") || line.startsWith("* ")) break;
    if (line.startsWith("![")) break;
    if (line.startsWith("<")) break;
    if (line.startsWith(">")) continue; // Skip blockquotes (often frontmatter descriptions)
    if (line.startsWith(":::")) continue; // Skip admonitions
    if (line.match(/^\d+\.\s/)) break;

    // End of paragraph
    if (line.trim() === "" && paragraph.length > 0) break;

    paragraph.push(line.trim());
  }

  if (paragraph.length === 0) return null;

  // Join the full paragraph
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

function generateSkillMd(sitemapPath, distPath) {
  const sitemap = fs.readFileSync(sitemapPath, "utf-8");
  const lines = sitemap.split("\n");

  const output = [];
  output.push(FRONTMATTER);
  output.push("");
  output.push(INTRO);

  let currentSection = null;
  let maxDepth = 0;
  let seenSections = new Set();

  for (const line of lines) {
    const level = getHeadingLevel(line);

    if (level === 0) continue;

    if (level === 2) {
      const sectionName = extractSectionName(line);

      if (!sectionName || seenSections.has(sectionName)) continue;
      if (!SECTION_DESCRIPTIONS[sectionName]) continue;

      seenSections.add(sectionName);
      currentSection = sectionName;
      maxDepth = SECTION_MAX_LEVEL[sectionName] || 3;

      // Add blank line before ## section (INTRO already ends with newline for first)
      output.push("");
      output.push(rewriteLink(line));
      output.push(SECTION_DESCRIPTIONS[sectionName]);
      continue;
    }

    if (!currentSection) continue;
    if (level > maxDepth) continue;

    const processedLine = rewriteLink(line);
    if (output.includes(processedLine)) continue;

    // Add blank line before ### headings
    if (level === 3) {
      output.push("");
      output.push(processedLine);

      // Add description for ### headings (categories)
      const linkPath = extractLinkPath(line);
      if (linkPath) {
        // Convert URL to dist path (https://docs.tenzir.com/foo.md -> dist/foo.md)
        const relativePath = linkPath.replace("https://docs.tenzir.com/", "");
        const filePath = path.join(distPath, relativePath);
        const desc = extractDescription(filePath);
        if (desc) {
          output.push(desc);
        }
      }
    } else {
      // For #### headings - add blank line before for readability
      output.push("");
      output.push(processedLine);

      // Add brief description (1 sentence) for #### headings
      const linkPath = extractLinkPath(line);
      if (linkPath) {
        const relativePath = linkPath.replace("https://docs.tenzir.com/", "");
        const filePath = path.join(distPath, relativePath);
        const desc = extractDescription(filePath);
        if (desc) {
          output.push(desc);
        }
      }
    }
  }

  return output.join("\n");
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
const referencesDir = path.join(outputDir, "references");

// Check prerequisites
if (!fs.existsSync(distPath)) {
  console.error(`Error: dist/ directory not found`);
  console.error("Run 'LLMS_TXT=true pnpm build' first.");
  process.exit(1);
}

if (!fs.existsSync(sitemapPath)) {
  console.error(`Error: dist/sitemap.md not found`);
  console.error("Run 'LLMS_TXT=true pnpm build' first.");
  process.exit(1);
}

// Clean and create output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(referencesDir, { recursive: true });

// Generate SKILL.md
const skillMd = generateSkillMd(sitemapPath, distPath);
const skillPath = path.join(outputDir, "SKILL.md");
fs.writeFileSync(skillPath, skillMd);

const tokens = Math.round(skillMd.length / 4);
const fmt = (n) => n.toLocaleString("en-US");
console.warn(
  `Generated ${SKILL_NAME}/SKILL.md (${fmt(skillMd.length)} chars, ~${fmt(tokens)} tokens)`,
);

// Copy and rewrite reference files
const fileCount = copyMarkdownFiles(distPath, referencesDir);
removeEmptyDirs(referencesDir);

console.warn(
  `Copied ${fmt(fileCount)} markdown files to ${SKILL_NAME}/references/`,
);
console.warn(`\nSkill ready at: ${outputDir}/`);
console.warn(`Validate with: skills-ref validate ${SKILL_NAME}`);
