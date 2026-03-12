import { defineEcConfig } from "@astrojs/starlight/expressive-code";
import treeSitterTqlPlugin from "./src/plugins/expressive-code-tree-sitter-tql.js";

export default defineEcConfig({
  themes: ["github-light", "github-dark"],
  shiki: {
    // Let our custom Tree-sitter plugin own TQL highlighting while Shiki falls
    // back to plain text without warning about an unknown language.
    langAlias: {
      tql: "txt",
    },
  },
  plugins: [treeSitterTqlPlugin()],
});
