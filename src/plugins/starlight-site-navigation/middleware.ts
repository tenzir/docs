import config from "virtual:starlight-site-navigation/config";
import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import micromatch from "micromatch";

import type {
  ResolvedSiteNavigationSection,
  SiteNavigationRouteData,
  SiteNavigationRouteSection,
} from "./types";

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;
  const { id, pagination, sidebar } = starlightRoute;
  const currentPath = normalizePath(id);

  const activeSection =
    getSectionFromSidebar(config.sections, sidebar) ??
    getSectionFromPath(config.sections, currentPath);

  if (activeSection && activeSection.sidebarIndex !== null) {
    const activeSidebarGroup = sidebar[activeSection.sidebarIndex];
    starlightRoute.sidebar =
      activeSidebarGroup?.type === "group" ? activeSidebarGroup.entries : [];

    if (isFirstPage(starlightRoute.sidebar, id)) {
      pagination.prev = undefined;
    }
    if (isLastPage(starlightRoute.sidebar, id)) {
      pagination.next = undefined;
    }
  }

  context.locals.siteNavigation = getRouteData(config.sections, activeSection);
});

function getRouteData(
  sections: ResolvedSiteNavigationSection[],
  activeSection: ResolvedSiteNavigationSection | undefined,
): SiteNavigationRouteData {
  const byId = new Map(sections.map((section) => [section.id, section]));
  const activeTrailIds = new Set<string>();
  const activeTrail: SiteNavigationRouteSection[] = [];

  let cursor = activeSection;
  while (cursor) {
    activeTrailIds.add(cursor.id);
    activeTrail.unshift(toRouteSection(cursor, activeSection, activeTrailIds));
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  const routeSections = sections.map((section) =>
    toRouteSection(section, activeSection, activeTrailIds),
  );

  const primarySections = routeSections.filter(
    (section) => section.parentId === null,
  );
  const activePrimarySection = activeTrail[0];
  const sectionSwitcherSections = activePrimarySection
    ? routeSections.filter(
        (section) => section.parentId === activePrimarySection.id,
      )
    : [];

  return {
    isPageInNavigation: activeSection !== undefined,
    sections: routeSections,
    primarySections,
    activeTrail,
    activePrimarySection,
    activeSection: activeSection
      ? routeSections.find((section) => section.id === activeSection.id)
      : undefined,
    sectionSwitcherSections,
  };
}

function toRouteSection(
  section: ResolvedSiteNavigationSection,
  activeSection: ResolvedSiteNavigationSection | undefined,
  activeTrailIds: Set<string>,
): SiteNavigationRouteSection {
  return {
    id: section.id,
    label: section.label,
    link: section.link,
    icon: section.icon,
    badge: section.badge,
    parentId: section.parentId,
    depth: section.depth,
    dropdown: section.dropdown,
    isActive: activeTrailIds.has(section.id),
    isCurrent: activeSection?.id === section.id,
  };
}

function getSectionFromSidebar(
  sections: ResolvedSiteNavigationSection[],
  sidebar: StarlightRouteData["sidebar"],
) {
  const currentSidebarGroupIndex = getCurrentSidebarGroupIndex(sidebar);
  if (currentSidebarGroupIndex === null) {
    return undefined;
  }
  return sections.find(
    (section) => section.sidebarIndex === currentSidebarGroupIndex,
  );
}

function getCurrentSidebarGroupIndex(sidebar: StarlightRouteData["sidebar"]) {
  for (const [index, entry] of sidebar.entries()) {
    if (entry.type !== "group") {
      continue;
    }
    if (hasCurrentEntry(entry.entries)) {
      return index;
    }
  }
  return null;
}

function hasCurrentEntry(entries: StarlightRouteData["sidebar"]) {
  return entries.some((entry) => {
    if (entry.type === "link") {
      return entry.isCurrent;
    }
    return hasCurrentEntry(entry.entries);
  });
}

function getSectionFromPath(
  sections: ResolvedSiteNavigationSection[],
  currentPath: string,
) {
  const matches = sections.filter((section) => {
    if (pathsEqual(section.link, currentPath)) {
      return true;
    }
    if (
      section.paths.length > 0 &&
      micromatch.isMatch(currentPath, section.paths)
    ) {
      return true;
    }
    return false;
  });

  return matches.sort(compareSectionSpecificity).at(0);
}

function compareSectionSpecificity(
  a: ResolvedSiteNavigationSection,
  b: ResolvedSiteNavigationSection,
) {
  if (b.depth !== a.depth) {
    return b.depth - a.depth;
  }
  return b.link.length - a.link.length;
}

function isFirstPage(
  sidebar: StarlightRouteData["sidebar"],
  currentSlug: string,
) {
  const firstPage = getBoundaryPage(sidebar, "first");
  return firstPage
    ? pathsEqual(firstPage.href, normalizePath(currentSlug))
    : false;
}

function isLastPage(
  sidebar: StarlightRouteData["sidebar"],
  currentSlug: string,
) {
  const lastPage = getBoundaryPage(sidebar, "last");
  return lastPage
    ? pathsEqual(lastPage.href, normalizePath(currentSlug))
    : false;
}

function getBoundaryPage(
  sidebar: StarlightRouteData["sidebar"],
  edge: "first" | "last",
):
  | Extract<StarlightRouteData["sidebar"][number], { type: "link" }>
  | undefined {
  const entry = edge === "first" ? sidebar[0] : sidebar.at(-1);
  if (!entry) {
    return undefined;
  }
  if (entry.type === "link") {
    return entry;
  }
  return getBoundaryPage(entry.entries, edge);
}

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function pathsEqual(a: string, b: string) {
  return normalizePath(a) === normalizePath(b);
}
