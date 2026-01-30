#!/usr/bin/env npx ts-node
/**
 * Automated Code Cleanup Script
 * Removes console.log/debug/info from production code
 * Preserves console.error and console.warn
 * 
 * Usage: npx ts-node scripts/automated-cleanup.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

interface Stats {
  filesProcessed: number;
  filesModified: number;
  consoleLogs: number;
  consoleDebug: number;
  consoleInfo: number;
}

const stats: Stats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogs: 0,
  consoleDebug: 0,
  consoleInfo: 0,
};

const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', 'tests', 'e2e', '__tests__'];
const SKIP_FILES = ['logger.ts', 'logger.tsx', 'vite-env.d.ts', 'structured-logger.ts'];

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!SKIP_DIRS.includes(item.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      if (!SKIP_FILES.includes(item.name)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function cleanConsoleLogs(content: string): { content: string; counts: { log: number; debug: number; info: number } } {
  const counts = { log: 0, debug: 0, info: 0 };
  
  // Pattern to match console.log/debug/info statements
  // Handles multi-line statements and various formats
  const patterns = [
    { regex: /console\.log\([^;]*\);?\s*\n?/g, type: 'log' as const },
    { regex: /console\.debug\([^;]*\);?\s*\n?/g, type: 'debug' as const },
    { regex: /console\.info\([^;]*\);?\s*\n?/g, type: 'info' as const },
  ];
  
  for (const { regex, type } of patterns) {
    const matches = content.match(regex);
    if (matches) {
      counts[type] = matches.length;
      content = content.replace(regex, '');
    }
  }
  
  // Clean up excessive empty lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return { content, counts };
}

function processFile(filePath: string): boolean {
  stats.filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  const { content: cleaned, counts } = cleanConsoleLogs(content);
  content = cleaned;
  
  stats.consoleLogs += counts.log;
  stats.consoleDebug += counts.debug;
  stats.consoleInfo += counts.info;
  
  if (content !== original) {
    stats.filesModified++;
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content);
    }
    
    return true;
  }
  
  return false;
}

function main() {
  console.log('\n🧹 Automated Code Cleanup - Nauti One v5.0\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`📂 Processing ${files.length} files...\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`
========================================
CLEANUP REPORT
========================================

Files Processed: ${stats.filesProcessed}
Files Modified: ${stats.filesModified}

Removed:
  - console.log:   ${stats.consoleLogs}
  - console.debug: ${stats.consoleDebug}
  - console.info:  ${stats.consoleInfo}
  - Total:         ${stats.consoleLogs + stats.consoleDebug + stats.consoleInfo}

========================================
`);
  
  if (DRY_RUN && stats.filesModified > 0) {
    console.log('💡 Run without --dry-run to apply changes\n');
  }
  
  if (!DRY_RUN && stats.filesModified > 0) {
    console.log('✅ Changes applied!\n');
  }
}

main();
