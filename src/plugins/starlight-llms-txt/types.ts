import type { StarlightUserConfig } from "@astrojs/starlight/types";
import type { AstroConfig } from "astro";

interface CustomSetUserConfig {
  /** Label for this subset of documentation, e.g. `"Tutorial"` */
  label: string;
  /** An array of page slugs or glob patterns that match page slugs for docs to include in this set., e.g. `["tutorial/**"]` */
  paths: string[];
  /** An optional description for this subset of the documentation, e.g. `"a step-by-step tutorial to build a new project"` */
  description?: string;
}

interface CustomSet extends CustomSetUserConfig {
  slug: string;
}

/** Project configuration metadata passed from the integration to the routes in a virtual module. */
export interface ProjectContext {
  base: AstroConfig["base"];
  defaultLocale: StarlightUserConfig["defaultLocale"];
  locales: StarlightUserConfig["locales"];
  title: StarlightUserConfig["title"];
  description: StarlightUserConfig["description"];
  customSets: Array<CustomSet>;
  promote: string[];
  demote: string[];
  pageSeparator: string;
  perPageMarkdown: {
    enabled: boolean;
    extensionStrategy: "append" | "replace";
    excludePages: string[];
  };
}

/** Plugin user options. */
export interface StarlightLlmsTxtOptions {
  /**
   * Provide a custom name for this project or software. This will be used in `llms.txt` to identify
   * what the documentation is for.
   *
   * Default: the value of Starlight's `title` option.
   *
   * @example "Tenzir"
   */
  projectName?: string;

  /**
   * Set a custom description for your documentation site to share with large language models.
   * Can include Markdown syntax. Will be displayed in `llms.txt` immediately after the file's title.
   *
   * @example "The low-code data pipeline solution for security teams"
   */
  description?: string;

  /**
   * An array of custom subsets of your docs to process and add to the `llms.txt` entrypoint.
   */
  customSets?: Array<CustomSetUserConfig>;

  /**
   * Micromatch expressions to match page IDs that should be sorted to the end of the output.
   *
   * @default []
   */
  demote?: string[];

  /**
   * Enable generation of individual Markdown (.md) files for each documentation page.
   *
   * Can be set to `true` to enable with defaults, or an object for advanced configuration.
   *
   * @default false
   *
   * @example
   * // Enable with defaults
   * perPageMarkdown: true
   *
   * @example
   * // Enable with custom configuration
   * perPageMarkdown: {
   *   extensionStrategy: 'replace',
   *   excludePages: ['404', 'admin/**'],
   * }
   */
  perPageMarkdown?:
    | boolean
    | {
        /**
         * File naming pattern for individual Markdown files.
         * - 'append': Adds .md to the existing URL (e.g., /docs/getting-started.html.md)
         * - 'replace': Replaces the extension with .md (e.g., /docs/getting-started.md)
         *
         * @default 'append'
         */
        extensionStrategy?: "append" | "replace";
        /**
         * Page IDs to exclude from individual .md file generation. Supports glob patterns.
         *
         * @default ['404']
         *
         * @example ['404', 'admin/**']
         */
        excludePages?: string[];
      };
}
