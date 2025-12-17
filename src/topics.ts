import {
  guides,
  tutorials,
  explanations,
  reference,
  integrations,
} from "./sidebar";

// Try generated changelog data, fall back to stub
let changelogTopics: {
  label: string;
  id: string;
  link: string;
  icon: string;
  items: unknown[];
}[] = [];
let changelogTopicParents: Record<string, string> = {};
let changelogTopicPaths: Record<string, string[]> = {};
try {
  const generated = await import("./sidebar-changelog.generated");
  changelogTopics = generated.changelogTopics;
  changelogTopicParents = generated.changelogTopicParents;
  changelogTopicPaths = generated.changelogTopicPaths;
} catch {
  // No generated data yet - changelog section will be empty until sync runs
}

export { changelogTopicPaths };

// Icons for main topics (changelog icons come from generated file)
const icons: Record<string, string> = {
  Docs: "open-book",
  Integrations: "puzzle",
  Guides: "right-arrow",
  Tutorials: "rocket",
  Explanations: "information",
  Reference: "list-format",
  Changelog: "pen",
};

// Helper to create topic definitions
const topic = (label: string, link: string, items: unknown[] = []) => ({
  label,
  id: link || label.toLowerCase(),
  link,
  icon: icons[label] || "document",
  items,
});

export const topics = [
  // Root topics
  topic("Docs", ""),
  topic("Integrations", "integrations", integrations),
  // Docs children
  topic("Guides", "guides", guides),
  topic("Tutorials", "tutorials", tutorials),
  topic("Explanations", "explanations", explanations),
  topic("Reference", "reference", reference),
  // Changelog root
  topic("Changelog", "changelog"),
  // Changelog children (generated with icons from changelog-projects.json)
  ...changelogTopics,
];

// Topic hierarchy - null means root topic
export const topicParents: Record<string, string | null> = {
  Docs: null,
  Integrations: null,
  Changelog: null,
  Guides: "Docs",
  Tutorials: "Docs",
  Explanations: "Docs",
  Reference: "Docs",
  ...changelogTopicParents,
};

// Root topics that use dropdown instead of unrolled list
export const dropdownTopics = new Set(["Changelog"]);

export function rootTopics(): typeof topics {
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
