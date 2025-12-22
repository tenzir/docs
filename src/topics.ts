import {
  guides,
  tutorials,
  explanations,
  reference,
  integrations,
} from "./sidebar";

// Use import.meta.glob to gracefully handle missing generated file
// Returns empty object if file doesn't exist, avoiding build errors
const modules = import.meta.glob<{
  changelogTopics: {
    label: string;
    id: string;
    link: string;
    icon: string;
    items: unknown[];
  }[];
  changelogTopicParents: Record<string, string>;
  changelogTopicPaths: Record<string, string[]>;
}>("./sidebar-changelog.generated.ts", { eager: true });

const generated = Object.values(modules)[0];
const changelogTopics = generated?.changelogTopics ?? [];
const changelogTopicParents = generated?.changelogTopicParents ?? {};
const changelogTopicPaths = generated?.changelogTopicPaths ?? {};

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
