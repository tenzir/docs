#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

// Categories are now read from frontmatter in individual operator files
// This mapping is kept as a fallback for any operators without category metadata
const OPERATOR_CATEGORIES = {};

// Categories are sorted alphabetically (no fixed order)

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

async function processOperatorFiles(
  dirPath,
  operators = [],
  basePath = "src/content/docs/reference/operators",
) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      // Recursively process subdirectories
      await processOperatorFiles(fullPath, operators, basePath);
    } else if (item.name.endsWith(".md") || item.name.endsWith(".mdx")) {
      // Process operator files
      const content = await fs.readFile(fullPath, "utf-8");
      const { data, content: body } = parseFrontmatter(content);

      const operatorName = data.title || item.name.replace(/\.(md|mdx)$/, "");

      // Calculate relative path from base operators directory
      const relativePath = path.relative(basePath, fullPath);
      const urlPath = path.dirname(relativePath).replace(/\\/g, "/");
      const finalPath =
        urlPath === "."
          ? `/reference/operators/${operatorName}`
          : `/reference/operators/${urlPath}/${operatorName}`;

      // Handle multiple categories
      let categories;
      if (Array.isArray(data.category)) {
        categories = data.category;
      } else if (data.category && data.category.includes(",")) {
        categories = data.category.split(",").map((c) => c.trim());
      } else {
        categories = [
          data.category || OPERATOR_CATEGORIES[operatorName] || "Uncategorized",
        ];
      }

      const description = extractDescription(body);
      const example = data.example || "";

      operators.push({
        name: operatorName,
        categories,
        description,
        example,
        path: finalPath,
      });
    }
  }

  return operators;
}

async function generateOperatorsOverview() {
  const operatorsDir = "src/content/docs/reference/operators";

  console.warn(`Processing operator files in ${operatorsDir}...`);

  // Parse all operator files
  const operators = await processOperatorFiles(operatorsDir);

  console.warn(`Found ${operators.length} operators`);

  // Group by category - operators can appear in multiple categories
  const categorizedOperators = {};
  operators.forEach((op) => {
    op.categories.forEach((category) => {
      if (!categorizedOperators[category]) {
        categorizedOperators[category] = [];
      }
      categorizedOperators[category].push({
        name: op.name,
        description: op.description,
        example: op.example,
        path: op.path,
      });
    });
  });

  // Sort operators within each category
  Object.values(categorizedOperators).forEach((categoryOperators) => {
    categoryOperators.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Collect all operator data for frontmatter
  const allOperatorData = [];
  Object.values(categorizedOperators).forEach((categoryOperators) => {
    categoryOperators.forEach((op) => {
      allOperatorData.push({
        name: op.name,
        description: op.description,
        example: op.example,
        path: op.path,
      });
    });
  });

  // Generate markdown with metadata
  let markdown = `---
title: Operators
operators:
`;

  // Add operator metadata to frontmatter
  allOperatorData.forEach((op) => {
    const escapedName = op.name.replace(/'/g, "''");
    const escapedDescription = op.description.replace(/'/g, "''");
    const escapedExample = op.example.replace(/'/g, "''");
    markdown += `  - name: '${escapedName}'\n`;
    markdown += `    description: '${escapedDescription}'\n`;
    markdown += `    example: '${escapedExample}'\n`;
    markdown += `    path: '${op.path}'\n`;
  });

  markdown += `---

{/*
This file is auto-generated from individual operator files. Do not edit manually.
Run 'pnpm run generate:operators-overview' to regenerate this file.
*/}

import { CardGrid } from '@astrojs/starlight/components';
import ReferenceCard from '../../../components/ReferenceCard.astro';

Tenzir comes with a wide range of built-in pipeline operators.
`;

  // Add each category in alphabetical order
  const sortedCategoryNames = Object.keys(categorizedOperators)
    .filter((categoryName) => categoryName !== "Uncategorized")
    .sort();

  sortedCategoryNames.forEach((categoryName) => {
    const operators = categorizedOperators[categoryName];
    if (!operators || operators.length === 0) {
      return;
    }

    const isSubcategory = categoryName.includes("/");
    const [_mainCategory, subCategory] = categoryName.split("/");

    if (isSubcategory) {
      markdown += `\n#### ${subCategory}\n\n`;
    } else {
      markdown += `\n## ${categoryName}\n\n`;
    }

    markdown += `<CardGrid>\n\n`;

    operators.forEach((op) => {
      const escapedTitle = op.name.replace(/"/g, "&quot;");
      const escapedDescription = op.description.replace(/"/g, "&quot;");
      markdown += `<ReferenceCard title="${escapedTitle}" description="${escapedDescription}" href="${op.path}">\n\n\`\`\`tql\n${op.example}\n\`\`\`\n\n</ReferenceCard>\n\n`;
    });

    markdown += `</CardGrid>\n`;
  });

  // Add any uncategorized operators
  const uncategorized = categorizedOperators["Uncategorized"];
  if (uncategorized && uncategorized.length > 0) {
    markdown += `\n## Uncategorized\n\n`;
    markdown += `<CardGrid>\n\n`;

    uncategorized.forEach((op) => {
      const escapedTitle = op.name.replace(/"/g, "&quot;");
      const escapedDescription = op.description.replace(/"/g, "&quot;");
      markdown += `<ReferenceCard title="${escapedTitle}" description="${escapedDescription}" href="${op.path}">\n\n\`\`\`tql\n${op.example}\n\`\`\`\n\n</ReferenceCard>\n\n`;
    });

    markdown += `</CardGrid>\n`;
  }

  await fs.writeFile("src/content/docs/reference/operators.mdx", markdown);
  console.warn("✅ Generated operators overview");

  // Report any operators that were found but not categorized
  const uncategorizedCount = uncategorized ? uncategorized.length : 0;
  if (uncategorizedCount > 0) {
    console.warn(`⚠️  Found ${uncategorizedCount} uncategorized operators:`);
    uncategorized.forEach((op) => console.warn(`   - ${op.name}`));
  }
}

generateOperatorsOverview().catch(console.error);
