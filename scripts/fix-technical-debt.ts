#!/usr/bin/env npx ts-node
/**
 * Technical Debt Auto-Fix Script
 * Automatically fixes trivial and simple technical debt items
 * 
 * Usage: npx ts-node scripts/fix-technical-debt.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

interface FixStats {
  filesProcessed: number;
  filesModified: number;
  consoleLogs: number;
  tsIgnores: number;
  anyTypes: number;
  emptyLines: number;
}

const stats: FixStats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogs: 0,
  tsIgnores: 0,
  anyTypes: 0,
  emptyLines: 0,
};

const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage'];
const SKIP_FILES = ['logger.ts', 'logger.tsx', 'vite-env.d.ts'];

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

function fixConsoleLogs(content: string): { content: string; fixes: number } {
  let fixes = 0;
  
  // Remove console.log/debug/info (keep error, warn)
  const patterns = [
    /^\\s*console\\.log\\([^)]*\\);?\\s*\\n?/gm,
    /^\\s*console\\.debug\\([^)]*\\);?\\s*\\n?/gm,
    /^\\s*console\\.info\\([^)]*\\);?\\s*\\n?/gm,
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      fixes += matches.length;
      content = content.replace(pattern, '');
    }
  }
  
  return { content, fixes };
}

function fixEmptyLines(content: string): { content: string; fixes: number } {
  const before = (content.match(/\\n{3,}/g) || []).length;
  const cleaned = content.replace(/\\n{3,}/g, '\\n\\n');
  return { content: cleaned, fixes: before };
}

function fixTrailingWhitespace(content: string): { content: string; fixes: number } {
  const lines = content.split('\\n');
  let fixes = 0;
  
  const cleaned = lines.map(line => {
    const trimmed = line.replace(/\\s+$/, '');
    if (trimmed !== line) fixes++;
    return trimmed;
  }).join('\\n');
  
  return { content: cleaned, fixes };
}

function addMissingImportTypes(content: string): { content: string; fixes: number } {
  let fixes = 0;
  
  // Add 'type' keyword to type-only imports
  const typeOnlyImports = [
    /import \\{ ((?:\\w+, )*(?:\\w+Props|\\w+Type|\\w+Interface))( [^}]*)? \\} from/g,
  ];
  
  for (const pattern of typeOnlyImports) {
    const newContent = content.replace(pattern, (match) => {
      if (!match.includes('import type')) {
        fixes++;
        return match.replace('import {', 'import type {');
      }
      return match;
    });
    content = newContent;
  }
  
  return { content, fixes };
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
  
  const wsResult = fixTrailingWhitespace(content);
  content = wsResult.content;
  
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
  console.log('\\n🔧 Technical Debt Auto-Fix - Nauti One v4.0\\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\\n');
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`📂 Processing ${files.length} files...\\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`\\n========================================\\nAUTO-FIX REPORT\\n========================================\\n\\nFiles Processed: ${stats.filesProcessed}\\nFiles Modified: ${stats.filesModified}\\n\\nFixed:\\n  - Console logs removed: ${stats.consoleLogs}\\n  - Empty lines cleaned: ${stats.emptyLines}\\n\\n========================================\\n`);
  
  if (DRY_RUN && stats.filesModified > 0) {
    console.log('💡 Run without --dry-run to apply changes\\n');
  }
  
  if (!DRY_RUN && stats.filesModified > 0) {
    console.log('✅ Changes applied!\\n');
    console.log('📋 Next steps:');
    console.log('   1. npm run lint --fix');
    console.log('   2. npm run build');
    console.log('   3. npm test\\n');
  }
  
  fs.writeFileSync('fix-report.json', JSON.stringify(stats, null, 2));
}

main();
