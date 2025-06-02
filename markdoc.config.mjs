import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";
import starlightMarkdoc from "@astrojs/starlight-markdoc";

export default defineMarkdocConfig({
  extends: [starlightMarkdoc()],
  tags: {
    InteractiveDocsStructure: {
      render: component("./src/components/InteractiveDocsStructure.astro"),
      attributes: {
        imageSrc: { type: String },
        activeSection: { type: String },
      },
    },
  },
});
