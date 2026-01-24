import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { starlightLlmsTxtContext } from "virtual:starlight-llms-txt/context";
import type {
  APIRoute,
  GetStaticPaths,
  InferGetStaticParamsType,
  InferGetStaticPropsType,
} from "astro";
import micromatch from "micromatch";
import { entryToSimpleMarkdown } from "../entry-to-markdown";
import { isDefaultLocale } from "../utils";

export const getStaticPaths = (async () => {
  const { perPageMarkdown } = starlightLlmsTxtContext;

  // Only generate paths if the feature is enabled
  if (!perPageMarkdown.enabled) {
    return [];
  }

  // Get all documentation pages (filtered by locale and excluding drafts and excluded pages)
  const pages = await getCollection(
    "docs",
    (doc) =>
      isDefaultLocale(doc) &&
      !doc.data.draft &&
      !micromatch.isMatch(doc.id, perPageMarkdown.excludePages),
  );

  // Generate paths based on the file pattern
  const paths = pages.flatMap((doc) => {
    const slug = doc.id;

    // Handle different URL patterns
    if (perPageMarkdown.extensionStrategy === "replace") {
      // Simple .md replacement pattern
      return [
        {
          params: { slug },
          props: { doc },
        },
      ];
    } else {
      // 'append' pattern - add .html.md
      if (slug === "index") {
        return [
          {
            params: { slug: "index.html" },
            props: { doc },
          },
        ];
      } else {
        return [
          {
            params: { slug: `${slug}.html` },
            props: { doc },
          },
        ];
      }
    }
  });

  return paths;
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
type Params = InferGetStaticParamsType<typeof getStaticPaths>;

/**
 * Generates Markdown content for a single documentation page.
 */
async function generatePageMarkdown(
  doc: CollectionEntry<"docs">,
  context: Parameters<typeof entryToSimpleMarkdown>[1],
): Promise<string> {
  const segments: string[] = [];

  // Add the page title
  segments.push(`# ${doc.data.hero?.title || doc.data.title}`);

  // Add the description if available
  const description = doc.data.hero?.tagline || doc.data.description;
  if (description) {
    segments.push(`> ${description}`);
  }

  // Convert the content to Markdown
  const markdown = await entryToSimpleMarkdown(doc, context, false);
  segments.push(markdown);

  return segments.join("\n\n");
}

/**
 * Route that generates individual Markdown files for each documentation page.
 */
export const GET: APIRoute<Props, Params> = async (context) => {
  // Generate the Markdown content using the doc from props
  const content = await generatePageMarkdown(context.props.doc, context);

  // Return the Markdown content with appropriate headers
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
