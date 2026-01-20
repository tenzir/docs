// @ts-check

import sitemap from "@astrojs/sitemap";

import starlight from "@astrojs/starlight";
import { defineConfig, passthroughImageService } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import { bundledLanguages } from "shiki";
import starlightLinksValidator from "starlight-links-validator";
import starlightLlmsTxt from "starlight-llms-txt";
import starlightOpenAPI from "starlight-openapi";
import starlightSidebarTopics from "starlight-sidebar-topics";
import {
  nodeAPISidebarGroup,
  platformAPISidebarGroup,
} from "./src/sidebar-shared-groups.ts";
import { topicPaths, topics } from "./src/topics";
import { generateRedirects } from "./src/utils/redirects.mjs";
import { remarkExcalidrawLinks } from "./src/utils/remark-excalidraw-links";
import { remarkInlinePartials } from "./src/utils/remark-inline-partials";
import { remarkSeeAlsoLinks } from "./src/utils/remark-see-also-links";

const checkLinks = !!process.env.CHECK_LINKS;
const llmsTxt = !!process.env.LLMS_TXT;
const isProd = process.env.NODE_ENV === "production";

// Sidebar groups are now imported from shared-sidebar-groups.ts to ensure
// the same symbols are used in both astro.config.mjs and sidebar.ts

// https://astro.build/config
export default defineConfig({
  site: "https://docs.tenzir.com",
  redirects: generateRedirects(),
  integrations: [
    sitemap(),
    starlight({
      title: "Tenzir",
      logo: {
        light: "./src/assets/tenzir-light.svg",
        dark: "./src/assets/tenzir-dark.svg",
        replacesTitle: true,
      },
      head: [
        ...(isProd
          ? [
              {
                tag: "script",
                attrs: {
                  defer: true,
                  "data-domain": "docs.tenzir.com",
                  src: "https://plausible.io/js/script.js",
                },
              },
            ]
          : []),
        {
          tag: "link",
          attrs: {
            rel: "alternate",
            type: "application/atom+xml",
            title: "Tenzir Changelog",
            href: "/changelog/feed.xml",
          },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/tenzir/tenzir",
        },
        { icon: "discord", label: "Discord", href: "/discord" },
        {
          icon: "linkedin",
          label: "LinkedIn",
          href: "https://linkedin.com/company/tenzir",
        },
      ],
      lastUpdated: true,
      pagination: false,
      customCss: [
        "@fontsource-variable/jetbrains-mono",
        "@fontsource-variable/inter",
        "./src/assets/styles.css",
        "./src/assets/css/utilities.css",
      ],
      components: {
        PageFrame: "./src/components/PageFrame.astro",
        PageTitle: "./src/components/PageTitle.astro",
        Sidebar: "./src/components/Sidebar.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        Footer: "./src/components/Footer.astro",
        MobileMenuToggle: "./src/components/MobileMenuToggle.astro",
      },
      routeMiddleware: "./src/routeData.ts",
      pagefind: {
        // See https://pagefind.app/docs/ranking/ for details to tune the ranking.
        // We are tuning the defaults to better accomodate the needs of our
        // documentation structure. In particular, the reference should trump
        // guides, tutorials, and explanations. That is, exact term matches
        // always.
        ranking: {
          pageLength: 0.1, // default: 0.1
          termFrequency: 0.1, // default: 0.1
          termSaturation: 0.1, // default: 2
          termSimilarity: 9, // default: 9
        },
      },
      plugins: [
        ...(llmsTxt
          ? [
              starlightLlmsTxt({
                projectName: "Tenzir",
                description:
                  "The low-code data pipeline solution for security teams",
                perPageMarkdown: {
                  extensionStrategy: "replace",
                },
                customSets: [
                  {
                    label: "Reference",
                    paths: ["reference/**/*"],
                  },
                  {
                    label: "Guides",
                    paths: ["guides/**/*"],
                  },
                  {
                    label: "Tutorials",
                    paths: ["tutorials/**/*"],
                  },
                  {
                    label: "Explanations",
                    paths: ["explanations/**/*"],
                  },
                  {
                    label: "Integrations",
                    paths: ["integrations/**/*"],
                  },
                  {
                    label: "Changelog",
                    paths: ["changelog/**/*"],
                  },
                ],
                demote: ["changelog/**/*"],
              }),
            ]
          : []),
        ...(checkLinks
          ? [
              starlightLinksValidator({
                //errorOnInvalidHashes: false,
                //errorOnLocalLinks: false,
                // Validate See Also component links (Op, Fn, Guide, Tutorial,
                // Explanation). The remark-see-also-links plugin extracts the
                // slot content and adds it as a data-href attribute.
                components: [
                  ["Op", "data-href"],
                  ["Fn", "data-href"],
                  ["Guide", "data-href"],
                  ["Tutorial", "data-href"],
                  ["Explanation", "data-href"],
                ],
                exclude: [
                  // Legacy API path that redirects to correct locations
                  "/api/",
                  // Redirect to Discord server; handled by redirects.mjs
                  "/discord",
                  // Auto-generated OpenAPI pages that may not be ready during
                  // link checking
                  "/reference/node/api",
                  "/reference/platform/api",
                  // These pages fail the link check for reasons unknown; maybe
                  // a timing issue during build?
                  "/explanations/configuration",
                  "/guides/platform-setup",
                ],
              }),
            ]
          : []),
        starlightOpenAPI([
          {
            base: "reference/platform/api",
            schema: "./src/content/apis/openapi.platform.yaml",
            sidebar: {
              collapsed: false,
              label: "API",
              group: platformAPISidebarGroup,
              operations: { badges: true, labels: "path" },
            },
          },
          {
            base: "reference/node/api",
            schema: "./src/content/apis/openapi.node.yaml",
            sidebar: {
              collapsed: false,
              label: "API",
              group: nodeAPISidebarGroup,
              operations: { badges: true, labels: "path" },
            },
          },
        ]),
        starlightSidebarTopics(topics, { topics: topicPaths }),
      ],
    }),
  ],
  markdown: {
    shikiConfig: {
      // Note: These themes are for inline code in Markdown content.
      // For code blocks, Expressive Code uses the themes defined in ec.config.mjs
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      langs: [...Object.keys(bundledLanguages)],
    },
    remarkPlugins: [
      remarkInlinePartials,
      remarkExcalidrawLinks,
      remarkSeeAlsoLinks,
    ],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: "_blank", rel: ["noopener", "noreferrer"] },
      ],
    ],
  },
  // Disable built-in image optimization for SVGs to preserve their content
  // for inline SVG rendering (dark mode CSS support).
  image: {
    service: passthroughImageService(),
  },
});
