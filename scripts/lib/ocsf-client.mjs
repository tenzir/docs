/**
 * OCSF client for reading schema data from local files.
 * Requires OCSF_LOCAL_DIR environment variable pointing to the schemas directory.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

// GitHub API for ocsf-docs repository (still fetched remotely)
const OCSF_DOCS_API = "https://api.github.com/repos/ocsf/ocsf-docs/contents";
const OCSF_DOCS_RAW = "https://raw.githubusercontent.com/ocsf/ocsf-docs/main";

/**
 * Get the local schemas directory from environment.
 */
function getLocalDir() {
  const dir = process.env.OCSF_LOCAL_DIR;
  if (!dir) {
    throw new Error(
      "OCSF_LOCAL_DIR environment variable is required. " +
        "Run the build-ocsf action first or set it to your local schemas directory.",
    );
  }
  return dir;
}

/**
 * Read JSON from a local file.
 */
async function readLocalJson(filePath) {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Fetch JSON from a URL with timeout (for GitHub API).
 */
export async function fetchJson(url, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch text from a URL with timeout (for GitHub API).
 */
export async function fetchText(url, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch current/latest OCSF version from local versions.json.
 */
export async function fetchCurrentVersion() {
  const versions = await fetchAvailableVersions();
  // Return the last (latest) version
  const current = versions[versions.length - 1];
  console.log(`  Current version: ${current}`);
  return current;
}

/**
 * Fetch list of available OCSF versions from local versions.json.
 * Returns versions sorted ascending.
 */
export async function fetchAvailableVersions() {
  const localDir = getLocalDir();
  const versionsFile = join(localDir, "versions.json");

  console.log(`Reading available versions from ${versionsFile}...`);
  const versions = await readLocalJson(versionsFile);

  // Sort by semantic version (dev versions sort after their base version)
  versions.sort((a, b) => {
    const parseVersion = (v) => {
      const isDev = v.includes("-dev");
      const clean = v.replace(/-dev$/, "");
      const [major, minor, patch] = clean.split(".").map(Number);
      return { major, minor, patch, isDev };
    };
    const va = parseVersion(a);
    const vb = parseVersion(b);
    return (
      va.major - vb.major ||
      va.minor - vb.minor ||
      va.patch - vb.patch ||
      (va.isDev === vb.isDev ? 0 : va.isDev ? 1 : -1)
    );
  });

  console.log(
    `  Found ${versions.length} versions: ${versions[0]} to ${versions[versions.length - 1]}`,
  );
  return versions;
}

/**
 * Fetch OCSF schema for a specific version from local files.
 */
export async function fetchSchema(version) {
  const localDir = getLocalDir();
  const schemaFile = join(localDir, version, "schema.json");
  console.log(`Reading schema from ${schemaFile}...`);
  return await readLocalJson(schemaFile);
}

/**
 * Fetch OCSF profiles for a specific version from local files.
 */
export async function fetchProfiles(version) {
  const localDir = getLocalDir();
  const profilesFile = join(localDir, version, "profiles.json");
  console.log(`Reading profiles from ${profilesFile}...`);
  return await readLocalJson(profilesFile);
}

/**
 * Fetch OCSF extensions for a specific version from local files.
 */
export async function fetchExtensions(version) {
  const localDir = getLocalDir();
  const extensionsFile = join(localDir, version, "extensions.json");
  console.log(`Reading extensions from ${extensionsFile}...`);
  return await readLocalJson(extensionsFile);
}

/**
 * Fetch FAQ files from ocsf-docs repository.
 * Returns array of {name, content} objects.
 */
export async function fetchFaqs() {
  const faqsResponse = await fetchJson(`${OCSF_DOCS_API}/faqs`);
  // Filter to only actual FAQ .md files, exclude README and other non-FAQ files
  const faqFiles = faqsResponse.filter(
    (f) =>
      f.name.endsWith(".md") &&
      f.name.toLowerCase() !== "readme.md" &&
      !f.name.startsWith("."),
  );

  const results = [];
  for (const file of faqFiles) {
    const content = await fetchText(`${OCSF_DOCS_RAW}/faqs/${file.name}`);
    results.push({ name: file.name, content });
  }
  return results;
}

/**
 * Fetch article files from ocsf-docs repository.
 * Returns array of {name, content} objects.
 */
export async function fetchArticles() {
  const articlesResponse = await fetchJson(`${OCSF_DOCS_API}/articles`);
  // Filter to only actual article .md files, exclude README and other non-article files
  const articleFiles = articlesResponse.filter(
    (f) =>
      f.name.endsWith(".md") &&
      f.name.toLowerCase() !== "readme.md" &&
      !f.name.startsWith("."),
  );

  const results = [];
  for (const file of articleFiles) {
    const content = await fetchText(`${OCSF_DOCS_RAW}/articles/${file.name}`);
    results.push({ name: file.name, content });
  }
  return results;
}

/**
 * Fetch the OCSF overview document (understanding-ocsf.md).
 * Returns {name, content} object.
 */
export async function fetchOverview() {
  const content = await fetchText(
    `${OCSF_DOCS_RAW}/overview/understanding-ocsf.md`,
  );
  return { name: "understanding-ocsf.md", content };
}
