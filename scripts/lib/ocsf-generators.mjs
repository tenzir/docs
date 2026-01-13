/**
 * MDX generators for OCSF reference documentation.
 */

// =============================================================================
// Shared Helpers
// =============================================================================

/**
 * Convert version string to URL-safe slug (1.7.0 -> 1-7-0).
 */
export function versionToSlug(version) {
  return version.replace(/\./g, "-");
}

/**
 * Convert OCSF name to URL-safe slug (win/reg_key -> win_reg_key).
 */
export function nameToSlug(name) {
  return name.replace(/\//g, "_");
}

/**
 * Clean HTML tags from description text, converting to Markdown.
 */
export function cleanDescription(text) {
  if (!text) return "";
  return (
    text
      // Convert code tags
      .replace(/<code>/g, "`")
      .replace(/<\/code>/g, "`")
      // Convert external links (with protocol) to markdown
      .replace(
        /<a[^>]*href=['"](https?:\/\/[^'"]+)['"][^>]*>([^<]+)<\/a>/g,
        "[$2]($1)",
      )
      // Strip internal OCSF links (simple identifiers like "file_activity") - keep text only
      .replace(/<a[^>]*href=['"][^'"]*['"][^>]*>([^<]+)<\/a>/g, "$1")
      // Convert list items to Markdown bullets
      .replace(/<li[^>]*>/g, "\n- ")
      .replace(/<\/li>/g, "")
      // Remove list wrapper tags
      .replace(/<\/?ul[^>]*>/g, "")
      .replace(/<\/?ol[^>]*>/g, "")
      // Convert paragraphs to double newlines
      .replace(/<p[^>]*>/g, "\n\n")
      .replace(/<\/p>/g, "")
      // Convert line breaks
      .replace(/<br\s*\/?>/g, "\n")
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, "")
      // Normalize whitespace in link text
      .replace(/\[\s*([^\]]+?)\s*\]/g, "[$1]")
      // Clean up excessive newlines
      .replace(/\n{3,}/g, "\n\n")
      // Remove trailing whitespace from each line
      .replace(/[ \t]+$/gm, "")
      .trim()
  );
}

/**
 * Extract first sentence for description meta.
 * Handles version numbers (e.g., "1.3") without treating them as sentence endings.
 */
export function extractFirstSentence(text) {
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
 * Format attribute type for display in documentation.
 */
export function formatType(baseType, objType, versionSlug = null) {
  if (objType) {
    if (versionSlug) {
      return `[\`${objType}\`](/reference/ocsf/${versionSlug}/objects/${nameToSlug(objType)})`;
    }
    return `\`${objType}\``;
  }
  return `\`${baseType}\``;
}

/**
 * Format a single attribute as a definition list entry.
 * Unified function used across class, object, and profile documentation.
 *
 * @param {string} attrName - The attribute name
 * @param {object} attrData - The attribute data from OCSF API
 * @param {string} versionSlug - The version slug for links (e.g., "1-7-0")
 * @param {object} options - Optional formatting options
 * @param {string} options.basePath - Base path for links (default: computed from versionSlug)
 * @param {boolean} options.showProfile - Whether to show profile badge (default: true)
 * @param {boolean} options.useBadge - Whether to use Badge component for profiles (default: false)
 * @returns {string[]} Array of lines for the attribute entry
 */
export function formatAttribute(attrName, attrData, versionSlug, options = {}) {
  const basePath = options.basePath || `/reference/ocsf/${versionSlug}`;
  const showProfile = options.showProfile !== false;
  const showExtension = options.showExtension !== false;
  const useBadge = options.useBadge || false;

  const lines = [];
  const req = attrData.requirement || "optional";
  const baseType = attrData.type || "";
  const objType = attrData.object_type;
  const formattedType = formatType(baseType, objType, versionSlug);
  const desc = cleanDescription(attrData.description || attrData.caption || "");
  const profile = attrData.profile || "";
  const extension = attrData.extension || "";

  // Format attribute name with optional profile/extension indicators
  let badges = "";

  // Profile badge (blue/note)
  if (showProfile && profile) {
    const profileSlug = profile.replace(/\//g, "_");
    if (useBadge) {
      badges += ` <a href="${basePath}/profiles/${profileSlug}"><Badge text="${profile}" variant="note" size="small" /></a>`;
    } else {
      badges += ` *(profile: [\`${profile}\`](${basePath}/profiles/${profileSlug}))*`;
    }
  }

  // Extension badge (orange/caution) - always use Badge component
  if (showExtension && extension) {
    const extensionSlug = extension.replace(/\//g, "_");
    badges += ` <a href="${basePath}/extensions/${extensionSlug}"><Badge text="${extension}" variant="caution" size="small" /></a>`;
  }

  lines.push(`**\`${attrName}\`**${badges}`);
  lines.push("");
  lines.push(`- **Type**: ${formattedType}`);
  lines.push(`- **Requirement**: ${req}`);

  // Add enum values if present
  const enumValues = attrData.enum || {};
  if (Object.keys(enumValues).length > 0) {
    lines.push(`- **Values**:`);
    for (const [enumId, enumData] of Object.entries(enumValues).sort(
      (a, b) => Number(a[0]) - Number(b[0]),
    )) {
      const enumCaption = enumData.caption || enumId;
      const enumDesc = enumData.description
        ? `: ${cleanDescription(enumData.description)}`
        : "";
      lines.push(`  - \`${enumId}\` - \`${enumCaption}\`${enumDesc}`);
    }
  }

  if (desc) {
    lines.push("");
    lines.push(desc);
  }
  lines.push("");

  return lines;
}

/**
 * Generate MDX frontmatter.
 */
export function generateFrontmatter({ title, description, sidebarLabel }) {
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

// =============================================================================
// Class Documentation
// =============================================================================

/**
 * Generate class documentation as MDX.
 */
export function generateClassDoc(
  className,
  classData,
  allObjects,
  versionSlug,
) {
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

  // Import Badge component for profile indicators
  lines.push(`import { Badge } from '@astrojs/starlight/components';`, "");

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

  // Attributes grouped by group (classification, primary, occurrence, context)
  const attributes = classData.attributes || {};
  if (Object.keys(attributes).length > 0) {
    // Group attributes by their group field
    const byGroup = {};
    for (const [attrName, attrData] of Object.entries(attributes)) {
      const group = attrData.group || "context";
      if (!byGroup[group]) {
        byGroup[group] = [];
      }
      byGroup[group].push([attrName, attrData]);
    }

    // Helper to render a group of attributes sorted by requirement then name
    const renderAttributeGroup = (attrs) => {
      const sorted = attrs.sort((a, b) => {
        const reqOrder = { required: 0, recommended: 1, optional: 2 };
        const reqA = reqOrder[a[1].requirement || "optional"] ?? 2;
        const reqB = reqOrder[b[1].requirement || "optional"] ?? 2;
        if (reqA !== reqB) return reqA - reqB;
        return a[0].localeCompare(b[0]);
      });

      const result = [];
      for (const [attrName, attrData] of sorted) {
        result.push(
          ...formatAttribute(attrName, attrData, versionSlug, {
            useBadge: true,
          }),
        );
      }
      return result;
    };

    lines.push("## Attributes", "");

    // Define group order and display names
    const groupOrder = ["classification", "context", "occurrence", "primary"];
    const groupNames = {
      classification: "Classification",
      primary: "Primary",
      occurrence: "Occurrence",
      context: "Context",
    };

    for (const group of groupOrder) {
      const groupAttrs = byGroup[group];
      if (!groupAttrs || groupAttrs.length === 0) continue;

      const displayName = groupNames[group] || group;
      lines.push(`### ${displayName}`, "");
      lines.push(...renderAttributeGroup(groupAttrs));
    }

    // Render any remaining groups not in the predefined order
    for (const group of Object.keys(byGroup).sort()) {
      if (groupOrder.includes(group)) continue;
      const groupAttrs = byGroup[group];
      lines.push(`### ${group}`, "");
      lines.push(...renderAttributeGroup(groupAttrs));
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

// =============================================================================
// Object Documentation
// =============================================================================

/**
 * Generate object documentation as MDX.
 */
export function generateObjectDoc(objName, objData, classUsage, versionSlug) {
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

  // Import Badge component for extension indicators
  lines.push(`import { Badge } from '@astrojs/starlight/components';`, "");

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

    // Sort by requirement then name
    const sorted = Object.entries(attributes).sort((a, b) => {
      const reqOrder = { required: 0, recommended: 1, optional: 2 };
      const reqA = reqOrder[a[1].requirement || "optional"] ?? 2;
      const reqB = reqOrder[b[1].requirement || "optional"] ?? 2;
      if (reqA !== reqB) return reqA - reqB;
      return a[0].localeCompare(b[0]);
    });

    for (const [attrName, attrData] of sorted) {
      lines.push(
        ...formatAttribute(attrName, attrData, versionSlug, {
          showProfile: false,
        }),
      );
    }
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

// =============================================================================
// Profile Documentation
// =============================================================================

/**
 * Generate profile documentation as MDX.
 */
export function generateProfileDoc(
  profileName,
  profileData,
  versionSlug,
  profileUsage,
) {
  const basePath = `/reference/ocsf/${versionSlug}`;
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

    // Sort by requirement then name
    const sorted = Object.entries(attributes).sort((a, b) => {
      const reqOrder = { required: 0, recommended: 1, optional: 2 };
      const reqA = reqOrder[a[1].requirement || "optional"] ?? 2;
      const reqB = reqOrder[b[1].requirement || "optional"] ?? 2;
      if (reqA !== reqB) return reqA - reqB;
      return a[0].localeCompare(b[0]);
    });

    for (const [attrName, attrData] of sorted) {
      lines.push(
        ...formatAttribute(attrName, attrData, versionSlug, {
          showProfile: false,
        }),
      );
    }
  }

  // Available In classes
  const usedBy = profileUsage[profileName] || [];
  if (usedBy.length > 0) {
    lines.push("## Available In", "");
    for (const className of usedBy) {
      lines.push(
        `- [\`${className}\`](${basePath}/classes/${nameToSlug(className)})`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

// =============================================================================
// Extension Documentation
// =============================================================================

/**
 * Generate extension documentation as MDX.
 */
export function generateExtensionDoc(
  extensionName,
  extensionData,
  versionSlug,
  extensionUsage,
) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  const caption = extensionData.caption || extensionName;
  const description = cleanDescription(extensionData.description || "");
  const uid = extensionData.uid;

  // Frontmatter
  lines.push(
    generateFrontmatter({
      title: caption,
      description: extractFirstSentence(extensionData.description),
    }),
  );

  // Description
  if (description) {
    lines.push(description, "");
  }

  // Metadata
  if (uid !== undefined) {
    lines.push(`- **UID**: \`${uid}\``);
  }
  if (extensionData.version) {
    lines.push(`- **Version**: ${extensionData.version}`);
  }
  lines.push("");

  // Classes contributed by this extension
  const usage = extensionUsage[extensionName] || { classes: [], objects: [] };
  if (usage.classes.length > 0) {
    lines.push("## Classes", "");
    for (const className of usage.classes) {
      lines.push(
        `- [\`${className}\`](${basePath}/classes/${nameToSlug(className)})`,
      );
    }
    lines.push("");
  }

  // Objects contributed by this extension
  if (usage.objects.length > 0) {
    lines.push("## Objects", "");
    for (const objName of usage.objects) {
      lines.push(
        `- [\`${objName}\`](${basePath}/objects/${nameToSlug(objName)})`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build extension usage map: extension -> {classes: [], objects: []}.
 */
export function buildExtensionUsage(classes, objects, extensions) {
  const usage = {};
  for (const extName of Object.keys(extensions)) {
    usage[extName] = { classes: [], objects: [] };
  }

  // Find classes belonging to each extension
  for (const [className, classData] of Object.entries(classes)) {
    const ext = classData.extension;
    if (ext && usage[ext]) {
      usage[ext].classes.push(className);
    }
  }

  // Find objects belonging to each extension
  for (const [objName, objData] of Object.entries(objects)) {
    const ext = objData.extension;
    if (ext && usage[ext]) {
      usage[ext].objects.push(objName);
    }
  }

  // Sort arrays
  for (const extName of Object.keys(usage)) {
    usage[extName].classes.sort();
    usage[extName].objects.sort();
  }

  return usage;
}

/**
 * Generate extensions overview MDX.
 */
export function generateExtensionsOverview(version, extensions, versionSlug) {
  const basePath = `/reference/ocsf/${versionSlug}`;
  const lines = [];

  lines.push(
    generateFrontmatter({
      title: "Extensions",
      description: `Complete listing of OCSF ${version} extensions.`,
      sidebarLabel: "Extensions",
    }),
  );

  lines.push(
    "Extensions add platform-specific classes, objects, and attributes to the core OCSF schema. They enable detailed representation of OS-specific events and entities.",
    "",
  );

  for (const extensionName of Object.keys(extensions).sort()) {
    const extensionData = extensions[extensionName];
    const caption = extensionData.caption || extensionName;
    const desc = extractFirstSentence(extensionData.description);
    const filename = extensionName.replace(/\//g, "_");
    const descPart = desc ? `: ${desc}` : "";
    lines.push(`- [${caption}](${basePath}/extensions/${filename})${descPart}`);
  }
  lines.push("");

  return lines.join("\n");
}

// =============================================================================
// Overview Pages
// =============================================================================

/**
 * Build profile usage map: profile -> list of classes that use it.
 */
export function buildProfileUsage(classes, profiles) {
  const usage = {};
  for (const profileName of Object.keys(profiles)) {
    usage[profileName] = new Set();
  }

  for (const [className, classData] of Object.entries(classes)) {
    const classProfiles = classData.profiles || [];
    for (const profileName of classProfiles) {
      if (usage[profileName]) {
        usage[profileName].add(className);
      }
    }
  }

  // Convert Sets to sorted arrays
  for (const profileName of Object.keys(usage)) {
    usage[profileName] = [...usage[profileName]].sort();
  }

  return usage;
}

/**
 * Build class usage map: object -> list of classes that use it.
 */
export function buildClassUsage(classes, objects) {
  const usage = {};
  for (const objName of Object.keys(objects)) {
    usage[objName] = new Set();
  }

  for (const [className, classData] of Object.entries(classes)) {
    const attributes = classData.attributes || {};
    for (const attrData of Object.values(attributes)) {
      const objType = attrData.object_type;
      if (objType && usage[objType]) {
        usage[objType].add(className);
      }
    }
  }

  // Convert Sets to sorted arrays
  for (const objName of Object.keys(usage)) {
    usage[objName] = [...usage[objName]].sort();
  }

  return usage;
}

/**
 * Generate classes overview MDX.
 */
export function generateClassesOverview(version, classes, versionSlug) {
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
 * Object category keywords for pattern-based categorization.
 *
 * OCSF doesn't provide object category metadata in its API, so we use
 * keyword matching on object names. To add a new category or improve
 * categorization, update the arrays below.
 *
 * Run generation with DEBUG=1 to see which objects fall into "Other".
 */
const OBJECT_CATEGORY_KEYWORDS = {
  "Identity & Access": [
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
  ],
  "Process & System": [
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
  ],
  Network: [
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
  ],
  "File & Data": [
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
  ],
  "Security & Compliance": [
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
  ],
  "Cloud & Infrastructure": [
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
  ],
  Observability: [
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
  ],
};

/**
 * Categorize an object by its name using keyword matching.
 */
function categorizeObject(objName) {
  const nameLower = objName.toLowerCase();

  // Windows objects get their own category
  if (objName.startsWith("win/")) {
    return "Windows";
  }

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(OBJECT_CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => nameLower.includes(kw))) {
      return category;
    }
  }

  return "Other";
}

/**
 * Find objects that don't match any category keywords.
 * Useful for identifying when OBJECT_CATEGORY_KEYWORDS needs updating.
 */
export function findUncategorizedObjects(objects) {
  const uncategorized = [];
  for (const objName of Object.keys(objects)) {
    if (!objName.startsWith("win/") && categorizeObject(objName) === "Other") {
      uncategorized.push(objName);
    }
  }
  return uncategorized.sort();
}

/**
 * Generate objects overview MDX.
 */
export function generateObjectsOverview(version, objects, versionSlug) {
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

  // Categorize objects
  const categories = {};
  for (const [objName, objData] of Object.entries(objects)) {
    const category = categorizeObject(objName);
    const caption = objData.caption || objName;
    const desc = extractFirstSentence(objData.description);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push([objName, caption, desc]);
  }

  // Define category order (Other always last)
  const categoryOrder = [
    "Identity & Access",
    "Process & System",
    "Network",
    "File & Data",
    "Security & Compliance",
    "Cloud & Infrastructure",
    "Observability",
    "Windows",
    "Other",
  ];

  for (const category of categoryOrder) {
    const items = categories[category];
    if (!items || items.length === 0) continue;

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
export function generateProfilesOverview(version, profiles, versionSlug) {
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
export function generateTypesOverview(version, types) {
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

// =============================================================================
// Version Index
// =============================================================================

/**
 * Generate version index MDX.
 */
export function generateVersionIndex(
  version,
  classes,
  objects,
  profiles,
  extensions,
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

  // Import LinkButton for navigation
  lines.push(`import { LinkButton } from '@astrojs/starlight/components';`, "");

  lines.push(`Schema reference for OCSF version ${version}.`, "");

  lines.push(`## Classes`, "");
  lines.push(
    `Event classes define the structure and semantics of security events. Each class represents a specific type of activity like authentication, file operations, or network connections. OCSF ${version} includes ${Object.keys(classes).length} event classes organized by category.`,
    "",
  );
  lines.push(
    `<LinkButton href="${basePath}/classes/" icon="right-arrow">Browse classes</LinkButton>`,
    "",
  );

  lines.push(`## Objects`, "");
  lines.push(
    `Objects are reusable data structures embedded within event classes. They represent entities like users, devices, files, and network endpoints. OCSF ${version} defines ${Object.keys(objects).length} objects.`,
    "",
  );
  lines.push(
    `<LinkButton href="${basePath}/objects/" icon="right-arrow">Browse objects</LinkButton>`,
    "",
  );

  lines.push(`## Profiles`, "");
  lines.push(
    `Profiles are optional attribute sets that extend event classes with additional context. They enable consistent representation of cross-cutting concerns like host information or malware analysis. OCSF ${version} includes ${Object.keys(profiles).length} profiles.`,
    "",
  );
  lines.push(
    `<LinkButton href="${basePath}/profiles/" icon="right-arrow">Browse profiles</LinkButton>`,
    "",
  );

  lines.push(`## Extensions`, "");
  lines.push(
    `Extensions add platform-specific classes, objects, and attributes to the core schema. OCSF ${version} includes ${Object.keys(extensions).length} extensions.`,
    "",
  );
  lines.push(
    `<LinkButton href="${basePath}/extensions/" icon="right-arrow">Browse extensions</LinkButton>`,
    "",
  );

  lines.push(`## Types`, "");
  lines.push(
    `Types define the format and validation rules for attribute values. OCSF ${version} defines ${Object.keys(types).length} types.`,
    "",
  );
  lines.push(
    `<LinkButton href="${basePath}/types/" icon="right-arrow">Browse types</LinkButton>`,
    "",
  );

  return lines.join("\n");
}

// =============================================================================
// FAQs and Articles
// =============================================================================

/**
 * Parse FAQ content into individual questions.
 * Returns array of {title, slug, content} objects.
 */
export function parseFaqContent(content) {
  const questions = [];

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

    questions.push({
      title: questionTitle,
      slug,
      content: answerContent,
    });
  }

  return questions;
}

/**
 * Generate FAQ page MDX.
 */
export function generateFaqPage(question) {
  return (
    generateFrontmatter({
      title: question.title,
      description: `OCSF FAQ: ${question.title}`,
      sidebarLabel: question.slug,
    }) +
    question.content +
    "\n"
  );
}

/**
 * Generate FAQs index MDX.
 */
export function generateFaqsIndex(questions) {
  return (
    generateFrontmatter({
      title: "OCSF FAQs",
      description:
        "Frequently asked questions about the Open Cybersecurity Schema Framework.",
      sidebarLabel: "FAQs",
    }) +
    `Frequently asked questions about the Open Cybersecurity Schema Framework.

${questions
  .map((q) => `- [${q.title}](/reference/ocsf/faqs/${q.slug})`)
  .join("\n")}
`
  );
}

/**
 * Parse article file into {slug, title, content}.
 */
/**
 * Escape angle brackets outside of code blocks for MDX compatibility.
 * Preserves fenced code blocks and inline code, but escapes placeholder
 * patterns like <profile name> that would be interpreted as JSX tags.
 */
function escapeAngleBracketsForMdx(content) {
  const lines = content.split("\n");
  const result = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Track fenced code blocks
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Outside code blocks, escape placeholder patterns like <word word>
    // but preserve inline code. Use a regex to find and escape these patterns.
    // Split by inline code to preserve it
    const parts = line.split(/(`[^`]+`)/);
    const escapedParts = parts.map((part, index) => {
      // Odd indices are inline code (the captured groups)
      if (index % 2 === 1) {
        return part; // Keep inline code as-is
      }
      // Escape patterns that look like placeholders:
      // <word word>, <word-word>, etc. (anything with space or that's not a valid HTML tag)
      // Preserve valid self-closing tags and common HTML elements
      return part.replace(/<([^>]+)>/g, (match, inner) => {
        // If it contains spaces and no =, it's likely a placeholder
        if (inner.includes(" ") && !inner.includes("=")) {
          return `&lt;${inner}&gt;`;
        }
        // If it's not a valid HTML/JSX tag name, escape it
        // Valid: starts with letter, followed by letters/numbers/hyphens, optionally with attributes
        const validTagPattern = /^\/?\s*[a-zA-Z][a-zA-Z0-9-]*(?:\s|\/|$)/;
        if (!validTagPattern.test(inner)) {
          return `&lt;${inner}&gt;`;
        }
        return match;
      });
    });

    result.push(escapedParts.join(""));
  }

  return result.join("\n");
}

export function parseArticle(fileName, content) {
  const baseName = fileName.replace(/\.md$/, "");

  // Extract title from first H1 or use filename
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : baseName.replace(/-/g, " ");

  // Remove the H1 title from content (Starlight uses frontmatter title)
  // Also fix malformed markdown links with double parentheses: [text]((url)) -> [text](url)
  // And escape angle brackets that would be interpreted as JSX tags
  const contentWithoutTitle = escapeAngleBracketsForMdx(
    content.replace(/^#\s+.+\n/, "").replace(/\]\(\(([^)]+)\)\)/g, "]($1)"),
  );

  return { slug: baseName, title, content: contentWithoutTitle };
}

/**
 * Generate article page MDX.
 */
export function generateArticlePage(article) {
  return (
    generateFrontmatter({
      title: article.title,
      description: `OCSF article: ${article.title}`,
      sidebarLabel: article.slug,
    }) + article.content
  );
}

/**
 * Generate articles index MDX.
 */
export function generateArticlesIndex(articles) {
  return `---
title: "OCSF Articles"
description: "In-depth articles about using the Open Cybersecurity Schema Framework."
sidebar:
  label: "Articles"
---

In-depth articles about using the Open Cybersecurity Schema Framework.

${articles.map((a) => `- [${a.title}](/reference/ocsf/articles/${a.slug})`).join("\n")}
`;
}

// =============================================================================
// Main Index Page
// =============================================================================

/**
 * Generate the main OCSF index page with version table.
 */
export function generateMainIndex(versionStats) {
  // Find latest stable version for the Schema link
  const latestStable = [...versionStats]
    .reverse()
    .find((v) => !v.version.includes("-dev"));
  const latestSlug = latestStable
    ? versionToSlug(latestStable.version)
    : "1-7-0";

  const versionRows = versionStats
    .slice()
    .reverse()
    .map(
      (v) =>
        `| [v${v.version}](/reference/ocsf/${versionToSlug(v.version)}) | ${v.classes} | ${v.objects} | ${v.profiles} | ${v.extensions} | ${v.types} |`,
    )
    .join("\n");

  return `---
title: OCSF
description: Reference documentation for the Open Cybersecurity Schema Framework (OCSF).
---

import { CardGrid } from "@astrojs/starlight/components";
import LinkCard from "@components/LinkCard.astro";
import ocsfIcon from "@assets/ocsf.svg?raw";

:::tip[AI-Optimized Documentation]
This reference is optimized for AI agents.
:::

This reference provides comprehensive documentation for the
[Open Cybersecurity Schema Framework (OCSF)](https://ocsf.io), an open standard
for normalizing security telemetry across tools and vendors.

## Resources

<CardGrid>
  <LinkCard
    title="Schema"
    description="Classes, objects, profiles, and extensions"
    href="/reference/ocsf/${latestSlug}"
    customIcon={ocsfIcon}
  />
  <LinkCard
    title="FAQs"
    description="Common questions about OCSF"
    href="/reference/ocsf/faqs"
    customIcon={ocsfIcon}
  />
  <LinkCard
    title="Articles"
    description="In-depth guides and best practices"
    href="/reference/ocsf/articles"
    customIcon={ocsfIcon}
  />
  <LinkCard
    title="Official OCSF Site"
    description="Learn more at ocsf.io"
    href="https://ocsf.io"
    customIcon={ocsfIcon}
  />
</CardGrid>

## Versions

We publish all OCSF schema versions with full cross-references between classes,
objects, profiles, extensions, and types.

| Version | Classes | Objects | Profiles | Extensions | Types |
| ------- | ------- | ------- | -------- | ---------- | ----- |
${versionRows}

:::note
This documentation is auto-generated from the official
[OCSF schema](https://schema.ocsf.io) and
[ocsf-docs](https://github.com/ocsf/ocsf-docs) repository. Download an
AI-optimized snapshot at our [GitHub release
page](https://github.com/tenzir/docs/releases/tag/latest).
:::

## Using OCSF with Tenzir

Tenzir provides native support for OCSF through the \`ocsf.*\` operators:
[\`ocsf.apply\`](/reference/operators/ocsf/apply),
[\`ocsf.cast\`](/reference/operators/ocsf/cast),
[\`ocsf.derive\`](/reference/operators/ocsf/derive), and
[\`ocsf.trim\`](/reference/operators/ocsf/trim). You can normalize events to OCSF,
validate schema compliance, and work with OCSF-formatted data throughout your
pipelines.

See the [OCSF mapping workflow](/reference/workflows/generate-an-ocsf-mapping)
for guidance on creating custom mappings for your data sources.
`;
}
