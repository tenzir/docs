export function normalizeDocPathForMarkdown(path: string): string {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  if (!normalizedPath || normalizedPath === "index") {
    return "index";
  }

  return normalizedPath.replace(/\/index$/, "");
}

export function markdownPathForDocPath(docPath: string): string {
  return `/${normalizeDocPathForMarkdown(docPath)}.md`;
}

export function markdownUrlForDocPath(
  baseUrl: string,
  docPath: string,
): string {
  return `${baseUrl}${markdownPathForDocPath(docPath)}`;
}
