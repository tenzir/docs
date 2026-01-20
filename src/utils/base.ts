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
