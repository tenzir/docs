// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import starlightLinksValidator from 'starlight-links-validator';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightOpenAPI from 'starlight-openapi'
import rehypeExternalLinks from 'rehype-external-links';
import inlineSVGs from './astro-inline-svgs.mjs'
import markdoc from '@astrojs/markdoc';
import { topics } from './src/topics';
import { bundledLanguages } from 'shiki'

// A GitHub Actions workflow pushes upstream changes in tenzir/vscode-tql
// directly into this repository, keeping this file up to date.
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
      social: [
        {icon: 'github', label: 'GitHub', href: 'https://github.com/tenzir/tenzir'},
        {icon: 'discord', label: 'Discord', href: 'https://discord.tenzir.com'},
        {icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/tenzir'},
      ],
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
            schema: './src/content/apis/openapi.node.yaml',
          },
          {
            base: 'reference/api/platform',
            label: 'Platform',
            schema: './src/content/apis/openapi.platform.json',
          },
        ]),
        starlightSidebarTopics(
          topics,
          {
            topics: {
              // Associate all pages under `/reference/api/` directory with the
              // Reference topic.
              reference: ["/reference/api", "/reference/api/**/*"],
            },
          }),
      ],
    }),
    inlineSVGs(),
    markdoc(),
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
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['noopener', 'noreferrer'] }
      ]
    ]
  },
  // Disable built-in image optimization. We need this so that our SVG hoisting
  // works.
  image: {
    service: passthroughImageService(),
  },
});
