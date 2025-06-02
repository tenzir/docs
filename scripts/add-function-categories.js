#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

// This script is now only used for adding categories to functions that don't have them
// All function categories should be defined in the frontmatter of individual function files
const FUNCTION_CATEGORIES = {};

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: null, body: content };
  }

  return {
    frontmatter: match[1],
    body: content.slice(match[0].length),
  };
}

function addCategoryToFrontmatter(frontmatter, categories) {
  const lines = frontmatter.split("\n");

  // Check if category already exists
  const hasCategoryLine = lines.some((line) =>
    line.trim().startsWith("category:"),
  );

  if (hasCategoryLine) {
    // Replace existing category
    const newLines = [];
    let inCategorySection = false;

    for (const line of lines) {
      if (line.trim().startsWith("category:")) {
        // Start replacing category section
        inCategorySection = true;
        if (categories.length === 1) {
          newLines.push(`category: ${categories[0]}`);
        } else {
          newLines.push("category:");
          categories.forEach((cat) => {
            newLines.push(`  - ${cat}`);
          });
        }
      } else if (inCategorySection && line.trim().startsWith("-")) {
        // Skip existing category array items
        continue;
      } else {
        // End of category section or regular line
        if (
          inCategorySection &&
          !line.trim().startsWith("-") &&
          line.trim() !== ""
        ) {
          inCategorySection = false;
        }
        if (!inCategorySection) {
          newLines.push(line);
        }
      }
    }
    return newLines.join("\n");
  } else {
    // Add category after title
    const titleIndex = lines.findIndex((line) =>
      line.trim().startsWith("title:"),
    );
    const insertIndex = titleIndex >= 0 ? titleIndex + 1 : 0;

    if (categories.length === 1) {
      lines.splice(insertIndex, 0, `category: ${categories[0]}`);
    } else {
      lines.splice(insertIndex, 0, "category:");
      categories.forEach((cat, idx) => {
        lines.splice(insertIndex + 1 + idx, 0, `  - ${cat}`);
      });
    }

    if (titleIndex < 0) {
      // If no title found and we added at beginning, add a title too
      lines.unshift(`category: ${categories.join(", ")}`);
    }
    return lines.join("\n");
  }
}

async function addCategoriesToFunctions() {
  const functionsDir = "src/content/docs/reference/functions";
  const files = await fs.readdir(functionsDir);
  const functionFiles = files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => path.join(functionsDir, file));

  console.warn(`Processing ${functionFiles.length} function files...`);

  let updatedCount = 0;
  let skippedCount = 0;
  let uncategorizedCount = 0;
  const uncategorizedFunctions = [];

  for (const filePath of functionFiles) {
    const content = await fs.readFile(filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(content);

    if (!frontmatter) {
      console.warn(`⚠️  No frontmatter found in ${filePath}`);
      continue;
    }

    // Extract function name from file path
    const functionName = filePath
      .split("/")
      .pop()
      .replace(/\.(md|mdx)$/, "");
    const categories = FUNCTION_CATEGORIES[functionName];

    if (!categories) {
      console.warn(`⚠️  No category mapping found for ${functionName}`);
      uncategorizedFunctions.push(functionName);
      uncategorizedCount++;
      continue;
    }

    // Check if category already exists
    if (frontmatter.includes("category:")) {
      console.warn(`⏭️  Category already exists for ${functionName}`);
      skippedCount++;
      continue;
    }

    // Add categories to frontmatter
    const updatedFrontmatter = addCategoryToFrontmatter(
      frontmatter,
      categories,
    );
    const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;

    await fs.writeFile(filePath, updatedContent);
    console.warn(
      `✅ Added categories "${categories.join(", ")}" to ${functionName}`,
    );
    updatedCount++;
  }

  console.warn("\n📊 Summary:");
  console.warn(`   Updated: ${updatedCount} files`);
  console.warn(`   Skipped: ${skippedCount} files (already had category)`);
  console.warn(`   Uncategorized: ${uncategorizedCount} files`);

  if (uncategorizedFunctions.length > 0) {
    console.warn("\n❓ Functions without category mapping:");
    uncategorizedFunctions.forEach((fn) => console.warn(`   - ${fn}`));
    console.warn(
      "\nPlease add these functions to the FUNCTION_CATEGORIES mapping.",
    );
  }
}

addCategoriesToFunctions().catch(console.error);
