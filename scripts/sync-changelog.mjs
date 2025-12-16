#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";

// Load shared project config (icons defined once, used by both sync and topics.ts)
const require = createRequire(import.meta.url);
const changelogProjects = require("../src/changelog-projects.json");

/**
 * Sync changelog from tenzir/news repository.
 *
 * Usage:
 *   node sync-changelog.mjs              # Clone from GitHub
 *   node sync-changelog.mjs <local-path> # Use local clone
 */

/**
 * Parse simple YAML files (config.yaml, manifest.yaml).
 * Handles basic key-value pairs and multiline strings (>-).
 */
function parseYaml(content) {
  const data = {};
  const lines = content.split("\n");
  let currentKey = null;
  let isMultiline = false;
  let multilineValue = "";

  for (const line of lines) {
    // Handle multiline continuation
    if (isMultiline) {
      if (line.startsWith("  ") || line.trim() === "") {
        multilineValue += (multilineValue ? " " : "") + line.trim();
        continue;
      } else {
        data[currentKey] = multilineValue.trim();
        isMultiline = false;
        multilineValue = "";
      }
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && !line.startsWith(" ") && !line.startsWith("-")) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Check for multiline indicator
      if (value === ">-" || value === ">") {
        currentKey = key;
        isMultiline = true;
        multilineValue = "";
        continue;
      }

      // Handle array start
      if (value === "") {
        data[key] = [];
        currentKey = key;
        continue;
      }

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[key] = value;
      currentKey = key;
    } else if (
      line.trim().startsWith("-") &&
      currentKey &&
      Array.isArray(data[currentKey])
    ) {
      const item = line.slice(line.indexOf("-") + 1).trim();
      data[currentKey].push(item);
    }
  }

  // Handle trailing multiline
  if (isMultiline && currentKey) {
    data[currentKey] = multilineValue.trim();
  }

  return data;
}

/**
 * Parse semantic version string into components.
 */
function parseVersion(version) {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    return { major: 0, minor: 0, patch: 0, prerelease: null, raw: version };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    raw: version,
  };
}

/**
 * Convert version to slug format (v5.21.2 -> v5-21-2).
 */
function versionToSlug(version) {
  return version.replace(/\./g, "-");
}

/**
 * Check if a dirent is a directory (follows symlinks).
 */
function isDirectoryEntry(basePath, entry) {
  if (entry.isDirectory()) return true;
  if (entry.isSymbolicLink()) {
    return fsSync.statSync(path.join(basePath, entry.name)).isDirectory();
  }
  return false;
}

/**
 * Compare versions for sorting (newest first, unreleased at top).
 */
function compareVersions(a, b) {
  // Use majorVersion property (Infinity for unreleased) for primary sort
  if (a.majorVersion !== b.majorVersion) return b.majorVersion - a.majorVersion;
  if (a.minorVersion !== b.minorVersion) return b.minorVersion - a.minorVersion;
  if (a.patchVersion !== b.patchVersion) return b.patchVersion - a.patchVersion;

  return 0;
}

/**
 * Read all projects from the news repo.
 * Projects have structure: {project}/changelog/config.yaml
 * Projects may have modules configured via glob pattern.
 */
async function readProjects(newsRepoPath) {
  const projects = [];
  const entries = await fs.readdir(newsRepoPath, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden entries and non-directories
    if (entry.name.startsWith(".") || !isDirectoryEntry(newsRepoPath, entry)) {
      continue;
    }

    // Config is at {project}/changelog/config.yaml
    const configPath = path.join(
      newsRepoPath,
      entry.name,
      "changelog",
      "config.yaml",
    );
    try {
      const configContent = await fs.readFile(configPath, "utf-8");
      const config = parseYaml(configContent);

      if (config.id) {
        const project = {
          id: config.id,
          name: config.name || config.id,
          description: config.description || "",
          repository: config.repository || "",
          components: config.components || [],
          dirName: entry.name,
          modules: [], // Will be populated if modules field exists
        };

        // Check for modules configuration
        if (config.modules) {
          project.modules = await discoverModules(
            newsRepoPath,
            entry.name,
            config.modules,
          );
        }

        projects.push(project);
      }
    } catch {
      // Skip directories without config.yaml
    }
  }

  return projects;
}

/**
 * Discover module changelogs based on glob pattern.
 * @param {string} newsRepoPath - Base path to news repo
 * @param {string} projectDir - Project directory name
 * @param {string} modulesGlob - Glob pattern from config (e.g., "../plugins/wildcard/changelog")
 */
async function discoverModules(newsRepoPath, projectDir, modulesGlob) {
  const modules = [];
  const changelogRoot = path.join(newsRepoPath, projectDir, "changelog");

  // Resolve the glob pattern relative to changelog root
  // Pattern like "../plugins/*/changelog" resolves to {project}/plugins/*/changelog
  const resolvedPattern = path.resolve(changelogRoot, modulesGlob);

  // Extract the base path and wildcard part
  // e.g., /path/to/news/claude-plugins/plugins/*/changelog
  const parts = resolvedPattern.split("*");
  if (parts.length !== 2) {
    console.warn(`  Warning: Unsupported glob pattern: ${modulesGlob}`);
    return modules;
  }

  const basePath = parts[0]; // /path/to/news/claude-plugins/plugins/
  const suffix = parts[1]; // /changelog

  try {
    const dirEntries = await fs.readdir(basePath, { withFileTypes: true });

    for (const dirEntry of dirEntries) {
      // Skip hidden entries and non-directories
      if (
        dirEntry.name.startsWith(".") ||
        !isDirectoryEntry(basePath, dirEntry)
      ) {
        continue;
      }

      const moduleConfigPath = path.join(
        basePath,
        dirEntry.name,
        suffix.replace(/^\//, ""),
        "config.yaml",
      );

      try {
        const configContent = await fs.readFile(moduleConfigPath, "utf-8");
        const config = parseYaml(configContent);

        if (config.id) {
          // Compute changelog path relative to news repo
          const moduleChangelogDir = path.join(
            basePath,
            dirEntry.name,
            suffix.replace(/^\//, ""),
          );
          modules.push({
            id: config.id,
            name: config.name || config.id,
            description: config.description || "",
            repository: config.repository || "",
            components: config.components || [],
            changelogPath: path.relative(newsRepoPath, moduleChangelogDir),
          });
        }
      } catch {
        // Skip modules without valid config
      }
    }
  } catch {
    console.warn(`  Warning: Could not read modules from ${basePath}`);
  }

  // Sort modules alphabetically by id
  modules.sort((a, b) => a.id.localeCompare(b.id));

  return modules;
}

/**
 * Read unreleased changelog entries for a project using tenzir-changelog CLI.
 * @param {string} newsRepoPath - Base path to news repo
 * @param {string} changelogPath - Path to changelog directory (relative to newsRepoPath)
 */
async function readUnreleased(newsRepoPath, changelogPath) {
  const fullChangelogPath = path.join(newsRepoPath, changelogPath);
  const unreleasedPath = path.join(fullChangelogPath, "unreleased");

  try {
    // Check if unreleased directory exists and has entries
    const dirEntries = await fs.readdir(unreleasedPath, {
      withFileTypes: true,
    });
    const mdFiles = dirEntries.filter(
      (e) => e.isFile() && e.name.endsWith(".md"),
    );

    if (mdFiles.length === 0) return null;

    // Run tenzir-changelog to get structured JSON data with explicit links
    const jsonOutput = execSync(
      "uvx tenzir-changelog show --json --explicit-links -",
      {
        cwd: fullChangelogPath,
        encoding: "utf-8",
      },
    ).trim();

    if (!jsonOutput) return null;

    const changelog = JSON.parse(jsonOutput);
    if (!changelog.entries || changelog.entries.length === 0) return null;

    // Extract unique components from all entries
    const components = [
      ...new Set(changelog.entries.flatMap((e) => e.components || [])),
    ];

    // Extract entry types for summary
    const entryTypes = [...new Set(changelog.entries.map((e) => e.type))];

    return {
      version: "Unreleased",
      slug: "unreleased",
      title: "Unreleased",
      created: changelog.created || "",
      intro: changelog.intro || "",
      entries: changelog.entries, // Store raw entries for MDX generation
      majorVersion: Infinity, // Sort to top
      minorVersion: 0,
      patchVersion: 0,
      isUnreleased: true,
      components,
      entryTypes,
      entryCount: changelog.entries.length,
    };
  } catch {
    return null;
  }
}

/**
 * Read all releases for a changelog.
 * @param {string} newsRepoPath - Base path to news repo
 * @param {string} changelogPath - Path to changelog directory (relative to newsRepoPath)
 * @param {string} projectName - Name for release titles
 */
async function readReleases(newsRepoPath, changelogPath, projectName) {
  const releases = [];
  const fullChangelogPath = path.join(newsRepoPath, changelogPath);
  const releasesPath = path.join(fullChangelogPath, "releases");

  // Check for unreleased entries first
  const unreleased = await readUnreleased(newsRepoPath, changelogPath);
  if (unreleased) {
    releases.push(unreleased);
  }

  try {
    const dirEntries = await fs.readdir(releasesPath, { withFileTypes: true });

    for (const dirEntry of dirEntries) {
      if (!dirEntry.isDirectory()) continue;

      const manifestPath = path.join(
        releasesPath,
        dirEntry.name,
        "manifest.yaml",
      );

      try {
        const manifestContent = await fs.readFile(manifestPath, "utf-8");
        const manifest = parseYaml(manifestContent);
        const version = dirEntry.name;
        const parsed = parseVersion(version);

        // Get structured data via JSON export with explicit links
        let entries = [];
        let components = [];
        let entryTypes = [];
        try {
          const jsonOutput = execSync(
            `uvx tenzir-changelog show --json --explicit-links ${version}`,
            { cwd: fullChangelogPath, encoding: "utf-8" },
          ).trim();
          const changelog = JSON.parse(jsonOutput);
          if (changelog.entries) {
            entries = changelog.entries;
            components = [
              ...new Set(changelog.entries.flatMap((e) => e.components || [])),
            ];
            entryTypes = [...new Set(changelog.entries.map((e) => e.type))];
          }
        } catch {
          // JSON export may not be available for older releases
        }

        releases.push({
          version,
          slug: versionToSlug(version),
          title: manifest.title || `${projectName} ${version}`,
          created: manifest.created || "",
          intro: manifest.intro || "",
          entries, // Store raw entries for MDX generation
          majorVersion: parsed.major,
          minorVersion: parsed.minor,
          patchVersion: parsed.patch,
          components,
          entryTypes,
          entryCount: entries.length,
        });
      } catch {
        // Skip releases without required files
      }
    }
  } catch {
    // No releases directory
  }

  // Sort releases by version (newest first, unreleased at top due to Infinity)
  releases.sort(compareVersions);

  return releases;
}

/**
 * Generate badges JSX array string from components.
 * Returns empty string if no components.
 */
function generateBadgesAttr(components) {
  if (!components || components.length === 0) return "";
  const badges = components.map((c) => `"${c}"`);
  return `\n  badges={[${badges.join(", ")}]}`;
}

/**
 * Entry type configuration for rendering.
 */
const entryTypeConfig = {
  breaking: { emoji: "💥", heading: "Breaking Changes", order: 0 },
  feature: { emoji: "🚀", heading: "Features", order: 1 },
  change: { emoji: "🔧", heading: "Changes", order: 2 },
  bugfix: { emoji: "🐞", heading: "Bug Fixes", order: 3 },
};

/**
 * Format author for display.
 * Handles multiple formats:
 * - Markdown link: "[@handle](url)" - passed through unchanged
 * - Object: { handle: "mavam", url: "..." } - converted to link
 * - String handle: "mavam" - prefixed with @
 * - String name: "Full Name" - used as-is
 */
function formatAuthor(author) {
  // Handle string format (including markdown links from --explicit-links)
  if (typeof author === "string") {
    // Already a markdown link - pass through unchanged
    if (author.startsWith("[") && author.includes("](")) {
      return author;
    }
    // Name with spaces - use as-is
    if (author.includes(" ")) {
      return author;
    }
    // Handle - add @ prefix
    return `@${author}`;
  }

  // Handle object format: { handle: "mavam", url: "https://github.com/mavam" }
  if (typeof author === "object" && author !== null) {
    const handle = author.handle || author.name || "unknown";
    const url = author.url;
    // If we have a URL, create a markdown link
    if (url) {
      const displayName = handle.includes(" ") ? handle : `@${handle}`;
      return `[${displayName}](${url})`;
    }
    // No URL - just format the handle
    if (handle.includes(" ")) {
      return handle;
    }
    return `@${handle}`;
  }

  return String(author);
}

/**
 * Format date for display (YYYY-MM-DD -> readable format).
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  // Handle ISO datetime strings
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Render a single changelog entry as markdown.
 */
function renderEntry(entry) {
  let md = `### ${entry.title}\n\n`;

  // Build details line: date · authors · PRs · components (badges)
  const detailParts = [];

  // Date
  if (entry.created) {
    const dateStr = formatDate(entry.created);
    if (dateStr) {
      detailParts.push(dateStr);
    }
  }

  // Authors
  if (entry.authors && entry.authors.length > 0) {
    const formatted = entry.authors.map(formatAuthor).join(", ");
    detailParts.push(formatted);
  }

  // PRs (may be numbers, strings, or objects from --explicit-links)
  if (entry.prs && entry.prs.length > 0) {
    const prLinks = entry.prs
      .map((pr) => {
        // Object format from --explicit-links: { number: 123, url: "..." }
        if (typeof pr === "object" && pr !== null) {
          const num = pr.number || pr.id || "?";
          const url = pr.url;
          return url ? `[#${num}](${url})` : `#${num}`;
        }
        // Already a markdown link string - pass through
        if (typeof pr === "string" && pr.startsWith("[")) {
          return pr;
        }
        // Just a number or string - format as #N
        return `#${pr}`;
      })
      .join(", ");
    detailParts.push(prLinks);
  }

  // Components as badges (last)
  if (entry.components && entry.components.length > 0) {
    const badges = entry.components
      .map((c) => `<span class="badge">${c}</span>`)
      .join(" ");
    detailParts.push(badges);
  }

  if (detailParts.length > 0) {
    md += `<p class="entry-details">${detailParts.join(" · ")}</p>\n\n`;
  }

  // Add body
  if (entry.body) {
    md += `${entry.body}\n\n`;
  }

  return md;
}

/**
 * Generate release notes content from JSON entries.
 */
function generateNotesFromEntries(entries) {
  if (!entries || entries.length === 0) return "";

  // Group entries by type
  const grouped = {};
  for (const entry of entries) {
    const type = entry.type || "change";
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(entry);
  }

  // Sort types by configured order
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const orderA = entryTypeConfig[a]?.order ?? 99;
    const orderB = entryTypeConfig[b]?.order ?? 99;
    return orderA - orderB;
  });

  // Render each section
  let md = "";
  for (const type of sortedTypes) {
    const config = entryTypeConfig[type] || { emoji: "📝", heading: "Other" };
    md += `## ${config.emoji} ${config.heading}\n\n`;

    for (const entry of grouped[type]) {
      md += renderEntry(entry);
    }
  }

  return md;
}

/**
 * Generate MDX content for a release.
 * @param {object} project - Project or module object
 * @param {object} release - Release object
 * @param {object} options - Optional settings
 * @param {string} [options.topicId] - Topic ID for frontmatter
 * @param {string} [options.sidebarLabel] - Custom sidebar label (defaults to version)
 */
function generateMdxContent(project, release, { topicId, sidebarLabel } = {}) {
  const topicLine = topicId ? `\ntopic: ${topicId}` : "";
  const label = sidebarLabel || release.version;

  // Determine if we need LinkCard import (for download link)
  const hasDownloadLink = project.repository && !release.isUnreleased;
  const imports = hasDownloadLink
    ? `\nimport LinkCard from '@components/LinkCard.astro';\n`
    : "";

  const frontmatter = `---
title: "${project.name} ${release.version}"
sidebar:
  label: "${label}"${topicLine}
---
${imports}
`;

  // Add intro paragraph if available
  let content = "";
  if (release.intro) {
    content += release.intro + "\n\n";
  }

  // Generate content from entries if available, otherwise fall back to notes
  if (release.entries && release.entries.length > 0) {
    content += generateNotesFromEntries(release.entries);
  } else if (release.notes) {
    content += release.notes;
  }

  // Add download link if repository is specified (not for unreleased)
  if (hasDownloadLink) {
    const repoUrl = project.repository.startsWith("http")
      ? project.repository
      : `https://github.com/${project.repository}`;
    const downloadUrl = `${repoUrl}/releases/tag/${release.version}`;
    content += `\n<LinkCard
  title="Download on GitHub"
  description="Get the release artifacts and source code."
  href="${downloadUrl}"
  icon="github"
/>\n`;
  }

  return frontmatter + content;
}

/**
 * Group versions by major version.
 * Unreleased entries are kept separate at the top.
 */
function groupVersionsByMajor(releases) {
  const groups = new Map();
  const unreleased = [];

  for (const release of releases) {
    if (release.isUnreleased) {
      unreleased.push(release);
    } else {
      const major = release.majorVersion;
      if (!groups.has(major)) {
        groups.set(major, []);
      }
      groups.get(major).push(release);
    }
  }

  // Convert to array sorted by major version (newest first)
  const result = Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([major, versions]) => ({
      label: `v${major}.x`,
      major,
      versions,
      isUnreleased: false,
    }));

  // Add unreleased at the top if present
  if (unreleased.length > 0) {
    result.unshift({
      label: "Unreleased",
      major: null,
      versions: unreleased,
      isUnreleased: true,
    });
  }

  return result;
}

/**
 * Build sidebar items for a set of releases.
 * @param {string} basePath - URL path prefix (e.g., "changelog/mcp")
 * @param {string} projectName - Name for version group labels
 * @param {Array} releases - Array of release objects
 */
function buildSidebarItems(basePath, projectName, releases) {
  const sidebarItems = [];
  const versionGroups = groupVersionsByMajor(releases);

  for (const group of versionGroups) {
    if (group.isUnreleased) {
      // Unreleased is a standalone link at the top
      sidebarItems.push(`${basePath}/unreleased`);
    } else {
      // Version groups are collapsible, first one expanded
      const isFirst =
        sidebarItems.length === 0 ||
        (sidebarItems.length === 1 && typeof sidebarItems[0] === "string");
      sidebarItems.push({
        label: `${projectName} ${group.label}`,
        collapsed: !isFirst,
        items: group.versions.map((v) => `${basePath}/${v.slug}`),
      });
    }
  }

  return sidebarItems;
}

/**
 * Generate TypeScript sidebar file content with topics.
 * Icons come from changelog-projects.json.
 */
function generateSidebarFile(projects, projectVersions, moduleVersions) {
  const topics = [];
  const topicParents = {};

  for (const project of projects) {
    const releases = projectVersions[project.id] || [];
    const hasModules = project.modules.length > 0;
    const sidebarItems = [];

    if (hasModules) {
      // Add parent project's unreleased entry if any
      const parentUnreleased = releases.find((r) => r.isUnreleased);
      if (parentUnreleased) {
        sidebarItems.push(`changelog/${project.id}/unreleased`);
      }

      // Add each module with flat version list
      for (const mod of project.modules) {
        const moduleReleases = moduleVersions[`${project.id}/${mod.id}`] || [];
        if (moduleReleases.length === 0) continue;

        sidebarItems.push({
          label: mod.name,
          collapsed: true,
          items: moduleReleases.map(
            (r) => `changelog/${project.id}/${mod.id}/${r.slug}`,
          ),
        });
      }
    } else {
      // Use standard version grouping for regular projects
      sidebarItems.push(
        ...buildSidebarItems(`changelog/${project.id}`, project.name, releases),
      );
    }

    // Get icon and color from changelog-projects.json
    const icon = changelogProjects[project.id]?.icon || "pen";
    const color = changelogProjects[project.id]?.color;

    const topicEntry = {
      label: project.name,
      id: `changelog-${project.id}`,
      link: `changelog/${project.id}`,
      icon,
      items: sidebarItems,
    };
    if (color) topicEntry.color = color;
    topics.push(topicEntry);

    topicParents[project.name] = "Changelog";
  }

  // Generate topic path mappings for starlight-sidebar-topics
  const topicPaths = {};
  for (const project of projects) {
    const topicId = `changelog-${project.id}`;
    topicPaths[topicId] = [
      `/changelog/${project.id}`,
      `/changelog/${project.id}/**/*`,
    ];
  }

  return `// This file is auto-generated by scripts/sync-changelog.mjs
// Do not edit manually.

// Individual project topics (children of Changelog)
export const changelogTopics = ${JSON.stringify(topics, null, 2)};

// Parent mappings for the dropdown
export const changelogTopicParents = ${JSON.stringify(topicParents, null, 2)};

// Topic path mappings for starlight-sidebar-topics
export const changelogTopicPaths = ${JSON.stringify(topicPaths, null, 2)};
`;
}

/**
 * Clone or update news repo from GitHub.
 */
function getNewsRepo(localPath) {
  if (localPath) {
    console.log(`Using local news repo: ${localPath}`);
    return path.resolve(localPath);
  }

  const newsPath = path.join(process.cwd(), ".news");

  try {
    // Check if already cloned
    fsSync.accessSync(path.join(newsPath, ".git"));
    console.log("Updating tenzir/news from GitHub...");
    execSync("git pull --ff-only", { cwd: newsPath, stdio: "inherit" });
  } catch {
    console.log("Cloning tenzir/news from GitHub...");
    execSync(
      `git clone --depth 1 https://github.com/tenzir/news "${newsPath}"`,
      {
        stdio: "inherit",
      },
    );
  }

  return newsPath;
}

/**
 * Generate release cards for an index page.
 */
function generateReleaseCards(releases, projectName, basePath) {
  // Get releases from the current major version (excluding unreleased)
  const releasedVersions = releases.filter((r) => !r.isUnreleased);
  const latestRelease = releasedVersions[0];
  const currentMajor = latestRelease?.majorVersion;
  const currentMajorReleases = releasedVersions.filter(
    (r) => r.majorVersion === currentMajor,
  );

  // Generate unreleased card if present
  const unreleasedRelease = releases.find((r) => r.isUnreleased);
  const unreleasedCard = unreleasedRelease
    ? `<LinkCard
  title="${projectName}"
  description="Upcoming changes not yet published in a release."
  href="${basePath}/unreleased"
  meta="upcoming"
/>`
    : "";

  // Generate LinkCards for all releases in current major version
  const releaseCards = currentMajorReleases
    .map((r) => {
      let description = r.intro || "";
      if (description.length > 300) {
        description = description.slice(0, 297) + "...";
      }
      // Escape quotes for JSX
      description = description.replace(/"/g, '\\"');
      const badgesAttr = generateBadgesAttr(r.components);
      return `<LinkCard
  title="${projectName} ${r.version}"
  description="${description}"
  href="${basePath}/${r.slug}"
  meta="${r.created}"${badgesAttr}
/>`;
    })
    .join("\n\n");

  return [unreleasedCard, releaseCards].filter(Boolean).join("\n\n");
}

/**
 * Generate index MDX content for a changelog (project or module).
 * @param {string} name - Page title
 * @param {string} description - Page description
 * @param {string} cards - Card content to include
 * @param {object} options - Optional settings
 * @param {string} [options.topicId] - Topic ID for frontmatter
 * @param {boolean} [options.useCardGrid] - Wrap cards in CardGrid component
 * @param {string} [options.prefixContent] - Content to render before the CardGrid (full width)
 */
function generateIndexContent(
  name,
  description,
  cards,
  { topicId, useCardGrid, prefixContent } = {},
) {
  const topicLine = topicId ? `\ntopic: ${topicId}` : "";
  const imports = useCardGrid
    ? `import LinkCard from '@components/LinkCard.astro';
import { CardGrid } from '@astrojs/starlight/components';`
    : `import LinkCard from '@components/LinkCard.astro';`;

  let body = prefixContent || "";
  if (useCardGrid && cards) {
    body += `<CardGrid>\n${cards}\n</CardGrid>`;
  } else if (cards) {
    body += cards;
  }

  return `---
title: ${name}
description: ${description}
sidebar:
  hidden: true${topicLine}
---

${imports}

${description ? description + "\n\n" : ""}${body || "No releases available yet."}
`;
}

/**
 * Write MDX files for a list of releases.
 * @param {string} dir - Output directory
 * @param {object} entity - Project or module object
 * @param {Array} releases - Release objects
 * @param {object} options - Optional settings passed to generateMdxContent
 * @returns {number} Number of files written.
 */
async function writeReleaseMdxFiles(dir, entity, releases, options = {}) {
  let count = 0;
  for (const release of releases) {
    const mdxPath = path.join(dir, `${release.slug}.mdx`);
    // For parent projects (no topicId), use entity name as sidebar label for unreleased
    const releaseOptions = { ...options };
    if (!options.topicId && release.isUnreleased) {
      releaseOptions.sidebarLabel = entity.name;
    }
    const mdxContent = generateMdxContent(entity, release, releaseOptions);
    await fs.writeFile(mdxPath, mdxContent);
    count++;
  }
  return count;
}

/**
 * Main sync function.
 */
async function syncChangelog(newsRepoPath) {
  const docsRoot = process.cwd();
  const changelogContentDir = path.join(docsRoot, "src/content/docs/changelog");
  const srcDir = path.join(docsRoot, "src");

  console.log(`Syncing changelog from: ${newsRepoPath}`);

  // Read all projects and sort by order in changelog-projects.json
  const configOrder = Object.keys(changelogProjects);
  let projects = await readProjects(newsRepoPath);
  projects.sort((a, b) => {
    const orderA = configOrder.indexOf(a.id);
    const orderB = configOrder.indexOf(b.id);
    // Unknown projects go to the end
    return (
      (orderA === -1 ? Infinity : orderA) - (orderB === -1 ? Infinity : orderB)
    );
  });
  console.log(
    `Found ${projects.length} projects: ${projects.map((p) => p.id).join(", ")}`,
  );

  // Read releases for each project and their modules
  const projectVersions = {};
  const moduleVersions = {};
  let totalPages = 0;

  for (const project of projects) {
    const hasModules = project.modules.length > 0;
    const topicId = `changelog-${project.id}`;

    // Read parent project releases
    const changelogPath = path.join(project.dirName, "changelog");
    const releases = await readReleases(
      newsRepoPath,
      changelogPath,
      project.name,
    );
    projectVersions[project.id] = releases;

    // Clean and create project directory
    const projectDir = path.join(changelogContentDir, project.id);
    await fs.rm(projectDir, { recursive: true, force: true });
    await fs.mkdir(projectDir, { recursive: true });

    // Log project info
    const moduleInfo = hasModules ? `, ${project.modules.length} modules` : "";
    console.log(`  ${project.id}: ${releases.length} releases${moduleInfo}`);

    // Write release MDX files for the parent project
    totalPages += await writeReleaseMdxFiles(projectDir, project, releases);

    // Process modules if present
    if (hasModules) {
      for (const mod of project.modules) {
        const moduleReleases = await readReleases(
          newsRepoPath,
          mod.changelogPath,
          mod.name,
        );
        moduleVersions[`${project.id}/${mod.id}`] = moduleReleases;
        console.log(`    ${mod.id}: ${moduleReleases.length} releases`);

        // Create module directory and write release files
        const moduleDir = path.join(projectDir, mod.id);
        await fs.mkdir(moduleDir, { recursive: true });
        totalPages += await writeReleaseMdxFiles(
          moduleDir,
          mod,
          moduleReleases,
          { topicId },
        );

        // Generate module index
        const moduleCards = generateReleaseCards(
          moduleReleases,
          mod.name,
          `/changelog/${project.id}/${mod.id}`,
        );
        const moduleIndexContent = generateIndexContent(
          mod.name,
          mod.description,
          moduleCards,
          { topicId },
        );
        await fs.writeFile(
          path.join(moduleDir, "index.mdx"),
          moduleIndexContent,
        );
      }
    }

    // Generate project index
    const indexPath = path.join(projectDir, "index.mdx");
    if (hasModules) {
      // Module cards for parent project index
      const moduleCardsList = project.modules
        .map((mod) => {
          const modReleases = moduleVersions[`${project.id}/${mod.id}`] || [];
          const latestRelease = modReleases.find((r) => !r.isUnreleased);
          const version = latestRelease?.version || "";
          return `<LinkCard
  title="${mod.name}"
  description="${mod.description}"
  href="/changelog/${project.id}/${mod.id}"
  meta="${version}"
/>`;
        })
        .join("\n\n");

      // Add unreleased card before modules if present (full width, outside grid)
      const parentUnreleased = releases.find((r) => r.isUnreleased);
      const unreleasedCard = parentUnreleased
        ? `<LinkCard
  title="${project.name}"
  description="Upcoming changes not yet published in a release."
  href="/changelog/${project.id}/unreleased"
  meta="upcoming"
/>\n\n`
        : "";

      const indexContent = generateIndexContent(
        project.name,
        project.description,
        moduleCardsList,
        { useCardGrid: true, prefixContent: unreleasedCard },
      );
      await fs.writeFile(indexPath, indexContent);
    } else {
      // Regular project: show release cards
      const allCards = generateReleaseCards(
        releases,
        project.name,
        `/changelog/${project.id}`,
      );
      const indexContent = generateIndexContent(
        project.name,
        project.description,
        allCards,
      );
      await fs.writeFile(indexPath, indexContent);
    }
  }

  // Generate main changelog landing page
  const projectCards = projects
    .map((project) => {
      const releases = projectVersions[project.id] || [];
      const latestRelease = releases.find((r) => !r.isUnreleased);
      const version = latestRelease?.version || "";
      const icon = changelogProjects[project.id]?.icon || "document";
      const color = changelogProjects[project.id]?.color;
      const colorAttr = color ? `\n  color="${color}"` : "";
      return `<LinkCard
  title="${project.name}"
  description="${project.description}"
  href="/changelog/${project.id}"
  icon="${icon}"${colorAttr}
  meta="${version}"
/>`;
    })
    .join("\n\n");

  const landingContent = `---
title: Changelog
---

import LinkCard from '@components/LinkCard.astro';

Welcome to the Tenzir changelog hub. Here you can find release notes,
feature updates, and behind-the-scenes improvements across our projects.

${projectCards}

---

For general release announcements and deeper dives into selected features,
check out our [blog](https://tenzir.com/blog) or join the conversation on
our [Discord](https://tenzir.com/discord).
`;
  const landingPath = path.join(changelogContentDir, "index.mdx");
  await fs.writeFile(landingPath, landingContent);
  console.log(`Generated: src/content/docs/changelog/index.mdx`);

  // Generate sidebar and topics configuration
  const sidebarFilePath = path.join(srcDir, "sidebar-changelog.generated.ts");
  const sidebarContent = generateSidebarFile(
    projects,
    projectVersions,
    moduleVersions,
  );
  await fs.writeFile(sidebarFilePath, sidebarContent);
  console.log(`Generated: src/sidebar-changelog.generated.ts`);

  console.log(`\nSync complete!`);
  console.log(`Generated ${totalPages} changelog pages.`);
}

// CLI entry point
const args = process.argv.slice(2);
const localPath = args[0] || null;

const newsRepoPath = getNewsRepo(localPath);

syncChangelog(newsRepoPath).catch((err) => {
  console.error("Error syncing changelog:", err);
  process.exit(1);
});
