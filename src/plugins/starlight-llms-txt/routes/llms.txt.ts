import { starlightLlmsTxtContext } from "virtual:starlight-llms-txt/context";
import type { APIRoute } from "astro";
import { ensureTrailingSlash, getSiteTitle } from "../utils";

// Explicitly set this to prerender so it works the same way for sites in `server` mode.
export const prerender = true;

/**
 * Route that generates an introductory summary of this site for LLMs.
 */
export const GET: APIRoute = async (context) => {
  const title = getSiteTitle();
  const description = starlightLlmsTxtContext.description
    ? `> ${starlightLlmsTxtContext.description}`
    : "";
  const site = new URL(
    ensureTrailingSlash(starlightLlmsTxtContext.base),
    context.site,
  );
  const llmsFullLink = new URL("./llms-full.txt", site);
  const llmsSmallLink = new URL("./llms-small.txt", site);

  const segments = [`# ${title}`];
  if (description) segments.push(description);

  // Further documentation links.
  segments.push("## Documentation Sets");
  segments.push(
    [
      `- [Abridged documentation](${llmsSmallLink}): a compact version of the documentation for ${getSiteTitle()}, with non-essential content removed`,
      `- [Complete documentation](${llmsFullLink}): the full documentation for ${getSiteTitle()}`,
      ...starlightLlmsTxtContext.customSets.map(
        ({ label, description, slug }) =>
          `- [${label}](${new URL(`./_llms-txt/${slug}.txt`, site)})` +
          (description ? `: ${description}` : ""),
      ),
    ].join("\n"),
  );

  // Additional notes.
  segments.push("## Notes");
  segments.push(`- The complete documentation includes all content from the official documentation
- The content is automatically generated from the same source as the official documentation`);

  return new Response(segments.join("\n\n") + "\n");
};
