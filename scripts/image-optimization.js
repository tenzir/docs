#!/usr/bin/env node

import { execSync } from 'child_process';
import { statSync, readdirSync, unlinkSync, existsSync, mkdtempSync, rmSync, copyFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Configuration
const OPTIMIZATION_THRESHOLD = 0.1; // 10% threshold
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg'];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDependencies() {
  const dependencies = [
    { cmd: 'pngquant', name: 'pngquant' },
    { cmd: 'jpegoptim', name: 'jpegoptim' },
    { cmd: 'svgo', name: 'svgo' }
  ];

  const missing = [];
  
  for (const dep of dependencies) {
    try {
      execSync(`which ${dep.cmd}`, { stdio: 'ignore' });
    } catch (error) {
      missing.push(dep.name);
    }
  }

  if (missing.length > 0) {
    log(`Missing required dependencies: ${missing.join(', ')}`, 'red');
    log('Install them with:', 'yellow');
    log('  brew install pngquant jpegoptim svgo  # macOS', 'blue');
    log('  apt-get install pngquant jpegoptim && npm install -g svgo  # Ubuntu', 'blue');
    process.exit(1);
  }
}

function createTempDir() {
  return mkdtempSync(join(tmpdir(), 'image-optimization-'));
}

function cleanupTempDir(tempDir) {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    log(`Warning: Could not clean up temp directory ${tempDir}`, 'yellow');
  }
}

function findImages(dir) {
  const images = [];
  const excludedDirs = [
    'node_modules',
    'dist',
    '.astro',
    '.git',
    '.github',
    '.next',
    'build',
    'out'
  ];

  
  function walkDir(currentDir) {
    const items = readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      
      if (item.isDirectory() && 
          !item.name.startsWith('.') && 
          !excludedDirs.includes(item.name)) {
        walkDir(fullPath);
      } else if (item.isFile() && IMAGE_EXTENSIONS.includes(extname(item.name).toLowerCase())) {
        images.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return images;
}

function getFileSize(filePath) {
  return statSync(filePath).size;
}

function optimizeImage(filePath, dryRun = false, tempDir = null) {
  const ext = extname(filePath).toLowerCase();
  const originalSize = getFileSize(filePath);
  
  try {
    let command;
    
    switch (ext) {
      case '.png':
        command = `pngquant --ext .png --force --quality=65-80 "${filePath}"`;
        break;
      case '.jpg':
      case '.jpeg':
        command = `jpegoptim --strip-all --max=80 "${filePath}"`;
        break;
      case '.svg':
        command = `svgo "${filePath}"`;
        break;
      default:
        return null;
    }
    
    if (dryRun) {
      // For dry run, create a temporary copy in temp directory and optimize it
      const fileName = basename(filePath);
      const tempFile = join(tempDir, fileName);
      copyFileSync(filePath, tempFile);
      
      try {
        let tempCommand;
        switch (ext) {
          case '.png':
            tempCommand = `pngquant --ext .png --force --quality=65-80 "${tempFile}"`;
            break;
          case '.jpg':
          case '.jpeg':
            tempCommand = `jpegoptim --strip-all --max=80 "${tempFile}"`;
            break;
          case '.svg':
            tempCommand = `svgo "${tempFile}"`;
            break;
        }
        
        execSync(tempCommand, { stdio: 'ignore' });
        const optimizedSize = getFileSize(tempFile);
        
        return {
          originalSize,
          optimizedSize,
          savings: originalSize - optimizedSize,
          savingsPercent: ((originalSize - optimizedSize) / originalSize) * 100
        };
      } catch (error) {
        throw error;
      }
    } else {
      execSync(command, { stdio: 'ignore' });
      const optimizedSize = getFileSize(filePath);
      
      return {
        originalSize,
        optimizedSize,
        savings: originalSize - optimizedSize,
        savingsPercent: ((originalSize - optimizedSize) / originalSize) * 100
      };
    }
  } catch (error) {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  checkDependencies();
  
  const images = findImages(ROOT_DIR);
  
  if (images.length === 0) {
    log('No images found to process.', 'yellow');
    process.exit(0);
  }
  
  log(`Found ${images.length} images to process`, 'blue');
  
  let hasUnoptimizedImages = false;
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  const problematicImages = [];
  let tempDir = null;
  
  // Create temp directory for dry runs
  if (command === 'check') {
    tempDir = createTempDir();
  }
  
  try {
    for (const imagePath of images) {
      const relativePath = imagePath.replace(ROOT_DIR + '/', '');
      
      const result = optimizeImage(imagePath, command === 'check', tempDir);
      
      if (!result) {
        log(`⚠️  Failed to process: ${relativePath}`, 'yellow');
        continue;
      }
      
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      
      const isUnoptimized = result.savingsPercent > OPTIMIZATION_THRESHOLD * 100;
      
      if (isUnoptimized) {
        hasUnoptimizedImages = true;
        problematicImages.push({
          path: relativePath,
          ...result
        });
      }
      
      const icon = isUnoptimized ? '❌' : '✅';
      const savingsText = result.savings > 0 
        ? `${formatBytes(result.savings)} (${result.savingsPercent.toFixed(1)}%)`
        : 'already optimized';
      
      if (command === 'check') {
        if (isUnoptimized) {
          log(`${icon} ${relativePath}: could save ${savingsText}`, 'red');
        } else {
          log(`${icon} ${relativePath}: ${savingsText}`, 'green');
        }
      } else if (command === 'optimize') {
        log(`${icon} ${relativePath}: saved ${savingsText}`, result.savings > 0 ? 'green' : 'blue');
      }
    }
  } finally {
    // Clean up temp directory
    if (tempDir) {
      cleanupTempDir(tempDir);
    }
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'bold');
  log('SUMMARY', 'bold');
  log('='.repeat(50), 'bold');
  
  const totalSavings = totalOriginalSize - totalOptimizedSize;
  const totalSavingsPercent = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;
  
  log(`Total images processed: ${images.length}`);
  log(`Total original size: ${formatBytes(totalOriginalSize)}`);
  log(`Total ${command === 'check' ? 'potential ' : ''}optimized size: ${formatBytes(totalOptimizedSize)}`);
  
  if (totalSavings > 0) {
    log(`Total ${command === 'check' ? 'potential ' : ''}savings: ${formatBytes(totalSavings)} (${totalSavingsPercent.toFixed(1)}%)`, 'green');
  }
  
  if (command === 'check') {
    if (hasUnoptimizedImages) {
      log(`\n❌ Found ${problematicImages.length} unoptimized images exceeding ${OPTIMIZATION_THRESHOLD * 100}% threshold`, 'red');
      log('\nTo fix these issues, run:', 'yellow');
      log('  pnpm run lint:images:fix', 'blue');
      log('\nOr optimize individual files:', 'yellow');
      
      for (const img of problematicImages.slice(0, 5)) {
        const ext = extname(img.path).toLowerCase();
        let cmd;
        switch (ext) {
          case '.png':
            cmd = `pngquant --ext .png --force --quality=65-80 "${img.path}"`;
            break;
          case '.jpg':
          case '.jpeg':
            cmd = `jpegoptim --strip-all --max=80 "${img.path}"`;
            break;
          case '.svg':
            cmd = `svgo "${img.path}"`;
            break;
        }
        log(`  ${cmd}`, 'blue');
      }
      
      if (problematicImages.length > 5) {
        log(`  ... and ${problematicImages.length - 5} more`, 'blue');
      }
      
      process.exit(1);
    } else {
      log('\n✅ All images are optimized within the acceptable threshold', 'green');
    }
  } else if (command === 'optimize') {
    log('\n✅ Image optimization complete', 'green');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}