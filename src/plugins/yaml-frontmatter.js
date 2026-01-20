/**
 * YAML frontmatter highlighting helpers for TQL.
 *
 * ⚠️ tree-sitter note: we would prefer to rely on `tree-sitter-yaml`, but the
 * published packages no longer ship a Node binding compatible with the
 * `tree-sitter@0.25.x` runtime that Expressive Code already embeds. Only WASM
 * artifacts are available, and rebuilding older versions surfaced `Invalid
 * language object` errors when passed to `parser.setLanguage`. Until a
 * compatible bundle exists (or we ship our own), we fall back to the `yaml`
 * library to recover token ranges and map them to Expressive Code annotations.
 */

import {
  parseDocument as parseYamlDocument,
  isMap as yamlIsMap,
  isScalar as yamlIsScalar,
  isSeq as yamlIsSeq,
} from "yaml";

export function highlightYamlFrontmatter(node, context) {
  const { code, addAnnotation, baseRow, baseColumn } = context;
  const frontmatterText = code.slice(node.startIndex, node.endIndex);
  if (!frontmatterText.trim()) {
    return;
  }

  const doc = parseYamlDocument(frontmatterText, { keepNodeTypes: true });
  const contents = doc.contents;
  if (!contents) {
    return;
  }

  const lineOffsets = computeLineOffsets(frontmatterText);

  const annotateByOffsets = (start, end, styleKey, label) => {
    if (end <= start) {
      return;
    }
    let adjustedStart = Math.max(0, start);
    let adjustedEnd = Math.min(frontmatterText.length, end);

    while (
      adjustedEnd > adjustedStart &&
      frontmatterText.charCodeAt(adjustedEnd - 1) === 10
    ) {
      adjustedEnd -= 1;
    }
    if (adjustedEnd <= adjustedStart) {
      return;
    }

    while (adjustedStart < adjustedEnd) {
      const { line } = offsetToLinePos(lineOffsets, adjustedStart);
      const lineStartOffset = lineOffsets[line];
      const lineEndOffset = lineOffsets[line + 1] ?? frontmatterText.length;
      const segmentEnd = Math.min(adjustedEnd, lineEndOffset);

      const absoluteLine = baseRow + line;
      const columnBase = line === 0 ? baseColumn : 0;
      const columnStart = columnBase + (adjustedStart - lineStartOffset);
      const columnEnd = columnBase + (segmentEnd - lineStartOffset);

      addAnnotation(absoluteLine, columnStart, columnEnd, styleKey, label);
      adjustedStart = segmentEnd;
    }
  };

  const peelScalar = (scalar) => {
    if (!scalar?.range) {
      return;
    }
    annotateByOffsets(
      scalar.range[0],
      scalar.range[1],
      styleForScalarValue(scalar),
      "tql:yamlScalar",
    );
    if (scalar.range[2] && scalar.range[2] > scalar.range[1]) {
      annotateByOffsets(
        scalar.range[1],
        scalar.range[2],
        "tql.comment",
        "tql:yamlComment",
      );
    }
  };

  const highlightSequenceItem = (range) => {
    if (!range) {
      return;
    }
    const { line } = offsetToLinePos(lineOffsets, range[0]);
    const lineStartOffset = lineOffsets[line];
    const hyphenIndex = frontmatterText.indexOf("-", lineStartOffset);
    if (hyphenIndex !== -1 && hyphenIndex < range[0]) {
      annotateByOffsets(
        hyphenIndex,
        hyphenIndex + 1,
        "tql.punctuation",
        "tql:yamlHyphen",
      );
    }
  };

  const visitNode = (yamlNode) => {
    if (!yamlNode) {
      return;
    }
    if (yamlIsMap(yamlNode)) {
      yamlNode.items.forEach(visitPair);
    } else if (yamlIsSeq(yamlNode)) {
      visitSequence(yamlNode);
    } else if (yamlIsScalar(yamlNode)) {
      peelScalar(yamlNode);
    }
  };

  const visitPair = (pair) => {
    if (!pair) {
      return;
    }
    const keyRange = pair.key?.range;
    if (keyRange) {
      annotateByOffsets(
        keyRange[0],
        keyRange[1],
        "tql.attribute",
        "tql:yamlKey",
      );
    }
    if (pair.value) {
      const valueRange = pair.value.range;
      if (keyRange && valueRange) {
        const colonIndex = frontmatterText.indexOf(":", keyRange[1]);
        if (colonIndex !== -1 && colonIndex < valueRange[0]) {
          annotateByOffsets(
            colonIndex,
            colonIndex + 1,
            "tql.punctuation",
            "tql:yamlColon",
          );
        }
      }
      visitNode(pair.value);
    }
    if (pair.comment) {
      const commentStart = Math.max(
        pair.value?.range?.[1] ?? pair.key?.range?.[1] ?? 0,
        pair.value?.range?.[1] ?? 0,
      );
      const commentText = `#${pair.comment.replace(/^\s*/, "")}`;
      const commentIndex = frontmatterText.indexOf(commentText, commentStart);
      if (commentIndex !== -1) {
        annotateByOffsets(
          commentIndex,
          commentIndex + commentText.length,
          "tql.comment",
          "tql:yamlComment",
        );
      }
    }
  };

  const visitSequence = (seq) => {
    if (!seq?.items?.length) {
      return;
    }
    for (const item of seq.items) {
      if (yamlIsScalar(item)) {
        highlightSequenceItem(item.range);
        peelScalar(item);
        if (typeof item.comment === "string" && item.comment.trim()) {
          const commentStart = item.range?.[1] ?? 0;
          const commentEnd = item.range?.[2] ?? commentStart;
          annotateByOffsets(
            commentStart,
            commentEnd,
            "tql.comment",
            "tql:yamlComment",
          );
        }
      } else if (yamlIsMap(item) || yamlIsSeq(item)) {
        highlightSequenceItem(item.range);
        visitNode(item);
      }
    }
  };

  visitNode(contents);
}

function computeLineOffsets(value) {
  const offsets = [0];
  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) === 10) {
      offsets.push(index + 1);
    }
  }
  offsets.push(value.length);
  return offsets;
}

function offsetToLinePos(lineOffsets, offset) {
  let line = 0;
  while (line + 1 < lineOffsets.length && lineOffsets[line + 1] <= offset) {
    line += 1;
  }
  return {
    line,
    column: offset - lineOffsets[line],
  };
}

function styleForScalarValue(scalar) {
  const { type, value } = scalar ?? {};
  if (
    type === "BLOCK_LITERAL" ||
    type === "BLOCK_FOLDED" ||
    type === "DOUBLE_QUOTED" ||
    type === "SINGLE_QUOTED"
  ) {
    return "tql.string";
  }
  if (typeof value === "boolean") {
    return "tql.boolean";
  }
  if (value === null) {
    return "tql.constant";
  }
  if (typeof value === "number") {
    return "tql.number";
  }
  if (typeof value === "string") {
    if (type === "PLAIN") {
      if (/^(true|false)$/i.test(value)) {
        return "tql.boolean";
      }
      if (/^(null|~)$/i.test(value)) {
        return "tql.constant";
      }
      if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
        return "tql.number";
      }
      if (/^[!&]/.test(value)) {
        return "tql.attribute";
      }
    }
    return "tql.string";
  }
  return "tql.literal";
}
