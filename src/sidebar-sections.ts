import type { StarlightUserConfig } from "@astrojs/starlight/types";

type SidebarItems = NonNullable<StarlightUserConfig["sidebar"]>;

export const SIDEBAR_SECTION = Symbol("sidebar-section");

export interface SidebarSection {
  [SIDEBAR_SECTION]: true;
  label: string;
  icon?: string;
  items: SidebarItems;
}

export function section(
  label: string,
  items: SidebarItems,
  icon?: string,
): SidebarSection {
  if (items.length === 0) {
    throw new Error(`Section "${label}" must have at least one item`);
  }
  return { [SIDEBAR_SECTION]: true, label, icon, items };
}

export function isSection(item: unknown): item is SidebarSection {
  return typeof item === "object" && item !== null && SIDEBAR_SECTION in item;
}
