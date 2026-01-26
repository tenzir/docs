import type { APIRoute } from "astro";
import { generateSitemap } from "../sitemap-generator";

// Explicitly set this to prerender so it works the same way for sites in `server` mode.
export const prerender = true;

/**
 * Route that generates the llms.txt entry point with hierarchical navigation,
 * descriptions, and headings following the llmstxt.org standard.
 */
export const GET: APIRoute = async (context) => {
  const body = await generateSitemap(context);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
