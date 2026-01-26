import type { StarlightUserConfig } from "@astrojs/starlight/types";
import type { AstroConfig } from "astro";

/** Configuration for a preamble that appears after the title in generated files. */
export interface PreambleConfig {
  /** Markdown content inserted after the title/description. */
  content: string;
}

/** Preamble configuration for generated output files. */
export interface PreambleOptions {
  /** Preamble for llms.txt (the index/sitemap file). */
  index?: PreambleConfig;
  /** Preamble for llms-full.txt. */
  full?: PreambleConfig;
}

/** Project configuration metadata passed from the integration to the routes in a virtual module. */
export interface ProjectContext {
  base: AstroConfig["base"];
  defaultLocale: StarlightUserConfig["defaultLocale"];
  locales: StarlightUserConfig["locales"];
  title: StarlightUserConfig["title"];
  description: StarlightUserConfig["description"];
  pageSeparator: string;
  perPageMarkdown: {
    enabled: boolean;
    extensionStrategy: "append" | "replace";
    excludePages: string[];
  };
  preambles: PreambleOptions;
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

  /**
   * Custom preambles for generated files.
   *
   * Preambles are markdown content inserted after the title/description in generated files.
   * Use them to provide navigation hints or context for LLMs.
   *
   * @example
   * preambles: {
   *   index: {
   *     content: '## Documentation Index\n> Fetch the complete docs at: https://docs.example.com/llms-full.txt',
   *   },
   *   full: {
   *     content: '## Complete Documentation\n> For a navigable index, see: https://docs.example.com/llms.txt',
   *   },
   * }
   */
  preambles?: PreambleOptions;

  /**
   * Create a sitemap.md alias that serves the same content as llms.txt.
   * Useful for backwards compatibility with tools expecting sitemap.md.
   *
   * @default false
   */
  sitemapAlias?: boolean;
}
