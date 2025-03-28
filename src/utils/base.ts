// This is a copy of packages/starlight/utils/base.ts because it's not imported,
// but we do need in combination with generating link in our overridden
// components. :-/

const base = import.meta.env.BASE_URL ?? '/';

function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, '');
}

export function pathWithBase(path: string): string {
  path = stripLeadingSlash(path);
  return path ? base + '/' + path : base + '/';
}
