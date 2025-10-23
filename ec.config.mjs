import { defineEcConfig } from "@astrojs/starlight/expressive-code";
import treeSitterTqlPlugin from "./src/plugins/expressive-code-tree-sitter-tql.js";

export default defineEcConfig({
  themes: ["github-light", "github-dark"],
  plugins: [treeSitterTqlPlugin()],
});
