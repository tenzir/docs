// Stub file for changelog sidebar data.
// This file is overwritten by `pnpm sync:changelog` with real changelog data.
// The stub ensures `pnpm build` works without running sync:changelog first.

export const changelogTopics: {
  label: string;
  id: string;
  link: string;
  icon: string;
  items: unknown[];
}[] = [];

export const changelogTopicParents: Record<string, string> = {};

export const changelogTopicPaths: Record<string, string[]> = {};
