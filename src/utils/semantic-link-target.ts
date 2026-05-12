export interface SemanticLinkTarget {
  path: string;
  anchor: string;
}

export function parseSemanticLinkTarget(target: string): SemanticLinkTarget {
  const hashIndex = target.indexOf("#");
  if (hashIndex === -1) {
    return { path: target, anchor: "" };
  }

  return {
    path: target.slice(0, hashIndex),
    anchor: target.slice(hashIndex),
  };
}

export function normalizePagePath(path: string): string {
  return path.replace(/\/+$/, "");
}
