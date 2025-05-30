#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Categories are now read from frontmatter in individual function files
// This mapping is kept as a fallback for any functions without category metadata
const FUNCTION_CATEGORIES = {};

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

async function generateFunctionsOverview() {
  const functionsDir = 'src/content/docs/reference/functions';
  const files = await fs.readdir(functionsDir);
  const functionFiles = files
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(functionsDir, file));

  console.log(`Found ${functionFiles.length} function files`);

  // Parse all function files
  const functions = await Promise.all(
    functionFiles.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: body } = parseFrontmatter(content);

      const functionName = data.title || path.basename(filePath, '.md');

      // Handle multiple categories
      let categories;
      if (Array.isArray(data.category)) {
        categories = data.category;
      } else if (data.category && data.category.includes(',')) {
        categories = data.category.split(',').map(c => c.trim());
      } else {
        categories = [data.category || FUNCTION_CATEGORIES[functionName] || 'Uncategorized'];
      }

      const description = extractDescription(body);
      const example = extractExample(body);



      return {
        name: functionName,
        categories,
        description,
        example,
        path: `/reference/functions/${functionName}`
      };
    })
  );

  // Group by category - functions can appear in multiple categories
  const categorizedFunctions = {};
  functions.forEach(fn => {
    fn.categories.forEach(category => {
      if (!categorizedFunctions[category]) {
        categorizedFunctions[category] = [];
      }
      categorizedFunctions[category].push({
        name: fn.name,
        description: fn.description,
        example: fn.example,
        path: fn.path
      });
    });
  });

  // Sort functions within each category
  Object.values(categorizedFunctions).forEach(categoryFunctions => {
    categoryFunctions.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Generate markdown
  let markdown = `---
title: Functions
---

<!-- This file is auto-generated from individual function files. Do not edit manually. -->
<!-- Run 'pnpm run generate:functions-overview' to regenerate this file. -->

<!--

TODO: the following functions still need to be documented:

## OCSF

- \`ocsf::category_name\`
- \`ocsf::category_uid\`
- \`ocsf::class_name\`
- \`ocsf::class_uid\`

-->

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

  // Add each category in alphabetical order
  const sortedCategoryNames = Object.keys(categorizedFunctions)
    .filter(categoryName => categoryName !== 'Uncategorized')
    .sort();

  sortedCategoryNames.forEach(categoryName => {
    const functions = categorizedFunctions[categoryName];
    if (!functions || functions.length === 0) {
      return;
    }

    const isSubcategory = categoryName.includes('/');
    const [mainCategory, subCategory] = categoryName.split('/');

    if (isSubcategory) {
      markdown += `\n### ${subCategory}\n\n`;
    } else {
      markdown += `\n## ${categoryName}\n\n`;
    }

    markdown += `| Function | Description | Example |\n`;
    markdown += `| :------- | :---------- | :------ |\n`;

    functions.forEach(fn => {
      const escapedDescription = fn.description.replace(/\|/g, '\\|');
      const escapedExample = fn.example.replace(/\|/g, '\\|');
      markdown += `| [\`${fn.name}\`](${fn.path}) | ${escapedDescription} | \`${escapedExample}\` |\n`;
    });
  });

  // Add any uncategorized functions
  const uncategorized = categorizedFunctions['Uncategorized'];
  if (uncategorized && uncategorized.length > 0) {
    markdown += `\n## Uncategorized\n\n`;
    markdown += `| Function | Description | Example |\n`;
    markdown += `| :------- | :---------- | :------ |\n`;

    uncategorized.forEach(fn => {
      const escapedDescription = fn.description.replace(/\|/g, '\\|');
      const escapedExample = fn.example.replace(/\|/g, '\\|');
      markdown += `| [\`${fn.name}\`](${fn.path}) | ${escapedDescription} | \`${escapedExample}\` |\n`;
    });
  }

  await fs.writeFile('src/content/docs/reference/functions.md', markdown);
  console.log('✅ Generated functions overview');

  // Report any functions that were found but not categorized
  const uncategorizedCount = uncategorized ? uncategorized.length : 0;
  if (uncategorizedCount > 0) {
    console.log(`⚠️  Found ${uncategorizedCount} uncategorized functions:`);
    uncategorized.forEach(fn => console.log(`   - ${fn.name}`));
  }
}

generateFunctionsOverview().catch(console.error);
