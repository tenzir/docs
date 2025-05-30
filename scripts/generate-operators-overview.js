#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

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
  const lines = frontmatter.split('\n');
  let currentKey = null;
  let isArray = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const colonIndex = line.indexOf(':');

    if (colonIndex > 0 && !line.trim().startsWith('-')) {
      // New key-value pair
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Check if this starts an array
      if (value === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
        // This is an array
        data[key] = [];
        currentKey = key;
        isArray = true;
      } else {
        data[key] = value;
        currentKey = null;
        isArray = false;
      }
    } else if (line.trim().startsWith('-') && isArray && currentKey) {
      // Array item
      const item = line.slice(line.indexOf('-') + 1).trim();
      data[currentKey].push(item);
    }
  }

  return { data, content: body };
}

function extractDescription(content) {
  // Get the first non-empty line after frontmatter
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
      return trimmed;
    }
  }
  return '';
}

function extractExample(content) {
  // Find the first TQL code block
  const tqlMatch = content.match(/```tql\n(.+?)\n```/s);
  if (tqlMatch) {
    // Get the first line of the example
    const firstLine = tqlMatch[1].split('\n')[0].trim();
    return firstLine;
  }
  return '';
}

async function processOperatorFiles(dirPath, operators = []) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Recursively process subdirectories
      await processOperatorFiles(fullPath, operators);
    } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
      // Process operator files
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data, content: body } = parseFrontmatter(content);

      const operatorName = data.title || item.name.replace(/\.(md|mdx)$/, '');

      // Handle multiple categories
      let categories;
      if (Array.isArray(data.category)) {
        categories = data.category;
      } else if (data.category && data.category.includes(',')) {
        categories = data.category.split(',').map(c => c.trim());
      } else {
        categories = [data.category || OPERATOR_CATEGORIES[operatorName] || 'Uncategorized'];
      }

      const description = extractDescription(body);
      const example = extractExample(body);

      operators.push({
        name: operatorName,
        categories,
        description,
        example,
        path: `/reference/operators/${operatorName}`
      });
    }
  }
  
  return operators;
}

async function generateOperatorsOverview() {
  const operatorsDir = 'src/content/docs/reference/operators';
  
  console.log(`Processing operator files in ${operatorsDir}...`);

  // Parse all operator files
  const operators = await processOperatorFiles(operatorsDir);
  
  console.log(`Found ${operators.length} operator files`);

  // Group by category - operators can appear in multiple categories
  const categorizedOperators = {};
  operators.forEach(op => {
    op.categories.forEach(category => {
      if (!categorizedOperators[category]) {
        categorizedOperators[category] = [];
      }
      categorizedOperators[category].push({
        name: op.name,
        description: op.description,
        example: op.example,
        path: op.path
      });
    });
  });

  // Sort operators within each category
  Object.values(categorizedOperators).forEach(categoryOperators => {
    categoryOperators.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Generate markdown
  let markdown = `---
title: Operators
---

<!-- This file is auto-generated from individual operator files. Do not edit manually. -->
<!-- Run 'pnpm run generate:operators-overview' to regenerate this file. -->

Tenzir comes with a wide range of built-in pipeline operators.
`;

  // Add each category in alphabetical order
  const sortedCategoryNames = Object.keys(categorizedOperators)
    .filter(categoryName => categoryName !== 'Uncategorized')
    .sort();

  sortedCategoryNames.forEach(categoryName => {
    const operators = categorizedOperators[categoryName];
    if (!operators || operators.length === 0) {
      return;
    }

    const isSubcategory = categoryName.includes('/');
    const [mainCategory, subCategory] = categoryName.split('/');

    if (isSubcategory) {
      markdown += `\n#### ${subCategory}\n\n`;
    } else {
      markdown += `\n## ${categoryName}\n\n`;
    }

    markdown += `| Operator | Description | Example |\n`;
    markdown += `| :------- | :---------- | :------ |\n`;

    operators.forEach(op => {
      const escapedDescription = op.description.replace(/\|/g, '\\|');
      const escapedExample = op.example.replace(/\|/g, '\\|');
      markdown += `| [\`${op.name}\`](${op.path}) | ${escapedDescription} | \`${escapedExample}\` |\n`;
    });
  });

  // Add any uncategorized operators
  const uncategorized = categorizedOperators['Uncategorized'];
  if (uncategorized && uncategorized.length > 0) {
    markdown += `\n## Uncategorized\n\n`;
    markdown += `| Operator | Description | Example |\n`;
    markdown += `| :------- | :---------- | :------ |\n`;

    uncategorized.forEach(op => {
      const escapedDescription = op.description.replace(/\|/g, '\\|');
      const escapedExample = op.example.replace(/\|/g, '\\|');
      markdown += `| [\`${op.name}\`](${op.path}) | ${escapedDescription} | \`${escapedExample}\` |\n`;
    });
  }

  await fs.writeFile('src/content/docs/reference/operators.md', markdown);
  console.log('✅ Generated operators overview');

  // Report any operators that were found but not categorized
  const uncategorizedCount = uncategorized ? uncategorized.length : 0;
  if (uncategorizedCount > 0) {
    console.log(`⚠️  Found ${uncategorizedCount} uncategorized operators:`);
    uncategorized.forEach(op => console.log(`   - ${op.name}`));
  }
}

generateOperatorsOverview().catch(console.error);