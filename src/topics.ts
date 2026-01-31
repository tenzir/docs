import type { StarlightUserConfig } from "@astrojs/starlight/types";
import { parse } from "yaml";
import * as sidebars from "./sidebar";
import { isSection } from "./sidebar-sections";
import configYaml from "./topics.yaml?raw";

// ============================================================================
// Types
// ============================================================================

type SidebarItems = NonNullable<StarlightUserConfig["sidebar"]>;

interface TopicConfig {
  icon: string;
  link?: string;
  sidebar?: keyof typeof sidebars;
  paths?: string[];
  children?: Record<string, TopicConfig>;
}

interface Topic {
  label: string;
  id: string;
  link: string;
  icon: string;
  items: SidebarItems;
}

// ============================================================================
// Load YAML Configuration
// ============================================================================

const config = parse(configYaml) as Record<string, TopicConfig>;

// ============================================================================
// Changelog Integration (from generated file)
// ============================================================================

const modules = import.meta.glob<{
  changelogTopics: Topic[];
  changelogTopicParents: Record<string, string>;
  changelogTopicPaths: Record<string, string[]>;
}>("./sidebar-changelog.generated.ts", { eager: true });

const generated = Object.values(modules)[0];
const changelogTopics = generated?.changelogTopics ?? [];
const changelogTopicParents = generated?.changelogTopicParents ?? {};
const changelogTopicPaths = generated?.changelogTopicPaths ?? {};

// ============================================================================
// Transform Sidebar Items (Section Support)
// ============================================================================

/**
 * Transforms sidebar items, converting our custom section() items into
 * Starlight-compatible groups with badge markers that SidebarSublist can detect.
 */
function transformSidebarItems(items: SidebarItems): SidebarItems {
  return items.flatMap((item) => {
    if (isSection(item)) {
      // Convert to Starlight group with badge marker
      // Badge class encodes section + icon info for SidebarSublist detection
      const badgeClass = item.icon
        ? `sidebar-section-marker icon-${item.icon}`
        : "sidebar-section-marker";
      return {
        label: item.label,
        collapsed: false,
        badge: { text: "", variant: "default" as const, class: badgeClass },
        items: transformSidebarItems(item.items),
      };
    }
    // Recursively transform nested groups
    if (
      typeof item === "object" &&
      "items" in item &&
      Array.isArray(item.items)
    ) {
      return { ...item, items: transformSidebarItems(item.items) };
    }
    return item;
  });
}

// ============================================================================
// Process Configuration
// ============================================================================

interface ProcessedConfig {
  topics: Topic[];
  parents: Record<string, string | null>;
  dropdowns: Set<string>;
  paths: Record<string, string[]>;
}

function processConfig(
  tree: Record<string, TopicConfig>,
  parent: string | null = null,
): ProcessedConfig {
  const topics: Topic[] = [];
  const childTopics: Topic[] = [];
  const parents: Record<string, string | null> = {};
  const dropdowns = new Set<string>();
  const paths: Record<string, string[]> = {};

  for (const [label, def] of Object.entries(tree)) {
    // Use || for id (empty string falls back to label), ?? for link (empty string is valid)
    const id = def.link || label.toLowerCase();
    const link = def.link ?? label.toLowerCase();

    // Resolve sidebar reference to actual items and transform sections
    const items: SidebarItems = def.sidebar
      ? transformSidebarItems(sidebars[def.sidebar])
      : [];

    topics.push({ label, id, link, icon: def.icon, items });
    parents[label] = parent;

    // Add path patterns from YAML config
    if (def.paths) {
      paths[id] = def.paths;
    }

    // Process children - collect separately to maintain correct order
    if (def.children) {
      const child = processConfig(def.children, label);
      childTopics.push(...child.topics);
      Object.assign(parents, child.parents);
      child.dropdowns.forEach((d) => dropdowns.add(d));
      Object.assign(paths, child.paths);
    }
  }

  // Add child topics after all root-level topics (matches original order)
  topics.push(...childTopics);

  return { topics, parents, dropdowns, paths };
}

// Process the static configuration
const processed = processConfig(config);

// Merge changelog topics and their path patterns
processed.topics.push(...changelogTopics);
Object.assign(processed.parents, changelogTopicParents);
Object.assign(processed.paths, changelogTopicPaths);

// Changelog uses dropdown because it has generated children
processed.dropdowns.add("Changelog");

// ============================================================================
// Exports
// ============================================================================

export const topics = processed.topics;
export const topicPaths = processed.paths;
export const topicParents = processed.parents;
export const dropdownTopics = processed.dropdowns;

export function rootTopics(): Topic[] {
  return topics.filter((t) => topicParents[t.label] === null);
}

export function parentTopic(label: string): string | null {
  return topicParents[label] ?? null;
}

export function childTopics(parentLabel: string): string[] {
  return Object.entries(topicParents)
    .filter(([, parent]) => parent === parentLabel)
    .map(([label]) => label);
}
