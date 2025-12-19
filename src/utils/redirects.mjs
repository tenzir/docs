// Generate all redirects for the documentation
export function generateRedirects() {
  const redirects = {};

  // Static redirects
  redirects["/discord"] = "https://discord.gg/xqbDgVTCxZ";
  redirects["/sbom"] =
    "https://github.com/tenzir/tenzir/releases/latest/download/tenzir.spdx.json";

  return redirects;
}
