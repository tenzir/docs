import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "acorn";
import jsx from "acorn-jsx";
import type { Content, Root } from "mdast";
import type { MdxjsEsm } from "mdast-util-mdx";
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPartialsDir = resolve(__dirname, "../partials");
const AcornParser = Parser.extend(jsx());

interface InlinePartialsOptions {
  partialsDir?: string;
}

interface InlineResult {
  contentNodes: Content[];
  hoistedImports: MdxjsEsm[];
  consumedPartialImports: Set<string>;
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

interface PartialImportBinding {
  id: string;
  resolvedPath: string;
}

interface ImportDeclarationInfo {
  source: string;
  resolvedPath: string | null;
  isPartial: boolean;
  defaultLocalName: string | null;
  localNames: string[];
  start: number;
  end: number;
  sourceStart: number;
  sourceEnd: number;
}

interface ExistingImports {
  values: Set<string>;
  keys: Set<string>;
}

interface ImportSpecifierLike {
  type?: string;
  local?: {
    name?: string;
  };
}

interface ImportDeclarationLike {
  type?: string;
  source?: {
    value?: unknown;
    start?: number;
    end?: number;
  };
  specifiers?: ImportSpecifierLike[];
  start?: number;
  end?: number;
}

interface ProgramLike {
  type?: string;
  body?: unknown[];
}

interface NodeLike {
  type?: string;
  name?: string;
  computed?: boolean;
  shorthand?: boolean;
  [key: string]: unknown;
}

interface ExpressionStatementLike {
  type?: string;
  expression?: unknown;
}

interface LiteralLike {
  type?: string;
  value?: unknown;
}

interface ConditionalExpressionLike {
  type?: string;
  test?: unknown;
  consequent?: unknown;
  alternate?: unknown;
}

interface JSXFragmentLike {
  type?: string;
  children?: Array<{ type?: string; value?: string; raw?: string }>;
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

export const remarkInlinePartials: Plugin<[InlinePartialsOptions?], Root> = (
  options = {},
) => {
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
      }
    };

    const state: InlineState = { partialsDir, cache, report };
    const { hoistedImports } = inlineTree(tree, file.path, state, [], false);

    if (hoistedImports.length === 0) return;

    const existingImports = collectExistingImports(
      tree.children as Content[],
      file.path,
      state.partialsDir,
      state.report,
    );
    const uniqueImports: MdxjsEsm[] = [];
    for (const node of hoistedImports) {
      const value = node.value;
      if (typeof value !== "string") {
        uniqueImports.push(node);
        continue;
      }

      const importKeys = collectImportKeys(value, file.path, state.partialsDir);
      if (importKeys.some((key) => existingImports.keys.has(key))) continue;
      for (const key of importKeys) {
        existingImports.keys.add(key);
      }

      if (existingImports.values.has(value)) continue;
      existingImports.values.add(value);
      uniqueImports.push(node);
    }

    if (uniqueImports.length === 0) return;

    const insertIndex = tree.children.findIndex(
      (child) => child.type !== "mdxjsEsm",
    );
    const targetIndex = insertIndex === -1 ? tree.children.length : insertIndex;
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
  const importMap = collectPartialImports(
    tree,
    filePath,
    state.partialsDir,
    state.report,
  );
  const hoistedImports: MdxjsEsm[] = [];
  const consumedPartialImports = new Set<string>();

  visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement, index, parent) => {
    if (!parent || typeof index !== "number") return;
    if (!node.name) return;

    const partialImport = importMap.get(node.name);
    if (!partialImport) return;

    const propsMap = extractProps(node);
    const result = loadPartial(
      partialImport.resolvedPath,
      state,
      stack,
      propsMap,
    );
    if (!result) return;

    consumedPartialImports.add(partialImport.id);
    hoistedImports.push(...result.hoistedImports);
    parent.children.splice(index, 1, ...result.contentNodes);

    return index + result.contentNodes.length;
  });

  if (consumedPartialImports.size > 0) {
    pruneConsumedPartialImports(
      tree.children as Content[],
      filePath,
      state.partialsDir,
      consumedPartialImports,
      collectLiveReferences(tree, state.report),
      state.report,
    );
  }

  let contentNodes = tree.children as Content[];

  if (extractImports) {
    const liveReferences = collectLiveReferences(tree, state.report);
    const extracted = extractImportNodes(
      contentNodes,
      filePath,
      state.partialsDir,
      liveReferences,
      state.report,
    );
    contentNodes = extracted.contentNodes;
    hoistedImports.push(...extracted.hoistedImports);
    tree.children = contentNodes as Content[];
  }

  return { contentNodes, hoistedImports, consumedPartialImports };
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
    consumedPartialImports: result.consumedPartialImports,
  };
}

function collectPartialImports(
  tree: Root,
  filePath: string,
  partialsDir: string,
  report: (message: string) => void,
): Map<string, PartialImportBinding> {
  const imports = new Map<string, PartialImportBinding>();

  visit(tree, "mdxjsEsm", (node: MdxjsEsm) => {
    const code = typeof node.value === "string" ? node.value : "";
    const declarations = collectImportDeclarations(
      code,
      filePath,
      partialsDir,
      report,
    );
    if (!declarations) return;

    for (const declaration of declarations) {
      if (
        !declaration.defaultLocalName ||
        !declaration.resolvedPath ||
        !declaration.isPartial
      ) {
        continue;
      }

      imports.set(declaration.defaultLocalName, {
        id: importBindingId(
          declaration.defaultLocalName,
          declaration.resolvedPath,
        ),
        resolvedPath: declaration.resolvedPath,
      });
    }
  });

  return imports;
}

function extractImportNodes(
  nodes: Content[],
  filePath: string,
  partialsDir: string,
  liveReferences: Set<string>,
  report: (message: string) => void,
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
    const declarations = collectImportDeclarations(
      code,
      filePath,
      partialsDir,
      report,
    );
    if (!declarations) {
      contentNodes.push(mdxNode);
      continue;
    }

    const hoistedDeclarations = declarations.filter((declaration) =>
      shouldHoistExtractedImport(declaration, liveReferences),
    );
    if (hoistedDeclarations.length === 0) {
      continue;
    }

    hoistedImports.push(
      cloneImportNodeWithDeclarations(
        mdxNode,
        code,
        hoistedDeclarations,
        partialsDir,
        report,
        filePath,
      ),
    );
  }

  return { contentNodes, hoistedImports, consumedPartialImports: new Set() };
}

function pruneConsumedPartialImports(
  nodes: Content[],
  filePath: string,
  partialsDir: string,
  consumedPartialImports: Set<string>,
  liveReferences: Set<string>,
  report: (message: string) => void,
): void {
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index];
    if (node.type !== "mdxjsEsm") continue;

    const mdxNode = node as MdxjsEsm;
    const code = typeof mdxNode.value === "string" ? mdxNode.value : "";
    const declarations = collectImportDeclarations(
      code,
      filePath,
      partialsDir,
      report,
    );
    if (!declarations) continue;

    const keptDeclarations = declarations.filter((declaration) =>
      shouldKeepImportDeclaration(
        declaration,
        consumedPartialImports,
        liveReferences,
      ),
    );
    if (keptDeclarations.length === declarations.length) continue;

    if (keptDeclarations.length === 0) {
      nodes.splice(index, 1);
      continue;
    }

    const nextCode = renderImportDeclarations(
      code,
      keptDeclarations,
      partialsDir,
    );
    const estree = parseEstree(nextCode, report, filePath);
    if (!estree) continue;

    mdxNode.value = nextCode;
    setEstree(mdxNode, estree);
  }
}

function getExpressionAttributeEstree(
  attribute: MdxJsxExpressionAttribute,
  report: (message: string) => void,
): unknown | null {
  if (attribute.data?.estree) {
    return attribute.data.estree;
  }

  const value = attribute.value.trim();
  if (value.length === 0) return null;

  if (value.startsWith("...")) {
    return parseEstree(`({${value}})`, report, "MDX spread attribute");
  }

  return parseEstree(value, report, "MDX expression attribute");
}

function collectLiveReferences(
  tree: Root,
  report: (message: string) => void,
): Set<string> {
  const references = new Set<string>();

  visit(tree, (node) => {
    if (
      (node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement") &&
      (node as MdxJsxFlowElement | MdxJsxTextElement).name
    ) {
      references.add(
        (node as MdxJsxFlowElement | MdxJsxTextElement).name ?? "",
      );
    }

    if (node.type === "mdxjsEsm") {
      const code = (node as MdxjsEsm).value;
      if (typeof code !== "string") return;

      const estree = parseEstree(code, report, "MDX module");
      if (estree) addEstreeIdentifierReferences(estree, references);
      return;
    }

    if (
      node.type === "mdxTextExpression" ||
      node.type === "mdxFlowExpression"
    ) {
      const value = (node as { value?: string }).value;
      if (typeof value !== "string") return;

      const estree = parseEstree(value, report, "MDX expression");
      if (estree) addEstreeIdentifierReferences(estree, references);
      return;
    }

    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      const jsxNode = node as MdxJsxFlowElement | MdxJsxTextElement;
      for (const attribute of jsxNode.attributes ?? []) {
        if (attribute.type === "mdxJsxExpressionAttribute") {
          const estree = getExpressionAttributeEstree(
            attribute as MdxJsxExpressionAttribute,
            report,
          );
          if (estree) addEstreeIdentifierReferences(estree, references);
          continue;
        }

        if (
          attribute.type !== "mdxJsxAttribute" ||
          typeof attribute.value === "string" ||
          !attribute.value
        ) {
          continue;
        }

        const estree = parseEstree(
          attribute.value.value,
          report,
          "MDX attribute expression",
        );
        if (estree) addEstreeIdentifierReferences(estree, references);
      }
    }
  });

  references.delete("");
  return references;
}

function addEstreeIdentifierReferences(
  estree: unknown,
  references: Set<string>,
): void {
  const stack: Array<{ node: unknown; parent?: NodeLike; key?: string }> = [
    { node: estree },
  ];

  while (stack.length > 0) {
    const currentEntry = stack.pop();
    if (!currentEntry) continue;
    const current = currentEntry.node;
    if (!current || typeof current !== "object") continue;

    const node = current as NodeLike;
    if (node.type === "ImportDeclaration") continue;

    if (
      (node.type === "Identifier" || node.type === "JSXIdentifier") &&
      node.name &&
      isReferenceIdentifier(node, currentEntry.parent, currentEntry.key)
    ) {
      references.add(node.name);
    }

    for (const [key, value] of Object.entries(node)) {
      if (
        key === "loc" ||
        key === "range" ||
        key === "start" ||
        key === "end" ||
        key === "position"
      ) {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          stack.push({ node: item, parent: node, key });
        }
      } else if (value && typeof value === "object") {
        stack.push({ node: value, parent: node, key });
      }
    }
  }
}

function isReferenceIdentifier(
  node: NodeLike,
  parent: NodeLike | undefined,
  key: string | undefined,
): boolean {
  if (!parent) return true;
  if (key === "id" && isBindingParent(parent)) return false;
  if (key === "params") return false;
  if (key === "local" && parent.type?.startsWith("Import")) return false;
  if (key === "label") return false;
  if (key === "property" && parent.type === "MemberExpression") {
    return parent.computed === true;
  }
  if (key === "key" && parent.computed !== true) {
    return parent.shorthand === true && node.type === "Identifier";
  }
  return true;
}

function isBindingParent(parent: NodeLike): boolean {
  return (
    parent.type === "VariableDeclarator" ||
    parent.type === "FunctionDeclaration" ||
    parent.type === "FunctionExpression" ||
    parent.type === "ClassDeclaration" ||
    parent.type === "ClassExpression"
  );
}

function shouldKeepImportDeclaration(
  declaration: ImportDeclarationInfo,
  consumedPartialImports: Set<string>,
  liveReferences: Set<string>,
): boolean {
  if (
    !declaration.isPartial ||
    !declaration.defaultLocalName ||
    !declaration.resolvedPath
  ) {
    return true;
  }

  if (declaration.localNames.length > 1) return true;

  const id = importBindingId(
    declaration.defaultLocalName,
    declaration.resolvedPath,
  );
  if (!consumedPartialImports.has(id)) return true;
  return liveReferences.has(declaration.defaultLocalName);
}

function shouldHoistExtractedImport(
  declaration: ImportDeclarationInfo,
  liveReferences: Set<string>,
): boolean {
  if (!declaration.isPartial) return true;
  return declaration.localNames.some((name) => liveReferences.has(name));
}

function collectExistingImports(
  nodes: Content[],
  filePath: string,
  partialsDir: string,
  report: (message: string) => void,
): ExistingImports {
  const values = new Set<string>();
  const keys = new Set<string>();

  for (const node of nodes) {
    if (node.type !== "mdxjsEsm") continue;
    const value = (node as MdxjsEsm).value;
    if (typeof value !== "string") continue;

    values.add(value);
    for (const key of collectImportKeys(value, filePath, partialsDir, report)) {
      keys.add(key);
    }
  }

  return { values, keys };
}

function collectImportKeys(
  code: string,
  filePath: string,
  partialsDir: string,
  report?: (message: string) => void,
): string[] {
  const declarations = collectImportDeclarations(
    code,
    filePath,
    partialsDir,
    report,
  );
  if (!declarations) return [];

  return declarations.flatMap((declaration) => {
    const importTarget = declaration.resolvedPath ?? declaration.source;
    if (declaration.localNames.length === 0) {
      return [`bare::${importTarget}`];
    }
    return declaration.localNames.map(
      (localName) => `${localName}::${importTarget}`,
    );
  });
}

function collectImportDeclarations(
  code: string,
  filePath: string,
  partialsDir: string,
  report?: (message: string) => void,
): ImportDeclarationInfo[] | null {
  if (!code.trim().startsWith("import")) return null;

  const estree = report
    ? parseEstree(code, report, filePath)
    : parseEstreeQuietly(code);
  if (!estree || typeof estree !== "object") return null;

  const program = estree as ProgramLike;
  if (program.type !== "Program" || !Array.isArray(program.body)) return null;
  if (program.body.length === 0) return null;
  if (
    program.body.some(
      (statement) =>
        !statement ||
        typeof statement !== "object" ||
        (statement as ImportDeclarationLike).type !== "ImportDeclaration",
    )
  ) {
    return null;
  }

  const declarations: ImportDeclarationInfo[] = [];
  for (const statement of program.body) {
    const declaration = createImportDeclarationInfo(
      statement as ImportDeclarationLike,
      filePath,
      partialsDir,
    );
    if (!declaration) return null;
    declarations.push(declaration);
  }

  return declarations;
}

function createImportDeclarationInfo(
  declaration: ImportDeclarationLike,
  filePath: string,
  partialsDir: string,
): ImportDeclarationInfo | null {
  const source =
    typeof declaration.source?.value === "string"
      ? declaration.source.value
      : null;
  if (
    !source ||
    typeof declaration.start !== "number" ||
    typeof declaration.end !== "number" ||
    typeof declaration.source.start !== "number" ||
    typeof declaration.source.end !== "number"
  ) {
    return null;
  }

  const localNames: string[] = [];
  let defaultLocalName: string | null = null;
  for (const specifier of declaration.specifiers ?? []) {
    const localName = specifier.local?.name;
    if (!localName) continue;
    localNames.push(localName);
    if (specifier.type === "ImportDefaultSpecifier") {
      defaultLocalName = localName;
    }
  }

  const resolvedPath = resolvePartialPath(source, filePath, partialsDir);
  const isPartial = Boolean(
    resolvedPath && isWithinPartials(resolvedPath, partialsDir),
  );

  return {
    source,
    resolvedPath,
    isPartial,
    defaultLocalName,
    localNames,
    start: declaration.start,
    end: declaration.end,
    sourceStart: declaration.source.start,
    sourceEnd: declaration.source.end,
  };
}

function cloneImportNodeWithDeclarations(
  node: MdxjsEsm,
  code: string,
  declarations: ImportDeclarationInfo[],
  partialsDir: string,
  report: (message: string) => void,
  filePath: string,
): MdxjsEsm {
  const clone = cloneValue(node) as MdxjsEsm;
  const nextCode = renderImportDeclarations(code, declarations, partialsDir);
  clone.value = nextCode;

  const estree = parseEstree(nextCode, report, filePath);
  if (estree) setEstree(clone, estree);

  return clone;
}

function renderImportDeclarations(
  code: string,
  declarations: ImportDeclarationInfo[],
  partialsDir: string,
): string {
  return declarations
    .map((declaration) => {
      const rawDeclaration = code.slice(declaration.start, declaration.end);
      const hoistedSource = getHoistedImportSource(declaration, partialsDir);
      if (!hoistedSource || hoistedSource === declaration.source) {
        return rawDeclaration;
      }

      const sourceStart = declaration.sourceStart - declaration.start;
      const sourceEnd = declaration.sourceEnd - declaration.start;
      return [
        rawDeclaration.slice(0, sourceStart),
        JSON.stringify(hoistedSource),
        rawDeclaration.slice(sourceEnd),
      ].join("");
    })
    .join("\n");
}

function getHoistedImportSource(
  declaration: ImportDeclarationInfo,
  partialsDir: string,
): string | null {
  if (!declaration.isPartial || !declaration.resolvedPath) return null;
  const relativePath = relative(partialsDir, declaration.resolvedPath).replace(
    /\\/g,
    "/",
  );
  return `@partials/${relativePath}`;
}

function importBindingId(localName: string, resolvedPath: string): string {
  return `${localName}::${resolvedPath}`;
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
            const staticMarkdown = extractStaticMarkdown(estree);
            if (
              staticMarkdown != null &&
              node.type === "mdxFlowExpression" &&
              parent &&
              typeof index === "number" &&
              "children" in parent &&
              Array.isArray(parent.children)
            ) {
              const replacementTree = remark()
                .use(remarkMdx)
                .parse(staticMarkdown) as Root;
              parent.children.splice(
                index,
                1,
                ...(replacementTree.children as Content[]),
              );
              return index + replacementTree.children.length;
            }

            const staticText = extractStaticText(estree);
            if (
              staticText != null &&
              canReplaceExpressionWithText(node, parent) &&
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

function canReplaceExpressionWithText(
  node: { type: string },
  parent: { type?: string } | undefined,
): boolean {
  if (node.type === "mdxTextExpression") return true;
  return (
    parent?.type === "mdxJsxFlowElement" || parent?.type === "mdxJsxTextElement"
  );
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

function parseEstreeQuietly(value: string): unknown | null {
  try {
    return AcornParser.parse(value, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
  } catch {
    return null;
  }
}

function extractStaticMarkdown(estree: unknown): string | null {
  const expression = getSingleExpression(estree);
  const conditional = expression as ConditionalExpressionLike;
  if (conditional?.type !== "ConditionalExpression") return null;

  const test = conditional.test as LiteralLike;
  if (test?.type !== "Literal" || typeof test.value !== "boolean") return null;

  const branch = test.value ? conditional.consequent : conditional.alternate;
  return extractJSXFragmentText(branch);
}

function extractJSXFragmentText(node: unknown): string | null {
  const fragment = node as JSXFragmentLike;
  if (fragment?.type !== "JSXFragment" || !Array.isArray(fragment.children)) {
    return null;
  }

  let text = "";
  for (const child of fragment.children) {
    if (child.type !== "JSXText") return null;
    text += child.value ?? child.raw ?? "";
  }
  return text;
}

function extractStaticText(estree: unknown): string | null {
  const expression = getSingleExpression(estree) as {
    type?: string;
    value?: unknown;
    quasis?: Array<{ value?: { cooked?: string; raw?: string } }>;
    expressions?: unknown[];
  } | null;
  if (!expression) return null;

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

function getSingleExpression(estree: unknown): unknown | null {
  if (!estree || typeof estree !== "object") return null;
  const program = estree as { type?: string; body?: unknown[] };
  if (program.type !== "Program" || !Array.isArray(program.body)) return null;
  if (program.body.length !== 1) return null;

  const statement = program.body[0] as ExpressionStatementLike;
  if (statement.type !== "ExpressionStatement") return null;
  return statement.expression ?? null;
}

function setEstree(
  node: { data?: { [key: string]: unknown } },
  estree: unknown,
): void {
  node.data = node.data ?? {};
  node.data.estree = estree;
}
