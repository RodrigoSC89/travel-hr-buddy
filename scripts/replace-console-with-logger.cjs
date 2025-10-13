#!/usr/bin/env node

/**
 * Script to replace console statements with logger imports and calls
 * Usage: node scripts/replace-console-with-logger.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/TSX files with console statements
const filesWithConsole = execSync(
  `find src -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec grep -l "console\\." {} \\;`,
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

console.log(`Found ${filesWithConsole.length} files with console statements\n`);

let processedCount = 0;
let errorCount = 0;

filesWithConsole.forEach(filePath => {
  try {
    // Skip logger.ts itself
    if (filePath.includes('logger.ts')) {
      console.log(`⏭️  Skipping: ${filePath} (logger file)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Check if logger is already imported
    const hasLoggerImport = content.includes('from "@/lib/logger"') || content.includes("from '@/lib/logger'");
    
    // Count console usage
    const consoleMatches = content.match(/console\.(log|error|warn|info|debug)/g) || [];
    
    if (consoleMatches.length === 0) {
      return; // No console statements found
    }
    
    // Replace console.error with logger.error
    content = content.replace(
      /console\.error\(["']([^"']+)["'],?\s*([^)]*)\)/g,
      (match, msg, rest) => {
        if (rest.trim()) {
          return `logger.error("${msg}", ${rest})`;
        }
        return `logger.error("${msg}")`;
      }
    );
    
    // Replace console.error with simple string
    content = content.replace(
      /console\.error\(([^)]+)\)/g,
      'logger.error($1)'
    );
    
    // Replace console.warn
    content = content.replace(
      /console\.warn\(["']([^"']+)["'],?\s*([^)]*)\)/g,
      (match, msg, rest) => {
        if (rest.trim()) {
          return `logger.warn("${msg}", ${rest})`;
        }
        return `logger.warn("${msg}")`;
      }
    );
    
    content = content.replace(
      /console\.warn\(([^)]+)\)/g,
      'logger.warn($1)'
    );
    
    // Replace console.log and console.info with logger.info (development only)
    content = content.replace(/console\.(log|info)\(/g, 'logger.info(');
    
    // Replace console.debug
    content = content.replace(/console\.debug\(/g, 'logger.debug(');
    
    // Add logger import if not present and if we made changes
    if (!hasLoggerImport && content !== originalContent) {
      // Find the last import statement
      const importRegex = /^import\s+.*from\s+['"][^'"]+['"];?$/gm;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        
        content = 
          content.slice(0, insertPosition) +
          '\nimport { logger } from "@/lib/logger";' +
          content.slice(insertPosition);
      }
    }
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Processed: ${filePath} (${consoleMatches.length} replacements)`);
      processedCount++;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(`   ⏭️  Skipped: ${filesWithConsole.length - processedCount - errorCount} files\n`);
