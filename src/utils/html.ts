/**
 * HTML escaping utilities for safe attribute injection.
 */

/**
 * Escape special HTML characters in a string for use in attributes.
 */
export function escapeAttr(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Inject or update attributes on an SVG tag.
 * Handles existing attributes by updating them, or adds new ones.
 */
export function injectSvgAttrs(
  content: string,
  classValue: string,
  alt: string,
): string {
  const match = content.match(/<svg\b[^>]*>/i);
  if (!match) return content;

  let tag = match[0];

  // Upsert class attribute
  if (classValue) {
    const classRe = /\bclass=(["'])(.*?)\1/i;
    if (classRe.test(tag)) {
      tag = tag.replace(classRe, (_, quote, existing) => {
        const combined = `${existing} ${escapeAttr(classValue)}`.trim();
        return `class=${quote}${combined}${quote}`;
      });
    } else {
      tag = tag.replace(/>$/, ` class="${escapeAttr(classValue)}">`);
    }
  }

  // Upsert role and aria-label
  for (const [name, value] of Object.entries({
    role: "img",
    "aria-label": alt,
  })) {
    const attrRe = new RegExp(`\\b${name}=(["'])(.*?)\\1`, "i");
    if (attrRe.test(tag)) {
      tag = tag.replace(attrRe, `${name}="${escapeAttr(value)}"`);
    } else {
      tag = tag.replace(/>$/, ` ${name}="${escapeAttr(value)}">`);
    }
  }

  return content.replace(match[0], tag);
}
