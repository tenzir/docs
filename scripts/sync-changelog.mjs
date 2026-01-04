#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { Feed } from "feed";

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
  let isNestedObject = false;

  for (const line of lines) {
    // Handle multiline continuation
    if (isMultiline) {
      if (line.startsWith("  ") || line.trim() === "") {
        // Always fold into a single paragraph (join with spaces)
        multilineValue += (multilineValue ? " " : "") + line.trim();
        continue;
      } else {
        data[currentKey] = multilineValue.trim();
        isMultiline = false;
        multilineValue = "";
      }
    }

    // Handle nested object properties (indented key-value pairs)
    if (
      isNestedObject &&
      line.startsWith("  ") &&
      !line.trim().startsWith("-")
    ) {
      const trimmed = line.trim();
      const nestedColonIndex = trimmed.indexOf(":");
      if (nestedColonIndex > 0) {
        const nestedKey = trimmed.slice(0, nestedColonIndex).trim();
        let nestedValue = trimmed.slice(nestedColonIndex + 1).trim();
        // Remove quotes if present
        if (
          (nestedValue.startsWith('"') && nestedValue.endsWith('"')) ||
          (nestedValue.startsWith("'") && nestedValue.endsWith("'"))
        ) {
          nestedValue = nestedValue.slice(1, -1);
        }
        data[currentKey][nestedKey] = nestedValue;
        continue;
      }
    } else if (isNestedObject && !line.startsWith("  ") && line.trim() !== "") {
      isNestedObject = false;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && !line.startsWith(" ") && !line.startsWith("-")) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Check for multiline indicator (|, |-, >, >-) - all treated as folded
      if (value === ">-" || value === ">" || value === "|" || value === "|-") {
        currentKey = key;
        isMultiline = true;
        multilineValue = "";
        continue;
      }

      // Handle nested object or array start (empty value)
      if (value === "") {
        // Look ahead to determine if it's an array or object
        const lineIndex = lines.indexOf(line);
        const nextLine = lines[lineIndex + 1] || "";
        if (nextLine.trim().startsWith("-")) {
          data[key] = [];
        } else {
          data[key] = {};
          isNestedObject = true;
        }
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
 * Strip links from intro text to keep timeline rows fully clickable.
 */
function stripIntroLinks(text) {
  if (!text) return "";
  let output = text;
  output = output.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  output = output.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");
  output = output.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1");
  return output;
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
        stdio: ["pipe", "pipe", "pipe"],
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
 * @param {object} options - Optional settings
 * @param {function} [options.onProgress] - Callback for progress updates (current, total)
 */
async function readReleases(
  newsRepoPath,
  changelogPath,
  projectName,
  { onProgress } = {},
) {
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
    const directories = dirEntries.filter((e) => e.isDirectory());
    let processed = 0;

    for (const dirEntry of directories) {
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
            {
              cwd: fullChangelogPath,
              encoding: "utf-8",
              stdio: ["pipe", "pipe", "pipe"],
            },
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
          modules: manifest.modules || null, // Module versions for parent releases
        });
      } catch {
        // Skip releases without required files
      }

      processed++;
      if (onProgress) {
        onProgress(processed, directories.length);
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
 * @param {Array} [options.moduleReleases] - Module releases to include after parent content
 */
function generateMdxContent(
  project,
  release,
  { topicId, sidebarLabel, moduleReleases } = {},
) {
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

  // Add module releases if provided (for parent releases with modules)
  // Uses compact bullet format: "- 🚀 Title — _@author_"
  if (moduleReleases && moduleReleases.length > 0) {
    content += "\n---\n\n";
    for (const modRelease of moduleReleases) {
      content += `## ${modRelease.name} ${modRelease.version}\n\n`;
      if (modRelease.entries && modRelease.entries.length > 0) {
        for (const entry of modRelease.entries) {
          const emoji = entryTypeConfig[entry.type]?.emoji || "📝";
          const authors = entry.authors?.map(formatAuthor).join(" and ") || "";
          const authorSuffix = authors ? ` — _${authors}_` : "";
          content += `- ${emoji} ${entry.title}${authorSuffix}\n`;
        }
        content += "\n";
      }
    }
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
 * Unreleased entries are included at the top of the latest major version group.
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
    }));

  // Add unreleased entries to the top of the latest major version group
  if (unreleased.length > 0 && result.length > 0) {
    result[0].versions = [...unreleased, ...result[0].versions];
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
    // Version groups are collapsible, first one expanded
    const isFirst = sidebarItems.length === 0;
    sidebarItems.push({
      label: `${projectName} ${group.label}`,
      collapsed: !isFirst,
      items: group.versions.map((v) => `${basePath}/${v.slug}`),
    });
  }

  return sidebarItems;
}

/**
 * Generate unified timeline entries across all projects.
 * Returns released entries sorted by date (newest first).
 * Unreleased entries are excluded from the unified timeline.
 */
function generateUnifiedTimelineEntries(
  projects,
  projectVersions,
  moduleVersions,
) {
  const entries = [];

  for (const project of projects) {
    const releases = projectVersions[project.id] || [];
    const icon = changelogProjects[project.id]?.icon || "document";
    const color = changelogProjects[project.id]?.color || "";

    // Add project releases (skip unreleased)
    for (const release of releases) {
      if (release.isUnreleased) continue;

      let description = stripIntroLinks(release.intro || "");
      if (description.length > 300) {
        description = description.slice(0, 297) + "...";
      }

      entries.push({
        version: release.version,
        date: formatDate(release.created),
        href: `/changelog/${project.id}/${release.slug}`,
        description: description || undefined,
        // Store raw date for sorting
        _sortDate: release.created || "",
        project: {
          id: project.id,
          name: project.name,
          icon,
          color,
        },
      });
    }

    // Add module releases (skip unreleased)
    if (project.modules && project.modules.length > 0) {
      for (const mod of project.modules) {
        const moduleReleases = moduleVersions[`${project.id}/${mod.id}`] || [];
        for (const release of moduleReleases) {
          if (release.isUnreleased) continue;

          let description = stripIntroLinks(release.intro || "");
          if (description.length > 300) {
            description = description.slice(0, 297) + "...";
          }

          entries.push({
            version: release.version,
            date: formatDate(release.created),
            href: `/changelog/${project.id}/${mod.id}/${release.slug}`,
            description: description || undefined,
            _sortDate: release.created || "",
            project: {
              id: mod.id,
              name: mod.name,
              icon,
              color,
              parentName: project.name,
            },
          });
        }
      }
    }
  }

  // Sort by date (newest first)
  entries.sort((a, b) => new Date(b._sortDate) - new Date(a._sortDate));

  // Remove internal sort field and clean up undefined descriptions
  return entries.map(({ _sortDate, description, ...entry }) => {
    if (description) {
      return { ...entry, description };
    }
    return entry;
  });
}

/**
 * Group timeline entries by year.
 * Returns a Map with year as key and entries for that year as value.
 * Years are sorted newest first.
 */
function groupEntriesByYear(entries) {
  const yearGroups = new Map();

  for (const entry of entries) {
    // Extract year from date string (format: "Dec 19, 2024")
    const match = entry.date.match(/\d{4}/);
    const year = match ? match[0] : "Unknown";

    if (!yearGroups.has(year)) {
      yearGroups.set(year, []);
    }
    yearGroups.get(year).push(entry);
  }

  // Sort by year descending and return as array of [year, entries] tuples
  return Array.from(yearGroups.entries()).sort((a, b) => b[0] - a[0]);
}

/**
 * Generate unified timeline TypeScript file.
 */
function generateUnifiedTimelineFile(entries) {
  return `// This file is auto-generated by scripts/sync-changelog.mjs
// Do not edit manually.

import type { StarlightIcon } from "@astrojs/starlight/components/Icons";

export interface UnifiedTimelineEntry {
  version: string;
  date: string;
  href: string;
  description?: string;
  project: {
    id: string;
    name: string;
    icon: StarlightIcon;
    color: string;
    parentName?: string;
  };
}

export const unifiedTimelineEntries: UnifiedTimelineEntry[] = ${JSON.stringify(entries, null, 2)};
`;
}

/**
 * Generate MDX content for a year-specific timeline page.
 */
function generateYearTimelineContent(year, entries) {
  const entriesJson = JSON.stringify(entries, null, 2);

  return `---
title: "${year}"
sidebar:
  label: "${year}"
topic: changelog-timeline
tableOfContents: false
---

import Timeline from '@components/Timeline.astro';

All changes across Tenzir projects released in ${year}.

<Timeline entries={${entriesJson}} showProjectInfo />
`;
}

// =============================================================================
// Atom Feed Generation
// =============================================================================

const SITE_URL = "https://docs.tenzir.com";

const FEED_AUTHOR = {
  name: "Tenzir",
  link: "https://tenzir.com",
};

/**
 * Escape special HTML characters.
 */
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Remark processor for converting markdown to HTML (sanitized for feeds)
const remarkProcessor = remark().use(remarkHtml, { sanitize: true });

/**
 * Convert markdown to HTML for feed content using remark.
 */
function markdownToHtml(md) {
  if (!md) return "";
  const result = remarkProcessor.processSync(md);
  return String(result).trim();
}

/**
 * Generate HTML content for a single release entry.
 */
function generateEntryHtml(release) {
  let html = "";

  // Intro paragraph
  if (release.intro) {
    html += markdownToHtml(release.intro) + "\n";
  }

  // Group entries by type
  if (release.entries && release.entries.length > 0) {
    const grouped = {};
    for (const entry of release.entries) {
      const type = entry.type || "change";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(entry);
    }

    // Sort by configured order
    const sortedTypes = Object.keys(grouped).sort((a, b) => {
      const orderA = entryTypeConfig[a]?.order ?? 99;
      const orderB = entryTypeConfig[b]?.order ?? 99;
      return orderA - orderB;
    });

    for (const type of sortedTypes) {
      const config = entryTypeConfig[type] || { heading: "Other" };
      html += `\n<h2>${config.heading}</h2>\n`;

      for (const entry of grouped[type]) {
        html += `\n<h3>${escapeHtml(entry.title)}</h3>\n`;

        // Metadata line
        const metaParts = [];
        if (entry.created) {
          metaParts.push(formatDate(entry.created));
        }
        if (entry.authors && entry.authors.length > 0) {
          const authors = entry.authors
            .map((a) => {
              if (typeof a === "string" && a.startsWith("[")) {
                // Parse markdown link: [@handle](url)
                const match = a.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (match) return `<a href="${match[2]}">${match[1]}</a>`;
              }
              const handle = typeof a === "string" ? a : a.handle || a.name;
              const url = typeof a === "object" ? a.url : null;
              const display = handle.includes(" ") ? handle : `@${handle}`;
              return url ? `<a href="${url}">${display}</a>` : display;
            })
            .join(", ");
          metaParts.push(authors);
        }
        if (entry.prs && entry.prs.length > 0) {
          const prs = entry.prs
            .map((pr) => {
              if (typeof pr === "string" && pr.startsWith("[")) {
                const match = pr.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (match) return `<a href="${match[2]}">${match[1]}</a>`;
              }
              if (typeof pr === "object") {
                return pr.url
                  ? `<a href="${pr.url}">#${pr.number}</a>`
                  : `#${pr.number}`;
              }
              return `#${pr}`;
            })
            .join(", ");
          metaParts.push(prs);
        }
        if (metaParts.length > 0) {
          html += `<p><small>${metaParts.join(" · ")}</small></p>\n`;
        }

        // Entry body
        if (entry.body) {
          html += markdownToHtml(entry.body) + "\n";
        }
      }
    }
  }

  return html;
}

/**
 * Generate Atom feed XML for a project.
 * @param {object} project - Project object
 * @param {Array} releases - Release objects (newest first)
 * @param {object} options - Optional settings
 * @param {number} [options.limit=20] - Maximum entries in feed
 */
function generateAtomFeed(project, releases, { limit = 20 } = {}) {
  const releasedOnly = releases.filter((r) => !r.isUnreleased);
  const feedReleases = releasedOnly.slice(0, limit);

  if (feedReleases.length === 0) return null;

  const projectPath = `changelog/${project.id}`;
  const feedUrl = `${SITE_URL}/${projectPath}.xml`;
  const siteUrl = `${SITE_URL}/${projectPath}`;

  const feed = new Feed({
    title: `${project.name} Changelog`,
    description: `Release notes and changelog for ${project.name}`,
    id: siteUrl,
    link: siteUrl,
    language: "en",
    favicon: `${SITE_URL}/favicon.svg`,
    updated: new Date(feedReleases[0].created),
    generator: "Tenzir Changelog",
    feedLinks: {
      atom: feedUrl,
    },
    author: FEED_AUTHOR,
  });

  for (const release of feedReleases) {
    const entryUrl = `${SITE_URL}/changelog/${project.id}/${release.slug}`;

    feed.addItem({
      title: `${project.name} ${release.version}`,
      id: entryUrl,
      link: entryUrl,
      description: stripIntroLinks(release.intro || ""),
      content: generateEntryHtml(release),
      date: new Date(release.created),
      published: new Date(release.created),
    });
  }

  return feed.atom1();
}

/**
 * Generate unified Atom feed across all projects.
 */
function generateUnifiedAtomFeed(
  projects,
  projectVersions,
  moduleVersions,
  { limit = 50 } = {},
) {
  // Collect all released entries with dates
  const allEntries = [];

  for (const project of projects) {
    const releases = projectVersions[project.id] || [];

    for (const release of releases) {
      if (release.isUnreleased) continue;
      allEntries.push({
        project,
        release,
        path: `changelog/${project.id}/${release.slug}`,
        sortDate: new Date(release.created),
      });
    }

    // Include module releases
    if (project.modules) {
      for (const mod of project.modules) {
        const modReleases = moduleVersions[`${project.id}/${mod.id}`] || [];
        for (const release of modReleases) {
          if (release.isUnreleased) continue;
          allEntries.push({
            project: { ...mod, parentName: project.name },
            release,
            path: `changelog/${project.id}/${mod.id}/${release.slug}`,
            sortDate: new Date(release.created),
          });
        }
      }
    }
  }

  // Sort by date (newest first) and limit
  allEntries.sort((a, b) => b.sortDate - a.sortDate);
  const feedEntries = allEntries.slice(0, limit);

  if (feedEntries.length === 0) return null;

  const feedUrl = `${SITE_URL}/changelog/feed.xml`;
  const siteUrl = `${SITE_URL}/changelog`;

  const feed = new Feed({
    title: "Tenzir Changelog",
    description: "Release notes across all Tenzir projects",
    id: siteUrl,
    link: siteUrl,
    language: "en",
    favicon: `${SITE_URL}/favicon.svg`,
    updated: feedEntries[0].sortDate,
    generator: "Tenzir Changelog",
    feedLinks: {
      atom: feedUrl,
    },
    author: FEED_AUTHOR,
  });

  for (const entry of feedEntries) {
    const { project, release, path } = entry;
    const entryUrl = `${SITE_URL}/${path}`;

    // Title includes parent name for modules
    const titlePrefix = project.parentName
      ? `${project.parentName}: ${project.name}`
      : project.name;

    // Category for project identification
    const categoryLabel = project.parentName
      ? `${project.parentName}: ${project.name}`
      : project.name;

    feed.addItem({
      title: `${titlePrefix} ${release.version}`,
      id: entryUrl,
      link: entryUrl,
      description: stripIntroLinks(release.intro || ""),
      content: generateEntryHtml(release),
      date: new Date(release.created),
      published: new Date(release.created),
      category: [{ name: categoryLabel }],
    });
  }

  return feed.atom1();
}

/**
 * Generate and write all Atom feeds.
 */
async function generateFeeds(
  projects,
  projectVersions,
  moduleVersions,
  outputDir,
) {
  await fs.mkdir(outputDir, { recursive: true });
  const generated = [];

  // Per-project feeds
  for (const project of projects) {
    const releases = projectVersions[project.id] || [];
    const feed = generateAtomFeed(project, releases);
    if (feed) {
      const filename = `${project.id}.xml`;
      await fs.writeFile(path.join(outputDir, filename), feed);
      generated.push(filename);
    }
  }

  // Unified feed
  const unifiedFeed = generateUnifiedAtomFeed(
    projects,
    projectVersions,
    moduleVersions,
  );
  if (unifiedFeed) {
    await fs.writeFile(path.join(outputDir, "feed.xml"), unifiedFeed);
    generated.push("feed.xml");
  }

  return generated;
}

// =============================================================================
// Sidebar Generation
// =============================================================================

/**
 * Generate TypeScript sidebar file content with topics.
 * Icons come from changelog-projects.json.
 */
function generateSidebarFile(
  projects,
  projectVersions,
  moduleVersions,
  timelineYears = [],
) {
  const topics = [];
  const topicParents = {};

  for (const project of projects) {
    const releases = projectVersions[project.id] || [];
    const hasModules = project.modules.length > 0;
    const sidebarItems = [];

    if (hasModules) {
      // Add parent project releases as flat list (no major version grouping)
      // to avoid excessive nesting with modules
      if (releases.length > 0) {
        sidebarItems.push({
          label: project.name,
          collapsed: true,
          items: releases.map((r) => `changelog/${project.id}/${r.slug}`),
        });
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

  // Add timeline topic with year-based sidebar items
  if (timelineYears.length > 0) {
    const timelineTopic = {
      label: "Timeline",
      id: "changelog-timeline",
      link: "changelog/timeline",
      icon: "seti:clock",
      items: timelineYears.map((year) => `changelog/timeline/${year}`),
    };
    topics.unshift(timelineTopic); // Add at the beginning
    topicParents["Timeline"] = "Changelog";
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

  // Add timeline topic paths
  if (timelineYears.length > 0) {
    topicPaths["changelog-timeline"] = [
      "/changelog/timeline",
      "/changelog/timeline/**/*",
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
 * Generate Timeline entries array for an index page.
 */
function generateTimelineEntries(releases, basePath) {
  const entries = [];

  for (const r of releases) {
    let description = stripIntroLinks(r.intro || "");
    if (description.length > 300) {
      description = description.slice(0, 297) + "...";
    }
    // Escape quotes and newlines for JSON
    description = description
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ");

    const entry = {
      version: r.isUnreleased ? "Unreleased" : r.version,
      date: r.isUnreleased ? "" : formatDate(r.created),
      href: `${basePath}/${r.slug}`,
    };

    if (description) {
      entry.description = description;
    }

    entries.push(entry);
  }

  return entries;
}

/**
 * Generate index MDX content for a changelog (project or module).
 * @param {string} name - Page title
 * @param {string} description - Page description
 * @param {object} options - Optional settings
 * @param {string} [options.topicId] - Topic ID for frontmatter
 * @param {boolean} [options.useCardGrid] - Wrap content in CardGrid component (for module lists)
 * @param {string} [options.cardContent] - Card content for CardGrid mode
 * @param {string} [options.prefixContent] - Content to render before the CardGrid (full width)
 * @param {Array} [options.timelineEntries] - Timeline entries for release list
 * @param {string} [options.repository] - GitHub repository path (e.g., "tenzir/tenzir")
 * @param {string} [options.feedUrl] - RSS feed URL for the project
 */
function generateIndexContent(
  name,
  description,
  {
    topicId,
    useCardGrid,
    cardContent,
    prefixContent,
    timelineEntries,
    repository,
    feedUrl,
  } = {},
) {
  const topicLine = topicId ? `\ntopic: ${topicId}` : "";

  // Build imports based on what's needed
  const importLines = [];
  const starlightComponents = [];

  // Use LinkCard for GitHub + RSS cards when we have a repository
  const useResourceCards =
    repository && (timelineEntries?.length > 0 || useCardGrid);

  if (useCardGrid || useResourceCards) {
    importLines.push(`import LinkCard from '@components/LinkCard.astro';`);
    starlightComponents.push("CardGrid");
  }
  if (timelineEntries && timelineEntries.length > 0) {
    importLines.push(`import Timeline from '@components/Timeline.astro';`);
  }
  if (starlightComponents.length > 0) {
    importLines.push(
      `import { ${starlightComponents.join(", ")} } from '@astrojs/starlight/components';`,
    );
  }
  const imports = importLines.join("\n");

  // Build body content
  let body = "";

  // Description paragraph
  if (description) {
    body += `<p style="margin-bottom: var(--tnz-space-4);">${description}</p>\n\n`;
  }

  // GitHub + RSS Feed cards
  if (useResourceCards) {
    const repoUrl = repository.startsWith("http")
      ? repository
      : `https://github.com/${repository}/releases`;
    body += `<CardGrid>\n`;
    body += `  <LinkCard title="GitHub" href="${repoUrl}" icon="github" description="Download releases and artifacts" />\n`;
    if (feedUrl) {
      body += `  <LinkCard title="RSS Feed" href="${feedUrl}" icon="rss" description="Subscribe to release updates" />\n`;
    }
    body += `</CardGrid>\n\n`;
  }

  // Main content: either CardGrid or Timeline
  if (useCardGrid && cardContent) {
    // Add section heading before releases
    body += `## Releases\n\n`;
    // Prefix content (e.g., root project card before module grid)
    if (prefixContent) {
      body += prefixContent;
    }
    body += `<CardGrid>\n${cardContent}\n</CardGrid>`;
  } else if (timelineEntries && timelineEntries.length > 0) {
    // Add section heading before timeline
    body += `## Releases\n\n`;
    // Generate Timeline component with entries
    const entriesJson = JSON.stringify(timelineEntries, null, 2);
    body += `<Timeline entries={${entriesJson}} />`;
  } else if (prefixContent) {
    body += prefixContent;
  } else {
    body += "No releases available yet.";
  }

  return `---
title: ${name}
description: "${description || ""}"
sidebar:
  hidden: true${topicLine}
tableOfContents: false
---

${imports}

${body}
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
    const mdxContent = generateMdxContent(entity, release, options);
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

  // Helper for inline progress updates (only in TTY mode)
  const isTTY = process.stdout.isTTY;
  const writeProgress = (text, isFinal = false) => {
    if (!isTTY && !isFinal) return; // Skip intermediate progress in CI
    if (isTTY) {
      process.stdout.clearLine?.(0);
      process.stdout.cursorTo?.(0);
    }
    process.stdout.write(isFinal && !isTTY ? text : text);
  };

  console.log(`Syncing from: ${newsRepoPath}`);

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
  console.log(`Found ${projects.length} projects\n`);

  // Read releases for each project and their modules
  const projectVersions = {};
  const moduleVersions = {};
  let totalPages = 0;

  for (const project of projects) {
    const hasModules = project.modules.length > 0;
    const topicId = `changelog-${project.id}`;

    // Show project being processed
    writeProgress(`  ${project.id}: reading releases...`);

    // Read parent project releases with progress
    const changelogPath = path.join(project.dirName, "changelog");
    const releases = await readReleases(
      newsRepoPath,
      changelogPath,
      project.name,
      {
        onProgress: (current, total) => {
          writeProgress(
            `  ${project.id}: reading releases ${current}/${total}`,
          );
        },
      },
    );
    projectVersions[project.id] = releases;

    // Clean and create project directory
    const projectDir = path.join(changelogContentDir, project.id);
    await fs.rm(projectDir, { recursive: true, force: true });
    await fs.mkdir(projectDir, { recursive: true });

    // Log project completion
    const moduleInfo = hasModules ? ` + ${project.modules.length} modules` : "";
    writeProgress(
      `  ${project.id}: ${releases.length} releases${moduleInfo}\n`,
      true,
    );

    // Read all module releases first (needed for parent release pages)
    if (hasModules) {
      for (const mod of project.modules) {
        writeProgress(`    ${mod.id}: reading...`);
        const moduleReleases = await readReleases(
          newsRepoPath,
          mod.changelogPath,
          mod.name,
          {
            onProgress: (current, total) => {
              writeProgress(`    ${mod.id}: reading ${current}/${total}`);
            },
          },
        );
        moduleVersions[`${project.id}/${mod.id}`] = moduleReleases;
        writeProgress(
          `    ${mod.id}: ${moduleReleases.length} releases\n`,
          true,
        );
      }
    }

    // Write release MDX files for the parent project
    // For projects with modules, include module releases in parent release pages
    for (const release of releases) {
      const mdxPath = path.join(projectDir, `${release.slug}.mdx`);
      const releaseOptions = {};

      // If this release has module versions, gather their releases
      if (release.modules && hasModules) {
        const modReleases = [];
        for (const mod of project.modules) {
          const modVersion = release.modules[mod.id];
          if (modVersion) {
            const allModReleases =
              moduleVersions[`${project.id}/${mod.id}`] || [];
            const matchingRelease = allModReleases.find(
              (r) => r.version === modVersion,
            );
            if (matchingRelease) {
              modReleases.push({
                name: mod.name,
                version: matchingRelease.version,
                entries: matchingRelease.entries,
              });
            }
          }
        }
        if (modReleases.length > 0) {
          releaseOptions.moduleReleases = modReleases;
        }
      }

      const mdxContent = generateMdxContent(project, release, releaseOptions);
      await fs.writeFile(mdxPath, mdxContent);
      totalPages++;
    }

    // Process modules if present - write module release pages
    if (hasModules) {
      for (const mod of project.modules) {
        const moduleReleases = moduleVersions[`${project.id}/${mod.id}`] || [];

        // Create module directory and write release files
        const moduleDir = path.join(projectDir, mod.id);
        await fs.mkdir(moduleDir, { recursive: true });
        totalPages += await writeReleaseMdxFiles(
          moduleDir,
          mod,
          moduleReleases,
          { topicId },
        );

        // Generate module index with Timeline
        const moduleTimelineEntries = generateTimelineEntries(
          moduleReleases,
          `/changelog/${project.id}/${mod.id}`,
        );
        const moduleIndexContent = generateIndexContent(
          mod.name,
          mod.description,
          {
            topicId,
            timelineEntries: moduleTimelineEntries,
          },
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

      // Add parent project card before modules (full width, outside grid)
      // Shows latest release, or unreleased if no releases exist yet
      let prefixCards = "";
      const latestParentRelease = releases.find((r) => !r.isUnreleased);
      const parentUnreleased = releases.find((r) => r.isUnreleased);
      const projectIcon = changelogProjects[project.id]?.icon || "document";
      const projectColor = changelogProjects[project.id]?.color;
      const colorAttr = projectColor ? `\n  color="${projectColor}"` : "";

      if (latestParentRelease) {
        prefixCards += `<LinkCard
  title="${project.name}"
  description="Root release notes for the project and all modules."
  href="/changelog/${project.id}/${latestParentRelease.slug}"
  icon="${projectIcon}"${colorAttr}
  meta="${latestParentRelease.version}"
/>\n\n`;
      } else if (parentUnreleased) {
        // Only show unreleased card if there are no releases yet
        prefixCards += `<LinkCard
  title="${project.name}"
  description="Upcoming changes not yet published in a release."
  href="/changelog/${project.id}/unreleased"
/>\n\n`;
      }

      const indexContent = generateIndexContent(
        project.name,
        project.description,
        {
          useCardGrid: true,
          cardContent: moduleCardsList,
          prefixContent: prefixCards || undefined,
          repository: changelogProjects[project.id]?.repository,
          feedUrl: `/changelog/${project.id}.xml`,
        },
      );
      await fs.writeFile(indexPath, indexContent);
    } else {
      // Regular project: show Timeline
      const timelineEntries = generateTimelineEntries(
        releases,
        `/changelog/${project.id}`,
      );
      const indexContent = generateIndexContent(
        project.name,
        project.description,
        {
          timelineEntries,
          repository: changelogProjects[project.id]?.repository,
          feedUrl: `/changelog/${project.id}.xml`,
        },
      );
      await fs.writeFile(indexPath, indexContent);
    }
  }

  // Generate unified timeline data
  const unifiedEntries = generateUnifiedTimelineEntries(
    projects,
    projectVersions,
    moduleVersions,
  );
  const unifiedTimelinePath = path.join(
    srcDir,
    "unified-timeline-data.generated.ts",
  );
  await fs.writeFile(
    unifiedTimelinePath,
    generateUnifiedTimelineFile(unifiedEntries),
  );

  // Generate year-based timeline pages
  const yearGroups = groupEntriesByYear(unifiedEntries);
  const timelineYears = yearGroups.map(([year]) => year);
  const timelineDir = path.join(changelogContentDir, "timeline");
  await fs.rm(timelineDir, { recursive: true, force: true });
  await fs.mkdir(timelineDir, { recursive: true });

  for (const [year, entries] of yearGroups) {
    const yearContent = generateYearTimelineContent(year, entries);
    await fs.writeFile(path.join(timelineDir, `${year}.mdx`), yearContent);
  }

  // Generate timeline index page (mirrors the original timeline.mdx)
  const timelineIndexContent = `---
title: Timeline
description: "A chronological view of all changes across all Tenzir projects."
sidebar:
  hidden: true
topic: changelog-timeline
tableOfContents: false
---

import UnifiedTimeline from "@components/UnifiedTimeline.astro";
import LinkCard from "@components/LinkCard.astro";
import { CardGrid } from "@astrojs/starlight/components";

Browse all release updates across Tenzir projects in reverse-chronological
order. Use the toggle to include unreleased changes that are in development.

<CardGrid>
  <LinkCard title="GitHub" href="https://github.com/tenzir" icon="github" description="Tenzir open source projects" />
  <LinkCard title="RSS Feed" href="/changelog/feed.xml" icon="rss" description="Subscribe to all release updates" />
</CardGrid>

## Releases

<UnifiedTimeline />
`;
  await fs.writeFile(path.join(timelineDir, "index.mdx"), timelineIndexContent);

  console.log(
    `  timeline: ${timelineYears.length} years (${timelineYears.join(", ")})`,
  );

  // Generate main changelog landing page
  const latestTimelineYear = timelineYears[0] || "2025";
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
template: splash
---

import LinkCard from '@components/LinkCard.astro';
import { LinkButton } from '@astrojs/starlight/components';

Welcome to the Tenzir changelog hub. Here you can find release notes, feature
updates, and behind-the-scenes improvements across our projects.

<div style="display: flex; gap: var(--tnz-space-2); flex-wrap: wrap;">
  <LinkButton href="/changelog/timeline/${latestTimelineYear}" icon="right-arrow" variant="secondary">
    View all changes chronologically
  </LinkButton>
  <LinkButton href="/changelog/feed.xml" icon="rss" variant="minimal">
    RSS Feed
  </LinkButton>
</div>

<div class="card-grid" style="margin-top: var(--tnz-space-6);">

${projectCards}

</div>

---

For general release announcements and deeper dives into selected features,
check out our [blog](https://tenzir.com/blog) or join the conversation on
our [Discord](https://tenzir.com/discord).
`;
  const landingPath = path.join(changelogContentDir, "index.mdx");
  await fs.writeFile(landingPath, landingContent);

  // Generate sidebar and topics configuration
  const sidebarFilePath = path.join(srcDir, "sidebar-changelog.generated.ts");
  const sidebarContent = generateSidebarFile(
    projects,
    projectVersions,
    moduleVersions,
    timelineYears,
  );
  await fs.writeFile(sidebarFilePath, sidebarContent);

  // Generate Atom feeds
  const feedsDir = path.join(docsRoot, "public/changelog");
  const generatedFeeds = await generateFeeds(
    projects,
    projectVersions,
    moduleVersions,
    feedsDir,
  );
  console.log(
    `  feeds: ${generatedFeeds.length} (${generatedFeeds.join(", ")})`,
  );

  console.log(
    `\nGenerated ${totalPages} pages, ${unifiedEntries.length} timeline entries`,
  );
}

// CLI entry point
const args = process.argv.slice(2);
const localPath = args[0] || null;

const newsRepoPath = getNewsRepo(localPath);

syncChangelog(newsRepoPath).catch((err) => {
  console.error("Error syncing changelog:", err);
  process.exit(1);
});
