#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Generate SVG files from Excalidraw source files.
 *
 * Usage:
 *   node scripts/generate-excalidraw-svgs.mjs
 *   pnpm generate:excalidraw
 *
 * Converts all .excalidraw files in src/content/ to .svg files.
 * Naming: foo.excalidraw -> foo.svg
 *
 * Skips conversion if SVG is newer than source (incremental builds).
 */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup DOM environment for @excalidraw/utils before importing it.
// The @excalidraw/utils package is designed for browser environments and expects
// DOM APIs (window, document, DOMParser, XMLSerializer, etc.) to be globally
// available. We use jsdom to simulate these APIs in Node.js. This approach is
// necessary because:
// 1. exportToSvg() internally creates DOM elements and manipulates them
// 2. The package checks for browser globals at import time
// 3. There's no official Node.js-native alternative
//
// Note: We use @excalidraw/utils@0.1.3-test32 because stable releases had bugs
// with font embedding. Track https://github.com/excalidraw/excalidraw/issues
// for stable release availability.
import { JSDOM } from "jsdom";
import { Crypto } from "@peculiar/webcrypto";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

// Set up globals that Excalidraw expects.
// Use Object.defineProperty for properties that may be read-only.
Object.defineProperty(global, "window", {
  value: dom.window,
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "document", {
  value: dom.window.document,
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "navigator", {
  value: dom.window.navigator,
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "DOMParser", {
  value: dom.window.DOMParser,
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "XMLSerializer", {
  value: dom.window.XMLSerializer,
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "crypto", {
  value: new Crypto(),
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "devicePixelRatio", {
  value: 1,
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "fetch", {
  value: globalThis.fetch,
  writable: true,
  configurable: true,
});

// FontFace polyfill for font embedding
class FontFacePolyfill {
  constructor(family, source, descriptors = {}) {
    this.family = family;
    this.source = source;
    this.descriptors = descriptors;
    this.status = "unloaded";
  }
  async load() {
    this.status = "loaded";
    return this;
  }
}

Object.defineProperty(global, "FontFace", {
  value: FontFacePolyfill,
  writable: true,
  configurable: true,
});

// Add TextEncoder/TextDecoder if not present
if (!global.TextEncoder) {
  global.TextEncoder = dom.window.TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = dom.window.TextDecoder;
}

// Now we can import @excalidraw/utils
const { exportToSvg } = await import("@excalidraw/utils");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT_DIR, "src/content");

/**
 * Find all .excalidraw files recursively in a directory.
 */
async function findExcalidrawFiles(dir) {
  const results = [];
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".excalidraw")) {
        results.push(fullPath);
      }
    }
  }
  await walk(dir);
  return results;
}

/**
 * Get the output SVG path for an Excalidraw file.
 * foo.excalidraw -> foo.excalidraw.svg
 *
 * This naming convention allows gitignoring all generated SVGs with *.excalidraw.svg
 */
function getSvgPath(excalidrawPath) {
  return excalidrawPath + ".svg";
}

/**
 * Check if SVG needs regeneration based on timestamps.
 */
async function needsRegeneration(excalidrawPath, svgPath) {
  try {
    const [excalidrawStat, svgStat] = await Promise.all([
      fs.stat(excalidrawPath),
      fs.stat(svgPath),
    ]);
    return excalidrawStat.mtime > svgStat.mtime;
  } catch {
    return true; // SVG doesn't exist
  }
}

/**
 * Convert a single .excalidraw file to SVG.
 */
async function convertToSvg(excalidrawPath) {
  const content = await fs.readFile(excalidrawPath, "utf-8");
  const data = JSON.parse(content);

  // Filter out deleted elements
  const elements = (data.elements || []).filter((el) => !el.isDeleted);

  const svg = await exportToSvg({
    elements,
    appState: {
      ...data.appState,
      exportBackground: false, // Transparent background
      exportWithDarkMode: false,
    },
    files: data.files || {},
  });

  return svg.outerHTML;
}

/**
 * Main generation function.
 */
async function generateSvgs() {
  if (!fsSync.existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  console.log("Scanning for .excalidraw files...");
  const excalidrawFiles = await findExcalidrawFiles(CONTENT_DIR);

  if (excalidrawFiles.length === 0) {
    console.log("No .excalidraw files found.");
    return;
  }

  console.log(`Found ${excalidrawFiles.length} .excalidraw file(s)`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const excalidrawPath of excalidrawFiles) {
    const svgPath = getSvgPath(excalidrawPath);
    const relativePath = path.relative(ROOT_DIR, excalidrawPath);
    const relativeSvgPath = path.relative(ROOT_DIR, svgPath);

    if (!(await needsRegeneration(excalidrawPath, svgPath))) {
      skipped++;
      continue;
    }

    try {
      console.log(`  Converting: ${relativePath} -> ${relativeSvgPath}`);
      const svgContent = await convertToSvg(excalidrawPath);
      await fs.writeFile(svgPath, svgContent, "utf-8");
      generated++;
    } catch (error) {
      console.error(`  Error converting ${relativePath}:`, error.message);
      errors++;
    }
  }

  console.log(
    `Done: ${generated} generated, ${skipped} skipped (up to date), ${errors} errors`,
  );

  if (errors > 0) {
    process.exit(1);
  }
}

generateSvgs().catch((err) => {
  console.error("Error generating SVGs:", err);
  process.exit(1);
});
