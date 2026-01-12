// Generate all redirects for the documentation
export function generateRedirects() {
  const redirects = {};

  // Static redirects
  redirects["/discord"] = "https://discord.gg/xqbDgVTCxZ";
  redirects["/sbom"] =
    "https://github.com/tenzir/tenzir/releases/latest/download/tenzir.spdx.json";

  // OCSF latest version redirect (updated by sync-ocsf.mjs)
  // Use dashes in version to avoid URL issues with dots (1.7.0 -> 1-7-0)
  // Note: Only base redirect works; Astro doesn't support dynamic segments in static redirects
  const ocsfVersion = "1-7-0";
  redirects["/reference/ocsf/latest"] = `/reference/ocsf/${ocsfVersion}`;

  return redirects;
}
