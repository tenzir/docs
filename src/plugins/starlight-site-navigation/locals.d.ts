declare namespace App {
  type StarlightLocals = import("@astrojs/starlight").StarlightLocals;

  interface Locals extends StarlightLocals {
    siteNavigation: import("./types").SiteNavigationRouteData;
  }
}
