/**
 * Centralized icon registry for sidebar components.
 *
 * This module provides a single source of truth for icon mappings used across
 * the sidebar. Icons are referenced by string names that correspond to:
 * - Topic icons (in Sidebar.astro for topic navigation)
 * - Section icons (in SidebarSublist.astro, encoded in badge classes as "icon-<name>")
 */

import AnalyticsIcon from "../components/icons/AnalyticsIcon.astro";
import ArchitectureIcon from "../components/icons/ArchitectureIcon.astro";
import ComponentIcon from "../components/icons/ComponentIcon.astro";
import ConceptIcon from "../components/icons/ConceptIcon.astro";
import ContributeIcon from "../components/icons/ContributeIcon.astro";
import ExplanationIcon from "../components/icons/ExplanationIcon.astro";
import FunctionIcon from "../components/icons/FunctionIcon.astro";
import GuideIcon from "../components/icons/GuideIcon.astro";
import HelpIcon from "../components/icons/HelpIcon.astro";
import IntegrationIcon from "../components/icons/IntegrationIcon.astro";
import LanguageIcon from "../components/icons/LanguageIcon.astro";
import OperatorIcon from "../components/icons/OperatorIcon.astro";
import PackageIcon from "../components/icons/PackageIcon.astro";
import ReferenceIcon from "../components/icons/ReferenceIcon.astro";
import SecurityIcon from "../components/icons/SecurityIcon.astro";
import SetupIcon from "../components/icons/SetupIcon.astro";
import TestingIcon from "../components/icons/TestingIcon.astro";
import ToolsIcon from "../components/icons/ToolsIcon.astro";
import TutorialIcon from "../components/icons/TutorialIcon.astro";

/**
 * Valid icon names that can be used in the sidebar.
 */
export type IconName =
  | "analytics"
  | "architecture"
  | "component"
  | "concept"
  | "contribute"
  | "data"
  | "explanation"
  | "function"
  | "guide"
  | "help"
  | "integration"
  | "language"
  | "operator"
  | "package"
  | "reference"
  | "security"
  | "setup"
  | "testing"
  | "tools"
  | "tutorial";

/**
 * Icon component type - all icon components have the same interface.
 */
export type IconComponent = typeof ReferenceIcon;

/**
 * Registry mapping icon names to their Astro components.
 */
export const iconComponents: Record<IconName, IconComponent> = {
  analytics: AnalyticsIcon,
  architecture: ArchitectureIcon,
  component: ComponentIcon,
  concept: ConceptIcon,
  contribute: ContributeIcon,
  data: ArchitectureIcon,
  explanation: ExplanationIcon,
  function: FunctionIcon,
  guide: GuideIcon,
  help: HelpIcon,
  integration: IntegrationIcon,
  language: LanguageIcon,
  operator: OperatorIcon,
  package: PackageIcon,
  reference: ReferenceIcon,
  security: SecurityIcon,
  setup: SetupIcon,
  testing: TestingIcon,
  tools: ToolsIcon,
  tutorial: TutorialIcon,
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
