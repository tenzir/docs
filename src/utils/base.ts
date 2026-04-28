// This is a copy of packages/starlight/utils/base.ts because it's not imported,
// but we do need in combination with generating link in our overridden
// components. :-/

function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, "");
}

function stripTrailingSlash(path: string): string {
  return path.replace(/\/+$/, "");
}

export function pathWithBase(path: NonNullable<string>): string {
  const base = import.meta.env.BASE_URL;
  path = stripLeadingSlash(path);
  if (!base) {
    return path;
  }
  return `${stripTrailingSlash(base)}/${path}`;
}

/**
 * Apply Astro's configured base path to internal absolute hrefs.
 * Leaves external, protocol-relative, anchor, and relative hrefs unchanged.
 */
export function hrefWithBase(href: string): string;
export function hrefWithBase(href: undefined): undefined;
export function hrefWithBase(href: string | undefined): string | undefined {
  return typeof href === "string" &&
    href.startsWith("/") &&
    !href.startsWith("//")
    ? pathWithBase(href)
    : href;
}
