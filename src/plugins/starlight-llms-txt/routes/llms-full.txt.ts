import { starlightLlmsTxtContext } from "virtual:starlight-llms-txt/context";
import type { APIRoute } from "astro";
import { generateLlmsTxt } from "../generator";
import { getSiteTitle } from "../utils";

// Explicitly set this to prerender so it works the same way for sites in `server` mode.
export const prerender = true;

/**
 * Route that generates a single plaintext Markdown document from the full website content.
 */
export const GET: APIRoute = async (context) => {
  const body = await generateLlmsTxt(context, {
    description: `This is the full developer documentation for ${getSiteTitle()}`,
    preamble: starlightLlmsTxtContext.preambles.full?.content,
  });
  return new Response(body);
};
