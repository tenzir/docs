export interface ChangelogTopic {
  label: string;
  link?: string;
}

interface ChangelogModule {
  changelogTopics: ChangelogTopic[];
}

const modules = import.meta.glob<ChangelogModule>(
  "../../sidebar-changelog.generated.ts",
  { eager: true },
);

export const changelogTopics: ChangelogTopic[] =
  Object.values(modules)[0]?.changelogTopics ?? [];
