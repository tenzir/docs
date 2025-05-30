#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Function category mappings extracted from the current functions.md
// Functions can have multiple categories (array)
const FUNCTION_CATEGORIES = {
  // Aggregation functions
  'all': ['Aggregation'],
  'any': ['Aggregation'],
  'collect': ['Aggregation'],
  'count': ['Aggregation'],
  'count_if': ['Aggregation'],
  'count_distinct': ['Aggregation'],
  'distinct': ['Aggregation'],
  'first': ['Aggregation'],
  'last': ['Aggregation'],
  'max': ['Aggregation'],
  'mean': ['Aggregation'],
  'median': ['Aggregation'],
  'min': ['Aggregation'],
  'mode': ['Aggregation'],
  'quantile': ['Aggregation'],
  'stddev': ['Aggregation'],
  'sum': ['Aggregation'],
  'value_counts': ['Aggregation'],
  'variance': ['Aggregation'],
  'where': ['Aggregation', 'List'],

  // Record functions
  'get': ['Record', 'List'],
  'has': ['Record'],
  'keys': ['Record'],
  'merge': ['Record'],
  'sort': ['Record', 'List'],

  // List functions
  'append': ['List'],
  'prepend': ['List'],
  'concatenate': ['List'],
  'length': ['List'],
  'map': ['List'],
  'zip': ['List'],

  // Subnet functions
  'network': ['Subnet', 'IP'],

  // String functions - Inspection
  'length_bytes': ['String/Inspection'],
  'length_chars': ['String/Inspection'],
  'starts_with': ['String/Inspection'],
  'ends_with': ['String/Inspection'],
  'is_alnum': ['String/Inspection'],
  'is_alpha': ['String/Inspection'],
  'is_lower': ['String/Inspection'],
  'is_numeric': ['String/Inspection'],
  'is_printable': ['String/Inspection'],
  'is_title': ['String/Inspection'],
  'is_upper': ['String/Inspection'],
  'match_regex': ['String/Inspection'],
  'slice': ['String/Inspection'],

  // String functions - Transformation
  'trim': ['String/Transformation'],
  'trim_start': ['String/Transformation'],
  'trim_end': ['String/Transformation'],
  'capitalize': ['String/Transformation'],
  'replace': ['String/Transformation'],
  'replace_regex': ['String/Transformation'],
  'reverse': ['String/Transformation'],
  'to_lower': ['String/Transformation'],
  'to_title': ['String/Transformation'],
  'to_upper': ['String/Transformation'],
  'split': ['String/Transformation'],
  'split_regex': ['String/Transformation'],
  'join': ['String/Transformation'],

  // String functions - Filesystem
  'file_contents': ['String/Filesystem'],
  'file_name': ['String/Filesystem'],
  'parent_dir': ['String/Filesystem'],

  // Parsing functions
  'parse_cef': ['Parsing'],
  'parse_csv': ['Parsing'],
  'parse_grok': ['Parsing'],
  'parse_json': ['Parsing'],
  'parse_kv': ['Parsing'],
  'parse_leef': ['Parsing'],
  'parse_ssv': ['Parsing'],
  'parse_syslog': ['Parsing'],
  'parse_tsv': ['Parsing'],
  'parse_xsv': ['Parsing'],
  'parse_yaml': ['Parsing'],

  // Printing functions
  'print_csv': ['Printing'],
  'print_kv': ['Printing'],
  'print_json': ['Printing'],
  'print_ndjson': ['Printing'],
  'print_ssv': ['Printing'],
  'print_tsv': ['Printing'],
  'print_xsv': ['Printing'],
  'print_yaml': ['Printing'],

  // Time & Date functions
  'from_epoch': ['Time & Date'],
  'now': ['Time & Date'],
  'since_epoch': ['Time & Date'],
  'parse_time': ['Time & Date'],
  'format_time': ['Time & Date'],
  'year': ['Time & Date'],
  'month': ['Time & Date'],
  'day': ['Time & Date'],
  'hour': ['Time & Date'],
  'minute': ['Time & Date'],
  'second': ['Time & Date'],
  'years': ['Time & Date'],
  'months': ['Time & Date'],
  'weeks': ['Time & Date'],
  'days': ['Time & Date'],
  'hours': ['Time & Date'],
  'minutes': ['Time & Date'],
  'seconds': ['Time & Date'],
  'milliseconds': ['Time & Date'],
  'microseconds': ['Time & Date'],
  'nanoseconds': ['Time & Date'],
  'count_years': ['Time & Date'],
  'count_months': ['Time & Date'],
  'count_weeks': ['Time & Date'],
  'count_days': ['Time & Date'],
  'count_hours': ['Time & Date'],
  'count_minutes': ['Time & Date'],
  'count_seconds': ['Time & Date'],
  'count_milliseconds': ['Time & Date'],
  'count_microseconds': ['Time & Date'],
  'count_nanoseconds': ['Time & Date'],

  // IP functions
  'is_v4': ['IP'],
  'is_v6': ['IP'],

  // Math functions
  'abs': ['Math'],
  'ceil': ['Math'],
  'floor': ['Math'],
  'random': ['Math'],
  'round': ['Math'],
  'sqrt': ['Math'],

  // Networking functions
  'community_id': ['Networking'],
  'decapsulate': ['Networking'],
  'encrypt_cryptopan': ['Networking'],

  // Hashing functions
  'hash_md5': ['Hashing'],
  'hash_sha1': ['Hashing'],
  'hash_sha224': ['Hashing'],
  'hash_sha256': ['Hashing'],
  'hash_sha384': ['Hashing'],
  'hash_sha512': ['Hashing'],
  'hash_xxh3': ['Hashing'],

  // Bit Operations functions
  'bit_and': ['Bit Operations'],
  'bit_not': ['Bit Operations'],
  'bit_or': ['Bit Operations'],
  'bit_xor': ['Bit Operations'],
  'shift_left': ['Bit Operations'],
  'shift_right': ['Bit Operations'],

  // Encoding functions
  'encode_base64': ['Encoding'],
  'encode_hex': ['Encoding'],
  'encode_url': ['Encoding'],

  // Decoding functions
  'decode_base64': ['Decoding'],
  'decode_hex': ['Decoding'],
  'decode_url': ['Decoding'],

  // Type System functions - Introspection
  'type_id': ['Type System/Introspection'],
  'type_of': ['Type System/Introspection'],

  // Type System functions - Conversion
  'int': ['Type System/Conversion'],
  'uint': ['Type System/Conversion'],
  'float': ['Type System/Conversion'],
  'string': ['Type System/Conversion'],
  'ip': ['Type System/Conversion'],
  'subnet': ['Type System/Conversion'],
  'time': ['Type System/Conversion'],
  'duration': ['Type System/Conversion'],

  // Type System functions - Transposition
  'flatten': ['Type System/Transposition'],
  'unflatten': ['Type System/Transposition'],

  // Runtime functions
  'config': ['Runtime'],
  'env': ['Runtime'],
  'secret': ['Runtime'],

  // Functions that are missing from Time & Date but likely should be there
  'otherwise': ['Aggregation'], // This is a conditional/aggregation function
};

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

async function addCategoriesToFunctions() {
  const functionsDir = 'src/content/docs/reference/functions';
  const files = await fs.readdir(functionsDir);
  const functionFiles = files
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(functionsDir, file));
  
  console.log(`Processing ${functionFiles.length} function files...`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let uncategorizedCount = 0;
  const uncategorizedFunctions = [];

  for (const filePath of functionFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    
    if (!frontmatter) {
      console.log(`⚠️  No frontmatter found in ${filePath}`);
      continue;
    }

    // Extract function name from file path
    const functionName = filePath.split('/').pop().replace('.md', '');
    const categories = FUNCTION_CATEGORIES[functionName];
    
    if (!categories) {
      console.log(`⚠️  No category mapping found for ${functionName}`);
      uncategorizedFunctions.push(functionName);
      uncategorizedCount++;
      continue;
    }

    // Check if category already exists
    if (frontmatter.includes('category:')) {
      console.log(`⏭️  Category already exists for ${functionName}`);
      skippedCount++;
      continue;
    }

    // Add categories to frontmatter
    const updatedFrontmatter = addCategoryToFrontmatter(frontmatter, categories);
    const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
    
    await fs.writeFile(filePath, updatedContent);
    console.log(`✅ Added categories "${categories.join(', ')}" to ${functionName}`);
    updatedCount++;
  }

  console.log('\n📊 Summary:');
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${skippedCount} files (already had category)`);
  console.log(`   Uncategorized: ${uncategorizedCount} files`);
  
  if (uncategorizedFunctions.length > 0) {
    console.log('\n❓ Functions without category mapping:');
    uncategorizedFunctions.forEach(fn => console.log(`   - ${fn}`));
    console.log('\nPlease add these functions to the FUNCTION_CATEGORIES mapping.');
  }
}

addCategoriesToFunctions().catch(console.error);