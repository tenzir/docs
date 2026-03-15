declare module "virtual:starlight-site-navigation/config" {
  const config: {
    sections: import("./types").ResolvedSiteNavigationSection[];
  };
  export default config;
}
