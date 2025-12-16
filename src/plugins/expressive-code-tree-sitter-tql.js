import Parser from "tree-sitter";
import TreeSitterTql from "tree-sitter-tql";
import { readFileSync } from "node:fs";
import {
  InlineStyleAnnotation,
  PluginStyleSettings,
  definePlugin,
} from "@expressive-code/core";
import { highlightYamlFrontmatter } from "./yaml-frontmatter.js";

// This plugin only wires Tree-sitter capture names to Expressive Code style keys.
// We deliberately avoid defining colors here; the active Expressive Code theme
// remains in full control via its TextMate scopes. If the grammar emits different
// captures (for example, a sigil versus the variable name), the theme decides
// whether they share a color.

const parser = new Parser();
parser.setLanguage(TreeSitterTql);

let highlightQuery;
try {
  highlightQuery = new Parser.Query(
    TreeSitterTql,
    readFileSync(
      new URL(
        "../../node_modules/tree-sitter-tql/queries/tql/highlights.scm",
        import.meta.url,
      ),
      "utf8",
    ),
  );
} catch (error) {
  throw new Error(
    `Failed to load TQL highlights query. Ensure tree-sitter-tql is installed ` +
      `and rebuilt (run: pnpm install). Original error: ${error.message}`,
  );
}

const TQL_TOKEN_SCOPES = {
  keyword: ["keyword"],
  boolean: ["constant.language.boolean", "constant.language"],
  constant: ["constant", "support.constant"],
  number: ["constant.numeric", "number"],
  string: ["string"],
  functionCall: ["entity.name.function", "support.function"],
  operator: ["keyword.operator"],
  punctuation: ["punctuation"],
  comment: ["comment"],
  variable: ["variable", "variable.other"],
  attribute: ["entity.other.attribute-name", "support.type.property-name"],
  literal: ["constant.language", "constant.other"],
};

const tqlStyleSettings = new PluginStyleSettings({
  defaultValues: {
    tql: Object.fromEntries(
      Object.entries(TQL_TOKEN_SCOPES).map(([token, scopes]) => [
        token,
        ({ theme }) =>
          resolveThemeTokenColor({ theme, scopes }) ??
          theme.colors?.["editor.foreground"] ??
          theme.fg ??
          "currentColor",
      ]),
    ),
  },
  cssVarReplacements: [
    ["tql", "tql"],
    ["functionCall", "fn-call"],
  ],
});

function resolveThemeTokenColor({ theme, scopes }) {
  if (theme?.settings) {
    let bestMatchScore = -1;
    let bestColor;
    for (const setting of theme.settings) {
      const scopeValuesRaw = Array.isArray(setting.scope)
        ? setting.scope
        : setting.scope
          ? [setting.scope]
          : [];
      if (!scopeValuesRaw.length) {
        continue;
      }
      const scopeValues = scopeValuesRaw.flatMap((value) =>
        value.split(/\s+/).filter(Boolean),
      );
      let highestScopeScore = -1;
      for (const scopeValue of scopeValues) {
        for (const target of scopes) {
          const score = scopeMatchScore(scopeValue, target);
          if (score > highestScopeScore) {
            highestScopeScore = score;
          }
          if (highestScopeScore === 3) {
            break;
          }
        }
        if (highestScopeScore === 3) {
          break;
        }
      }
      if (
        highestScopeScore > bestMatchScore &&
        typeof setting.settings?.foreground === "string"
      ) {
        bestMatchScore = highestScopeScore;
        bestColor = setting.settings.foreground;
        if (bestMatchScore === 3) {
          break;
        }
      }
    }
    if (bestColor) {
      return bestColor;
    }
  }
  return theme?.fg;
}

function scopeMatchScore(scopeValue, target) {
  if (!scopeValue || !target) {
    return -1;
  }
  if (scopeValue === target) {
    return 3;
  }
  if (scopeValue.startsWith(`${target}.`)) {
    return 2;
  }
  if (target.startsWith(`${scopeValue}.`)) {
    return 1;
  }
  if (scopeValue.includes(target) || target.includes(scopeValue)) {
    return 0;
  }
  return -1;
}

const captureToSetting = new Map(
  Object.entries({
    keyword: "tql.keyword",
    "function.call": "tql.functionCall",
    "function.method": "tql.functionCall",
    operator: "tql.operator",
    "punctuation.bracket": "tql.punctuation",
    "punctuation.delimiter": "tql.punctuation",
    boolean: "tql.boolean",
    number: "tql.number",
    string: "tql.string",
    format_expr: "tql.string",
    comment: "tql.comment",
    "constant.builtin": "tql.constant",
    constant: "tql.constant",
    "variable.builtin": "tql.variable",
    dollar_var: "tql.variable",
    // Map sigils to the same style as variables so $foo appears as a unified
    // token rather than having distinct colors for the sigil and the name.
    global_sigil: "tql.variable",
    metadata_sigil: "tql.variable",
    meta_selector: "tql.attribute",
    attribute: "tql.attribute",
    ip: "tql.literal",
    subnet: "tql.literal",
    time: "tql.literal",
    duration: "tql.literal",
    frontmatter_open: "tql.comment",
    frontmatter_close: "tql.comment",
  }),
);

const TREE_SITTER_FLAG = Symbol("tree-sitter-tql");
const EXTRA_COMMENT_NODE_TYPES = ["frontmatter_body", "frontmatter_line"];

const plugin = definePlugin({
  name: "Tree-sitter TQL",
  styleSettings: tqlStyleSettings,
  hooks: {
    preprocessLanguage: ({ codeBlock }) => {
      if (codeBlock.language.toLowerCase() !== "tql") {
        return;
      }
      codeBlock.props[TREE_SITTER_FLAG] = true;
      codeBlock.language = "plaintext";
    },
    performSyntaxAnalysis: ({ codeBlock, styleVariants }) => {
      if (!codeBlock.props[TREE_SITTER_FLAG]) {
        return;
      }

      const code = codeBlock.code;
      const codeLines = codeBlock.getLines();
      const addAnnotation = (
        row,
        columnStart,
        columnEnd,
        settingKey,
        label,
      ) => {
        if (columnEnd <= columnStart) {
          return;
        }
        const line = codeLines[row];
        if (!line) {
          return;
        }
        for (
          let variantIndex = 0;
          variantIndex < styleVariants.length;
          variantIndex += 1
        ) {
          const styleVariant = styleVariants[variantIndex];
          const color = styleVariant.resolvedStyleSettings.get(settingKey);
          if (!color) {
            continue;
          }
          line.addAnnotation(
            new InlineStyleAnnotation({
              name: `${label}-${row}-${columnStart}-${columnEnd}-${variantIndex}`,
              renderPhase: "earliest",
              styleVariantIndex: variantIndex,
              color,
              inlineRange: {
                columnStart,
                columnEnd,
              },
            }),
          );
        }
      };
      if (!codeLines.length) {
        return;
      }

      const tree = parser.parse(codeBlock.code);
      const captures = highlightQuery.captures(tree.rootNode);
      for (const type of EXTRA_COMMENT_NODE_TYPES) {
        collectNodesOfType(tree.rootNode, type).forEach((node) => {
          captures.push({ name: "comment", node });
        });
      }

      for (const { name, node } of captures) {
        const settingKey = captureToSetting.get(name);
        if (!settingKey) {
          continue;
        }
        const { startPosition, endPosition } = node;
        for (let row = startPosition.row; row <= endPosition.row; row += 1) {
          const columnStart =
            row === startPosition.row ? startPosition.column : 0;
          const columnEnd =
            row === endPosition.row
              ? endPosition.column
              : (codeLines[row]?.text.length ?? columnStart);
          addAnnotation(row, columnStart, columnEnd, settingKey, `tql:${name}`);
        }
      }

      const frontmatterBodies = collectNodesOfType(
        tree.rootNode,
        "frontmatter_body",
      );
      for (const bodyNode of frontmatterBodies) {
        highlightYamlFrontmatter(bodyNode, {
          code,
          addAnnotation,
          baseRow: bodyNode.startPosition.row,
          baseColumn: bodyNode.startPosition.column,
        });
      }
    },
    postprocessRenderedBlock: ({ codeBlock, renderData }) => {
      if (!codeBlock.props[TREE_SITTER_FLAG]) {
        return;
      }
      const ensureLanguageProp = (node) => {
        if (node?.type !== "element") {
          return;
        }
        if (node.tagName === "pre" || node.tagName === "code") {
          node.properties = node.properties ?? {};
          delete node.properties["data-language"];
          delete node.properties.dataLanguage;
          node.properties["data-language"] = "tql";
        }
        if (Array.isArray(node.children)) {
          node.children.forEach(ensureLanguageProp);
        }
      };
      ensureLanguageProp(renderData.blockAst);
    },
  },
});

export default function treeSitterTqlPlugin() {
  return plugin;
}

function collectNodesOfType(root, type) {
  const result = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    if (current.type === type) {
      result.push(current);
    }
    if (current.children?.length) {
      for (const child of current.children) {
        stack.push(child);
      }
    }
  }
  return result;
}
