/**
 * Extract the first paragraph from markdown content.
 */
export function extractDescription(markdown: string): string | null {
  const lines = markdown.split("\n");
  const paragraph: string[] = [];

  for (const line of lines) {
    // Skip headings
    if (line.startsWith("#")) break;
    // Skip code blocks
    if (line.startsWith("```")) break;
    // Skip lists
    if (line.startsWith("- ") || line.startsWith("* ")) break;
    if (/^\d+\.\s/.test(line)) break;
    // Skip images
    if (line.startsWith("![")) break;
    // Skip components/HTML
    if (line.startsWith("<")) break;
    // Skip blockquotes
    if (line.startsWith(">")) continue;
    // Skip admonitions
    if (line.startsWith(":::")) continue;

    // Skip empty lines before content
    if (paragraph.length === 0 && line.trim() === "") continue;

    // End of paragraph
    if (line.trim() === "" && paragraph.length > 0) break;

    paragraph.push(line.trim());
  }

  if (paragraph.length === 0) return null;

  let text = paragraph.join(" ");
  // Strip markdown links [text](url) -> text, while preserving any inline code
  // inside the link text.
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Strip bold/italic.
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");

  return text.trim() || null;
}
