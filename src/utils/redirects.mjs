/** Static redirect paths (external URLs, versioned aliases). */
const STATIC_REDIRECTS = {
  "/discord": "https://discord.gg/xqbDgVTCxZ",
  "/sbom":
    "https://github.com/tenzir/tenzir/releases/latest/download/tenzir.spdx.json",
  // Architecture hoisting
  "/explanations/architecture": "/explanations/deployment",
  "/explanations/architecture/pipeline": "/explanations/pipeline",
  "/explanations/architecture/node": "/explanations/node",
  "/explanations/architecture/platform": "/explanations/platform",
  // Language detail pages move to Reference
  "/explanations/language/types": "/reference/types",
  "/explanations/language/expressions": "/reference/expressions",
  "/explanations/language/statements": "/reference/statements",
  "/explanations/language/programs": "/reference/programs",
};

/**
 * OpenAPI-generated paths (starlight-openapi plugin).
 * These render as HTML but have no markdown source files.
 */
export const OPENAPI_PATHS = ["/reference/node/api", "/reference/platform/api"];

/** Generate all redirects for the documentation. */
export function generateRedirects() {
  return { ...STATIC_REDIRECTS };
}

/**
 * Get all paths that don't have markdown equivalents.
 * Used by llms-txt plugin to avoid appending .md to these links.
 */
export function getNonMarkdownPaths() {
  return [...Object.keys(STATIC_REDIRECTS), ...OPENAPI_PATHS];
}
