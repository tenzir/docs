#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Sync Claude plugins documentation from tenzir/claude-plugins repository.
 *
 * Usage:
 *   node sync-claude-plugins.mjs              # Clone from GitHub
 *   node sync-claude-plugins.mjs <local-path> # Use local clone
 */

const PLUGINS_REPO_URL = "https://github.com/tenzir/claude-plugins";
const LOCAL_CLONE_DIR = ".claude-plugins";

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns an object with top-level frontmatter fields only.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    // Skip indented lines (nested properties)
    if (line.startsWith(" ") || line.startsWith("\t")) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * Clone or update claude-plugins repo from GitHub.
 */
function getClaudePluginsRepo(localPath) {
  if (localPath) {
    console.log(`Using local repo: ${localPath}`);
    return path.resolve(localPath);
  }

  const repoPath = path.join(process.cwd(), LOCAL_CLONE_DIR);

  try {
    fsSync.accessSync(path.join(repoPath, ".git"));
    console.log("Updating tenzir/claude-plugins from GitHub...");
    execSync("git pull --ff-only", { cwd: repoPath, stdio: "inherit" });
  } catch {
    console.log("Cloning tenzir/claude-plugins from GitHub...");
    execSync(`git clone --depth 1 ${PLUGINS_REPO_URL} "${repoPath}"`, {
      stdio: "inherit",
    });
  }

  return repoPath;
}

/**
 * Discover all plugins in the repository.
 */
async function discoverPlugins(repoPath) {
  const pluginsDir = path.join(repoPath, "plugins");
  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
  const plugins = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    const pluginPath = path.join(pluginsDir, entry.name);
    const pluginJsonPath = path.join(
      pluginPath,
      ".claude-plugin",
      "plugin.json",
    );

    try {
      const json = JSON.parse(await fs.readFile(pluginJsonPath, "utf-8"));
      plugins.push({
        id: entry.name,
        path: pluginPath,
        name: json.name || entry.name,
        version: json.version || "0.0.0",
        description: json.description || "",
        license: json.license || "",
        repository: json.repository || PLUGINS_REPO_URL,
      });
    } catch {
      console.warn(`  Warning: Skipping ${entry.name} (no valid plugin.json)`);
    }
  }

  return plugins.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parse README.md to extract title, description, Features and Usage sections.
 */
async function parseReadme(pluginPath) {
  const readmePath = path.join(pluginPath, "README.md");
  let content;

  try {
    content = await fs.readFile(readmePath, "utf-8");
  } catch {
    return { title: "", description: "", features: "", usage: "" };
  }

  // Extract # Title from first H1 heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract first paragraph after the title (the description)
  // Match content between # Title and the first ## or end
  const descMatch = content.match(/^#\s+.+\n\n([\s\S]*?)(?=\n##|\n$)/m);
  let description = "";
  if (descMatch) {
    // Get first non-empty paragraph
    const paragraphs = descMatch[1].split(/\n\n+/);
    description = paragraphs[0]?.trim() || "";
  }

  // Extract ## Features section (with or without emoji)
  const featuresMatch = content.match(
    /##\s*(?:✨\s*)?Features\s*\n([\s\S]*?)(?=\n##|\n$)/i,
  );
  const features = featuresMatch ? featuresMatch[1].trim() : "";

  // Extract ## Usage section (with or without emoji)
  const usageMatch = content.match(
    /##\s*(?:🚀\s*)?Usage\s*\n([\s\S]*?)(?=\n##|\n$)/i,
  );
  const usage = usageMatch ? usageMatch[1].trim() : "";

  return { title, description, features, usage };
}

/**
 * Scan for skills, commands, agents, and hooks.
 */
async function scanCapabilities(pluginPath) {
  const capabilities = { skills: [], commands: [], agents: [], hooks: [] };

  // Scan skills (skills/*/SKILL.md)
  const skillsDir = path.join(pluginPath, "skills");
  if (fsSync.existsSync(skillsDir)) {
    const skillDirs = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const dir of skillDirs) {
      if (!dir.isDirectory()) continue;
      const skillFile = path.join(skillsDir, dir.name, "SKILL.md");
      if (fsSync.existsSync(skillFile)) {
        const content = await fs.readFile(skillFile, "utf-8");
        const fm = parseFrontmatter(content);
        capabilities.skills.push({
          name: fm.name || dir.name,
          description: fm.description || "",
        });
      }
    }
  }

  // Scan commands (commands/*.md)
  const commandsDir = path.join(pluginPath, "commands");
  if (fsSync.existsSync(commandsDir)) {
    const commandFiles = await fs.readdir(commandsDir, { withFileTypes: true });
    for (const file of commandFiles) {
      if (!file.isFile() || !file.name.endsWith(".md")) continue;
      const content = await fs.readFile(
        path.join(commandsDir, file.name),
        "utf-8",
      );
      const fm = parseFrontmatter(content);
      const name = file.name.replace(/\.md$/, "");
      capabilities.commands.push({
        name,
        description: fm.description || "",
      });
    }
  }

  // Scan agents (agents/*.md)
  const agentsDir = path.join(pluginPath, "agents");
  if (fsSync.existsSync(agentsDir)) {
    const agentFiles = await fs.readdir(agentsDir, { withFileTypes: true });
    for (const file of agentFiles) {
      if (!file.isFile() || !file.name.endsWith(".md")) continue;
      const content = await fs.readFile(
        path.join(agentsDir, file.name),
        "utf-8",
      );
      const fm = parseFrontmatter(content);
      const name = fm.name || file.name.replace(/\.md$/, "");
      capabilities.agents.push({
        name,
        description: fm.description || "",
      });
    }
  }

  // Scan hooks (hooks/hooks.json)
  const hooksJsonPath = path.join(pluginPath, "hooks", "hooks.json");
  if (fsSync.existsSync(hooksJsonPath)) {
    try {
      const hooksJson = JSON.parse(await fs.readFile(hooksJsonPath, "utf-8"));
      if (hooksJson.hooks) {
        for (const [hookType, hookEntries] of Object.entries(hooksJson.hooks)) {
          for (const entry of hookEntries) {
            const matcher = entry.matcher || "*";
            // Escape pipe characters for markdown table
            const matcherEscaped = matcher.replace(/\|/g, ", ");
            capabilities.hooks.push({
              name: hookType,
              description: `Triggers on ${matcherEscaped}`,
            });
          }
        }
      }
    } catch {
      // Skip invalid hooks.json
    }
  }

  return capabilities;
}

/**
 * Capitalize first letter of a string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate landing page MDX content.
 */
function generateLandingPage(plugins) {
  const cards = plugins
    .map(
      (p) => `<LinkCard
  title="${p.displayName}"
  description="${p.description}"
  href="/reference/claude-plugins/${p.id}"
  meta="v${p.version}"
/>`,
    )
    .join("\n\n");

  const enabledPlugins = plugins
    .map((p) => `    "${p.name}@tenzir": true`)
    .join(",\n");

  return `---
title: Claude Marketplace
description: Tenzir plugins for Claude Code that enhance AI-assisted development workflows.
---

import LinkCard from '@components/LinkCard.astro';
import { CardGrid, Steps, Tabs, TabItem } from '@astrojs/starlight/components';

The [Tenzir Claude Marketplace](https://github.com/tenzir/claude-plugins) provides
plugins with specialized knowledge and workflows for Tenzir development.
[Claude Code](https://claude.ai/download) supports
[plugins](https://docs.claude.ai/en/docs/claude-code/plugins) that extend the
agent with custom slash commands, skills, agents, and hooks.
[Marketplaces](https://docs.claude.ai/en/docs/claude-code/plugin-marketplaces)
bundle Claude plugins for easy distribution.

## Installation

Add the Tenzir marketplace to Claude Code and install plugins:

<Tabs>
<TabItem label="Interactive">
<Steps>
1. Run \`/plugin\` in Claude Code <kbd>Enter</kbd>
2. Go to **Marketplaces** <kbd>Tab</kbd>
3. Select **+ Add Marketplace** <kbd>Enter</kbd>
4. Type \`tenzir/claude-plugins\` <kbd>Enter</kbd>
</Steps>
</TabItem>
<TabItem label="Shell">
\`\`\`bash
# Install to user scope (default)
claude plugin install tql@tenzir

# Install to project scope (shared with team)
claude plugin install tql@tenzir --scope project

# Install to local scope (gitignored)
claude plugin install tql@tenzir --scope local
\`\`\`
</TabItem>
<TabItem label="Settings">
Add to \`.claude/settings.json\`:

\`\`\`json
{
  "extraKnownMarketplaces": {
    "tenzir": {
      "source": {
        "source": "github",
        "repo": "tenzir/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
${enabledPlugins}
  }
}
\`\`\`
</TabItem>
</Tabs>

## Available Plugins

<CardGrid>
${cards}
</CardGrid>

<LinkCard
  title="View on GitHub"
  description="Browse the plugin source code and documentation."
  href="https://github.com/tenzir/claude-plugins"
  icon="github"
/>
`;
}

/**
 * Generate individual plugin page MDX content.
 */
function generatePluginPage(plugin, readme, capabilities) {
  const hasCapabilities =
    capabilities.skills.length > 0 ||
    capabilities.commands.length > 0 ||
    capabilities.agents.length > 0 ||
    capabilities.hooks.length > 0;

  const sourceUrl = `https://github.com/tenzir/claude-plugins/tree/main/plugins/${plugin.id}`;

  let content = `---
title: ${plugin.displayName}
description: "${plugin.description}"
---

import { CardGrid } from '@astrojs/starlight/components';
import LinkCard from '@components/LinkCard.astro';

${plugin.description}

## Installation

\`\`\`
/plugin install ${plugin.name}@tenzir
\`\`\`
`;

  // Add features section if available
  if (readme.features) {
    content += `
## Features

${readme.features}
`;
  }

  // Add capabilities table if any exist
  if (hasCapabilities) {
    content += `
## Capabilities

| Type | Name | Description |
|------|------|-------------|
`;

    for (const skill of capabilities.skills) {
      content += `| Skill | \`${skill.name}\` | ${skill.description} |\n`;
    }
    for (const cmd of capabilities.commands) {
      content += `| Command | \`/${plugin.name}:${cmd.name}\` | ${cmd.description} |\n`;
    }
    for (const agent of capabilities.agents) {
      content += `| Agent | \`${plugin.name}:${agent.name}\` | ${agent.description} |\n`;
    }
    for (const hook of capabilities.hooks) {
      content += `| Hook | \`${hook.name}\` | ${hook.description} |\n`;
    }
  }

  // Add usage section if available
  if (readme.usage) {
    content += `
## Usage

${readme.usage}
`;
  }

  // Add changelog and GitHub source cards at the bottom
  const changelogUrl = `/changelog/claude-plugins/${plugin.id}`;
  content += `
<CardGrid>
<LinkCard
  title="Changelog"
  description="View the release history and recent changes."
  href="${changelogUrl}"
  icon="open-book"
/>

<LinkCard
  title="View on GitHub"
  description="Browse the plugin source code and documentation."
  href="${sourceUrl}"
  icon="github"
/>
</CardGrid>
`;

  return content;
}

/**
 * Main sync function.
 */
async function syncClaudePlugins(repoPath) {
  const docsRoot = process.cwd();
  const outputDir = path.join(
    docsRoot,
    "src/content/docs/reference/claude-plugins",
  );

  console.log(`Syncing from: ${repoPath}`);

  // Discover plugins
  const plugins = await discoverPlugins(repoPath);
  console.log(`Found ${plugins.length} plugins\n`);

  // Clean and create output directory
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const warnings = [];

  // Process each plugin
  for (const plugin of plugins) {
    console.log(`  ${plugin.name}: processing...`);

    const readme = await parseReadme(plugin.path);
    const capabilities = await scanCapabilities(plugin.path);

    // Validate README structure
    if (!readme.title) {
      warnings.push(`${plugin.id}: missing # title heading`);
    }
    if (!readme.description) {
      warnings.push(`${plugin.id}: missing description paragraph after title`);
    }
    if (!readme.features) {
      warnings.push(`${plugin.id}: missing ## Features section`);
    }
    if (!readme.usage) {
      warnings.push(`${plugin.id}: missing ## Usage section`);
    }

    // Use README title as display name, fall back to capitalized plugin name
    plugin.displayName = readme.title || capitalize(plugin.name);

    // Use README description (first paragraph after title)
    plugin.description = readme.description;

    const pageContent = generatePluginPage(plugin, readme, capabilities);
    await fs.writeFile(path.join(outputDir, `${plugin.id}.mdx`), pageContent);

    const capSummary = [
      capabilities.skills.length > 0
        ? `${capabilities.skills.length} skills`
        : "",
      capabilities.commands.length > 0
        ? `${capabilities.commands.length} commands`
        : "",
      capabilities.agents.length > 0
        ? `${capabilities.agents.length} agents`
        : "",
      capabilities.hooks.length > 0 ? `${capabilities.hooks.length} hooks` : "",
    ]
      .filter(Boolean)
      .join(", ");

    console.log(
      `  ${plugin.displayName}: v${plugin.version} (${capSummary || "no capabilities"})`,
    );
  }

  // Generate landing page
  const landingContent = generateLandingPage(plugins);
  await fs.writeFile(path.join(outputDir, "index.mdx"), landingContent);

  console.log(`\nGenerated ${plugins.length + 1} pages in ${outputDir}`);

  // Print warnings about README structure issues
  if (warnings.length > 0) {
    console.warn(`\nWarnings (${warnings.length}):`);
    for (const warning of warnings) {
      console.warn(`  - ${warning}`);
    }
  }
}

// CLI entry point
const args = process.argv.slice(2);
const localPath = args[0] || null;

const repoPath = getClaudePluginsRepo(localPath);

syncClaudePlugins(repoPath).catch((err) => {
  console.error("Error syncing claude-plugins:", err);
  process.exit(1);
});
