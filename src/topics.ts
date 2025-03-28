import { guides, tutorials, explanations, reference, integrations, changelog_node, changelog_platform } from './sidebar';

export const topics = [
  {
    label: 'Docs',
    id: 'docs',
    link: '/',
    icon: 'open-book',
    items: guides,
  },
  {
    label: 'Integrations',
    id: 'integrations',
    link: '/integrations',
    icon: 'information',
    items: integrations,
  },
  // Sub-topics underneath Docs.
  {
    label: 'Guides',
    id: 'guides',
    link: '/guides',
    icon: 'open-book',
    items: guides,
  },
  {
    label: 'Tutorials',
    id: 'tutorials',
    link: '/tutorials',
    icon: 'open-book',
    items: tutorials,
  },
  {
    label: 'Explanations',
    id: 'explanations',
    link: '/explanations',
    icon: 'open-book',
    items: explanations,
  },
  {
    label: 'Reference',
    id: 'reference',
    link: '/reference',
    icon: 'open-book',
    items: reference,
  },
  {
    label: 'Changelog',
    link: '/changelog/',
    items: changelog_node,
  },
  {
    label: 'Node',
    link: '/changelog/node',
    icon: 'open-book',
    items: changelog_node,
  },
  {
    label: 'Platform',
    link: '/changelog/platform',
    icon: 'open-book',
    items: changelog_platform,
  },
]

export const topicParents = {
  'Guides': 'Docs',
  'Tutorials': 'Docs',
  'Explanations': 'Docs',
  'Reference': 'Docs',
  'Docs': null,
  'Integrations': null,
  'Node': 'Changelog',
  'Platform': 'Changelog',
  'Changelog': null,
};

export function rootTopics(): typeof topics {
  return topics.filter((topic) => topicParents[topic.label] === null);
}

export function parentTopic(label: string): string | null {
  return topicParents[label] ?? null;
}

export function childTopics(parentLabel: string): string[] {
  return Object.entries(topicParents)
  .filter(([_, parent]) => parent === parentLabel)
  .map(([label]) => label);
}
