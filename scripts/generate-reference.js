#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const frontmatter = match[1];
  const body = content.slice(match[0].length);

  // Simple YAML parser for our needs
  const data = {};
  const lines = frontmatter.split("\n");
  let currentKey = null;
  let isArray = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const colonIndex = line.indexOf(":");

    if (colonIndex > 0 && !line.trim().startsWith("-")) {
      // New key-value pair
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Check if this starts an array
      if (
        value === "" &&
        i + 1 < lines.length &&
        lines[i + 1].trim().startsWith("-")
      ) {
        // This is an array
        data[key] = [];
        currentKey = key;
        isArray = true;
      } else {
        data[key] = value;
        currentKey = null;
        isArray = false;
      }
    } else if (line.trim().startsWith("-") && isArray && currentKey) {
      // Array item
      const item = line.slice(line.indexOf("-") + 1).trim();
      data[currentKey].push(item);
    }
  }

  return { data, content: body };
}

function extractDescription(content) {
  // Get the first paragraph after frontmatter (until empty line or code block)
  const lines = content.split("\n");
  let description = "";
  let foundStart = false;
  let inCallout = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle callout blocks
    if (trimmed.startsWith(":::")) {
      if (inCallout) {
        inCallout = false; // End of callout
      } else {
        inCallout = true; // Start of callout
      }
      continue;
    }

    // Skip content inside callouts
    if (inCallout) {
      continue;
    }

    // Skip empty lines at the beginning
    if (!foundStart && !trimmed) {
      continue;
    }

    // Skip headers and code blocks
    if (trimmed.startsWith("#") || trimmed.startsWith("```")) {
      if (foundStart) break; // End of description paragraph
      continue; // Skip if we haven't started yet
    }

    // If we hit an empty line after starting, we've reached the end of the paragraph
    if (foundStart && !trimmed) {
      break;
    }

    // This is part of the description
    if (trimmed) {
      foundStart = true;
      if (description) {
        description += " " + trimmed;
      } else {
        description = trimmed;
      }
    }
  }

  return description;
}

async function processReferenceFiles(dirPath, items = [], basePath, urlPrefix) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await processReferenceFiles(fullPath, items, basePath, urlPrefix);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      // Process reference files
      const content = await fs.readFile(fullPath, "utf-8");
      const { data, content: body } = parseFrontmatter(content);

      const itemName = data.title || entry.name.replace(/\.(md|mdx)$/, "");
      const fileName = entry.name.replace(/\.(md|mdx)$/, "");

      // Calculate relative path from base directory
      const relativePath = path.relative(basePath, fullPath);
      const urlPath = path.dirname(relativePath).replace(/\\/g, "/");
      const finalPath =
        urlPath === "."
          ? `${urlPrefix}/${fileName}`.substring(1)
          : `${urlPrefix}/${urlPath}/${fileName}`.substring(1);

      // Handle multiple categories
      let categories;
      if (Array.isArray(data.category)) {
        categories = data.category;
      } else if (data.category && data.category.includes(",")) {
        categories = data.category.split(",").map((c) => c.trim());
      } else {
        categories = [data.category || "Uncategorized"];
      }

      const description = extractDescription(body);
      const example = data.example || "";

      items.push({
        name: itemName,
        categories,
        description,
        example,
        path: finalPath,
      });
    }
  }

  return items;
}

function generateSidebarItems(categorizedItems) {
  // Collect all items from all categories
  const allItems = [];

  Object.values(categorizedItems).forEach((categoryItems) => {
    categoryItems.forEach((item) => {
      allItems.push(item.path);
    });
  });

  // Remove duplicates while preserving order
  const uniqueItems = [...new Set(allItems)];

  // Sort all items alphabetically by name
  const sortedItems = uniqueItems.sort((a, b) => {
    // Extract just the item name for sorting
    const nameA = a.split("/").pop();
    const nameB = b.split("/").pop();
    return nameA.localeCompare(nameB);
  });

  return sortedItems;
}

async function generateOverviewPage(items, categorizedItems, type, outputPath) {
  // Collect all item data for frontmatter
  const allItemData = [];
  Object.values(categorizedItems).forEach((categoryItems) => {
    categoryItems.forEach((item) => {
      allItemData.push({
        name: item.name,
        description: item.description,
        example: item.example,
        path: item.path,
      });
    });
  });

  // Generate markdown with metadata
  let markdown = `---
title: ${type}
sidebar:
  label: Overview
${type.toLowerCase()}:
`;

  // Add item metadata to frontmatter
  allItemData.forEach((item) => {
    const escapedName = item.name.replace(/'/g, "''");
    const escapedDescription = item.description.replace(/'/g, "''");
    const escapedExample = item.example.replace(/'/g, "''");
    markdown += `  - name: '${escapedName}'\n`;
    markdown += `    description: '${escapedDescription}'\n`;
    markdown += `    example: '${escapedExample}'\n`;
    markdown += `    path: '${item.path}'\n`;
  });

  markdown += `---

{/*
This file is auto-generated from individual ${type.toLowerCase()} files. Do not edit manually.
Run 'pnpm run generate:reference' to regenerate this file.
*/}

import { CardGrid } from '@astrojs/starlight/components';
import ReferenceCard from '../../../components/ReferenceCard.astro';

`;

  // Add type-specific introduction
  if (type === "Functions") {
    markdown += `{/*

TODO: the following functions still need to be documented:

## OCSF

- \`ocsf::category_name\`
- \`ocsf::category_uid\`
- \`ocsf::class_name\`
- \`ocsf::class_uid\`

*/}

Functions appear in [expressions](/reference/language/expressions) and take positional
and/or named arguments, producing a value as a result of their computation.

Function signatures have the following notation:

\`\`\`tql
f(arg1:<type>, arg2=<type>, [arg3=type]) -> <type>
\`\`\`

- \`arg:<type>\`: positional argument
- \`arg=<type>\`: named argument
- \`[arg=type]\`: optional (named) argument
- \`-> <type>\`: function return type

TQL features the [uniform function call syntax
(UFCS)](https://en.wikipedia.org/wiki/Uniform_Function_Call_Syntax), which
allows you to interchangeably call a function with at least one argument either
as _free function_ or _method_. For example, \`length(str)\` and \`str.length()\`
resolve to the identical function call. The latter syntax is particularly
suitable for function chaining, e.g., \`x.f().g().h()\` reads left-to-right as
"start with \`x\`, apply \`f()\`, then \`g()\` and then \`h()\`," compared to
\`h(g(f(x)))\`, which reads "inside out."

Throughout our documentation, we use the free function style in the synopsis
but often resort to the method style when it is more idiomatic.
`;
  } else if (type === "Operators") {
    markdown += `Tenzir comes with a wide range of built-in pipeline operators.
`;
  }

  // Add each category in alphabetical order
  const sortedCategoryNames = Object.keys(categorizedItems)
    .filter((categoryName) => categoryName !== "Uncategorized")
    .sort();

  sortedCategoryNames.forEach((categoryName) => {
    const items = categorizedItems[categoryName];
    if (!items || items.length === 0) {
      return;
    }

    const isSubcategory = categoryName.includes("/");
    const [_mainCategory, subCategory] = categoryName.split("/");

    if (isSubcategory) {
      markdown += `\n### ${subCategory}\n\n`;
    } else {
      markdown += `\n## ${categoryName}\n\n`;
    }

    markdown += `<CardGrid>\n\n`;

    items.forEach((item) => {
      const escapedTitle = item.name.replace(/"/g, "&quot;");
      const escapedDescription = item.description.replace(/"/g, "&quot;");
      markdown += `<ReferenceCard title="${escapedTitle}" description="${escapedDescription}" href="/${item.path}">\n\n\`\`\`tql\n${item.example}\n\`\`\`\n\n</ReferenceCard>\n\n`;
    });

    markdown += `</CardGrid>\n`;
  });

  // Add any uncategorized items
  const uncategorized = categorizedItems["Uncategorized"];
  if (uncategorized && uncategorized.length > 0) {
    markdown += `\n## Uncategorized\n\n`;
    markdown += `<CardGrid>\n\n`;

    uncategorized.forEach((item) => {
      const escapedTitle = item.name.replace(/"/g, "&quot;");
      const escapedDescription = item.description.replace(/"/g, "&quot;");
      markdown += `<ReferenceCard title="${escapedTitle}" description="${escapedDescription}" href="/${item.path}">\n\n\`\`\`tql\n${item.example}\n\`\`\`\n\n</ReferenceCard>\n\n`;
    });

    markdown += `</CardGrid>\n`;
  }

  await fs.writeFile(outputPath, markdown);
}

async function generateReference() {
  console.warn("Generating complete reference documentation...");

  // Process functions
  const functionsDir = "src/content/docs/reference/functions";
  const functions = await processReferenceFiles(
    functionsDir,
    [],
    functionsDir,
    "/reference/functions",
  );

  console.warn(`Found ${functions.length} functions`);

  // Process operators
  const operatorsDir = "src/content/docs/reference/operators";
  const operators = await processReferenceFiles(
    operatorsDir,
    [],
    operatorsDir,
    "/reference/operators",
  );

  console.warn(`Found ${operators.length} operators`);

  // Group functions by category
  const categorizedFunctions = {};
  functions.forEach((fn) => {
    fn.categories.forEach((category) => {
      if (!categorizedFunctions[category]) {
        categorizedFunctions[category] = [];
      }
      categorizedFunctions[category].push(fn);
    });
  });

  // Group operators by category
  const categorizedOperators = {};
  operators.forEach((op) => {
    op.categories.forEach((category) => {
      if (!categorizedOperators[category]) {
        categorizedOperators[category] = [];
      }
      categorizedOperators[category].push(op);
    });
  });

  // Sort items within each category
  Object.values(categorizedFunctions).forEach((categoryFunctions) => {
    categoryFunctions.sort((a, b) => a.name.localeCompare(b.name));
  });

  Object.values(categorizedOperators).forEach((categoryOperators) => {
    categoryOperators.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Generate overview pages
  console.warn("Generating functions overview...");
  await generateOverviewPage(
    functions,
    categorizedFunctions,
    "Functions",
    "src/content/docs/reference/functions.mdx",
  );

  console.warn("Generating operators overview...");
  await generateOverviewPage(
    operators,
    categorizedOperators,
    "Operators",
    "src/content/docs/reference/operators.mdx",
  );

  // Generate sidebar items
  const functionsSidebarItems = generateSidebarItems(categorizedFunctions);
  const operatorsSidebarItems = generateSidebarItems(categorizedOperators);

  // Generate the sidebar configuration as a JavaScript module
  const sidebarConfig = `// This file is auto-generated. Do not edit manually.
// Run 'pnpm run generate:reference' to regenerate this file.

export const referenceFunctions = ${JSON.stringify(functionsSidebarItems, null, 2)};

export const referenceOperators = ${JSON.stringify(operatorsSidebarItems, null, 2)};
`;

  await fs.writeFile("src/sidebar-reference.js", sidebarConfig);

  console.warn("✅ Generated complete reference documentation");

  // Report any items that were found but not categorized
  const uncategorizedFunctions = categorizedFunctions["Uncategorized"];
  const uncategorizedOperators = categorizedOperators["Uncategorized"];

  if (uncategorizedFunctions && uncategorizedFunctions.length > 0) {
    console.warn(
      `⚠️  Found ${uncategorizedFunctions.length} uncategorized functions:`,
    );
    uncategorizedFunctions.forEach((fn) => console.warn(`   - ${fn.name}`));
  }

  if (uncategorizedOperators && uncategorizedOperators.length > 0) {
    console.warn(
      `⚠️  Found ${uncategorizedOperators.length} uncategorized operators:`,
    );
    uncategorizedOperators.forEach((op) => console.warn(`   - ${op.name}`));
  }
}

generateReference().catch(console.error);
