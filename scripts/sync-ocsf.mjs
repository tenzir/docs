#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sync OCSF reference documentation from schema.ocsf.io.
 *
 * Usage:
 *   node sync-ocsf.mjs              # Generate latest version only
 *   node sync-ocsf.mjs --all        # Generate all stable versions
 *   node sync-ocsf.mjs --version X  # Generate specific version
 */

import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

const OCSF_BASE_URL = "https://schema.ocsf.io";
const DOCS_ROOT = process.cwd();
const OUTPUT_DIR = path.join(DOCS_ROOT, "src/content/docs/reference/ocsf");
const REDIRECTS_FILE = path.join(DOCS_ROOT, "src/utils/redirects.mjs");
const SIDEBAR_FILE = path.join(DOCS_ROOT, "src/sidebar.ts");

// GitHub API for ocsf-docs repository
const OCSF_DOCS_API = "https://api.github.com/repos/ocsf/ocsf-docs/contents";
const OCSF_DOCS_RAW = "https://raw.githubusercontent.com/ocsf/ocsf-docs/main";

/**
 * Fetch JSON from a URL with timeout.
 */
async function fetchJson(url, timeout = 30000) {
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
async function fetchText(url, timeout = 30000) {
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
async function fetchCurrentVersion() {
  const url = `${OCSF_BASE_URL}/api/version`;
  console.log(`Fetching current version from ${url}...`);
  const data = await fetchJson(url);
  console.log(`  Current version: ${data.version}`);
  return data.version;
}

/**
 * Fetch list of available OCSF versions.
 */
async function fetchAvailableVersions() {
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
async function fetchSchema(version) {
  const url = version
    ? `${OCSF_BASE_URL}/${version}/export/schema`
    : `${OCSF_BASE_URL}/export/schema`;
  console.log(`Fetching schema from ${url}...`);
  return await fetchJson(url, 120000);
}

/**
 * Fetch OCSF profiles for a specific version.
 */
async function fetchProfiles(version) {
  const url = version
    ? `${OCSF_BASE_URL}/api/${version}/profiles`
    : `${OCSF_BASE_URL}/api/profiles`;
  console.log(`Fetching profiles from ${url}...`);
  return await fetchJson(url);
}

/**
 * Convert version string to URL-safe slug (1.7.0 -> 1-7-0).
 */
function versionToSlug(version) {
  return version.replace(/\./g, "-");
}

/**
 * Clean HTML tags from description text.
 */
function cleanDescription(text) {
  if (!text) return "";
  return text
    .replace(/<code>/g, "`")
    .replace(/<\/code>/g, "`")
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<a[^>]*href=['"]([^'"]+)['"][^>]*>([^<]+)<\/a>/g, "[$2]($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+$/gm, ""); // Remove trailing whitespace from each line
}

/**
 * Extract first sentence for description meta.
 * Handles version numbers (e.g., "1.3") without treating them as sentence endings.
 */
function extractFirstSentence(text) {
  if (!text) return "";
  const cleaned = cleanDescription(text);
  // Match until a sentence-ending punctuation followed by space+capital or end
  // But not periods in version numbers like "1.3" or "v2.0"
  const match = cleaned.match(/^.+?[.!?](?=\s+[A-Z]|\s*$)/);
  if (match) {
    return match[0].trim();
  }
  // Fallback: take first 160 chars
  return cleaned.slice(0, 160).trim();
}

/**
 * Generate MDX frontmatter.
 */
function generateFrontmatter({ title, description, sidebarLabel }) {
  // Escape quotes in all string values
  const escapedTitle = title.replace(/"/g, '\\"');
  const lines = ["---", `title: "${escapedTitle}"`];
  if (description) {
    const escapedDesc = description.replace(/"/g, '\\"');
    lines.push(`description: "${escapedDesc}"`);
  }
  if (sidebarLabel) {
    const escapedLabel = sidebarLabel.replace(/"/g, '\\"');
    lines.push("sidebar:");
    lines.push(`  label: "${escapedLabel}"`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

/**
 * Generate class documentation as MDX.
 */
function generateClassDoc(className, classData, allObjects, versionSlug) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  const caption = classData.caption || className;
  // Handle uid=0 correctly (0 is falsy but valid)
  const uid =
    classData.uid !== undefined && classData.uid !== null ? classData.uid : "";
  const description = cleanDescription(classData.description || "");

  // Frontmatter (Starlight uses title as page heading)
  const title = uid !== "" ? `${caption} (${uid})` : caption;
  lines.push(
    generateFrontmatter({
      title,
      description: extractFirstSentence(classData.description),
    }),
  );

  // Description
  if (description) {
    lines.push(description, "");
  }

  // Metadata
  const category = classData.category || "";
  const categoryName = classData.category_name || category;
  const extendsClass = classData.extends || "";
  if (categoryName) {
    lines.push(`- **Category**: ${categoryName}`);
  }
  if (extendsClass) {
    lines.push(`- **Extends**: \`${extendsClass}\``);
  }
  if (uid !== "") {
    lines.push(`- **UID**: \`${uid}\``);
  }
  lines.push("");

  // Profiles
  const profiles = classData.profiles || [];
  if (profiles.length > 0) {
    lines.push("## Profiles", "");
    lines.push(
      profiles
        .map((p) => {
          const filename = p.replace(/\//g, "_");
          return `[\`${p}\`](${basePath}/profiles/${filename})`;
        })
        .join(", "),
      "",
    );
  }

  // Attributes by requirement
  const attributes = classData.attributes || {};
  if (Object.keys(attributes).length > 0) {
    const required = [];
    const recommended = [];
    const optional = [];

    // Helper to format type with proper backticks
    function formatType(baseType, objType) {
      if (objType) {
        return `\`object\` (\`${objType}\`)`;
      }
      return `\`${baseType}\``;
    }

    for (const [attrName, attrData] of Object.entries(attributes).sort()) {
      const req = attrData.requirement || "optional";
      const baseType = attrData.type || "";
      const objType = attrData.object_type;
      const formattedType = formatType(baseType, objType);
      // Use full description if available, otherwise fall back to caption
      const desc = cleanDescription(
        attrData.description || attrData.caption || "",
      );

      const entry = [attrName, formattedType, desc];
      if (req === "required") {
        required.push(entry);
      } else if (req === "recommended") {
        recommended.push(entry);
      } else {
        optional.push(entry);
      }
    }

    lines.push("## Attributes", "");

    if (required.length > 0) {
      lines.push("### Required", "");
      lines.push(
        "| Attribute | Type | Description |",
        "|-----------|------|-------------|",
      );
      for (const [name, type, desc] of required) {
        lines.push(`| \`${name}\` | ${type} | ${desc} |`);
      }
      lines.push("");
    }

    if (recommended.length > 0) {
      lines.push("### Recommended", "");
      lines.push(
        "| Attribute | Type | Description |",
        "|-----------|------|-------------|",
      );
      for (const [name, type, desc] of recommended) {
        lines.push(`| \`${name}\` | ${type} | ${desc} |`);
      }
      lines.push("");
    }

    if (optional.length > 0) {
      lines.push("### Optional", "");
      lines.push(
        "| Attribute | Type | Description |",
        "|-----------|------|-------------|",
      );
      for (const [name, type, desc] of optional) {
        lines.push(`| \`${name}\` | ${type} | ${desc} |`);
      }
      lines.push("");
    }
  }

  // Object references
  const objectRefs = new Set();
  for (const attrData of Object.values(attributes)) {
    const objType = attrData.object_type;
    if (objType && allObjects[objType]) {
      objectRefs.add(objType);
    }
  }

  if (objectRefs.size > 0) {
    lines.push("## Objects Used", "");
    for (const objName of [...objectRefs].sort()) {
      const filename = objName.replace(/\//g, "_");
      lines.push(`- [\`${objName}\`](${basePath}/objects/${filename})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate object documentation as MDX.
 */
function generateObjectDoc(objName, objData, classUsage, versionSlug) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  const caption = objData.caption || objName;
  const description = cleanDescription(objData.description || "");

  // Frontmatter
  lines.push(
    generateFrontmatter({
      title: caption,
      description: extractFirstSentence(objData.description),
    }),
  );

  // Description
  if (description) {
    lines.push(description, "");
  }

  // Extends
  const extendsObj = objData.extends || "";
  if (extendsObj && extendsObj !== "object") {
    lines.push(`- **Extends**: \`${extendsObj}\``, "");
  }

  // Attributes
  const attributes = objData.attributes || {};
  if (Object.keys(attributes).length > 0) {
    lines.push("## Attributes", "");

    for (const [attrName, attrData] of Object.entries(attributes).sort()) {
      const baseType = attrData.type || "";
      const objType = attrData.object_type;
      const formattedType = objType
        ? `\`object\` (\`${objType}\`)`
        : `\`${baseType}\``;
      const req = attrData.requirement || "optional";
      // Use full description if available, otherwise fall back to caption
      const desc = cleanDescription(
        attrData.description || attrData.caption || "",
      );
      const descPart = desc ? `: ${desc}` : "";
      lines.push(`- \`${attrName}\` (${formattedType}, *${req}*)${descPart}`);
    }
    lines.push("");
  }

  // Constraints
  const constraints = objData.constraints || {};
  const atLeastOne = constraints.at_least_one || [];
  if (atLeastOne.length > 0) {
    lines.push("## Constraints", "");
    lines.push(
      `At least one of: ${atLeastOne.map((c) => `\`${c}\``).join(", ")}`,
      "",
    );
  }

  // Used by classes
  const usedBy = classUsage[objName] || [];
  if (usedBy.length > 0) {
    lines.push("## Used By", "");
    for (const className of usedBy.sort()) {
      const filename = className.replace(/\//g, "_");
      lines.push(`- [\`${className}\`](${basePath}/classes/${filename})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate profile documentation as MDX.
 */
function generateProfileDoc(profileName, profileData) {
  const lines = [];

  const caption = profileData.caption || profileName;
  const description = cleanDescription(profileData.description || "");

  // Frontmatter
  lines.push(
    generateFrontmatter({
      title: caption,
      description: extractFirstSentence(profileData.description),
    }),
  );

  // Description
  if (description) {
    lines.push(description, "");
  }

  // Extension info
  const extension = profileData.extension;
  if (extension) {
    lines.push(`- **Extension**: \`${extension}\``, "");
  }

  // Attributes
  const attributes = profileData.attributes || {};
  if (Object.keys(attributes).length > 0) {
    lines.push("## Attributes", "");
    lines.push(
      "| Attribute | Type | Requirement | Description |",
      "|-----------|------|-------------|-------------|",
    );

    for (const [attrName, attrData] of Object.entries(attributes).sort()) {
      const baseType = attrData.type || "";
      const objType = attrData.object_type;
      const formattedType = objType
        ? `\`object\` (\`${objType}\`)`
        : `\`${baseType}\``;
      const req = attrData.requirement || "optional";
      // Use full description if available, otherwise fall back to caption
      const desc = cleanDescription(
        attrData.description || attrData.caption || "",
      );
      lines.push(`| \`${attrName}\` | ${formattedType} | *${req}* | ${desc} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build class usage map: object -> list of classes that use it.
 */
function buildClassUsage(classes, objects) {
  const usage = {};
  for (const objName of Object.keys(objects)) {
    usage[objName] = [];
  }

  for (const [className, classData] of Object.entries(classes)) {
    const attributes = classData.attributes || {};
    for (const attrData of Object.values(attributes)) {
      const objType = attrData.object_type;
      if (objType && usage[objType]) {
        usage[objType].push(className);
      }
    }
  }

  return usage;
}

/**
 * Generate classes overview MDX.
 */
function generateClassesOverview(version, classes, versionSlug) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  lines.push(
    generateFrontmatter({
      title: "Event Classes",
      description: `Complete listing of OCSF ${version} event classes by category.`,
      sidebarLabel: "Classes",
    }),
  );

  lines.push("Complete listing of event classes by category.", "");

  // Group by category
  const byCategory = {};
  for (const [className, classData] of Object.entries(classes)) {
    const cat = classData.category_name || "Other";
    const uid = classData.uid || 0;
    const caption = classData.caption || className;
    const desc = extractFirstSentence(classData.description);
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push([className, uid, caption, desc]);
  }

  // Sort categories by their lowest UID
  const sortedCats = Object.keys(byCategory).sort(
    (a, b) =>
      Math.min(...byCategory[a].map((x) => x[1])) -
      Math.min(...byCategory[b].map((x) => x[1])),
  );

  for (const category of sortedCats) {
    lines.push(`## ${category}`, "");
    for (const [className, uid, caption, desc] of byCategory[category].sort(
      (a, b) => a[1] - b[1],
    )) {
      const filename = className.replace(/\//g, "_");
      const descPart = desc ? `: ${desc}` : "";
      lines.push(
        `- [${caption} (${uid})](${basePath}/classes/${filename})${descPart}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate objects overview MDX.
 */
function generateObjectsOverview(version, objects, versionSlug) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  lines.push(
    generateFrontmatter({
      title: "Objects",
      description: `Complete listing of OCSF ${version} objects by category.`,
      sidebarLabel: "Objects",
    }),
  );

  lines.push("Complete listing of objects by category.", "");

  // Categorize objects based on naming patterns
  const categories = {
    "Identity & Access": [],
    "Process & System": [],
    Network: [],
    "File & Data": [],
    "Security & Compliance": [],
    "Cloud & Infrastructure": [],
    Observability: [],
    Windows: [],
    Other: [],
  };

  const identityKw = [
    "account",
    "actor",
    "auth",
    "user",
    "group",
    "idp",
    "ldap",
    "org",
    "policy",
    "session",
    "sso",
    "ticket",
    "trait",
  ];
  const processKw = [
    "agent",
    "application",
    "container",
    "device",
    "display",
    "environment",
    "image",
    "kernel",
    "keyboard",
    "module",
    "os",
    "peripheral",
    "process",
    "service",
    "startup",
  ];
  const networkKw = [
    "autonomous",
    "dns",
    "endpoint",
    "firewall",
    "http",
    "load_balancer",
    "network",
    "proxy",
    "tls",
    "tunnel",
  ];
  const fileKw = [
    "data_class",
    "data_security",
    "database",
    "databucket",
    "digital_signature",
    "encryption",
    "file",
    "fingerprint",
    "hassh",
    "ja4",
    "package",
    "sbom",
    "script",
    "software",
  ];
  const securityKw = [
    "analytic",
    "anomaly",
    "assessment",
    "attack",
    "baseline",
    "campaign",
    "check",
    "cis",
    "compliance",
    "cve",
    "cvss",
    "cwe",
    "d3f",
    "finding",
    "kill_chain",
    "malware",
    "mitigation",
    "osint",
    "rule",
    "vulnerability",
  ];
  const cloudKw = [
    "api",
    "cloud",
    "function",
    "job",
    "managed",
    "product",
    "reporter",
    "request",
    "resource",
    "response",
    "web_resource",
  ];
  const observabilityKw = [
    "enrichment",
    "evidence",
    "graph",
    "logger",
    "metric",
    "node",
    "observable",
    "observation",
    "occurrence",
    "span",
    "trace",
    "transformation",
  ];

  for (const [objName, objData] of Object.entries(objects)) {
    const caption = objData.caption || objName;
    const desc = extractFirstSentence(objData.description);
    const entry = [objName, caption, desc];
    const nameLower = objName.toLowerCase();

    if (objName.startsWith("win/")) {
      categories["Windows"].push(entry);
    } else if (identityKw.some((kw) => nameLower.includes(kw))) {
      categories["Identity & Access"].push(entry);
    } else if (processKw.some((kw) => nameLower.includes(kw))) {
      categories["Process & System"].push(entry);
    } else if (networkKw.some((kw) => nameLower.includes(kw))) {
      categories["Network"].push(entry);
    } else if (fileKw.some((kw) => nameLower.includes(kw))) {
      categories["File & Data"].push(entry);
    } else if (securityKw.some((kw) => nameLower.includes(kw))) {
      categories["Security & Compliance"].push(entry);
    } else if (cloudKw.some((kw) => nameLower.includes(kw))) {
      categories["Cloud & Infrastructure"].push(entry);
    } else if (observabilityKw.some((kw) => nameLower.includes(kw))) {
      categories["Observability"].push(entry);
    } else {
      categories["Other"].push(entry);
    }
  }

  for (const [category, items] of Object.entries(categories)) {
    if (items.length === 0) continue;
    lines.push(`## ${category} (${items.length} objects)`, "");
    for (const [objName, caption, desc] of items.sort()) {
      const filename = objName.replace(/\//g, "_");
      const descPart = desc ? `: ${desc}` : "";
      lines.push(`- [${caption}](${basePath}/objects/${filename})${descPart}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate profiles overview MDX.
 */
function generateProfilesOverview(version, profiles, versionSlug) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  lines.push(
    generateFrontmatter({
      title: "Profiles",
      description: `Complete listing of OCSF ${version} profiles.`,
      sidebarLabel: "Profiles",
    }),
  );

  lines.push(
    "Profiles are reusable attribute sets that can be applied to event classes to add common functionality like host information, user details, or malware analysis.",
    "",
  );

  for (const profileName of Object.keys(profiles).sort()) {
    const profileData = profiles[profileName];
    const caption = profileData.caption || profileName;
    const desc = extractFirstSentence(profileData.description);
    const filename = profileName.replace(/\//g, "_");
    const descPart = desc ? `: ${desc}` : "";
    lines.push(`- [${caption}](${basePath}/profiles/${filename})${descPart}`);
  }
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate data types overview MDX.
 */
function generateTypesOverview(version, types, _versionSlug) {
  const lines = [];

  lines.push(
    generateFrontmatter({
      title: "Types",
      description: `Complete listing of OCSF ${version} types.`,
      sidebarLabel: "Types",
    }),
  );

  lines.push(
    "Types define the format and validation rules for attribute values in OCSF.",
    "",
  );

  lines.push("| Type | Caption | Base Type | Description |");
  lines.push("|------|---------|-----------|-------------|");

  for (const typeName of Object.keys(types).sort()) {
    const typeData = types[typeName];
    const caption = typeData.caption || typeName;
    const baseType = typeData.type || "";
    const baseTypeFormatted = baseType ? `\`${baseType}\`` : "—";
    const desc = cleanDescription(typeData.description || "");
    lines.push(
      `| \`${typeName}\` | ${caption} | ${baseTypeFormatted} | ${desc} |`,
    );
  }
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate version index MDX.
 */
function generateVersionIndex(
  version,
  classes,
  objects,
  profiles,
  types,
  versionSlug,
) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  lines.push(
    generateFrontmatter({
      title: `OCSF v${version}`,
      description: `Schema reference for OCSF version ${version}.`,
      sidebarLabel: version,
    }),
  );

  lines.push(`Schema reference for OCSF version ${version}.`, "");

  lines.push(`## [Classes](${basePath}/classes)`, "");
  lines.push(
    `Event classes define the structure and semantics of security events. Each class represents a specific type of activity like authentication, file operations, or network connections. OCSF ${version} includes ${Object.keys(classes).length} event classes organized by category.`,
    "",
  );

  lines.push(`## [Objects](${basePath}/objects)`, "");
  lines.push(
    `Objects are reusable data structures embedded within event classes. They represent entities like users, devices, files, and network endpoints. OCSF ${version} defines ${Object.keys(objects).length} objects.`,
    "",
  );

  lines.push(`## [Profiles](${basePath}/profiles)`, "");
  lines.push(
    `Profiles are optional attribute sets that extend event classes with additional context. They enable consistent representation of cross-cutting concerns like host information or malware analysis. OCSF ${version} includes ${Object.keys(profiles).length} profiles.`,
    "",
  );

  lines.push(`## [Types](${basePath}/types)`, "");
  lines.push(
    `Types define the format and validation rules for attribute values. OCSF ${version} defines ${Object.keys(types).length} types.`,
    "",
  );

  return lines.join("\n");
}

/**
 * Generate documentation for a specific OCSF version.
 */
async function generateVersion(version) {
  // Fetch schema and profiles
  const schema = await fetchSchema(version);
  const profiles = await fetchProfiles(version);
  const classes = schema.classes || {};
  const objects = schema.objects || {};
  const types = schema.types || {};

  console.log(
    `  Found ${Object.keys(classes).length} classes, ${Object.keys(objects).length} objects, ${Object.keys(profiles).length} profiles, ${Object.keys(types).length} types`,
  );

  // Build class usage map
  const classUsage = buildClassUsage(classes, objects);

  // Create version-specific output directories (use dashes for URL compatibility)
  const versionSlug = versionToSlug(version);
  const versionDir = path.join(OUTPUT_DIR, versionSlug);
  const classesDir = path.join(versionDir, "classes");
  const objectsDir = path.join(versionDir, "objects");
  const profilesDir = path.join(versionDir, "profiles");
  const typesDir = path.join(versionDir, "types");

  await fs.mkdir(classesDir, { recursive: true });
  await fs.mkdir(objectsDir, { recursive: true });
  await fs.mkdir(profilesDir, { recursive: true });
  await fs.mkdir(typesDir, { recursive: true });

  let totalSize = 0;

  // Generate class docs
  for (const [className, classData] of Object.entries(classes)) {
    const filename = className.replace(/\//g, "_") + ".mdx";
    const doc = generateClassDoc(className, classData, objects, versionSlug);
    await fs.writeFile(path.join(classesDir, filename), doc);
    totalSize += doc.length;
  }

  // Generate object docs
  for (const [objName, objData] of Object.entries(objects)) {
    const filename = objName.replace(/\//g, "_") + ".mdx";
    const doc = generateObjectDoc(objName, objData, classUsage, versionSlug);
    await fs.writeFile(path.join(objectsDir, filename), doc);
    totalSize += doc.length;
  }

  // Generate profile docs
  for (const [profileName, profileData] of Object.entries(profiles)) {
    const filename = profileName.replace(/\//g, "_") + ".mdx";
    const doc = generateProfileDoc(profileName, profileData);
    await fs.writeFile(path.join(profilesDir, filename), doc);
    totalSize += doc.length;
  }

  // Generate index files for each category (classes, objects, profiles)
  const classesOverview = generateClassesOverview(
    version,
    classes,
    versionSlug,
  );
  await fs.writeFile(path.join(classesDir, "index.mdx"), classesOverview);
  totalSize += classesOverview.length;

  const objectsOverview = generateObjectsOverview(
    version,
    objects,
    versionSlug,
  );
  await fs.writeFile(path.join(objectsDir, "index.mdx"), objectsOverview);
  totalSize += objectsOverview.length;

  const profilesOverview = generateProfilesOverview(
    version,
    profiles,
    versionSlug,
  );
  await fs.writeFile(path.join(profilesDir, "index.mdx"), profilesOverview);
  totalSize += profilesOverview.length;

  const typesOverview = generateTypesOverview(version, types, versionSlug);
  await fs.writeFile(path.join(typesDir, "index.mdx"), typesOverview);
  totalSize += typesOverview.length;

  // Generate version index
  const versionIndex = generateVersionIndex(
    version,
    classes,
    objects,
    profiles,
    types,
    versionSlug,
  );
  await fs.writeFile(path.join(versionDir, "index.mdx"), versionIndex);
  totalSize += versionIndex.length;

  return totalSize;
}

/**
 * Sync FAQs and articles from ocsf-docs repository.
 */
async function syncDocs() {
  console.log("Syncing FAQs and articles from ocsf-docs...");

  const faqsDir = path.join(OUTPUT_DIR, "faqs");
  const articlesDir = path.join(OUTPUT_DIR, "articles");

  await fs.mkdir(faqsDir, { recursive: true });
  await fs.mkdir(articlesDir, { recursive: true });

  // Sync FAQs - each question becomes its own page
  try {
    const faqsResponse = await fetchJson(`${OCSF_DOCS_API}/faqs`);
    // Filter to only actual FAQ .md files, exclude README and other non-FAQ files
    const faqFiles = faqsResponse.filter(
      (f) =>
        f.name.endsWith(".md") &&
        f.name.toLowerCase() !== "readme.md" &&
        !f.name.startsWith("."),
    );

    const allQuestions = [];

    for (const file of faqFiles) {
      const content = await fetchText(`${OCSF_DOCS_RAW}/faqs/${file.name}`);

      // Split content by ## headings (questions)
      // Each section starts with "## Question" and ends before the next "##" or "---"
      const sections = content.split(/(?=^## )/m).filter((s) => s.trim());

      for (const section of sections) {
        // Extract question title from ## heading
        const questionMatch = section.match(/^##\s+(.+?)[\r\n]/);
        if (!questionMatch) continue;

        const questionTitle = questionMatch[1].trim();
        // Create URL-friendly slug from question
        const slug = questionTitle
          .toLowerCase()
          .replace(/[?`'"]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60); // Limit length

        // Get the answer content (everything after the heading, before ---)
        const answerContent = section
          .replace(/^##\s+.+?\n/, "") // Remove ## heading
          .replace(/\n---\s*$/, "") // Remove trailing ---
          .trim();

        if (!answerContent) continue;

        allQuestions.push({
          title: questionTitle,
          slug,
          content: answerContent,
        });

        const mdx =
          generateFrontmatter({
            title: questionTitle,
            description: `OCSF FAQ: ${questionTitle}`,
            sidebarLabel: slug,
          }) +
          answerContent +
          "\n";

        await fs.writeFile(path.join(faqsDir, `${slug}.md`), mdx);
      }
    }

    // Generate FAQs index
    const faqsIndex =
      generateFrontmatter({
        title: "OCSF FAQs",
        description:
          "Frequently asked questions about the Open Cybersecurity Schema Framework.",
        sidebarLabel: "FAQs",
      }) +
      `Frequently asked questions about the Open Cybersecurity Schema Framework.

${allQuestions
  .map((q) => `- [${q.title}](/reference/ocsf/faqs/${q.slug})`)
  .join("\n")}
`;
    await fs.writeFile(path.join(faqsDir, "index.md"), faqsIndex);
    console.log(`  Synced ${allQuestions.length} FAQ questions`);
  } catch (err) {
    console.warn(`  Warning: Could not sync FAQs: ${err.message}`);
  }

  // Sync articles
  try {
    const articlesResponse = await fetchJson(`${OCSF_DOCS_API}/articles`);
    // Filter to only actual article .md files, exclude README and other non-article files
    const articleFiles = articlesResponse.filter(
      (f) =>
        f.name.endsWith(".md") &&
        f.name.toLowerCase() !== "readme.md" &&
        !f.name.startsWith("."),
    );

    const articles = [];

    for (const file of articleFiles) {
      const content = await fetchText(`${OCSF_DOCS_RAW}/articles/${file.name}`);
      const baseName = file.name.replace(/\.md$/, "");

      // Extract title from first H1 or use filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : baseName.replace(/-/g, " ");

      articles.push({ slug: baseName, title });

      // Remove the H1 title from content (Starlight uses frontmatter title)
      // Also fix malformed markdown links with double parentheses: [text]((url)) -> [text](url)
      const contentWithoutTitle = content
        .replace(/^#\s+.+\n/, "")
        .replace(/\]\(\(([^)]+)\)\)/g, "]($1)");

      const mdx =
        generateFrontmatter({
          title,
          description: `OCSF article: ${title}`,
          sidebarLabel: baseName,
        }) + contentWithoutTitle;

      await fs.writeFile(path.join(articlesDir, `${baseName}.md`), mdx);
    }

    // Generate articles index
    const articlesIndex = `---
title: "OCSF Articles"
description: "In-depth articles about using the Open Cybersecurity Schema Framework."
sidebar:
  label: "Articles"
---

In-depth articles about using the Open Cybersecurity Schema Framework.

${articles.map((a) => `- [${a.title}](/reference/ocsf/articles/${a.slug})`).join("\n")}
`;
    await fs.writeFile(path.join(articlesDir, "index.mdx"), articlesIndex);
    console.log(`  Synced ${articles.length} article files`);
  } catch (err) {
    console.warn(`  Warning: Could not sync articles: ${err.message}`);
  }
}

/**
 * Update redirects.mjs and sidebar.ts with the latest version.
 */
async function updateVersionReferences(latestVersion) {
  console.log(`Updating version references to: ${latestVersion}`);

  const versionSlug = versionToSlug(latestVersion);

  // Update redirects.mjs
  try {
    let content = await fs.readFile(REDIRECTS_FILE, "utf-8");

    // Update version slug in redirect (handles both stable and -dev versions)
    content = content.replace(
      /\/reference\/ocsf\/\d+-\d+-\d+(-dev)?/g,
      `/reference/ocsf/${versionSlug}`,
    );

    await fs.writeFile(REDIRECTS_FILE, content);
    console.log(`  Updated ${REDIRECTS_FILE}`);
  } catch (err) {
    console.warn(`  Warning: Could not update redirects: ${err.message}`);
  }

  // Update sidebar.ts
  try {
    let content = await fs.readFile(SIDEBAR_FILE, "utf-8");

    // Update OCSF version links in sidebar
    content = content.replace(
      /reference\/ocsf\/\d+-\d+-\d+(-dev)?\//g,
      `reference/ocsf/${versionSlug}/`,
    );

    await fs.writeFile(SIDEBAR_FILE, content);
    console.log(`  Updated ${SIDEBAR_FILE}`);
  } catch (err) {
    console.warn(`  Warning: Could not update sidebar: ${err.message}`);
  }
}

/**
 * Main entry point.
 */
async function main() {
  const args = process.argv.slice(2);
  const generateAll = args.includes("--all");
  const versionIndex = args.indexOf("--version");
  const specificVersion = versionIndex !== -1 ? args[versionIndex + 1] : null;

  // Determine which versions to generate
  let versions;
  if (generateAll) {
    versions = await fetchAvailableVersions();
  } else if (specificVersion) {
    versions = [specificVersion];
  } else {
    versions = [await fetchCurrentVersion()];
  }

  let totalSize = 0;
  const generatedVersions = [];

  for (const version of versions) {
    console.log(`\nGenerating documentation for OCSF ${version}...`);
    try {
      const size = await generateVersion(version);
      totalSize += size;
      generatedVersions.push(version);
      console.log(`  Generated ${(size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  // Sync FAQs and articles
  await syncDocs();

  // Update redirects and sidebar with latest stable version (not dev)
  if (generatedVersions.length > 0) {
    const latestStable = [...generatedVersions]
      .reverse()
      .find((v) => !v.includes("-dev"));
    if (latestStable) {
      await updateVersionReferences(latestStable);
    }
  }

  // Fix markdown lint issues in generated content
  console.log("\nFixing markdown lint issues...");
  try {
    execSync(
      `pnpm exec markdownlint --fix '${OUTPUT_DIR}/**/*.md' '${OUTPUT_DIR}/**/*.mdx'`,
      {
        cwd: DOCS_ROOT,
        stdio: "pipe",
      },
    );
    console.log("  Done");
  } catch {
    // markdownlint returns non-zero even after fixing if unfixable issues remain
    // This is expected for some edge cases, so we don't fail the whole script
    console.log("  Applied fixes (some issues may remain)");
  }

  console.log(`\nTotal: ${(totalSize / 1024).toFixed(1)} KB of documentation`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
