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
  // Get the first paragraph after frontmatter (until empty line or code block)
  const lines = content.split('\n');
  let description = '';
  let foundStart = false;
  let inCallout = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Handle callout blocks
    if (trimmed.startsWith(':::')) {
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
    if (trimmed.startsWith('#') || 
        trimmed.startsWith('```')) {
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
        description += ' ' + trimmed;
      } else {
        description = trimmed;
      }
    }
  }
  
  return description;
}

async function processFunctionFiles(dirPath, functions = [], basePath = "src/content/docs/reference/functions") {
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      // Recursively process subdirectories
      await processFunctionFiles(fullPath, functions, basePath);
    } else if (item.name.endsWith(".md") || item.name.endsWith(".mdx")) {
      // Process function files
      const content = await fs.readFile(fullPath, "utf-8");
      const { data, content: body } = parseFrontmatter(content);

      const functionName = data.title || item.name.replace(/\.(md|mdx)$/, "");

      // Calculate relative path from base functions directory
      const relativePath = path.relative(basePath, fullPath);
      const urlPath = path.dirname(relativePath).replace(/\\/g, '/');
      const finalPath = urlPath === '.' ? 
        `/reference/functions/${functionName}` : 
        `/reference/functions/${urlPath}/${functionName}`;

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
      const example = data.example || '';

      functions.push({
        name: functionName,
        categories,
        description,
        example,
        path: finalPath
      });
    }
  }

  return functions;
}

async function generateFunctionsOverview() {
  const functionsDir = 'src/content/docs/reference/functions';

  console.warn(`Processing function files in ${functionsDir}...`);

  // Parse all function files
  const functions = await processFunctionFiles(functionsDir);

  console.warn(`Found ${functions.length} functions`);

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

  // Collect all function data for frontmatter
  const allFunctionData = [];
  Object.values(categorizedFunctions).forEach(categoryFunctions => {
    categoryFunctions.forEach(fn => {
      allFunctionData.push({
        name: fn.name,
        description: fn.description,
        example: fn.example,
        path: fn.path
      });
    });
  });

  // Generate markdown with metadata
  let markdown = `---
title: Functions
functions:
`;

  // Add function metadata to frontmatter
  allFunctionData.forEach(fn => {
    const escapedName = fn.name.replace(/'/g, "''");
    const escapedDescription = fn.description.replace(/'/g, "''");
    const escapedExample = fn.example.replace(/'/g, "''");
    markdown += `  - name: '${escapedName}'\n`;
    markdown += `    description: '${escapedDescription}'\n`;
    markdown += `    example: '${escapedExample}'\n`;
    markdown += `    path: '${fn.path}'\n`;
  });

  markdown += `---

{/*
This file is auto-generated from individual function files. Do not edit manually.
Run 'pnpm run generate:functions-overview' to regenerate this file.
*/}

import { CardGrid } from '@astrojs/starlight/components';
import ReferenceCard from '../../../components/ReferenceCard.astro';

{/*

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
    const [_mainCategory, subCategory] = categoryName.split('/');

    if (isSubcategory) {
      markdown += `\n### ${subCategory}\n\n`;
    } else {
      markdown += `\n## ${categoryName}\n\n`;
    }

    markdown += `<CardGrid>\n\n`;

    functions.forEach(fn => {
      const escapedTitle = fn.name.replace(/"/g, '&quot;');
      const escapedDescription = fn.description.replace(/"/g, '&quot;');
      markdown += `<ReferenceCard title="${escapedTitle}" description="${escapedDescription}" href="${fn.path}">\n\n\`\`\`tql\n${fn.example}\n\`\`\`\n\n</ReferenceCard>\n\n`;
    });

    markdown += `</CardGrid>\n`;
  });

  // Add any uncategorized functions
  const uncategorized = categorizedFunctions['Uncategorized'];
  if (uncategorized && uncategorized.length > 0) {
    markdown += `\n## Uncategorized\n\n`;
    markdown += `<CardGrid>\n\n`;

    uncategorized.forEach(fn => {
      const escapedTitle = fn.name.replace(/"/g, '&quot;');
      const escapedDescription = fn.description.replace(/"/g, '&quot;');
      markdown += `<ReferenceCard title="${escapedTitle}" description="${escapedDescription}" href="${fn.path}">\n\n\`\`\`tql\n${fn.example}\n\`\`\`\n\n</ReferenceCard>\n\n`;
    });

    markdown += `</CardGrid>\n`;
  }

  await fs.writeFile('src/content/docs/reference/functions.mdx', markdown);
  console.warn('✅ Generated functions overview');

  // Report any functions that were found but not categorized
  const uncategorizedCount = uncategorized ? uncategorized.length : 0;
  if (uncategorizedCount > 0) {
    console.warn(`⚠️  Found ${uncategorizedCount} uncategorized functions:`);
    uncategorized.forEach(fn => console.warn(`   - ${fn.name}`));
  }
}

generateFunctionsOverview().catch(console.error);
