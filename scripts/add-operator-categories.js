#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// This script is now only used for adding categories to operators that don't have them
// All operator categories should be defined in the frontmatter of individual operator files
const OPERATOR_CATEGORIES = {};

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: null, body: content };
  }

  return {
    frontmatter: match[1],
    body: content.slice(match[0].length)
  };
}

function addCategoryToFrontmatter(frontmatter, categories) {
  const lines = frontmatter.split('\n');
  
  // Check if category already exists
  const hasCategoryLine = lines.some(line => line.trim().startsWith('category:'));
  
  if (hasCategoryLine) {
    // Replace existing category
    const newLines = [];
    let inCategorySection = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('category:')) {
        // Start replacing category section
        inCategorySection = true;
        if (categories.length === 1) {
          newLines.push(`category: ${categories[0]}`);
        } else {
          newLines.push('category:');
          categories.forEach(cat => {
            newLines.push(`  - ${cat}`);
          });
        }
      } else if (inCategorySection && line.trim().startsWith('-')) {
        // Skip existing category array items
        continue;
      } else {
        // End of category section or regular line
        if (inCategorySection && !line.trim().startsWith('-') && line.trim() !== '') {
          inCategorySection = false;
        }
        if (!inCategorySection) {
          newLines.push(line);
        }
      }
    }
    return newLines.join('\n');
  } else {
    // Add category after title
    const titleIndex = lines.findIndex(line => line.trim().startsWith('title:'));
    const insertIndex = titleIndex >= 0 ? titleIndex + 1 : 0;
    
    if (categories.length === 1) {
      lines.splice(insertIndex, 0, `category: ${categories[0]}`);
    } else {
      lines.splice(insertIndex, 0, 'category:');
      categories.forEach((cat, idx) => {
        lines.splice(insertIndex + 1 + idx, 0, `  - ${cat}`);
      });
    }
    
    if (titleIndex < 0) {
      // If no title found and we added at beginning, add a title too
      lines.unshift(`category: ${categories.join(', ')}`);
    }
    return lines.join('\n');
  }
}

async function processOperatorFiles(dirPath, updatedCount, skippedCount, uncategorizedCount, uncategorizedOperators) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Recursively process subdirectories
      const results = await processOperatorFiles(fullPath, updatedCount, skippedCount, uncategorizedCount, uncategorizedOperators);
      updatedCount = results.updatedCount;
      skippedCount = results.skippedCount;
      uncategorizedCount = results.uncategorizedCount;
      uncategorizedOperators = results.uncategorizedOperators;
    } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
      // Process operator files
      const content = await fs.readFile(fullPath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(content);
      
      if (!frontmatter) {
        console.warn(`⚠️  No frontmatter found in ${fullPath}`);
        continue;
      }

      // Extract operator name from file path
      const operatorName = item.name.replace(/\.(md|mdx)$/, '');
      const categories = OPERATOR_CATEGORIES[operatorName];
      
      if (!categories) {
        console.warn(`⚠️  No category mapping found for ${operatorName}`);
        uncategorizedOperators.push(operatorName);
        uncategorizedCount++;
        continue;
      }

      // Check if category already exists
      if (frontmatter.includes('category:')) {
        console.warn(`⏭️  Category already exists for ${operatorName}`);
        skippedCount++;
        continue;
      }

      // Add categories to frontmatter
      const updatedFrontmatter = addCategoryToFrontmatter(frontmatter, categories);
      const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
      
      await fs.writeFile(fullPath, updatedContent);
      console.warn(`✅ Added categories "${categories.join(', ')}" to ${operatorName}`);
      updatedCount++;
    }
  }
  
  return { updatedCount, skippedCount, uncategorizedCount, uncategorizedOperators };
}

async function addCategoriesToOperators() {
  const operatorsDir = 'src/content/docs/reference/operators';
  
  console.warn(`Processing operator files in ${operatorsDir}...`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let uncategorizedCount = 0;
  const uncategorizedOperators = [];

  const results = await processOperatorFiles(operatorsDir, updatedCount, skippedCount, uncategorizedCount, uncategorizedOperators);
  
  console.warn('\n📊 Summary:');
  console.warn(`   Updated: ${results.updatedCount} files`);
  console.warn(`   Skipped: ${results.skippedCount} files (already had category)`);
  console.warn(`   Uncategorized: ${results.uncategorizedCount} files`);
  
  if (results.uncategorizedOperators.length > 0) {
    console.warn('\n❓ Operators without category mapping:');
    results.uncategorizedOperators.forEach(op => console.warn(`   - ${op}`));
    console.warn('\nPlease add these operators to the OPERATOR_CATEGORIES mapping.');
  }
}

addCategoriesToOperators().catch(console.error);