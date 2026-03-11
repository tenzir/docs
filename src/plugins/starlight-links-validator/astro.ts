import fs from "node:fs";

import type { AstroConfig, AstroIntegrationLogger } from "astro";

const dataStoreFile = "data-store.json";

export async function clearContentLayerCache(
  config: AstroConfig,
  logger: AstroIntegrationLogger,
) {
  const dataStore = new URL(dataStoreFile, config.cacheDir);
  if (!fs.existsSync(dataStore)) {
    return;
  }
  logger.info("Invalidating content layer cache…");
  await fs.promises.rm(dataStore, { force: true });
}
