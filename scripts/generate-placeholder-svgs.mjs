#!/usr/bin/env node

/**
 * Generate placeholder SVGs for Excalidraw source files.
 *
 * Usage:
 *   node scripts/generate-placeholder-svgs.mjs
 *   bun run generate:excalidraw:placeholders
 *
 * Creates placeholder SVGs for any .excalidraw files that don't have
 * corresponding .svg files yet. This allows `bun run dev` to work before
 * running the full generation.
 */

import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT_DIR, "src/content");

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect fill="#f8f9fa" width="100%" height="100%" rx="8"/>
  <rect fill="#e9ecef" x="40" y="60" width="320" height="80" rx="4"/>
  <text x="200" y="95" text-anchor="middle" fill="#495057" font-family="system-ui, sans-serif" font-size="14" font-weight="500">
    Excalidraw diagram placeholder
  </text>
  <text x="200" y="120" text-anchor="middle" fill="#868e96" font-family="system-ui, sans-serif" font-size="12">
    Run: bun run generate:excalidraw
  </text>
</svg>`;

/**
 * Find all .excalidraw files recursively in a directory.
 */
async function findExcalidrawFiles(dir) {
  const results = [];
  for await (const file of fs.glob("**/*.excalidraw", { cwd: dir })) {
    results.push(path.join(dir, file));
  }
  return results;
}

/**
 * Get the output SVG path for an Excalidraw file.
 * foo.excalidraw -> foo.excalidraw.svg
 *
 * This naming convention matches generate-excalidraw-svgs.mjs and allows
 * gitignoring all generated SVGs with *.excalidraw.svg
 */
function getSvgPath(excalidrawPath) {
  return `${excalidrawPath}.svg`;
}

/**
 * Main function to generate placeholders.
 */
async function generatePlaceholders() {
  if (!fsSync.existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  console.log("Scanning for .excalidraw files missing SVGs...");
  const excalidrawFiles = await findExcalidrawFiles(CONTENT_DIR);

  if (excalidrawFiles.length === 0) {
    console.log("No .excalidraw files found.");
    return;
  }

  let created = 0;
  for (const excalidrawPath of excalidrawFiles) {
    const svgPath = getSvgPath(excalidrawPath);
    if (!fsSync.existsSync(svgPath)) {
      const relativePath = path.relative(ROOT_DIR, svgPath);
      console.log(`  Creating placeholder: ${relativePath}`);
      await fs.writeFile(svgPath, PLACEHOLDER_SVG, "utf-8");
      created++;
    }
  }

  if (created === 0) {
    console.log("All SVGs exist, no placeholders needed.");
  } else {
    console.log(`Created ${created} placeholder SVG(s).`);
  }
}

generatePlaceholders().catch((err) => {
  console.error("Error generating placeholders:", err);
  process.exit(1);
});
