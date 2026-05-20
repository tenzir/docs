#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const write = args.includes("--write");
const check = args.includes("--check") || !write;
const explicitFiles = args.filter((arg) => !arg.startsWith("--"));

const ignorePatterns = loadIgnorePatterns();
const files =
  explicitFiles.length > 0
    ? explicitFiles
    : execFileSync("git", ["ls-files", "-z", "--", "*.md", "*.mdx"], {
        cwd: root,
        encoding: "utf8",
      })
        .split("\0")
        .filter(Boolean);

const changed = [];
const skipped = [];

for (const file of files) {
  if (
    !isMarkdown(file) ||
    isIgnored(file, ignorePatterns) ||
    !existsSync(file)
  ) {
    continue;
  }

  const input = readFileSync(file, "utf8");
  const output = formatMarkdownTables(input, file, skipped);

  if (input !== output) {
    changed.push(file);
    if (write) {
      writeFileSync(file, output);
    }
  }
}

for (const { file, line, reason } of skipped) {
  console.warn(`${file}:${line}: skipped table formatting: ${reason}`);
}

if (check && changed.length > 0) {
  console.error("Markdown tables need formatting:");
  for (const file of changed) {
    console.error(`  ${file}`);
  }
  console.error("Run `bun run lint:tables:fix` or `bun run lint:fix`.");
  process.exit(1);
}

function formatMarkdownTables(input, file, skipped) {
  const trailingNewline = input.endsWith("\n");
  const lines = input.split(/\r?\n/);
  if (trailingNewline) {
    lines.pop();
  }

  const output = [];
  let inFence = false;
  let fenceMarker = "";
  let inFrontmatter = lines[0] === "---";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (inFrontmatter) {
      output.push(line);
      if (index > 0 && line === "---") {
        inFrontmatter = false;
      }
      continue;
    }

    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[2][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      output.push(line);
      continue;
    }

    if (
      inFence ||
      index + 1 >= lines.length ||
      !isSeparatorLine(lines[index + 1])
    ) {
      output.push(line);
      continue;
    }

    const header = parseTableRow(line);
    const separator = parseSeparatorRow(lines[index + 1]);

    if (
      header.cells.length < 2 ||
      separator.alignments.length !== header.cells.length
    ) {
      output.push(line);
      continue;
    }

    const indent = line.match(/^\s*/)?.[0] ?? "";
    const rows = [header.cells];
    let cursor = index + 2;
    let invalidRow = null;

    while (cursor < lines.length && looksLikeTableRow(lines[cursor])) {
      const row = parseTableRow(lines[cursor]);
      if (row.cells.length !== header.cells.length) {
        invalidRow = cursor;
        break;
      }
      rows.push(row.cells);
      cursor += 1;
    }

    if (invalidRow !== null) {
      skipped.push({
        file,
        line: invalidRow + 1,
        reason: `expected ${header.cells.length} cells`,
      });
      output.push(line);
      continue;
    }

    output.push(...renderTable(rows, separator.alignments, indent));
    index = cursor - 1;
  }

  return `${output.join("\n")}${trailingNewline ? "\n" : ""}`;
}

function parseTableRow(line) {
  let body = line.trim();
  if (body.startsWith("|")) {
    body = body.slice(1);
  }
  if (body.endsWith("|") && !isEscapedPipe(body, body.length - 1)) {
    body = body.slice(0, -1);
  }

  const cells = [];
  let cell = "";

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "|" && !isEscapedPipe(body, index)) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());

  return { cells };
}

function parseSeparatorRow(line) {
  const cells = parseTableRow(line).cells;
  return {
    alignments: cells.map((cell) => {
      const trimmed = cell.trim();
      const starts = trimmed.startsWith(":");
      const ends = trimmed.endsWith(":");
      if (starts && ends) {
        return "center";
      }
      if (ends) {
        return "right";
      }
      if (starts) {
        return "left";
      }
      return "none";
    }),
  };
}

function renderTable(rows, alignments, indent) {
  const widths = rows[0].map((_, column) =>
    Math.max(3, ...rows.map((row) => visibleLength(row[column] ?? ""))),
  );

  const rendered = [
    renderRow(rows[0], widths, alignments),
    renderSeparator(widths, alignments),
    ...rows.slice(1).map((row) => renderRow(row, widths, alignments)),
  ];

  return rendered.map((line) => `${indent}${line}`);
}

function renderRow(row, widths, alignments) {
  return `| ${row
    .map((cell, index) => padCell(cell, widths[index], alignments[index]))
    .join(" | ")} |`;
}

function renderSeparator(widths, alignments) {
  return `| ${widths
    .map((width, index) => {
      const alignment = alignments[index];
      if (alignment === "center") {
        return `:${"-".repeat(Math.max(1, width - 2))}:`;
      }
      if (alignment === "right") {
        return `${"-".repeat(Math.max(2, width - 1))}:`;
      }
      if (alignment === "left") {
        return `:${"-".repeat(Math.max(2, width - 1))}`;
      }
      return "-".repeat(width);
    })
    .join(" | ")} |`;
}

function padCell(cell, width, alignment) {
  const length = visibleLength(cell);
  const padding = Math.max(0, width - length);

  if (alignment === "right") {
    return `${" ".repeat(padding)}${cell}`;
  }
  if (alignment === "center") {
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return `${" ".repeat(left)}${cell}${" ".repeat(right)}`;
  }
  return `${cell}${" ".repeat(padding)}`;
}

function isSeparatorLine(line) {
  if (!line.includes("|")) {
    return false;
  }
  const cells = parseTableRow(line).cells;
  return (
    cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
  );
}

function looksLikeTableRow(line) {
  return line.trim().includes("|") && line.trim() !== "";
}

function isEscapedPipe(value, index) {
  let slashCount = 0;
  for (
    let cursor = index - 1;
    cursor >= 0 && value[cursor] === "\\";
    cursor -= 1
  ) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function visibleLength(value) {
  let length = 0;
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code === undefined || isZeroWidth(code)) {
      continue;
    }
    length += isWide(code) ? 2 : 1;
  }
  return length;
}

function isZeroWidth(code) {
  return (
    (code >= 0x0300 && code <= 0x036f) ||
    (code >= 0xfe00 && code <= 0xfe0f) ||
    code === 0x200d
  );
}

function isWide(code) {
  return (
    code >= 0x1100 &&
    (code <= 0x115f ||
      code === 0x2329 ||
      code === 0x232a ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f000 && code <= 0x1faff) ||
      code === 0x2705 ||
      code === 0x274c ||
      code === 0x274e)
  );
}

function isMarkdown(file) {
  return file.endsWith(".md") || file.endsWith(".mdx");
}

function loadIgnorePatterns() {
  const ignorePath = path.join(root, ".markdownlintignore");
  if (!existsSync(ignorePath)) {
    return [];
  }
  return readFileSync(ignorePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"));
}

function isIgnored(file, patterns) {
  const relative = path
    .relative(root, path.resolve(root, file))
    .replaceAll("\\", "/");
  return patterns.some((pattern) => {
    if (pattern.endsWith("/")) {
      return relative.startsWith(pattern);
    }
    return relative === pattern;
  });
}
