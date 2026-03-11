import type {
  StarlightIcon,
  StarlightUserConfig,
} from "@astrojs/starlight/types";

export type SidebarItems = NonNullable<StarlightUserConfig["sidebar"]>;

export interface SiteNavigationBadge {
  text: string;
  variant?: "note" | "danger" | "success" | "caution" | "tip" | "default";
}

export interface SiteNavigationUserSectionConfig {
  label: string;
  link?: string;
  icon?: string;
  badge?: SiteNavigationBadge;
  sidebar?: string;
  paths?: string[];
  dropdown?: boolean;
  children?: SiteNavigationUserSectionConfig[];
  childrenFrom?: "changelogProjects";
}

export interface SiteNavigationSectionConfig {
  id?: string;
  label: string;
  link: string;
  icon?: string;
  badge?: SiteNavigationBadge;
  sidebar?: SidebarItems;
  paths?: string[];
  dropdown?: boolean;
  children?: SiteNavigationSectionConfig[];
}

export interface ResolvedSiteNavigationSection {
  id: string;
  label: string;
  link: string;
  icon?: string;
  badge?: SiteNavigationBadge;
  parentId: string | null;
  depth: number;
  dropdown: boolean;
  childIds: string[];
  paths: string[];
  sidebarIndex: number | null;
}

export interface SiteNavigationRouteSection {
  id: string;
  label: string;
  link: string;
  icon?: StarlightIcon | string;
  badge?: SiteNavigationBadge;
  parentId: string | null;
  depth: number;
  dropdown: boolean;
  isActive: boolean;
  isCurrent: boolean;
}

export interface SiteNavigationRouteData {
  isPageInNavigation: boolean;
  sections: SiteNavigationRouteSection[];
  primarySections: SiteNavigationRouteSection[];
  activeTrail: SiteNavigationRouteSection[];
  activePrimarySection?: SiteNavigationRouteSection;
  activeSection?: SiteNavigationRouteSection;
  sectionSwitcherSections: SiteNavigationRouteSection[];
}
