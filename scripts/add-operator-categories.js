#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Operator category mappings extracted from the current operators.md
// Operators can have multiple categories (array)
const OPERATOR_CATEGORIES = {
  // Modify operators
  'set': ['Modify'],
  'select': ['Modify'],
  'drop': ['Modify'],
  'enumerate': ['Modify'],
  'http': ['Modify'],
  'move': ['Modify'],
  'timeshift': ['Modify'],
  'unroll': ['Modify'],

  // Filter operators
  'where': ['Filter'],
  'assert': ['Filter'],
  'taste': ['Filter'],
  'head': ['Filter'],
  'tail': ['Filter'],
  'slice': ['Filter'],
  'sample': ['Filter'],
  'deduplicate': ['Filter'],

  // Analyze operators
  'summarize': ['Analyze'],
  'sort': ['Analyze'],
  'reverse': ['Analyze'],
  'top': ['Analyze'],
  'rare': ['Analyze'],

  // Flow Control operators
  'delay': ['Flow Control'],
  'cron': ['Flow Control'],
  'discard': ['Flow Control'],
  'every': ['Flow Control'],
  'fork': ['Flow Control'],
  'load_balance': ['Flow Control'],
  'pass': ['Flow Control'],
  'repeat': ['Flow Control'],
  'throttle': ['Flow Control'],

  // Inputs - Events
  'from': ['Inputs/Events'],
  'from_file': ['Inputs/Events'],
  'from_http': ['Inputs/Events'],
  'from_fluent_bit': ['Inputs/Events'],
  'from_opensearch': ['Inputs/Events'],
  'from_velociraptor': ['Inputs/Events'],

  // Inputs - Bytes
  'load_amqp': ['Inputs/Bytes'],
  'load_azure_blob_storage': ['Inputs/Bytes'],
  'load_file': ['Inputs/Bytes'],
  'load_ftp': ['Inputs/Bytes'],
  'load_google_cloud_pubsub': ['Inputs/Bytes'],
  'load_gcs': ['Inputs/Bytes'],
  'load_http': ['Inputs/Bytes'],
  'load_kafka': ['Inputs/Bytes'],
  'load_nic': ['Inputs/Bytes'],
  'load_s3': ['Inputs/Bytes'],
  'load_stdin': ['Inputs/Bytes'],
  'load_sqs': ['Inputs/Bytes'],
  'load_tcp': ['Inputs/Bytes'],
  'load_udp': ['Inputs/Bytes'],
  'load_zmq': ['Inputs/Bytes'],

  // Outputs - Events
  'to': ['Outputs/Events'],
  'to_asl': ['Outputs/Events'],
  'to_azure_log_analytics': ['Outputs/Events'],
  'to_clickhouse': ['Outputs/Events'],
  'to_fluent_bit': ['Outputs/Events'],
  'to_google_secops': ['Outputs/Events'],
  'to_google_cloud_logging': ['Outputs/Events'],
  'to_hive': ['Outputs/Events'],
  'to_opensearch': ['Outputs/Events'],
  'to_snowflake': ['Outputs/Events'],
  'to_splunk': ['Outputs/Events'],

  // Outputs - Bytes
  'save_amqp': ['Outputs/Bytes'],
  'save_azure_blob_storage': ['Outputs/Bytes'],
  'save_email': ['Outputs/Bytes'],
  'save_file': ['Outputs/Bytes'],
  'save_ftp': ['Outputs/Bytes'],
  'save_google_cloud_pubsub': ['Outputs/Bytes'],
  'save_gcs': ['Outputs/Bytes'],
  'save_http': ['Outputs/Bytes'],
  'save_kafka': ['Outputs/Bytes'],
  'save_s3': ['Outputs/Bytes'],
  'save_stdout': ['Outputs/Bytes'],
  'save_sqs': ['Outputs/Bytes'],
  'save_tcp': ['Outputs/Bytes'],
  'save_udp': ['Outputs/Bytes'],
  'save_zmq': ['Outputs/Bytes'],

  // Parsing operators
  'read_bitz': ['Parsing'],
  'read_cef': ['Parsing'],
  'read_csv': ['Parsing'],
  'read_feather': ['Parsing'],
  'read_gelf': ['Parsing'],
  'read_grok': ['Parsing'],
  'read_json': ['Parsing'],
  'read_kv': ['Parsing'],
  'read_leef': ['Parsing'],
  'read_lines': ['Parsing'],
  'read_ndjson': ['Parsing'],
  'read_pcap': ['Parsing'],
  'read_parquet': ['Parsing'],
  'read_ssv': ['Parsing'],
  'read_suricata': ['Parsing'],
  'read_syslog': ['Parsing'],
  'read_tsv': ['Parsing'],
  'read_xsv': ['Parsing'],
  'read_yaml': ['Parsing'],
  'read_zeek_json': ['Parsing'],
  'read_zeek_tsv': ['Parsing'],

  // Printing operators
  'write_bitz': ['Printing'],
  'write_csv': ['Printing'],
  'write_feather': ['Printing'],
  'write_json': ['Printing'],
  'write_kv': ['Printing'],
  'write_ndjson': ['Printing'],
  'write_lines': ['Printing'],
  'write_parquet': ['Printing'],
  'write_pcap': ['Printing'],
  'write_ssv': ['Printing'],
  'write_syslog': ['Printing'],
  'write_tsv': ['Printing'],
  'write_tql': ['Printing'],
  'write_xsv': ['Printing'],
  'write_yaml': ['Printing'],
  'write_zeek_tsv': ['Printing'],

  // Charts operators
  'chart_area': ['Charts'],
  'chart_bar': ['Charts'],
  'chart_line': ['Charts'],
  'chart_pie': ['Charts'],

  // Connecting Pipelines operators
  'publish': ['Connecting Pipelines'],
  'subscribe': ['Connecting Pipelines'],

  // Node - Inspection
  'diagnostics': ['Node/Inspection'],
  'openapi': ['Node/Inspection'],
  'metrics': ['Node/Inspection'],
  'plugins': ['Node/Inspection'],
  'version': ['Node/Inspection'],

  // Node - Storage Engine
  'export': ['Node/Storage Engine'],
  'fields': ['Node/Storage Engine'],
  'import': ['Node/Storage Engine'],
  'partitions': ['Node/Storage Engine'],
  'schemas': ['Node/Storage Engine'],

  // Host Inspection operators
  'files': ['Host Inspection'],
  'nics': ['Host Inspection'],
  'processes': ['Host Inspection'],
  'sockets': ['Host Inspection'],

  // Detection operators
  'sigma': ['Detection'],
  'yara': ['Detection'],

  // Internals operators
  'api': ['Internals'],
  'batch': ['Internals'],
  'buffer': ['Internals'],
  'cache': ['Internals'],
  'legacy': ['Internals'],
  'local': ['Internals'],
  'measure': ['Internals'],
  'remote': ['Internals'],
  'serve': ['Internals'],
  'strict': ['Internals'],
  'unordered': ['Internals'],

  // Encode & Decode operators
  'compress': ['Encode & Decode'],
  'compress_brotli': ['Encode & Decode'],
  'compress_bz2': ['Encode & Decode'],
  'compress_gzip': ['Encode & Decode'],
  'compress_lz4': ['Encode & Decode'],
  'compress_zstd': ['Encode & Decode'],
  'decompress': ['Encode & Decode'],
  'decompress_brotli': ['Encode & Decode'],
  'decompress_bz2': ['Encode & Decode'],
  'decompress_gzip': ['Encode & Decode'],
  'decompress_lz4': ['Encode & Decode'],
  'decompress_zstd': ['Encode & Decode'],

  // Escape Hatches operators
  'python': ['Escape Hatches'],
  'shell': ['Escape Hatches'],

  // Functions that are missing but might exist
  'assert_throughput': ['Filter'], // Performance testing filter

  // Context operators (in context/ subdirectory)
  'create_bloom_filter': ['Contexts'],
  'create_geoip': ['Contexts'],
  'create_lookup_table': ['Contexts'],
  'enrich': ['Contexts'],
  'erase': ['Contexts'],
  'inspect': ['Contexts'],
  'load': ['Contexts'],
  'remove': ['Contexts'],
  'reset': ['Contexts'],
  'save': ['Contexts'],
  'update': ['Contexts'],

  // Package operators (in package/ subdirectory)
  'add': ['Packages'],
  'list': ['Packages'],

  // Pipeline operators (in pipeline/ subdirectory)
  'activity': ['Pipelines'],
  'detach': ['Pipelines'],
  'run': ['Pipelines'],
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
        console.log(`⚠️  No frontmatter found in ${fullPath}`);
        continue;
      }

      // Extract operator name from file path
      const operatorName = item.name.replace(/\.(md|mdx)$/, '');
      const categories = OPERATOR_CATEGORIES[operatorName];
      
      if (!categories) {
        console.log(`⚠️  No category mapping found for ${operatorName}`);
        uncategorizedOperators.push(operatorName);
        uncategorizedCount++;
        continue;
      }

      // Check if category already exists
      if (frontmatter.includes('category:')) {
        console.log(`⏭️  Category already exists for ${operatorName}`);
        skippedCount++;
        continue;
      }

      // Add categories to frontmatter
      const updatedFrontmatter = addCategoryToFrontmatter(frontmatter, categories);
      const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
      
      await fs.writeFile(fullPath, updatedContent);
      console.log(`✅ Added categories "${categories.join(', ')}" to ${operatorName}`);
      updatedCount++;
    }
  }
  
  return { updatedCount, skippedCount, uncategorizedCount, uncategorizedOperators };
}

async function addCategoriesToOperators() {
  const operatorsDir = 'src/content/docs/reference/operators';
  
  console.log(`Processing operator files in ${operatorsDir}...`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let uncategorizedCount = 0;
  const uncategorizedOperators = [];

  const results = await processOperatorFiles(operatorsDir, updatedCount, skippedCount, uncategorizedCount, uncategorizedOperators);
  
  console.log('\n📊 Summary:');
  console.log(`   Updated: ${results.updatedCount} files`);
  console.log(`   Skipped: ${results.skippedCount} files (already had category)`);
  console.log(`   Uncategorized: ${results.uncategorizedCount} files`);
  
  if (results.uncategorizedOperators.length > 0) {
    console.log('\n❓ Operators without category mapping:');
    results.uncategorizedOperators.forEach(op => console.log(`   - ${op}`));
    console.log('\nPlease add these operators to the OPERATOR_CATEGORIES mapping.');
  }
}

addCategoriesToOperators().catch(console.error);