import type { APIRoute } from "astro";
import { generateLlmsTxt } from "../generator";
import { getSiteTitle } from "../utils";

// Explicitly set this to prerender so it works the same way for sites in `server` mode.
export const prerender = true;

/**
 * Route that generates an abridged Markdown document with non-essential content removed.
 */
export const GET: APIRoute = async (context) => {
  const body = await generateLlmsTxt(context, {
    minify: true,
    description: `This is the abridged developer documentation for ${getSiteTitle()}`,
  });
  return new Response(body);
};
