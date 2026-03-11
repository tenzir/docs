#!/usr/bin/env node
/**
 * Generate markdown bundles from the built `dist/` directory.
 *
 * This intentionally consumes the per-page markdown emitted by the
 * starlight-llms-txt plugin instead of reading raw source files from
 * `src/content/docs`. The built markdown has already rendered MDX/Astro
 * components such as <Guide>, <Op>, <Tabs>, and <FileTree> into plain
 * markdown/links.
 *
 * Usage:
 *   generate-docs.mjs [--input <dir>] [--output <file>] [--bundle-dir <dir>] [--tarball <file>]
 *
 * Examples:
 *   node scripts/generate-docs.mjs
 *   node scripts/generate-docs.mjs --bundle-dir bundle --tarball tenzir-docs.tar.gz
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);

function getArg(name, fallback = undefined) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

const inputDir = getArg("--input", "dist");
const outputFile = getArg("--output", "tenzir-docs.md");
const requestedBundleDir = getArg("--bundle-dir");
const tarballFile = getArg("--tarball");

const SECTION_ORDER = [
  ["guides", "Guides"],
  ["tutorials", "Tutorials"],
  ["explanations", "Explanations"],
  ["reference", "Reference"],
  ["integrations", "Integrations"],
];

function resolveFromCwd(targetPath) {
  return path.isAbsolute(targetPath)
    ? targetPath
    : path.join(process.cwd(), targetPath);
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function walkMarkdownFiles(rootDir) {
  const result = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        result.push(fullPath);
      }
    }
  }

  await walk(rootDir);
  result.sort();
  return result;
}

function normalizeBundleRelativePath(relativePath) {
  return relativePath === ".md" ? "index.md" : relativePath;
}

function rewriteSitemapLinks(content) {
  return content
    .replace(/https:\/\/docs\.tenzir\.com\//g, "")
    .replace(/^> Last updated:.*\n?/m, "");
}

function demoteHeadings(content, amount = 1) {
  if (amount <= 0) return content;
  return content.replace(/^(#{1,6})\s/gm, (_match, hashes) => {
    const newLevel = Math.min(hashes.length + amount, 6);
    return `${"#".repeat(newLevel)} `;
  });
}

async function copyMarkdownBundle(sourceDir, bundleDir) {
  const markdownFiles = await walkMarkdownFiles(sourceDir);
  let copied = 0;

  for (const file of markdownFiles) {
    const relativePath = normalizeBundleRelativePath(
      path.relative(sourceDir, file),
    );

    if (relativePath === "sitemap.md") continue;

    const targetPath = path.join(bundleDir, relativePath);
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(file, targetPath);
    copied++;
  }

  const sitemapPath = path.join(sourceDir, "sitemap.md");
  if (await exists(sitemapPath)) {
    const sitemap = await fs.readFile(sitemapPath, "utf8");
    await fs.writeFile(
      path.join(bundleDir, "sitemap.md"),
      rewriteSitemapLinks(sitemap),
    );
  }

  return copied;
}

async function generateSingleFile(bundleDir, outputPath) {
  const sections = [
    "# Tenzir Documentation",
    "",
    "> Auto-generated from https://docs.tenzir.com",
    "",
  ];

  for (const [sectionDir, title] of SECTION_ORDER) {
    const absoluteSectionDir = path.join(bundleDir, sectionDir);
    if (!(await exists(absoluteSectionDir))) continue;

    sections.push(`# ${title}`, "");

    const files = await walkMarkdownFiles(absoluteSectionDir);
    for (const file of files) {
      const content = await fs.readFile(file, "utf8");
      sections.push(demoteHeadings(content, 1).trimEnd(), "", "---", "");
    }
  }

  await fs.writeFile(outputPath, `${sections.join("\n").trimEnd()}\n`);
}

async function createTarball(bundleDir, tarballPath) {
  const result = spawnSync("tar", ["-czf", tarballPath, "-C", bundleDir, "."], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`tar failed with exit code ${result.status ?? 1}`);
  }
}

async function main() {
  const absoluteInputDir = resolveFromCwd(inputDir);
  const absoluteOutputFile = resolveFromCwd(outputFile);
  const absoluteTarballFile = tarballFile ? resolveFromCwd(tarballFile) : null;
  const absoluteBundleDir = requestedBundleDir
    ? resolveFromCwd(requestedBundleDir)
    : await fs.mkdtemp(path.join(os.tmpdir(), "tenzir-docs-bundle-"));
  const removeBundleDirAfterwards = !requestedBundleDir;

  if (!(await exists(absoluteInputDir))) {
    throw new Error(
      `Input directory does not exist: ${absoluteInputDir}\nBuild the site first, for example with:\n  LLMS_TXT=true bun run astro build`,
    );
  }

  const builtMarkdown = await walkMarkdownFiles(absoluteInputDir);
  if (builtMarkdown.length === 0) {
    throw new Error(
      `No markdown files found in ${absoluteInputDir}.\nBuild the site first with LLMS_TXT enabled so per-page markdown is generated.`,
    );
  }

  console.log(
    `Reading built markdown from ${path.relative(process.cwd(), absoluteInputDir) || "."}...`,
  );

  await fs.rm(absoluteBundleDir, { recursive: true, force: true });
  await ensureDir(absoluteBundleDir);

  const copied = await copyMarkdownBundle(absoluteInputDir, absoluteBundleDir);
  if (copied === 0) {
    throw new Error(
      `No per-page markdown files found in ${absoluteInputDir}.\nBuild the site first with LLMS_TXT enabled so per-page markdown is generated.`,
    );
  }

  await ensureDir(path.dirname(absoluteOutputFile));
  await generateSingleFile(absoluteBundleDir, absoluteOutputFile);

  if (absoluteTarballFile) {
    await ensureDir(path.dirname(absoluteTarballFile));
    await createTarball(absoluteBundleDir, absoluteTarballFile);
  }

  console.log(
    `Copied ${copied} markdown file(s) into ${path.relative(process.cwd(), absoluteBundleDir) || absoluteBundleDir}`,
  );
  console.log(
    `Generated ${path.relative(process.cwd(), absoluteOutputFile) || absoluteOutputFile}`,
  );
  if (absoluteTarballFile) {
    console.log(
      `Generated ${path.relative(process.cwd(), absoluteTarballFile) || absoluteTarballFile}`,
    );
  }

  if (removeBundleDirAfterwards) {
    await fs.rm(absoluteBundleDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(
    "Error generating docs bundle:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
