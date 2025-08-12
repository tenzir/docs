// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";

import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import starlightLinksValidator from "starlight-links-validator";
import starlightSidebarTopics from "starlight-sidebar-topics";
import starlightOpenAPI from "starlight-openapi";
import starlightLlmsTxt from "starlight-llms-txt";
import rehypeExternalLinks from "rehype-external-links";
import inlineSVGs from "./astro-inline-svgs.mjs";
import markdoc from "@astrojs/markdoc";
import { topics } from "./src/topics";
import { bundledLanguages } from "shiki";
import { generateRedirects } from "./src/utils/redirects.mjs";
import {
  nodeAPISidebarGroup,
  platformAPISidebarGroup,
} from "./src/sidebar-shared-groups.ts";

// A GitHub Actions workflow pushes upstream changes in tenzir/vscode-tql
// directly into this repository, keeping this file up to date.
import tqlLang from "./tql.tmLanguage.json" assert { type: "json" };

const runLinkCheck = process.env.RUN_LINK_CHECK || false;
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
      plugins: [
        starlightLlmsTxt({
          projectName: "Tenzir",
          description: "The low-code data pipeline solution for security teams",
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
        ...(runLinkCheck
          ? [
              starlightLinksValidator({
                //errorOnInvalidHashes: false,
                //errorOnLocalLinks: false,
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
            schema: "./src/content/apis/openapi.platform.json",
            sidebar: { label: "API", group: platformAPISidebarGroup },
          },
          {
            base: "reference/node/api",
            schema: "./src/content/apis/openapi.node.yaml",
            sidebar: { label: "API", group: nodeAPISidebarGroup },
          },
        ]),
        starlightSidebarTopics(topics, {
          topics: {
            changelog_node: ["/changelog/node/*"],
            changelog_platform: ["/changelog/platform/*"],
            reference: [
              "/reference/node/api",
              "/reference/node/api/**/*",
              "/reference/platform/api",
              "/reference/platform/api/**/*",
              "/reference/functions/**/*",
              "/reference/operators/**/*",
            ],
          },
        }),
      ],
    }),
    inlineSVGs(),
    markdoc(),
  ],
  markdown: {
    shikiConfig: {
      // Note: These themes are for inline code in Markdown content.
      // For code blocks, Expressive Code uses the themes defined in ec.config.mjs
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      langs: [
        {
          ...tqlLang,
          id: "tql",
          scopeName: "source.tql",
        },
        ...Object.keys(bundledLanguages),
      ],
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: "_blank", rel: ["noopener", "noreferrer"] },
      ],
    ],
  },
  // Disable built-in image optimization. We need this so that our SVG hoisting
  // works.
  image: {
    service: passthroughImageService(),
  },
});
