import Parser from "tree-sitter";
import TreeSitterTql from "tree-sitter-tql";
import { readFileSync } from "node:fs";
import {
  InlineStyleAnnotation,
  PluginStyleSettings,
  definePlugin,
} from "@expressive-code/core";
import { highlightYamlFrontmatter } from "./yaml-frontmatter.js";

const parser = new Parser();
parser.setLanguage(TreeSitterTql);

const highlightQuery = new Parser.Query(
  TreeSitterTql,
  readFileSync(
    new URL(
      "../../node_modules/tree-sitter-tql/queries/tql/highlights.scm",
      import.meta.url,
    ),
    "utf8",
  ),
);

const tqlStyleSettings = new PluginStyleSettings({
  defaultValues: {
    tql: {
      keyword: ({ theme }) => (theme.type === "dark" ? "#f472b6" : "#b91c1c"),
      boolean: ({ theme }) => (theme.type === "dark" ? "#38bdf8" : "#0284c7"),
      constant: ({ theme }) => (theme.type === "dark" ? "#22c55e" : "#15803d"),
      number: ({ theme }) => (theme.type === "dark" ? "#fbbf24" : "#b45309"),
      string: ({ theme }) => (theme.type === "dark" ? "#34d399" : "#047857"),
      functionCall: ({ theme }) =>
        theme.type === "dark" ? "#c084fc" : "#7c3aed",
      operator: ({ theme }) => (theme.type === "dark" ? "#f97316" : "#c2410c"),
      punctuation: ({ theme }) =>
        theme.type === "dark" ? "#cbd5f5" : "#475569",
      comment: ({ theme }) => (theme.type === "dark" ? "#94a3b8" : "#64748b"),
      variable: ({ theme }) => (theme.type === "dark" ? "#facc15" : "#b45309"),
      attribute: ({ theme }) => (theme.type === "dark" ? "#38bdf8" : "#0369a1"),
      sigil: ({ theme }) => (theme.type === "dark" ? "#fb7185" : "#be123c"),
      literal: ({ theme }) => (theme.type === "dark" ? "#60a5fa" : "#2563eb"),
    },
  },
  cssVarReplacements: [
    ["tql", "tql"],
    ["functionCall", "fn-call"],
  ],
});

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
    global_sigil: "tql.sigil",
    metadata_sigil: "tql.sigil",
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
