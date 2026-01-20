/**
 * OCSF API client for fetching schema data from schema.ocsf.io.
 */

const OCSF_BASE_URL = "https://schema.ocsf.io";

// GitHub API for ocsf-docs repository
const OCSF_DOCS_API = "https://api.github.com/repos/ocsf/ocsf-docs/contents";
const OCSF_DOCS_RAW = "https://raw.githubusercontent.com/ocsf/ocsf-docs/main";

/**
 * Fetch JSON from a URL with timeout.
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
 * Fetch text from a URL with timeout.
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
 * Fetch current/latest OCSF version.
 */
export async function fetchCurrentVersion() {
  const url = `${OCSF_BASE_URL}/api/version`;
  console.log(`Fetching current version from ${url}...`);
  const data = await fetchJson(url);
  console.log(`  Current version: ${data.version}`);
  return data.version;
}

/**
 * Fetch list of available OCSF versions.
 * Returns only stable versions (excludes alpha, beta, rc), sorted ascending.
 */
export async function fetchAvailableVersions() {
  const url = `${OCSF_BASE_URL}/api/versions`;
  console.log(`Fetching available versions from ${url}...`);
  const data = await fetchJson(url);

  // Extract version strings from version objects
  const versions = (data.versions || []).map((v) =>
    typeof v === "string" ? v : v.version,
  );

  // Filter to stable and dev versions (exclude alpha, beta, rc)
  const stable = versions.filter(
    (v) =>
      !["alpha", "beta", "rc"].some((tag) => v.toLowerCase().includes(tag)),
  );

  // Sort by semantic version (dev versions sort after their base version)
  stable.sort((a, b) => {
    // Parse version: "1.8.0-dev" -> {major: 1, minor: 8, patch: 0, isDev: true}
    const parseVersion = (v) => {
      const isDev = v.includes("-dev");
      const clean = v.replace(/-dev$/, "");
      const [major, minor, patch] = clean.split(".").map(Number);
      return { major, minor, patch, isDev };
    };
    const va = parseVersion(a);
    const vb = parseVersion(b);
    // Sort by major, minor, patch, then dev versions last
    return (
      va.major - vb.major ||
      va.minor - vb.minor ||
      va.patch - vb.patch ||
      (va.isDev === vb.isDev ? 0 : va.isDev ? 1 : -1)
    );
  });

  console.log(
    `  Found ${stable.length} versions: ${stable[0]} to ${stable[stable.length - 1]}`,
  );
  return stable;
}

/**
 * Fetch OCSF schema for a specific version.
 */
export async function fetchSchema(version) {
  const url = version
    ? `${OCSF_BASE_URL}/${version}/export/schema`
    : `${OCSF_BASE_URL}/export/schema`;
  console.log(`Fetching schema from ${url}...`);
  return await fetchJson(url, 120000);
}

/**
 * Fetch OCSF profiles for a specific version.
 */
export async function fetchProfiles(version) {
  const url = version
    ? `${OCSF_BASE_URL}/api/${version}/profiles`
    : `${OCSF_BASE_URL}/api/profiles`;
  console.log(`Fetching profiles from ${url}...`);
  return await fetchJson(url);
}

/**
 * Fetch OCSF extensions for a specific version.
 */
export async function fetchExtensions(version) {
  const url = version
    ? `${OCSF_BASE_URL}/api/${version}/extensions`
    : `${OCSF_BASE_URL}/api/extensions`;
  console.log(`Fetching extensions from ${url}...`);
  return await fetchJson(url);
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
