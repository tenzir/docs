import { type CollectionEntry, render } from "astro:content";
import mdxServer from "@astrojs/mdx/server.js";
import type { APIContext } from "astro";
import { experimental_AstroContainer } from "astro/container";
import { matches, select, selectAll } from "hast-util-select";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { remove } from "unist-util-remove";

const astroContainer = await experimental_AstroContainer.create({
  renderers: [{ name: "astro:jsx", ssr: mdxServer }],
});

const htmlToMarkdownPipeline = unified()
  .use(rehypeParse, { fragment: true })
  .use(function improveExpressiveCodeHandling() {
    return (tree) => {
      const ecInstances = selectAll(
        ".expressive-code",
        tree as Parameters<typeof selectAll>[1],
      );
      for (const instance of ecInstances) {
        // Remove the "Terminal Window" label from Expressive Code terminal frames.
        const figcaption = select("figcaption", instance);
        if (figcaption) {
          const terminalWindowTextIndex = figcaption.children.findIndex(
            (child) => matches("span.sr-only", child),
          );
          if (terminalWindowTextIndex > -1) {
            figcaption.children.splice(terminalWindowTextIndex, 1);
          }
        }
        const pre = select("pre", instance);
        const code = select("code", instance);
        // Use Expressive Code's `data-language=*` attribute to set a `language-*` class name.
        // This is what `hast-util-to-mdast` checks for code language metadata.
        if (pre?.properties.dataLanguage && code) {
          if (!Array.isArray(code.properties.className))
            code.properties.className = [];

          const diffLines =
            pre.properties.dataLanguage === "diff"
              ? []
              : code.children.filter((child) =>
                  matches("div.ec-line.ins, div.ec-line.del", child),
                );
          if (diffLines.length === 0) {
            code.properties.className.push(
              `language-${pre.properties.dataLanguage}`,
            );
          } else {
            code.properties.className.push("language-diff");
            for (const line of diffLines) {
              if (line.type !== "element") continue;
              const classes = line.properties?.className;
              if (typeof classes !== "string" && !Array.isArray(classes))
                continue;
              const marker = classes.includes("ins") ? "+" : "-";
              const span = select("span:not(.indent)", line);
              const firstChild = span?.children[0];
              if (firstChild?.type === "text") {
                firstChild.value = `${marker}${firstChild.value}`;
              }
            }
          }
        }
      }
    };
  })
  .use(function improveTabsHandling() {
    return (tree) => {
      const tabInstances = selectAll(
        "starlight-tabs",
        tree as Parameters<typeof selectAll>[1],
      );
      for (const instance of tabInstances) {
        const tabs = selectAll('[role="tab"]', instance);
        const panels = selectAll('[role="tabpanel"]', instance);
        // Convert parent `<starlight-tabs>` element to empty unordered list.
        instance.tagName = "ul";
        instance.properties = {};
        instance.children = [];
        // Iterate over tabs and panels to build a list with tab label as initial list text.
        for (let i = 0; i < Math.min(tabs.length, panels.length); i++) {
          const tab = tabs[i];
          const panel = panels[i];
          if (!tab || !panel) continue;
          // Filter out extra whitespace and icons from tab contents.
          const tabLabel = tab.children
            .filter((child) => child.type === "text" && child.value.trim())
            .map((child) => child.type === "text" && child.value.trim())
            .join("");
          // Add list entry for this tab and panel.
          instance.children.push({
            type: "element",
            tagName: "li",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "p",
                children: [{ type: "text", value: tabLabel }],
                properties: {},
              },
              panel,
            ],
          });
        }
      }
    };
  })
  .use(function improveFileTreeHandling() {
    return (tree) => {
      const trees = selectAll(
        "starlight-file-tree",
        tree as Parameters<typeof selectAll>[1],
      );
      for (const fileTree of trees) {
        // Remove "Directory" screen reader labels from <FileTree> entries.
        remove(fileTree, (_node) => {
          const node = _node as Parameters<typeof matches>[1];
          return matches(".sr-only", node);
        });
      }
    };
  })
  .use(function removeHeadingAnchorLinks() {
    return (tree) => {
      // Remove Starlight's heading anchor links (e.g. "Section titled …").
      // These are sibling <a> elements next to headings inside .sl-heading-wrapper divs.
      remove(tree, (_node) => {
        const node = _node as Parameters<typeof matches>[1];
        return matches("a.sl-anchor-link", node);
      });
    };
  })
  .use(function addMarkdownExtensionToInternalLinks() {
    // Extensions that should not get .md appended
    const skipExtensions =
      /\.(md|txt|xml|json|yaml|yml|html|png|jpg|jpeg|gif|svg|pdf|zip|tar|gz)$/i;
    return (tree) => {
      const links = selectAll("a", tree as Parameters<typeof selectAll>[1]);
      for (const link of links) {
        const href = link.properties?.href;
        if (typeof href !== "string") continue;
        // Only transform internal links (starting with /)
        if (!href.startsWith("/")) continue;
        // Skip if already has a known extension
        const pathPart = href.split("#")[0].split("?")[0];
        if (skipExtensions.test(pathPart)) continue;
        // Skip anchor-only links
        if (href.startsWith("/#")) continue;
        // Add .md extension (preserve hash and query if present)
        const hashIndex = href.indexOf("#");
        const queryIndex = href.indexOf("?");
        const suffixIndex =
          hashIndex > -1 && queryIndex > -1
            ? Math.min(hashIndex, queryIndex)
            : hashIndex > -1
              ? hashIndex
              : queryIndex > -1
                ? queryIndex
                : href.length;
        const path = href.slice(0, suffixIndex);
        const suffix = href.slice(suffixIndex);
        // Remove trailing slash before adding .md
        const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;
        link.properties.href = `${cleanPath}.md${suffix}`;
      }
    };
  })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, {
    emphasis: "*",
    strong: "*",
  });

/** Render a content collection entry to HTML and back to Markdown to support rendering and simplifying MDX components */
export async function entryToSimpleMarkdown(
  entry: CollectionEntry<"docs">,
  context: APIContext,
) {
  const { Content } = await render(entry);
  const html = await astroContainer.renderToString(Content, context);
  const file = await htmlToMarkdownPipeline.process(html);
  return String(file).trim();
}
