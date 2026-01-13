import { OCSF_VERSION } from "../ocsf-version.mjs";

// Generate all redirects for the documentation
export function generateRedirects() {
  const redirects = {};

  // Static redirects
  redirects["/discord"] = "https://discord.gg/xqbDgVTCxZ";
  redirects["/sbom"] =
    "https://github.com/tenzir/tenzir/releases/latest/download/tenzir.spdx.json";

  // OCSF latest version redirect
  // Note: Only base redirect works; Astro doesn't support dynamic segments in static redirects
  redirects["/reference/ocsf/latest"] = `/reference/ocsf/${OCSF_VERSION}`;

  return redirects;
}
