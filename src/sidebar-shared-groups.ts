// We need predictable sidebar group references that can be shared between
// astro.config.mjs and sidebar.ts. Since starlight-openapi doesn't export
// getSidebarGroupPlaceholder from its public API, we recreate it here.
//
// This is based on the internal implementation in starlight-openapi/libs/starlight.ts
// but avoids the deep import that isn't available in the package exports.

function getSidebarGroupPlaceholder(label: symbol) {
  return {
    collapsed: false,
    items: [],
    label: label.toString(),
  };
}

export const nodeAPISidebarGroup = getSidebarGroupPlaceholder(
  Symbol("node-api"),
);
export const platformAPISidebarGroup = getSidebarGroupPlaceholder(
  Symbol("platform-api"),
);
