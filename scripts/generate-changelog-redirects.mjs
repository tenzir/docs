#!/usr/bin/env node
/**
 * Generate static redirect stubs for the retired docs changelog.
 *
 * The Tenzir changelog moved to https://tenzir.com/changelog. This script
 * replaces the old changelog generator: instead of rendering release pages
 * from the tenzir/news repository, it emits redirect stubs into
 * `public/changelog/` so that every previously published docs URL forwards
 * to its new home on tenzir.com.
 *
 * It also writes farewell Atom feeds that tell subscribers to resubscribe
 * to the feeds on tenzir.com.
 *
 * Usage:
 *   node scripts/generate-changelog-redirects.mjs [path/to/local/news/repo]
 *
 * Without an argument, the script clones (or updates) tenzir/news into the
 * gitignored `.news/` directory.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const WEBSITE_BASE = "https://tenzir.com/changelog";

/**
 * Fixed timestamp for the farewell feed entries so rebuilds do not churn
 * the feed contents. This is the date the changelog migration shipped.
 */
const MOVED_AT = "2026-07-02T00:00:00Z";

/** First year covered by the old cross-project timeline pages. */
const TIMELINE_START_YEAR = 2014;

/**
 * Clone or update the news repo from GitHub.
 */
function getNewsRepo(localPath) {
  if (localPath) {
    console.log(`Using local news repo: ${localPath}`);
    return path.resolve(localPath);
  }

  const newsPath = path.join(process.cwd(), ".news");

  try {
    // Check if already cloned
    fs.accessSync(path.join(newsPath, ".git"));
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
 * Discover changelog projects in the news repo. Only top-level
 * `<dir>/changelog/config.yaml` files count; nested module changelogs
 * (e.g. under `plugins/`) never had their own docs URLs at this level.
 */
function discoverProjects(newsPath) {
  const projects = [];
  for (const dirent of fs.readdirSync(newsPath, { withFileTypes: true })) {
    if (!dirent.isDirectory() || dirent.name.startsWith(".")) {
      continue;
    }
    const changelogDir = path.join(newsPath, dirent.name, "changelog");
    const configPath = path.join(changelogDir, "config.yaml");
    if (!fs.existsSync(configPath)) {
      continue;
    }
    const config = fs.readFileSync(configPath, "utf-8");
    const idMatch = config.match(/^id:\s*["']?([\w.-]+)["']?\s*$/m);
    if (!idMatch) {
      console.warn(`Skipping ${configPath}: no id field found.`);
      continue;
    }
    const id = idMatch[1];
    const releasesDir = path.join(changelogDir, "releases");
    const versions = fs.existsSync(releasesDir)
      ? fs
          .readdirSync(releasesDir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : [];
    projects.push({ id, versions });
  }
  return projects.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Render a minimal redirect stub pointing at the new website URL.
 */
function redirectHtml(url) {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${url}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${url}">
<title>Redirecting to ${url}</title>
<p>The Tenzir changelog has moved. If you are not redirected automatically,
follow <a href="${url}">${url}</a>.</p>
<script>location.replace(${JSON.stringify(url)});</script>
</html>
`;
}

function writeRedirect(outDir, relativeDir, url) {
  const dir = path.join(outDir, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), redirectHtml(url));
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render a farewell Atom feed with a single entry pointing subscribers at
 * the new feed location on tenzir.com.
 */
function farewellFeed({ feedId, title, pageUrl, feedUrl }) {
  const message =
    "The Tenzir changelog has moved to tenzir.com. This feed is no longer " +
    `updated. Please resubscribe to the new feed at ${feedUrl} and browse ` +
    `releases at ${pageUrl}.`;
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(feedId)}</id>
  <title>${escapeXml(title)}</title>
  <updated>${MOVED_AT}</updated>
  <link rel="alternate" href="${escapeXml(pageUrl)}"/>
  <entry>
    <id>${escapeXml(`${feedId}#moved`)}</id>
    <title>The Tenzir changelog has moved</title>
    <updated>${MOVED_AT}</updated>
    <link rel="alternate" href="${escapeXml(pageUrl)}"/>
    <content type="text">${escapeXml(message)}</content>
  </entry>
</feed>
`;
}

function main() {
  const newsPath = getNewsRepo(process.argv[2]);
  const projects = discoverProjects(newsPath);
  if (projects.length === 0) {
    throw new Error(`No changelog projects found in ${newsPath}.`);
  }

  const outDir = path.join(process.cwd(), "public", "changelog");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  let stubs = 0;
  const emit = (relativeDir, url) => {
    writeRedirect(outDir, relativeDir, url);
    stubs++;
  };

  // Landing page.
  emit(".", `${WEBSITE_BASE}/`);

  // The old cross-project timeline pages have no direct equivalent; send
  // them to the changelog landing page.
  emit("timeline", `${WEBSITE_BASE}/`);
  const currentYear = new Date().getUTCFullYear();
  for (let year = TIMELINE_START_YEAR; year <= currentYear; year++) {
    emit(`timeline/${year}`, `${WEBSITE_BASE}/`);
  }

  for (const project of projects) {
    emit(project.id, `${WEBSITE_BASE}/${project.id}/`);
    emit(
      `${project.id}/unreleased`,
      `${WEBSITE_BASE}/${project.id}/unreleased/`,
    );
    for (const version of project.versions) {
      // Docs URLs used dashed version slugs (v5.28.0 -> v5-28-0) because
      // Starlight slugifies page ids. The website keeps the dots.
      const dashed = version.replaceAll(".", "-");
      emit(
        `${project.id}/${dashed}`,
        `${WEBSITE_BASE}/${project.id}/${version}/`,
      );
    }
  }

  // Farewell feeds.
  fs.writeFileSync(
    path.join(outDir, "feed.xml"),
    farewellFeed({
      feedId: "https://docs.tenzir.com/changelog/feed.xml",
      title: "Tenzir Changelog",
      pageUrl: `${WEBSITE_BASE}/`,
      feedUrl: `${WEBSITE_BASE}/feed.xml`,
    }),
  );
  for (const project of projects) {
    fs.writeFileSync(
      path.join(outDir, `${project.id}.xml`),
      farewellFeed({
        feedId: `https://docs.tenzir.com/changelog/${project.id}.xml`,
        title: `Tenzir Changelog: ${project.id}`,
        pageUrl: `${WEBSITE_BASE}/${project.id}/`,
        feedUrl: `${WEBSITE_BASE}/${project.id}.xml`,
      }),
    );
  }

  console.log(
    `Wrote ${stubs} redirect stubs and ${projects.length + 1} farewell feeds to ${outDir}.`,
  );
}

main();
