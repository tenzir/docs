const htmlExtension = ".html";

export function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export function stripLeadingSlash(path: string): string {
  return path.replace(/^\//, "");
}

export function stripTrailingSlash(path: string): string {
  return path.replace(/\/$/, "");
}

export function pathnameToSlug(pathname: string): string {
  const base = stripTrailingSlash(import.meta.env.BASE_URL);

  if (base && pathname.startsWith(base)) {
    pathname = pathname.replace(base, "");
  }

  const segments = pathname.split("/");

  if (segments.at(-1) === "index.html") {
    segments.pop();
  } else if (segments.at(-1)?.endsWith(htmlExtension)) {
    const last = segments.pop();
    if (last) {
      segments.push(last.slice(0, -1 * htmlExtension.length));
    }
  }

  return segments.filter(Boolean).join("/");
}
