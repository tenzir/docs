import type { StarlightIcon } from "@astrojs/starlight/components/Icons";

export interface ChangelogLandingProject {
  title: string;
  description: string;
  href: string;
  icon: StarlightIcon;
  color?: string;
  meta: string;
}

const modules = import.meta.glob<{
  latestTimelineYear: string;
  changelogLandingProjects: ChangelogLandingProject[];
}>("./changelog-landing.generated.ts", { eager: true });

const generated = Object.values(modules)[0];

export const latestTimelineYear =
  generated?.latestTimelineYear ?? String(new Date().getFullYear());

export const changelogLandingProjects =
  generated?.changelogLandingProjects ?? [];
