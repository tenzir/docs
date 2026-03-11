import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { AstroConfig, AstroIntegrationLogger } from "astro";
import micromatch from "micromatch";
import {
  ensureTrailingSlash,
  pathnameToSlug,
  stripLeadingSlash,
  stripTrailingSlash,
} from "./path";
import type { Link, ValidationData } from "./remark";
import { getValidationData } from "./remark";
import type {
  StarlightLinksValidatorOptions,
  ValidationErrorType,
} from "./types";

interface PageData {
  pathname: string;
}

interface ValidationError {
  link: string;
  type: ValidationErrorType;
}

type ValidationErrors = Map<
  string,
  { errors: ValidationError[]; file: string }
>;

interface ValidationContext {
  astroConfig: AstroConfig;
  customPages: Set<string>;
  errors: ValidationErrors;
  id: string;
  file: string;
  link: Link;
  options: StarlightLinksValidatorOptions;
  outputDir: URL;
  pages: Set<string>;
  validationData: ValidationData;
}

export function validateLinks(
  pages: PageData[],
  customPages: Set<string>,
  outputDir: URL,
  astroConfig: AstroConfig,
  options: StarlightLinksValidatorOptions,
) {
  const validationData = getValidationData();
  const allPages = new Set(
    pages.map((page) =>
      ensureTrailingSlash(
        astroConfig.base === "/"
          ? stripLeadingSlash(page.pathname)
          : `${stripLeadingSlash(astroConfig.base)}/${page.pathname}`,
      ),
    ),
  );

  const errors: ValidationErrors = new Map();

  for (const [id, { links, file }] of validationData) {
    for (const link of links) {
      const context: ValidationContext = {
        astroConfig,
        customPages,
        errors,
        file,
        id,
        link,
        options,
        outputDir,
        pages: allPages,
        validationData,
      };

      if (link.raw.startsWith("#") || link.raw.startsWith("?")) {
        if (options.errorOnInvalidHashes) {
          validateSelfHash(context);
        }
      } else {
        validateLink(context);
      }
    }
  }

  return errors;
}

export function logErrors(
  logger: AstroIntegrationLogger,
  errors: ValidationErrors,
) {
  if (errors.size === 0) {
    logger.info("✓ All internal links are valid.");
    return;
  }

  const errorCount = [...errors.values()].reduce(
    (acc, entry) => acc + entry.errors.length,
    0,
  );

  logger.error(
    `✗ Found ${errorCount} invalid link${errorCount === 1 ? "" : "s"} in ${errors.size} file${errors.size === 1 ? "" : "s"}.`,
  );

  for (const [id, { errors: fileErrors, file }] of errors) {
    logger.info(`▶ ${id} (${file})`);
    for (const validationError of fileErrors) {
      logger.info(`  - ${validationError.link} (${validationError.type})`);
    }
  }
}

function validateLink(context: ValidationContext) {
  const { astroConfig, customPages, errors, id, file, link, options, pages } =
    context;

  if (isExcludedLink(link, options)) {
    return;
  }

  if (link.error) {
    addError(errors, id, file, link, link.error);
    return;
  }

  const linkToValidate = link.transformed ?? link.raw;
  const sanitizedLink = linkToValidate.replace(/^\//, "");
  const segments = sanitizedLink.split("#");

  let path = segments[0] ?? "";
  const hash = segments[1];

  path = stripQueryString(path);

  if (
    path.startsWith(".") ||
    (!linkToValidate.startsWith("/") && !linkToValidate.startsWith("?"))
  ) {
    if (options.errorOnRelativeLinks) {
      addError(errors, id, file, link, "relative-link");
    }
    return;
  }

  if (isValidAsset(path, context)) {
    return;
  }

  const sanitizedPath = ensureTrailingSlash(stripQueryString(path));
  const isValidPage = pages.has(sanitizedPath);
  const fileHeadings = getFileHeadings(sanitizedPath, context.validationData);

  if (!isValidPage || !fileHeadings) {
    addError(
      errors,
      id,
      file,
      link,
      customPages.has(stripTrailingSlash(sanitizedPath))
        ? "invalid-link-to-custom-page"
        : "invalid-link",
    );
    return;
  }

  if (hash && !fileHeadings.includes(hash)) {
    if (options.errorOnInvalidHashes) {
      addError(errors, id, file, link, "invalid-hash");
    }
    return;
  }

  if (path.length > 0) {
    if (astroConfig.trailingSlash === "always" && !path.endsWith("/")) {
      addError(errors, id, file, link, "missing-trailing-slash");
      return;
    }
    if (astroConfig.trailingSlash === "never" && path.endsWith("/")) {
      addError(errors, id, file, link, "forbidden-trailing-slash");
    }
  }
}

function validateSelfHash(context: ValidationContext) {
  const { errors, file, id, link, validationData, options } = context;

  if (isExcludedLink(link, options)) {
    return;
  }

  const hash = link.raw.split("#")[1] ?? link.raw;
  const sanitizedHash = hash.replace(/^#/, "");
  const fileHeadings = validationData.get(id)?.headings;

  if (!fileHeadings) {
    return;
  }

  if (!fileHeadings.includes(sanitizedHash)) {
    addError(errors, id, file, link, "invalid-hash");
  }
}

function getFileHeadings(path: string, validationData: ValidationData) {
  return validationData.get(path === "" ? "/" : path)?.headings;
}

function isValidAsset(path: string, context: ValidationContext) {
  if (context.astroConfig.base !== "/") {
    const base = stripLeadingSlash(context.astroConfig.base);
    if (path.startsWith(base)) {
      path = path.replace(new RegExp(`^${base}/?`), "");
    } else {
      return false;
    }
  }

  try {
    const filePath = fileURLToPath(new URL(path, context.outputDir));
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isExcludedLink(link: Link, options: StarlightLinksValidatorOptions) {
  return (
    options.exclude.length > 0 &&
    micromatch.isMatch(stripQueryString(link.raw), options.exclude)
  );
}

function stripQueryString(path: string) {
  return path.split("?")[0] ?? path;
}

function addError(
  errors: ValidationErrors,
  id: string,
  file: string,
  link: Link,
  type: ValidationErrorType,
) {
  const fileErrors = errors.get(id) ?? { errors: [], file };
  fileErrors.errors.push({ link: link.raw, type });
  errors.set(id, fileErrors);
}

export function customPagesFromAssets(
  assets: Map<string, Set<URL>>,
  routes: Array<{ pattern: string; origin: string }>,
  outDir: URL,
) {
  const customPages = new Set<string>();

  for (const [pattern, urls] of assets) {
    const route = routes.find((candidate) => candidate.pattern === pattern);
    if (!route || route.origin !== "project") {
      continue;
    }

    for (const url of urls) {
      customPages.add(
        pathnameToSlug(url.pathname.replace(outDir.pathname, "")),
      );
    }
  }

  return customPages;
}
