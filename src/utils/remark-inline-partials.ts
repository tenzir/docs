import type { Content, Root } from "mdast";
import type { MdxjsEsm } from "mdast-util-mdx";
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import type { Plugin } from "unified";
import { Parser } from "acorn";
import jsx from "acorn-jsx";
import { visit } from "unist-util-visit";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { remark } from "remark";
import remarkMdx from "remark-mdx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPartialsDir = resolve(__dirname, "../partials");
const AcornParser = Parser.extend(jsx());

interface InlinePartialsOptions {
  partialsDir?: string;
}

interface InlineResult {
  contentNodes: Content[];
  hoistedImports: MdxjsEsm[];
}

interface CachedPartial {
  mtimeMs: number;
  tree: Root;
}

interface InlineState {
  partialsDir: string;
  cache: Map<string, CachedPartial>;
  report: (message: string) => void;
}

interface ImportInfo {
  name: string;
  source: string;
}

interface PropsMap {
  [key: string]: string;
}

const cloneValue = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export const remarkInlinePartials: Plugin<[InlinePartialsOptions?], Root> =
  function (options = {}) {
    const partialsDir = options.partialsDir
      ? resolve(options.partialsDir)
      : defaultPartialsDir;
    const cache = new Map<string, CachedPartial>();

    return (tree, file) => {
      if (!file.path) return;

      const report = (message: string) => {
        if (file.message) {
          file.message(message);
        } else {
          console.warn(message);
        }
      };

      const state: InlineState = { partialsDir, cache, report };
      const existingImportValues = new Set<string>();
      const existingImportKeys = new Set<string>();

      for (const child of tree.children) {
        if (child.type === "mdxjsEsm" && typeof child.value === "string") {
          existingImportValues.add(child.value);
          for (const entry of extractDefaultImports(child.value)) {
            existingImportKeys.add(`${entry.name}::${entry.source}`);
          }
        }
      }

      const { hoistedImports } = inlineTree(tree, file.path, state, [], false);

      if (hoistedImports.length === 0) return;

      const uniqueImports: MdxjsEsm[] = [];
      for (const node of hoistedImports) {
        const value = node.value;
        if (typeof value !== "string") {
          uniqueImports.push(node);
          continue;
        }

        const entries = extractDefaultImports(value);
        if (entries.length > 0) {
          const hasDuplicate = entries.some((entry) =>
            existingImportKeys.has(`${entry.name}::${entry.source}`),
          );
          if (hasDuplicate) continue;

          for (const entry of entries) {
            existingImportKeys.add(`${entry.name}::${entry.source}`);
          }
        }

        if (existingImportValues.has(value)) continue;
        existingImportValues.add(value);
        uniqueImports.push(node);
      }

      if (uniqueImports.length === 0) return;

      const insertIndex = tree.children.findIndex(
        (child) => child.type !== "mdxjsEsm",
      );
      const targetIndex =
        insertIndex === -1 ? tree.children.length : insertIndex;
      tree.children.splice(targetIndex, 0, ...uniqueImports);
    };
  };

function inlineTree(
  tree: Root,
  filePath: string,
  state: InlineState,
  stack: string[],
  extractImports: boolean,
): InlineResult {
  const importMap = collectPartialImports(tree, filePath, state.partialsDir);
  const hoistedImports: MdxjsEsm[] = [];

  visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement, index, parent) => {
    if (!parent || typeof index !== "number") return;
    if (!node.name) return;

    const partialPath = importMap.get(node.name);
    if (!partialPath) return;

    const propsMap = extractProps(node);
    const result = loadPartial(partialPath, state, stack, propsMap);
    if (!result) return;

    hoistedImports.push(...result.hoistedImports);
    parent.children.splice(index, 1, ...result.contentNodes);

    return index + result.contentNodes.length;
  });

  let contentNodes = tree.children as Content[];

  if (extractImports) {
    const extracted = extractImportNodes(
      contentNodes,
      filePath,
      state.partialsDir,
    );
    contentNodes = extracted.contentNodes;
    hoistedImports.push(...extracted.hoistedImports);
    tree.children = contentNodes as Content[];
  }

  return { contentNodes, hoistedImports };
}

function loadPartial(
  partialPath: string,
  state: InlineState,
  stack: string[],
  propsMap: PropsMap,
): InlineResult | null {
  const resolvedPath = resolve(partialPath);

  if (!isWithinPartials(resolvedPath, state.partialsDir)) {
    return null;
  }

  if (stack.includes(resolvedPath)) {
    state.report(
      `Cyclic partial import detected: ${stack.concat(resolvedPath).join(" -> ")}`,
    );
    return null;
  }

  if (!existsSync(resolvedPath)) {
    state.report(`Partial not found: ${resolvedPath}`);
    return null;
  }

  const stats = statSync(resolvedPath);
  const cached = state.cache.get(resolvedPath);
  let sourceTree: Root;
  if (cached && cached.mtimeMs === stats.mtimeMs) {
    sourceTree = cached.tree;
  } else {
    const content = readFileSync(resolvedPath, "utf-8");
    sourceTree = remark().use(remarkMdx).parse(content) as Root;
    state.cache.set(resolvedPath, { mtimeMs: stats.mtimeMs, tree: sourceTree });
  }

  const tree = cloneValue(sourceTree) as Root;
  applyPropsSubstitutions(tree, propsMap, state.report, resolvedPath);

  stack.push(resolvedPath);
  const result = inlineTree(tree, resolvedPath, state, stack, true);
  stack.pop();

  return {
    contentNodes: result.contentNodes,
    hoistedImports: result.hoistedImports,
  };
}

function collectPartialImports(
  tree: Root,
  filePath: string,
  partialsDir: string,
): Map<string, string> {
  const imports = new Map<string, string>();

  visit(tree, "mdxjsEsm", (node: MdxjsEsm) => {
    const code = typeof node.value === "string" ? node.value : "";
    const entries = extractDefaultImports(code);

    for (const entry of entries) {
      const resolvedPath = resolvePartialPath(
        entry.source,
        filePath,
        partialsDir,
      );
      if (!resolvedPath) continue;
      if (!isWithinPartials(resolvedPath, partialsDir)) continue;
      imports.set(entry.name, resolvedPath);
    }
  });

  return imports;
}

function extractImportNodes(
  nodes: Content[],
  filePath: string,
  partialsDir: string,
): InlineResult {
  const contentNodes: Content[] = [];
  const hoistedImports: MdxjsEsm[] = [];

  for (const node of nodes) {
    if (node.type !== "mdxjsEsm") {
      contentNodes.push(node);
      continue;
    }

    const mdxNode = node as MdxjsEsm;
    const code = typeof mdxNode.value === "string" ? mdxNode.value : "";
    if (!isImportOnly(code)) {
      contentNodes.push(mdxNode);
      continue;
    }

    const disposition = getImportDisposition(code, filePath, partialsDir);
    if (disposition === "keep") {
      contentNodes.push(mdxNode);
      continue;
    }
    if (disposition === "hoist") {
      hoistedImports.push(mdxNode);
    }
  }

  return { contentNodes, hoistedImports };
}

type ImportDisposition = "drop" | "hoist" | "keep";

function getImportDisposition(
  code: string,
  filePath: string,
  partialsDir: string,
): ImportDisposition {
  const sources = extractImportSources(code);
  if (sources.length === 0) return "keep";

  for (const source of sources) {
    const resolvedPath = resolvePartialPath(source, filePath, partialsDir);
    if (!resolvedPath || !isWithinPartials(resolvedPath, partialsDir)) {
      return "hoist";
    }
  }

  return "drop";
}

function extractDefaultImports(code: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const regex = /import\s+([\w$]+)\s+from\s+['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    imports.push({ name: match[1], source: match[2] });
  }

  return imports;
}

function extractImportSources(code: string): string[] {
  const sources: string[] = [];
  const fromRegex = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
  const bareRegex = /import\s+['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null;
  while ((match = fromRegex.exec(code)) !== null) {
    sources.push(match[1]);
  }

  while ((match = bareRegex.exec(code)) !== null) {
    sources.push(match[1]);
  }

  return sources;
}

function isImportOnly(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed.startsWith("import")) return false;

  const stripped = trimmed.replace(/^import[\s\S]*?;?$/gm, "");
  return stripped.trim().length === 0;
}

function resolvePartialPath(
  importPath: string,
  filePath: string,
  partialsDir: string,
): string | null {
  const resolved = resolveImportPath(importPath, filePath, partialsDir);
  if (!resolved) return null;

  if (existsSync(resolved)) return resolved;

  if (!/\.[a-z]+$/i.test(resolved)) {
    const mdxPath = `${resolved}.mdx`;
    if (existsSync(mdxPath)) return mdxPath;

    const mdPath = `${resolved}.md`;
    if (existsSync(mdPath)) return mdPath;
  }

  return resolved;
}

function resolveImportPath(
  importPath: string,
  filePath: string,
  partialsDir: string,
): string | null {
  if (importPath.startsWith("@partials/")) {
    return resolve(partialsDir, importPath.slice("@partials/".length));
  }

  if (importPath.startsWith(".")) {
    return resolve(dirname(filePath), importPath);
  }

  return null;
}

function isWithinPartials(filePath: string, partialsDir: string): boolean {
  const relativePath = relative(partialsDir, filePath);
  return !relativePath.startsWith("..") && !isAbsolute(relativePath);
}

function extractProps(node: MdxJsxFlowElement | MdxJsxTextElement): PropsMap {
  const props: PropsMap = {};
  if (!node.attributes) return props;

  for (const attribute of node.attributes) {
    if (attribute.type !== "mdxJsxAttribute") continue;
    const attr = attribute as MdxJsxAttribute;
    if (!attr.name) continue;

    if (attr.value == null) {
      props[attr.name] = "true";
      continue;
    }

    if (typeof attr.value === "string") {
      props[attr.name] = JSON.stringify(attr.value);
      continue;
    }

    const expr = attr.value as MdxJsxAttributeValueExpression;
    if (typeof expr.value === "string") {
      props[attr.name] = expr.value;
    }
  }

  return props;
}

function applyPropsSubstitutions(
  tree: Root,
  propsMap: PropsMap,
  report: (message: string) => void,
  partialPath: string,
): void {
  const keys = Object.keys(propsMap);
  if (keys.length === 0) return;

  const missingProps = new Set<string>();
  const replaceProps = (value: string): { value: string; updated: boolean } => {
    let updated = false;
    const nextValue = value.replace(
      /\bprops\.([A-Za-z0-9_]+)\b/g,
      (match, propName) => {
        const replacement = propsMap[propName];
        if (replacement == null) {
          if (!missingProps.has(propName)) {
            missingProps.add(propName);
            report(`Missing prop "${propName}" for partial ${partialPath}.`);
          }
          return match;
        }
        updated = true;
        return replacement;
      },
    );
    return { value: nextValue, updated };
  };

  visit(tree, (node, index, parent) => {
    if (
      node.type === "mdxTextExpression" ||
      node.type === "mdxFlowExpression"
    ) {
      const exprNode = node as { value?: string };
      if (typeof exprNode.value === "string") {
        const result = replaceProps(exprNode.value);
        if (result.updated) {
          const estree = parseEstree(result.value, report, partialPath);
          if (estree) {
            if (node.type === "mdxTextExpression") {
              const staticText = extractStaticText(estree);
              if (
                staticText != null &&
                parent &&
                typeof index === "number" &&
                "children" in parent &&
                Array.isArray(parent.children)
              ) {
                const replacement: Content = {
                  type: "text",
                  value: staticText,
                };
                const position = (node as { position?: Content["position"] })
                  .position;
                if (position) replacement.position = position;
                parent.children[index] = replacement;
                return index;
              }
            }

            exprNode.value = result.value;
            setEstree(exprNode, estree);
          }
        }
      }
      return;
    }

    if (node.type === "mdxjsEsm") {
      const esmNode = node as MdxjsEsm;
      if (typeof esmNode.value === "string") {
        const result = replaceProps(esmNode.value);
        if (result.updated) {
          const estree = parseEstree(result.value, report, partialPath);
          if (estree) {
            esmNode.value = result.value;
            setEstree(esmNode, estree);
          }
        }
      }
      return;
    }

    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      const jsxNode = node as MdxJsxFlowElement | MdxJsxTextElement;
      if (!jsxNode.attributes) return;
      for (const attribute of jsxNode.attributes) {
        if (attribute.type !== "mdxJsxAttribute") continue;
        const attr = attribute as MdxJsxAttribute;
        if (
          attr.value &&
          typeof attr.value !== "string" &&
          attr.value.type === "mdxJsxAttributeValueExpression"
        ) {
          const result = replaceProps(attr.value.value);
          if (result.updated) {
            const estree = parseEstree(result.value, report, partialPath);
            if (estree) {
              attr.value.value = result.value;
              setEstree(attr.value, estree);
            }
          }
        }
      }
    }
  });
}

function parseEstree(
  value: string,
  report: (message: string) => void,
  partialPath: string,
): unknown | null {
  try {
    return AcornParser.parse(value, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
  } catch (error) {
    report(
      `Failed to parse expression in ${partialPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

function extractStaticText(estree: unknown): string | null {
  if (!estree || typeof estree !== "object") return null;
  const program = estree as { type?: string; body?: unknown[] };
  if (program.type !== "Program" || !Array.isArray(program.body)) return null;
  if (program.body.length !== 1) return null;

  const statement = program.body[0] as { type?: string; expression?: unknown };
  if (statement.type !== "ExpressionStatement") return null;

  const expression = statement.expression as {
    type?: string;
    value?: unknown;
    quasis?: Array<{ value?: { cooked?: string; raw?: string } }>;
    expressions?: unknown[];
  };

  if (expression?.type === "Literal" && typeof expression.value === "string") {
    return expression.value;
  }

  if (
    expression?.type === "TemplateLiteral" &&
    Array.isArray(expression.expressions) &&
    expression.expressions.length === 0 &&
    Array.isArray(expression.quasis) &&
    expression.quasis.length === 1
  ) {
    const cooked = expression.quasis[0]?.value?.cooked;
    if (typeof cooked === "string") return cooked;
    const raw = expression.quasis[0]?.value?.raw;
    if (typeof raw === "string") return raw;
  }

  return null;
}

function setEstree(
  node: { data?: { [key: string]: unknown } },
  estree: unknown,
): void {
  node.data = node.data ?? {};
  node.data.estree = estree;
}
