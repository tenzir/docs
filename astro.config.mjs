// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import starlightLinksValidator from 'starlight-links-validator';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightOpenAPI from 'starlight-openapi'
import inlineSVGs from './astro-inline-svgs.mjs'
import { docs_sidebar, integrations_sidebar } from './src/sidebar';
import { bundledLanguages } from 'shiki'

// TODO: make this a submodule and track the latest version.
import tqlLang from './tql.tmLanguage.json' assert { type: 'json' };

const runLinkCheck = process.env.RUN_LINK_CHECK || false;

// https://astro.build/config
export default defineConfig({
  // TODO: set to https://docs.tenzir.com and remove `base`.
  site: 'https://tenzir.github.io',
  base: 'docs',
  integrations: [
    sitemap(),
    starlight({
      title: 'Tenzir',
      logo: {
        light: './src/assets/tenzir-light.svg',
        dark: './src/assets/tenzir-dark.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/tenzir/tenzir',
        discord: 'https://discord.tenzir.com',
        linkedin: 'https://linkedin.com/company/tenzir',
      },
      lastUpdated: true,
      pagination: false,
      customCss: [
        "@fontsource-variable/jetbrains-mono",
        "@fontsource-variable/inter",
        "./src/assets/styles.css",
      ],
      components: {
        Sidebar: './src/components/Sidebar.astro',
        SiteTitle: './src/components/SiteTitle.astro',
      },
      routeMiddleware: './src/routeData.ts',
      plugins: [
        ...(runLinkCheck
          ? [
            starlightLinksValidator({
              //errorOnInvalidHashes: false,
              //errorOnLocalLinks: false,
              exclude: [
                "/api/",
              ],
            }),
          ]
          : []),
        starlightOpenAPI([
          {
            base: 'reference/api/node',
            label: 'Node',
            // TODO: Something should auto-generate the spec and update this
            // file automatically.
            schema: './src/content/apis/openapi.node.yaml',
          },
          //{
          //  base: 'reference/api/platform',
          //  label: 'Platform',
          //  schema: './src/content/apis/openapi.platform.yaml',
          //},
        ]),
        starlightSidebarTopics([
          {
            label: 'Documentation',
            id: 'documentation',
            link: '/',
            icon: 'open-book',
            items: docs_sidebar,
          },
          {
            label: 'Integrations',
            link: '/integrations',
            icon: 'information',
            items: integrations_sidebar,
          },
        ],
        {
          topics: {
            // Associate all pages under `/reference/api/` directory with the
            // "Documentation" topic having the ID `documentation`.
            documentation: ["/reference/api", "/reference/api/**/*"],
          },
        }),
      ],
    }),
    inlineSVGs(),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      langs: [
        {
          id: 'tql',
          scopeName: 'source.tql',
          ...tqlLang,
        },
        ...Object.keys(bundledLanguages),
      ],
    },
  },
  // Disable built-in image optimization. We need this so that our SVG hoisting
  // works.
  image: {
    service: passthroughImageService(),
  },
});
