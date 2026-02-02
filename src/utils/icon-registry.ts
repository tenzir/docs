/**
 * Centralized icon registry for sidebar components.
 *
 * This module provides a single source of truth for icon mappings used across
 * the sidebar. Icons are referenced by string names that correspond to:
 * - Topic icons (in Sidebar.astro for topic navigation)
 * - Section icons (in SidebarSublist.astro, encoded in badge classes as "icon-<name>")
 */

import BookIcon from "../components/icons/BookIcon.astro";
import ChartBarIcon from "../components/icons/ChartBarIcon.astro";
import CircleHelpIcon from "../components/icons/CircleHelpIcon.astro";
import CodeIcon from "../components/icons/CodeIcon.astro";
import CompassIcon from "../components/icons/CompassIcon.astro";
import CubeIcon from "../components/icons/CubeIcon.astro";
import FnIcon from "../components/icons/FnIcon.astro";
import GearIcon from "../components/icons/GearIcon.astro";
import GraduationCapIcon from "../components/icons/GraduationCapIcon.astro";
import HeartIcon from "../components/icons/HeartIcon.astro";
import LayersIcon from "../components/icons/LayersIcon.astro";
import LightbulbIcon from "../components/icons/LightbulbIcon.astro";
import ListChecksIcon from "../components/icons/ListChecksIcon.astro";
import PackageIcon from "../components/icons/PackageIcon.astro";
import PlugIcon from "../components/icons/PlugIcon.astro";
import PuzzlePieceIcon from "../components/icons/PuzzlePieceIcon.astro";
import ShieldIcon from "../components/icons/ShieldIcon.astro";
import WrenchIcon from "../components/icons/WrenchIcon.astro";

/**
 * Valid icon names that can be used in the sidebar.
 */
export type IconName =
  | "book"
  | "chart-bar"
  | "circle-help"
  | "code"
  | "compass"
  | "cube"
  | "fn"
  | "gear"
  | "graduation-cap"
  | "heart"
  | "layers"
  | "lightbulb"
  | "list-checks"
  | "package"
  | "plug"
  | "puzzle-piece"
  | "shield"
  | "wrench";

/**
 * Icon component type - all icon components have the same interface.
 */
export type IconComponent = typeof BookIcon;

/**
 * Registry mapping icon names to their Astro components.
 */
export const iconComponents: Record<IconName, IconComponent> = {
  book: BookIcon,
  "chart-bar": ChartBarIcon,
  "circle-help": CircleHelpIcon,
  code: CodeIcon,
  compass: CompassIcon,
  cube: CubeIcon,
  fn: FnIcon,
  gear: GearIcon,
  "graduation-cap": GraduationCapIcon,
  heart: HeartIcon,
  layers: LayersIcon,
  lightbulb: LightbulbIcon,
  package: PackageIcon,
  "list-checks": ListChecksIcon,
  plug: PlugIcon,
  "puzzle-piece": PuzzlePieceIcon,
  shield: ShieldIcon,
  wrench: WrenchIcon,
};

/**
 * Check if a string is a valid icon name.
 */
export function isValidIconName(name: string): name is IconName {
  return name in iconComponents;
}

/**
 * Get an icon component by name, or undefined if not found.
 */
export function getIconComponent(name: string): IconComponent | undefined {
  return isValidIconName(name) ? iconComponents[name] : undefined;
}
