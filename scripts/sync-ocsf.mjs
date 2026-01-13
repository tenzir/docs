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

import {
  fetchCurrentVersion,
  fetchAvailableVersions,
  fetchSchema,
  fetchProfiles,
  fetchFaqs,
  fetchArticles,
} from "./lib/ocsf-client.mjs";

import {
  versionToSlug,
  buildClassUsage,
  buildProfileUsage,
  findUncategorizedObjects,
  generateClassDoc,
  generateObjectDoc,
  generateProfileDoc,
  generateClassesOverview,
  generateObjectsOverview,
  generateProfilesOverview,
  generateTypesOverview,
  generateVersionIndex,
  parseFaqContent,
  generateFaqPage,
  generateFaqsIndex,
  parseArticle,
  generateArticlePage,
  generateArticlesIndex,
  generateMainIndex,
} from "./lib/ocsf-generators.mjs";

const DOCS_ROOT = process.cwd();
const OUTPUT_DIR = path.join(DOCS_ROOT, "src/content/docs/reference/ocsf");
const VERSION_CONFIG_FILE = path.join(DOCS_ROOT, "src/ocsf-version.mjs");
const SIDEBAR_FILE = path.join(DOCS_ROOT, "src/sidebar-ocsf.generated.ts");
const INDEX_FILE = path.join(OUTPUT_DIR, "index.mdx");

/**
 * Generate documentation for a specific OCSF version.
 * Returns version statistics for the index page.
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

  // Log uncategorized objects when DEBUG is set (helps maintain OBJECT_CATEGORY_KEYWORDS)
  if (process.env.DEBUG) {
    const uncategorized = findUncategorizedObjects(objects);
    if (uncategorized.length > 0) {
      console.log(`  Uncategorized objects: ${uncategorized.join(", ")}`);
    }
  }

  // Build usage maps
  const classUsage = buildClassUsage(classes, objects);
  const profileUsage = buildProfileUsage(classes, profiles);

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
    const doc = generateProfileDoc(
      profileName,
      profileData,
      versionSlug,
      profileUsage,
    );
    await fs.writeFile(path.join(profilesDir, filename), doc);
    totalSize += doc.length;
  }

  // Generate index files for each category
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

  const typesOverview = generateTypesOverview(version, types);
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

  return {
    size: totalSize,
    stats: {
      version,
      classes: Object.keys(classes).length,
      objects: Object.keys(objects).length,
      profiles: Object.keys(profiles).length,
      types: Object.keys(types).length,
    },
  };
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

  // Sync FAQs
  try {
    const faqFiles = await fetchFaqs();
    const allQuestions = [];

    for (const file of faqFiles) {
      const questions = parseFaqContent(file.content);
      allQuestions.push(...questions);

      for (const question of questions) {
        const mdx = generateFaqPage(question);
        await fs.writeFile(path.join(faqsDir, `${question.slug}.mdx`), mdx);
      }
    }

    // Generate FAQs index
    const faqsIndex = generateFaqsIndex(allQuestions);
    await fs.writeFile(path.join(faqsDir, "index.mdx"), faqsIndex);
    console.log(`  Synced ${allQuestions.length} FAQ questions`);
  } catch (err) {
    console.warn(`  Warning: Could not sync FAQs: ${err.message}`);
  }

  // Sync articles
  try {
    const articleFiles = await fetchArticles();
    const articles = [];

    for (const file of articleFiles) {
      const article = parseArticle(file.name, file.content);
      articles.push(article);

      const mdx = generateArticlePage(article);
      await fs.writeFile(path.join(articlesDir, `${article.slug}.mdx`), mdx);
    }

    // Generate articles index
    const articlesIndex = generateArticlesIndex(articles);
    await fs.writeFile(path.join(articlesDir, "index.mdx"), articlesIndex);
    console.log(`  Synced ${articles.length} article files`);
  } catch (err) {
    console.warn(`  Warning: Could not sync articles: ${err.message}`);
  }
}

/**
 * Update the centralized version config file.
 */
async function updateVersionConfig(latestVersion) {
  const versionSlug = versionToSlug(latestVersion);
  console.log(`Updating version config to: ${latestVersion} (${versionSlug})`);

  const content = `// OCSF version configuration.
// Auto-updated by scripts/sync-ocsf.mjs - do not edit manually.
export const OCSF_VERSION = "${versionSlug}";
`;

  await fs.writeFile(VERSION_CONFIG_FILE, content);
  console.log(`  Updated ${VERSION_CONFIG_FILE}`);
}

/**
 * Update the main index page with version statistics.
 */
async function updateMainIndex(versionStats) {
  console.log("Updating main OCSF index page...");
  const content = generateMainIndex(versionStats);
  await fs.writeFile(INDEX_FILE, content);
  console.log(`  Updated ${INDEX_FILE}`);
}

/**
 * Generate the sidebar configuration file.
 */
async function updateSidebar(latestVersion) {
  const versionSlug = versionToSlug(latestVersion);
  console.log("Generating OCSF sidebar configuration...");

  const content = `// OCSF sidebar configuration.
// Auto-generated by scripts/sync-ocsf.mjs - do not edit manually.

export const ocsfSidebar = {
  label: "OCSF",
  collapsed: true,
  items: [
    { label: "Overview", link: "reference/ocsf" },
    { label: "Classes", link: "reference/ocsf/${versionSlug}/classes" },
    { label: "Objects", link: "reference/ocsf/${versionSlug}/objects" },
    { label: "Profiles", link: "reference/ocsf/${versionSlug}/profiles" },
    { label: "Types", link: "reference/ocsf/${versionSlug}/types" },
    { label: "FAQs", link: "reference/ocsf/faqs" },
    { label: "Articles", link: "reference/ocsf/articles" },
  ],
};
`;

  await fs.writeFile(SIDEBAR_FILE, content);
  console.log(`  Updated ${SIDEBAR_FILE}`);
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
  const versionStats = [];

  for (const version of versions) {
    console.log(`\nGenerating documentation for OCSF ${version}...`);
    try {
      const result = await generateVersion(version);
      totalSize += result.size;
      versionStats.push(result.stats);
      console.log(`  Generated ${(result.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  // Sync FAQs and articles
  await syncDocs();

  // Update version config, sidebar, and index with latest stable version (not dev)
  if (versionStats.length > 0) {
    const latestStable = [...versionStats]
      .reverse()
      .find((v) => !v.version.includes("-dev"));
    if (latestStable) {
      await updateVersionConfig(latestStable.version);
      await updateSidebar(latestStable.version);
    }

    // Update main index with version table
    await updateMainIndex(versionStats);
  }

  console.log(`\nTotal: ${(totalSize / 1024).toFixed(1)} KB of documentation`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
