// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from "@astrojs/sitemap";
import starlightUtils from "@lorenzo_lewis/starlight-utils";
import starlightLinksValidator from 'starlight-links-validator'
import starlightOpenAPI from 'starlight-openapi'
import inlineSVGs from "./astro-inline-svgs.mjs";
import { sidebar } from "./src/sidebar";
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
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    starlight({
      pagination: false,
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
        starlightUtils({
          multiSidebar: {
            switcherStyle: 'hidden'
          },
          navLinks: {
            leading: { useSidebarLabelled: 'navbar' }
          }
        }),
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
      ],
      title: 'Tenzir',
      logo: {
        light: './src/assets/tenzir-light.svg',
        dark: './src/assets/tenzir-dark.svg',
        replacesTitle: true,
      },
      customCss: ['./src/assets/styles.css'],
      social: {
        github: 'https://github.com/tenzir/tenzir',
        discord: 'https://discord.tenzir.com',
        linkedin: 'https://linkedin.com/company/tenzir',
      },
      sidebar,
      lastUpdated: true,
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
  // Disable built-in image optimization.
  image: {
    service: passthroughImageService(),
  },
});
