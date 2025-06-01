import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Function to recursively find all .md, .mdx, and .mdoc files in a directory
function findMarkdownFiles(dir, baseDir) {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, baseDir));
    } else if (
      item.endsWith(".md") ||
      item.endsWith(".mdx") ||
      item.endsWith(".mdoc")
    ) {
      const relativePath = relative(baseDir, fullPath);
      files.push(relativePath.replace(/\.(md|mdx|mdoc)$/, ""));
    }
  }

  return files;
}

// Generate all redirects for the documentation
export function generateRedirects() {
  const redirects = {};

  // Static redirects
  redirects["/overview"] = "/";
  redirects["/discord"] = "https://discord.gg/xqbDgVTCxZ";
  redirects["/sbom"] =
    "https://github.com/tenzir/tenzir/releases/latest/download/tenzir.spdx.json";

  // Dynamically discover all operator and function pages
  const operatorsDir = "./src/content/docs/reference/operators";
  const functionsDir = "./src/content/docs/reference/functions";

  const operatorPages = findMarkdownFiles(operatorsDir, operatorsDir);
  const functionPages = findMarkdownFiles(functionsDir, functionsDir);

  // Add operator redirects
  operatorPages.forEach((page) => {
    redirects[`/tql2/operators/${page}`] = `/reference/operators/${page}`;
  });

  // Add function redirects
  functionPages.forEach((page) => {
    redirects[`/tql2/functions/${page}`] = `/reference/functions/${page}`;
  });

  return redirects;
}
