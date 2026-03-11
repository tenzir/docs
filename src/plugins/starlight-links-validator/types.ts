import type { AstroConfig } from "astro";

export interface StarlightLinksValidatorOptions {
  components: Array<[string, string]>;
  errorOnRelativeLinks: boolean;
  errorOnInvalidHashes: boolean;
  errorOnLocalLinks: boolean;
  sameSitePolicy: "error" | "ignore" | "validate";
  exclude: string[];
}

export interface StarlightLinksValidatorRemarkConfig {
  base: string;
  options: StarlightLinksValidatorOptions;
  site: AstroConfig["site"];
  srcDir: URL;
}

export type ValidationErrorType =
  | "invalid-hash"
  | "invalid-link"
  | "invalid-link-to-custom-page"
  | "local-link"
  | "relative-link"
  | "same-site"
  | "missing-trailing-slash"
  | "forbidden-trailing-slash";
