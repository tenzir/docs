/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { parse } from "node-html-parser";
import { fileURLToPath } from "url"; // Convert URL to path

let originalSVGs = new Map(); // Stores full paths of `src/content/` SVGs

/**
 * Collects original `src/content/` SVG filenames **with full paths** before
 * Astro builds them.
 */
function collectOriginalSVGs() {
  const contentDir = path.join(process.cwd(), "src/content");
  if (!fs.existsSync(contentDir)) return;

  function scanDir(dir) {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith(".svg")) {
        originalSVGs.set(file, fullPath); // Store full path mapped by filename
      }
    }
  }

  scanDir(contentDir);
  console.log(`📁 Found ${originalSVGs.size} SVGs in src/content/`);
}

/**
 * Modifies all built HTML files in `dist/` to inline only `src/content/` SVGs.
 */
function inlineSVGsInBuiltPages(dir) {
  const htmlFiles = findHtmlFiles(dir);
  let totalInlined = 0;
  for (const file of htmlFiles) {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, "utf8");

    const { html: newHtml, count } = inlineSVGsInHTML(html);
    totalInlined += count;
    fs.writeFileSync(filePath, newHtml, "utf8");
  }
  console.log(`✅ Inlined ${totalInlined} SVGs`);
}

/**
 * Finds all HTML files inside `dist/`.
 */
function findHtmlFiles(dir) {
  let results = [];
  function readDir(subdir) {
    const files = fs.readdirSync(subdir);
    for (const file of files) {
      const fullPath = path.join(subdir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        readDir(fullPath);
      } else if (file.endsWith(".html")) {
        results.push(path.relative(dir, fullPath));
      }
    }
  }
  readDir(dir);
  return results;
}

/**
 * Parses HTML and replaces `<img src="*.svg">` with inline `<svg>`, but only
 * for `src/content/` SVGs.
 */
function inlineSVGsInHTML(html) {
  const root = parse(html);
  let inlinedCount = 0;

  root.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");

    if (src && src.includes("/_astro/") && src.endsWith(".svg")) {
      const baseName = extractBaseFilename(src);

      // ✅ Check if this `_astro/` file came from `src/content/`
      if (!originalSVGs.has(baseName)) {
        return;
      }

      const originalSVG = originalSVGs.get(baseName);
      const svgContent = loadSVG(originalSVG);
      if (svgContent) {
        const svgNode = parse(svgContent).querySelector("svg");

        if (svgNode) {
          // Copy attributes from <img> to <svg>
          ["width", "height", "alt", "class"].forEach((attr) => {
            if (img.hasAttribute(attr)) {
              svgNode.setAttribute(attr, img.getAttribute(attr));
            }
          });

          // Ensure SVG has the correct class for styling
          const existingClass = svgNode.getAttribute("class") || "";
          svgNode.setAttribute("class", `inline-svg ${existingClass}`.trim());

          // Replace <img> with inline <svg>
          img.replaceWith(svgNode);
          inlinedCount++;
        }
      }
    }
  });

  return { html: root.toString(), count: inlinedCount };
}

/**
 * Extracts the **original filename** from an Astro-hashed `_astro/` filename.
 */
function extractBaseFilename(svgPath) {
  const base = path.basename(svgPath);
  // Match everything before the Astro hash
  // This handles filenames with multiple dots like "delay.excalidraw.svg"
  const match = base.match(/^(.+?)\.([A-Za-z0-9_-]+)\.svg$/);
  return match ? match[1] + ".svg" : base;
}

/**
 * Loads the correct SVG file from `src/content/`.
 */
function loadSVG(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }

    console.warn(`⚠️ SVG not found in src/content/: ${filePath}`);
    return null;
  } catch (error) {
    console.warn(`❌ Failed to load SVG: ${filePath}`, error);
    return null;
  }
}

export default function inlineSVGsPlugin() {
  return {
    name: "astro-inline-svg",
    hooks: {
      "astro:config:setup": () => {
        console.log("🔍 Collecting original SVG filenames...");
        collectOriginalSVGs();
      },
      "astro:build:done": async ({ dir }) => {
        const distPath = fileURLToPath(dir);
        console.log(`🔄 Inlining SVGs in built HTML at ${distPath}`);
        inlineSVGsInBuiltPages(distPath);
      },
    },
  };
}
