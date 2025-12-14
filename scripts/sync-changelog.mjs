#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Sync changelog from tenzir/news repository.
 *
 * Usage:
 *   node sync-changelog.mjs              # Clone from GitHub
 *   node sync-changelog.mjs <local-path> # Use local clone
 */

// Icons for changelog projects (must match topics.ts)
const projectIcons = {
  changelog: "open-book",
  mcp: "puzzle",
  "tenzir-test": "rocket",
};

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
 * Compare versions for sorting (newest first).
 */
function compareVersions(a, b) {
  const va = parseVersion(a.version);
  const vb = parseVersion(b.version);

  if (va.major !== vb.major) return vb.major - va.major;
  if (va.minor !== vb.minor) return vb.minor - va.minor;
  if (va.patch !== vb.patch) return vb.patch - va.patch;

  // Handle prereleases (non-prerelease > prerelease)
  if (va.prerelease && !vb.prerelease) return 1;
  if (!va.prerelease && vb.prerelease) return -1;

  return 0;
}

/**
 * Read all projects from the news repo.
 */
async function readProjects(newsRepoPath) {
  const projects = [];
  const entries = await fs.readdir(newsRepoPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) {
      continue;
    }

    const configPath = path.join(newsRepoPath, entry.name, "config.yaml");
    try {
      const configContent = await fs.readFile(configPath, "utf-8");
      const config = parseYaml(configContent);

      if (config.id) {
        projects.push({
          id: config.id,
          name: config.name || config.id,
          description: config.description || "",
          repository: config.repository || "",
          components: config.components || [],
          dirName: entry.name,
        });
      }
    } catch {
      // Skip directories without config.yaml
    }
  }

  return projects;
}

/**
 * Read unreleased changelog entries for a project using tenzir-changelog CLI.
 */
async function readUnreleased(newsRepoPath, project) {
  const projectPath = path.join(newsRepoPath, project.dirName);
  const unreleasedPath = path.join(projectPath, "unreleased");

  try {
    // Check if unreleased directory exists and has entries
    const entries = await fs.readdir(unreleasedPath, { withFileTypes: true });
    const mdFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".md"));

    if (mdFiles.length === 0) return null;

    // Run tenzir-changelog to get properly formatted markdown
    let markdown = execSync("uvx tenzir-changelog show --markdown -", {
      cwd: projectPath,
      encoding: "utf-8",
    }).trim();

    if (!markdown) return null;

    // Strip redundant "# Unreleased Changes" title
    markdown = markdown.replace(/^#\s+Unreleased Changes\n+/, "");

    return {
      version: "Unreleased",
      slug: "unreleased",
      title: "Unreleased",
      created: "",
      intro: "",
      notes: markdown,
      majorVersion: Infinity, // Sort to top
      minorVersion: 0,
      patchVersion: 0,
      isUnreleased: true,
    };
  } catch {
    return null;
  }
}

/**
 * Read all releases for a project.
 */
async function readReleases(newsRepoPath, project) {
  const releases = [];
  const releasesPath = path.join(newsRepoPath, project.dirName, "releases");

  // Check for unreleased entries first
  const unreleased = await readUnreleased(newsRepoPath, project);
  if (unreleased) {
    releases.push(unreleased);
  }

  try {
    const entries = await fs.readdir(releasesPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const manifestPath = path.join(releasesPath, entry.name, "manifest.yaml");
      const notesPath = path.join(releasesPath, entry.name, "notes.md");

      try {
        const [manifestContent, notesContent] = await Promise.all([
          fs.readFile(manifestPath, "utf-8"),
          fs.readFile(notesPath, "utf-8"),
        ]);

        const manifest = parseYaml(manifestContent);
        const version = entry.name;
        const parsed = parseVersion(version);

        releases.push({
          version,
          slug: versionToSlug(version),
          title: manifest.title || `${project.name} ${version}`,
          created: manifest.created || "",
          intro: manifest.intro || "",
          notes: notesContent,
          majorVersion: parsed.major,
          minorVersion: parsed.minor,
          patchVersion: parsed.patch,
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
 * Generate MDX content for a release.
 */
function generateMdxContent(project, release) {
  let frontmatter = `---
title: "${project.name} ${release.version}"
sidebar:
  label: "${release.version}"
---

`;

  // Add intro if present and different from notes start
  let content = release.notes;

  // Add download link if repository is specified (not for unreleased)
  if (project.repository && !release.isUnreleased) {
    const repoUrl = project.repository.startsWith("http")
      ? project.repository
      : `https://github.com/${project.repository}`;
    content += `\n\nDownload the release on [GitHub](${repoUrl}/releases/tag/${release.version}).\n`;
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
 * Generate TypeScript sidebar file content with topics.
 * Icons are applied in topics.ts, not here.
 */
function generateSidebarFile(projects, projectVersions) {
  const topics = [];
  const topicParents = {};

  for (const project of projects) {
    const releases = projectVersions[project.id] || [];
    const versionGroups = groupVersionsByMajor(releases);

    // Build sidebar items
    const sidebarItems = [];

    for (const group of versionGroups) {
      if (group.isUnreleased) {
        // Unreleased is a standalone link at the top
        sidebarItems.push(`changelog/${project.id}/unreleased`);
      } else {
        // Version groups are collapsible, first one expanded
        const isFirst =
          sidebarItems.length === 0 ||
          (sidebarItems.length === 1 && typeof sidebarItems[0] === "string");
        sidebarItems.push({
          label: `${project.name} ${group.label}`,
          collapsed: !isFirst,
          items: group.versions.map((v) => `changelog/${project.id}/${v.slug}`),
        });
      }
    }

    // Topic definition for this project (icon applied in topics.ts)
    topics.push({
      label: project.name,
      id: `changelog-${project.id}`,
      link: `changelog/${project.id}`,
      items: sidebarItems,
    });

    // Parent relationship
    topicParents[project.name] = "Changelog";
  }

  return `// This file is auto-generated by scripts/sync-changelog.mjs
// Do not edit manually. Icons are applied in topics.ts.

// Individual project topics (children of Changelog)
export const changelogTopics = ${JSON.stringify(topics, null, 2)};

// Parent mappings for the dropdown
export const changelogTopicParents = ${JSON.stringify(topicParents, null, 2)};
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
 * Main sync function.
 */
async function syncChangelog(newsRepoPath) {
  const docsRoot = process.cwd();
  const changelogContentDir = path.join(docsRoot, "src/content/docs/changelog");
  const srcDir = path.join(docsRoot, "src");

  console.log(`Syncing changelog from: ${newsRepoPath}`);

  // Read all projects
  const projects = await readProjects(newsRepoPath);
  console.log(
    `Found ${projects.length} projects: ${projects.map((p) => p.id).join(", ")}`,
  );

  // Read releases for each project
  const projectVersions = {};

  for (const project of projects) {
    const releases = await readReleases(newsRepoPath, project);
    projectVersions[project.id] = releases;
    console.log(`  ${project.id}: ${releases.length} releases`);

    // Create project directory
    const projectDir = path.join(changelogContentDir, project.id);
    await fs.mkdir(projectDir, { recursive: true });

    // Generate MDX files for each release
    for (const release of releases) {
      const mdxPath = path.join(projectDir, `${release.slug}.mdx`);
      const mdxContent = generateMdxContent(project, release);
      await fs.writeFile(mdxPath, mdxContent);
    }

    // Generate index file for the project (hidden from sidebar)
    const indexPath = path.join(projectDir, "index.mdx");

    // Get releases from the current major version (excluding unreleased)
    const releasedVersions = releases.filter((r) => !r.isUnreleased);
    const latestRelease = releasedVersions[0];
    const currentMajor = latestRelease?.majorVersion;
    const currentMajorReleases = releasedVersions.filter(
      (r) => r.majorVersion === currentMajor,
    );

    // Generate LinkCards for all releases in current major version
    const releaseCards = currentMajorReleases
      .map((r) => {
        let description = r.intro || "";
        if (description.length > 300) {
          description = description.slice(0, 297) + "...";
        }
        // Escape quotes for JSX
        description = description.replace(/"/g, '\\"');
        return `<LinkCard
  title="${project.name} ${r.version}"
  description="${description}"
  href="/changelog/${project.id}/${r.slug}"
  badge="${r.created}"
/>`;
      })
      .join("\n\n");

    const indexContent = `---
title: ${project.name}
description: ${project.description}
sidebar:
  hidden: true
---

import LinkCard from '@components/LinkCard.astro';

${project.description ? project.description + "\n\n" : ""}${
      latestRelease ? releaseCards : "No releases available yet."
    }
`;
    await fs.writeFile(indexPath, indexContent);
  }

  // Generate main changelog landing page
  // Icons are defined in src/topics.ts - use generic icon here, topics.ts is authoritative
  const projectCards = projects
    .map((project) => {
      const releases = projectVersions[project.id] || [];
      const latestRelease = releases.find((r) => !r.isUnreleased);
      const version = latestRelease?.version || "";
      const icon = projectIcons[project.id] || "document";
      return `<LinkCard
  title="${project.name}"
  description="${project.description}"
  href="/changelog/${project.id}"
  icon="${icon}"
  badge="${version}"
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
  const sidebarContent = generateSidebarFile(projects, projectVersions);
  await fs.writeFile(sidebarFilePath, sidebarContent);
  console.log(`Generated: src/sidebar-changelog.generated.ts`);

  console.log(`\nSync complete!`);
  console.log(
    `Generated ${Object.values(projectVersions).flat().length} changelog pages.`,
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
