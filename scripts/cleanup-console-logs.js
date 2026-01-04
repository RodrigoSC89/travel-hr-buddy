#!/usr/bin/env node
/**
 * Console Log Cleanup Script
 * 
 * Replaces console.log/debug/info with logger calls in production code.
 * Preserves console.error and console.warn.
 * 
 * Usage: node scripts/cleanup-console-logs.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Directories to process
const DIRS_TO_PROCESS = ['src'];

// Directories to skip
const DIRS_TO_SKIP = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'e2e',
  '__tests__',
  'stories',
];

// Files to skip
const FILES_TO_SKIP = [
  'logger.ts',
  'logger.js',
  'vite-env.d.ts',
];

// Stats
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogsRemoved: 0,
  consoleDebugsRemoved: 0,
  consoleInfosRemoved: 0,
};

/**
 * Check if path should be skipped
 */
function shouldSkip(filePath) {
  const fileName = path.basename(filePath);
  const parts = filePath.split(path.sep);
  
  // Check if any directory in path should be skipped
  if (parts.some(part => DIRS_TO_SKIP.includes(part))) {
    return true;
  }
  
  // Check if file should be skipped
  if (FILES_TO_SKIP.includes(fileName)) {
    return true;
  }
  
  return false;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  if (shouldSkip(filePath)) {
    return;
  }
  
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return;
  }
  
  stats.filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Patterns to match and replace
  const patterns = [
    // console.log(...) - remove entirely or replace with logger.debug
    {
      regex: /console\.log\([^)]*\);?\s*\n?/g,
      counter: 'consoleLogsRemoved',
      replacement: '',
    },
    // console.debug(...) - remove entirely
    {
      regex: /console\.debug\([^)]*\);?\s*\n?/g,
      counter: 'consoleDebugsRemoved',
      replacement: '',
    },
    // console.info(...) - remove entirely
    {
      regex: /console\.info\([^)]*\);?\s*\n?/g,
      counter: 'consoleInfosRemoved',
      replacement: '',
    },
  ];
  
  patterns.forEach(({ regex, counter, replacement }) => {
    const matches = content.match(regex);
    if (matches) {
      stats[counter] += matches.length;
      content = content.replace(regex, replacement);
    }
  });
  
  // Clean up empty lines left behind (multiple consecutive empty lines -> single)
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content !== originalContent) {
    stats.filesModified++;
    
    if (VERBOSE) {
      console.log(`📝 Modified: ${filePath}`);
    }
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content);
    }
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      if (!DIRS_TO_SKIP.includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else {
      processFile(fullPath);
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🧹 Console Log Cleanup Script');
  console.log('================================');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  DIRS_TO_PROCESS.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Processing: ${dir}/`);
      processDirectory(fullPath);
    } else {
      console.warn(`⚠️ Directory not found: ${dir}`);
    }
  });
  
  console.log('\n📊 Results:');
  console.log(`   Files processed: ${stats.filesProcessed}`);
  console.log(`   Files modified: ${stats.filesModified}`);
  console.log(`   console.log removed: ${stats.consoleLogsRemoved}`);
  console.log(`   console.debug removed: ${stats.consoleDebugsRemoved}`);
  console.log(`   console.info removed: ${stats.consoleInfosRemoved}`);
  console.log(`   Total removed: ${stats.consoleLogsRemoved + stats.consoleDebugsRemoved + stats.consoleInfosRemoved}`);
  
  if (DRY_RUN && stats.filesModified > 0) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
  
  console.log('\n✅ Done!');
}

main();
