import type { CollectionEntry } from "astro:content";

type DocsEntry = CollectionEntry<"docs">;
type DocsMap = Map<string, DocsEntry>;

const GENERIC_TITLES = new Set(["Overview", "Introduction"]);

export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word, i) =>
      i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(" ");
}

export function resolvePageTitle(
  docsMap: DocsMap,
  collection: string,
  path: string,
): string {
  const fullPath = `${collection}/${path}`;

  // Try direct path first, then as index page
  const entry = docsMap.get(fullPath) ?? docsMap.get(`${fullPath}/index`);

  if (entry) {
    // Prefer sidebar.label over title (consistent with PageTitle.astro)
    const title = entry.data.sidebar?.label ?? entry.data.title;

    // Return title unless it's generic
    if (!GENERIC_TITLES.has(title)) {
      return title;
    }
  }

  // Fall back to formatting the last path segment
  const lastSegment = path.split("/").pop() ?? path;
  return formatSlug(lastSegment);
}
