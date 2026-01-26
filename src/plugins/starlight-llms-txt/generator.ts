import { getCollection } from "astro:content";
import { starlightLlmsTxtContext } from "virtual:starlight-llms-txt/context";
import type { APIContext } from "astro";
import { entryToSimpleMarkdown } from "./entry-to-markdown";
import { isDefaultLocale } from "./utils";

/**
 * Generates a single plaintext Markdown document from the full website content.
 */
export async function generateLlmsTxt(
  context: APIContext,
  {
    description,
    preamble,
  }: {
    /** Description of the document being generated. Prepended to output inside `<SYSTEM>` tags. */
    description: string | undefined;
    /** Optional preamble content to insert after the system description. */
    preamble?: string | undefined;
  },
): Promise<string> {
  const docs = await getCollection(
    "docs",
    (doc) => isDefaultLocale(doc) && !doc.data.draft,
  );
  const { pageSeparator } = starlightLlmsTxtContext;
  const segments: string[] = [];
  for (const doc of docs) {
    const docSegments = [`# ${doc.data.hero?.title || doc.data.title}`];
    const docDescription = doc.data.hero?.tagline || doc.data.description;
    if (docDescription) docSegments.push(`> ${docDescription}`);
    docSegments.push(await entryToSimpleMarkdown(doc, context));
    segments.push(docSegments.join("\n\n"));
  }
  if (description) {
    segments.unshift(`<SYSTEM>${description}</SYSTEM>`);
  }
  if (preamble) {
    // Insert preamble after description (at index 1) or at the start.
    const insertIndex = description ? 1 : 0;
    segments.splice(insertIndex, 0, preamble);
  }
  return segments.join(pageSeparator);
}
