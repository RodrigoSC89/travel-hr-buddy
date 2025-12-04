#!/usr/bin/env node
/**
 * Console Log Cleaner
 * Removes or comments out console.log statements from source files
 * PATCH: Audit Plan 2025 - Housekeeping
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Patterns to detect console statements
const CONSOLE_PATTERNS = [
  /console\.log\s*\([^)]*\);?/g,
  /console\.debug\s*\([^)]*\);?/g,
  /console\.info\s*\([^)]*\);?/g,
];

// Patterns to preserve (useful debugging)
const PRESERVE_PATTERNS = [
  /console\.error/,
  /console\.warn/,
  /\/\/.*console/,  // Already commented
  /\/\*[\s\S]*console[\s\S]*\*\//,  // Block commented
];

const stats = {
  filesScanned: 0,
  filesModified: 0,
  logsRemoved: 0,
  logsPreserved: 0,
};

function shouldPreserve(line) {
  return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
}

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  let logsInFile = 0;
  
  const cleanedLines = lines.map((line, index) => {
    // Skip if line should be preserved
    if (shouldPreserve(line)) {
      return line;
    }
    
    let cleanedLine = line;
    
    CONSOLE_PATTERNS.forEach(pattern => {
      if (pattern.test(cleanedLine)) {
        logsInFile++;
        
        // Comment out instead of removing (safer)
        cleanedLine = cleanedLine.replace(pattern, (match) => {
          stats.logsRemoved++;
          modified = true;
          return `/* ${match} */`;
        });
        
        if (VERBOSE) {
          console.log(`  Line ${index + 1}: ${line.trim().substring(0, 60)}...`);
        }
      }
    });
    
    return cleanedLine;
  });
  
  if (modified) {
    stats.filesModified++;
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, cleanedLines.join('\n'));
    }
    
    console.log(`📝 ${path.relative(process.cwd(), filePath)}: ${logsInFile} console statements`);
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, tests, and other non-source directories
      if (!['node_modules', '__tests__', 'tests', '.git', 'dist'].includes(item)) {
        scanDirectory(fullPath);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      // Skip test files and type definitions
      if (!item.includes('.test.') && !item.includes('.spec.') && !item.endsWith('.d.ts')) {
        stats.filesScanned++;
        cleanFile(fullPath);
      }
    }
  });
}

// Main
console.log('🧹 Console Log Cleaner');
console.log('======================');

if (DRY_RUN) {
  console.log('🔍 DRY RUN - No files will be modified\n');
}

if (!fs.existsSync(SRC_DIR)) {
  console.error('❌ src/ directory not found');
  process.exit(1);
}

scanDirectory(SRC_DIR);

console.log('\n📊 Summary:');
console.log(`   Files scanned: ${stats.filesScanned}`);
console.log(`   Files modified: ${stats.filesModified}`);
console.log(`   Console statements commented: ${stats.logsRemoved}`);

if (DRY_RUN && stats.logsRemoved > 0) {
  console.log('\n💡 Run without --dry-run to apply changes');
}

console.log('\n✅ Done');
