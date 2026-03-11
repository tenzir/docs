import type { StarlightPlugin } from "@astrojs/starlight/types";
import type { IntegrationResolvedRoute } from "astro";

import { clearContentLayerCache } from "./astro";
import { stripTrailingSlash } from "./path";
import { clearValidationData, remarkStarlightLinksValidator } from "./remark";
import type { StarlightLinksValidatorOptions } from "./types";
import { customPagesFromAssets, logErrors, validateLinks } from "./validation";

const defaultOptions: StarlightLinksValidatorOptions = {
  components: [],
  errorOnRelativeLinks: true,
  errorOnInvalidHashes: true,
  errorOnLocalLinks: true,
  sameSitePolicy: "ignore",
  exclude: [],
};

export default function starlightLinksValidator(
  userOptions: Partial<StarlightLinksValidatorOptions> = {},
): StarlightPlugin {
  const options: StarlightLinksValidatorOptions = {
    ...defaultOptions,
    ...userOptions,
    components: userOptions.components ?? defaultOptions.components,
    exclude: userOptions.exclude ?? defaultOptions.exclude,
  };

  return {
    name: "starlight-links-validator",
    hooks: {
      setup({ addIntegration, astroConfig, logger }) {
        let routes: IntegrationResolvedRoute[] = [];
        const site = astroConfig.site
          ? stripTrailingSlash(astroConfig.site)
          : undefined;

        addIntegration({
          name: "starlight-links-validator-integration",
          hooks: {
            "astro:config:setup": async ({ command, updateConfig }) => {
              if (command !== "build") {
                return;
              }

              clearValidationData();
              await clearContentLayerCache(astroConfig, logger);

              updateConfig({
                markdown: {
                  remarkPlugins: [
                    [
                      remarkStarlightLinksValidator,
                      {
                        base: astroConfig.base,
                        options,
                        site,
                        srcDir: astroConfig.srcDir,
                      },
                    ],
                  ],
                },
              });
            },
            "astro:routes:resolved": ({ routes: resolvedRoutes }) => {
              routes = resolvedRoutes;
            },
            "astro:build:done": ({ dir, pages, assets }) => {
              const customPages = customPagesFromAssets(
                assets,
                routes.map((route) => ({
                  origin: route.origin,
                  pattern: route.pattern,
                })),
                astroConfig.outDir,
              );
              const errors = validateLinks(
                pages,
                customPages,
                dir,
                astroConfig,
                options,
              );
              logErrors(logger, errors);
              if (errors.size > 0) {
                throw new Error("Links validation failed.");
              }
            },
          },
        });
      },
    },
  };
}
