import { fileURLToPath } from "node:url";

import type {
  StarlightPlugin,
  StarlightUserConfig,
} from "@astrojs/starlight/types";
import type { ViteUserConfig } from "astro";

import changelogProjects from "../../changelog-projects.json";
import * as sidebars from "../../sidebar";
import { isSection } from "../../sidebar-sections";
import type {
  ResolvedSiteNavigationSection,
  SidebarItems,
  SiteNavigationSectionConfig,
  SiteNavigationUserSectionConfig,
} from "./types";

type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];

interface SharedSiteNavigationData {
  sections: ResolvedSiteNavigationSection[];
}

export default function starlightSiteNavigation(
  userConfig: SiteNavigationUserSectionConfig[],
): StarlightPlugin {
  const config = resolveUserConfig(userConfig);
  const { sections, sidebar } = resolveSiteNavigation(config);

  return {
    name: "starlight-site-navigation",
    hooks: {
      setup({
        addIntegration,
        addRouteMiddleware,
        command,
        config: starlightConfig,
        updateConfig,
      }) {
        if (command !== "dev" && command !== "build") {
          return;
        }

        if (starlightConfig.sidebar) {
          throw new Error(
            "starlight-site-navigation manages the Starlight sidebar and does not support a top-level `sidebar` config.",
          );
        }

        addRouteMiddleware({
          entrypoint: fileURLToPath(
            new URL("./middleware.ts", import.meta.url),
          ),
          order: "pre",
        });

        updateConfig({ sidebar });

        addIntegration({
          name: "starlight-site-navigation-integration",
          hooks: {
            "astro:config:setup": ({ updateConfig }) => {
              updateConfig({
                vite: {
                  plugins: [vitePluginStarlightSiteNavigation({ sections })],
                },
              });
            },
          },
        });
      },
    },
  };
}

function resolveUserConfig(
  sections: SiteNavigationUserSectionConfig[],
  trail: string[] = [],
): SiteNavigationSectionConfig[] {
  return sections.flatMap((section) => {
    const sectionTrail = [...trail, section.label];
    const resolvedLink = normalizeLink(
      section.link ?? deriveLink(section.label),
    );
    const resolvedChildren = [
      ...(section.children ?? []).flatMap((child) =>
        resolveUserConfig([child], sectionTrail),
      ),
      ...resolveChildrenSource(section.childrenFrom),
    ];

    return {
      label: section.label,
      link: resolvedLink,
      icon: section.icon,
      badge: section.badge,
      sidebar: resolveSidebar({
        explicitSidebarName: section.sidebar,
        fallbackSidebarName: deriveSidebarName(section.label),
        sectionTrail,
      }),
      paths: section.paths,
      dropdown: section.dropdown,
      children: resolvedChildren.length > 0 ? resolvedChildren : undefined,
    };
  });
}

function resolveChildrenSource(
  source: SiteNavigationUserSectionConfig["childrenFrom"],
): SiteNavigationSectionConfig[] {
  switch (source) {
    case undefined:
      return [];
    case "changelogProjects":
      return Object.keys(changelogProjects).map((projectId) => ({
        label: humanizeProjectId(projectId),
        link: `/changelog/${projectId}`,
      }));
    default:
      throw new Error(`Unknown site navigation children source: ${source}`);
  }
}

function humanizeProjectId(projectId: string) {
  return projectId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveSidebar({
  explicitSidebarName,
  fallbackSidebarName,
  sectionTrail,
}: {
  explicitSidebarName?: string;
  fallbackSidebarName: string;
  sectionTrail: string[];
}): SidebarItems | undefined {
  const sidebarName = explicitSidebarName ?? fallbackSidebarName;
  const sidebar = sidebars[sidebarName as keyof typeof sidebars];

  if (!Array.isArray(sidebar)) {
    if (explicitSidebarName) {
      throw new Error(
        `Unknown site navigation sidebar "${explicitSidebarName}" for section "${sectionTrail.join(" > ")}". Available sidebars: ${Object.keys(sidebars).sort().join(", ")}`,
      );
    }
    return undefined;
  }

  return transformSidebarItems(sidebar);
}

function transformSidebarItems(items: SidebarItems): SidebarItems {
  return items.flatMap((item) => {
    if (isSection(item)) {
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

    if (
      typeof item === "object" &&
      item !== null &&
      "items" in item &&
      Array.isArray(item.items)
    ) {
      return { ...item, items: transformSidebarItems(item.items) };
    }

    return item;
  });
}

function resolveSiteNavigation(config: SiteNavigationSectionConfig[]) {
  const sections: ResolvedSiteNavigationSection[] = [];
  const sidebar: SidebarItems = [];
  let sidebarIndex = 0;

  function visit(
    section: SiteNavigationSectionConfig,
    parentId: string | null,
    depth: number,
  ): string {
    const id = section.id ?? createId(section);
    const normalizedLink = normalizeLink(section.link);
    const normalizedPaths = (section.paths ?? []).map(normalizePathPattern);
    const childIds: string[] = [];

    const currentSidebarIndex = section.sidebar?.length ? sidebarIndex++ : null;
    if (section.sidebar?.length) {
      sidebar.push({
        label: id,
        items: section.sidebar,
      } as StarlightUserConfig["sidebar"][number]);
    }

    sections.push({
      id,
      label: section.label,
      link: normalizedLink,
      icon: section.icon,
      badge: section.badge,
      parentId,
      depth,
      dropdown: section.dropdown ?? false,
      childIds,
      paths: normalizedPaths,
      sidebarIndex: currentSidebarIndex,
    });

    for (const child of section.children ?? []) {
      childIds.push(visit(child, id, depth + 1));
    }

    return id;
  }

  for (const section of config) {
    visit(section, null, 0);
  }

  return { sections, sidebar };
}

function vitePluginStarlightSiteNavigation(
  data: SharedSiteNavigationData,
): VitePlugin {
  const modules = {
    "virtual:starlight-site-navigation/config": `export default ${JSON.stringify(data)}`,
  };

  const resolutionMap = Object.fromEntries(
    Object.keys(modules).map((key) => [resolveVirtualModuleId(key), key]),
  );

  return {
    name: "vite-plugin-starlight-site-navigation",
    resolveId(id) {
      if (id in modules) {
        return resolveVirtualModuleId(id);
      }
    },
    load(id) {
      const resolved = resolutionMap[id];
      return resolved ? modules[resolved as keyof typeof modules] : undefined;
    },
  };
}

function deriveLink(label: string) {
  return `/${slugify(label)}`;
}

function deriveSidebarName(label: string) {
  return slugify(label);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeLink(link: string) {
  if (!link || link === "/") {
    return "/";
  }
  return `/${link.replace(/^\/+|\/+$/g, "")}`;
}

function normalizePathPattern(path: string) {
  if (!path || path === "/") {
    return "/";
  }
  return `/${path.replace(/^\/+/, "")}`;
}

function createId(section: SiteNavigationSectionConfig) {
  if (section.link && section.link !== "/") {
    return section.link.replace(/^\/+|\/+$/g, "").replace(/\//g, ".");
  }
  return section.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
  return `\0${id}`;
}
