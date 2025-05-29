// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
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
const isProd = process.env.NODE_ENV === 'production';

// Function to recursively find all .md files in a directory
function findMarkdownFiles(dir, baseDir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, baseDir));
    } else if (item.endsWith('.md')) {
      const relativePath = relative(baseDir, fullPath);
      files.push(relativePath.replace(/\.md$/, ''));
    }
  }
  
  return files;
}

// Dynamically discover all operator and function pages
const operatorsDir = './src/content/docs/reference/operators';
const functionsDir = './src/content/docs/reference/functions';

const operatorPages = findMarkdownFiles(operatorsDir, operatorsDir);
const functionPages = findMarkdownFiles(functionsDir, functionsDir);

// Generate redirect mappings for all operator and function pages
const redirects = {};

// Add operator redirects
operatorPages.forEach(page => {
  redirects[`/tql2/operators/${page}`] = `/reference/operators/${page}`;
});

// Add function redirects
functionPages.forEach(page => {
  redirects[`/tql2/functions/${page}`] = `/reference/functions/${page}`;
});

// https://astro.build/config
export default defineConfig({
  site: 'https://new.docs.tenzir.com',
  redirects: {
    '/discord': 'https://discord.gg/xqbDgVTCxZ',
    '/sbom': 'https://github.com/tenzir/tenzir/releases/latest/download/tenzir.spdx.json',
    ...redirects,
  },
  integrations: [
    sitemap(),
    starlight({
      title: 'Tenzir',
      logo: {
        light: './src/assets/tenzir-light.svg',
        dark: './src/assets/tenzir-dark.svg',
        replacesTitle: true,
      },
      head: [
        ...(isProd ? [{
          tag: 'script',
          attrs: {
            defer: true,
            'data-domain': 'docs.tenzir.com',
            src: 'https://plausible.io/js/script.js',
          },
        }] : []),
      ],
      social: [
        {icon: 'github', label: 'GitHub', href: 'https://github.com/tenzir/tenzir'},
        {icon: 'discord', label: 'Discord', href: '/discord'},
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
        PageTitle: './src/components/PageTitle.astro',
        Sidebar: './src/components/Sidebar.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
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
            base: 'reference/platform-api',
            label: 'Platform API',
            schema: './src/content/apis/openapi.platform.json',
          },
          {
            base: 'reference/node-api',
            label: 'Node API',
            schema: './src/content/apis/openapi.node.yaml',
          },
        ]),
        starlightSidebarTopics(
          topics,
          {
            topics: {
              // Associate all pages under `/reference/api/` directory with the
              // Reference topic.
              reference: [
                "/reference/node-api",
                "/reference/node-api/**/*",
                "/reference/platform-api",
                "/reference/platform-api/**/*",
                "/reference/functions/*",
                "/reference/operators/**/*",
                "/reference/operators/*",
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
