#!/usr/bin/env npx ts-node
/**
 * 🔧 Frontend Auto-Fix Script
 * Automatically fixes common frontend issues
 * 
 * Usage: npx ts-node scripts/fix-frontend-issues.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

interface FixStats {
  filesProcessed: number;
  filesModified: number;
  consoleLogs: number;
  emptyLines: number;
  emptyCtach: number;
  todoComments: number;
}

const stats: FixStats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogs: 0,
  emptyLines: 0,
  emptyCtach: 0,
  todoComments: 0,
};

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      if (!item.name.includes('logger') && !item.name.includes('.test.') && !item.name.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function fixConsoleLogs(content: string): { content: string; fixes: number } {
  let fixes = 0;
  
  // Remove standalone console.log statements (not in catch blocks)
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a console.log/debug/info (not error/warn)
    if (/^\s*console\.(log|debug|info)\s*\(/.test(line)) {
      // Check if we're in a catch block (look back a few lines)
      const previousLines = lines.slice(Math.max(0, i - 5), i).join('\n');
      if (!previousLines.includes('catch')) {
        fixes++;
        continue; // Skip this line
      }
    }
    
    cleanedLines.push(line);
  }
  
  return { content: cleanedLines.join('\n'), fixes };
}

function fixEmptyLines(content: string): { content: string; fixes: number } {
  const before = (content.match(/\n{3,}/g) || []).length;
  const cleaned = content.replace(/\n{3,}/g, '\n\n');
  return { content: cleaned, fixes: before };
}

function fixEmptyCatchBlocks(content: string): { content: string; fixes: number } {
  let fixes = 0;
  
  // Replace empty catch blocks with proper error handling
  const fixed = content.replace(
    /catch\s*\(\s*(\w+)?\s*\)\s*\{\s*\}/g,
    (match, errorVar) => {
      fixes++;
      const varName = errorVar || 'error';
      return `catch (${varName}) {
      console.error('Error:', ${varName});
    }`;
    }
  );
  
  return { content: fixed, fixes };
}

function fixTrailingWhitespace(content: string): string {
  return content.split('\n').map(line => line.trimEnd()).join('\n');
}

function processFile(filePath: string): boolean {
  stats.filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Apply fixes
  const consoleResult = fixConsoleLogs(content);
  content = consoleResult.content;
  stats.consoleLogs += consoleResult.fixes;
  
  const emptyResult = fixEmptyLines(content);
  content = emptyResult.content;
  stats.emptyLines += emptyResult.fixes;
  
  const catchResult = fixEmptyCatchBlocks(content);
  content = catchResult.content;
  stats.emptyCtach += catchResult.fixes;
  
  content = fixTrailingWhitespace(content);
  
  // Check if modified
  if (content !== original) {
    stats.filesModified++;
    
    if (VERBOSE) {
      const relativePath = filePath.replace(process.cwd(), '');
      console.log(`📝 ${relativePath}`);
    }
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content);
    }
    
    return true;
  }
  
  return false;
}

function main() {
  console.log('\n🔧 Frontend Auto-Fix - Nauti One v4.0\n');
  
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 AUTO-FIX REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files Processed: ${stats.filesProcessed}
Files Modified: ${stats.filesModified}

Fixed:
  - Console logs removed: ${stats.consoleLogs}
  - Empty lines cleaned: ${stats.emptyLines}
  - Empty catch blocks: ${stats.emptyCtach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  
  if (DRY_RUN && stats.filesModified > 0) {
    console.log('💡 Run without --dry-run to apply changes\n');
  }
  
  if (!DRY_RUN && stats.filesModified > 0) {
    console.log('✅ Changes applied!\n');
    console.log('📋 Next steps:');
    console.log('   1. npm run lint --fix');
    console.log('   2. npm run build');
    console.log('   3. npm test\n');
  }
  
  fs.writeFileSync('completeness-reports/fix-report.json', JSON.stringify(stats, null, 2));
}

main();
