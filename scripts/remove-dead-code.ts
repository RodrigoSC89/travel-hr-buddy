#!/usr/bin/env npx ts-node
/**
 * Dead Code Removal Script
 * Removes commented code, console.logs, and unused imports
 * 
 * Usage: npx ts-node scripts/remove-dead-code.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

interface CleanupStats {
  filesProcessed: number;
  filesModified: number;
  consoleLogs: number;
  commentedCode: number;
  emptyLines: number;
  todoComments: number;
}

const stats: CleanupStats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogs: 0,
  commentedCode: 0,
  emptyLines: 0,
  todoComments: 0,
};

// Directories to skip
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', 'public'];
const SKIP_FILES = ['logger.ts', 'logger.tsx', 'vite-env.d.ts', 'service-worker.ts'];

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

function removeConsoleLogs(content: string): { content: string; count: number } {
  let count = 0;
  
  // Remove console.log, console.debug, console.info (keep error, warn)
  const patterns = [
    /^\s*console\.log\([^)]*\);?\s*\n?/gm,
    /^\s*console\.debug\([^)]*\);?\s*\n?/gm,
    /^\s*console\.info\([^)]*\);?\s*\n?/gm,
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      count += matches.length;
      content = content.replace(pattern, '');
    }
  }
  
  return { content, count };
}

function removeCommentedCode(content: string): { content: string; count: number } {
  let count = 0;
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  
  // Patterns for commented code (not regular comments)
  const codePatterns = [
    /^\s*\/\/\s*(import|export|const|let|var|function|class|interface|type|return|if|else|for|while|switch|case)/,
    /^\s*\/\/\s*<[A-Z]/,  // Commented JSX
    /^\s*\/\/\s*\{.*\}/, // Commented objects
    /^\s*\/\*\s*(import|export|const|let|var|function|class)/,
  ];
  
  let inBlockComment = false;
  let blockCommentIsCode = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Handle block comments
    if (trimmed.startsWith('/*')) {
      inBlockComment = true;
      blockCommentIsCode = codePatterns.some(p => p.test(trimmed.substring(2)));
      
      if (trimmed.endsWith('*/')) {
        inBlockComment = false;
        if (blockCommentIsCode) {
          count++;
          continue;
        }
      }
      
      if (blockCommentIsCode) {
        count++;
        continue;
      }
    }
    
    if (inBlockComment) {
      if (trimmed.endsWith('*/')) {
        inBlockComment = false;
        if (blockCommentIsCode) {
          count++;
          continue;
        }
      } else if (blockCommentIsCode) {
        count++;
        continue;
      }
    }
    
    // Check single line commented code
    if (codePatterns.some(p => p.test(trimmed))) {
      count++;
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return { content: cleanedLines.join('\n'), count };
}

function removeExcessiveEmptyLines(content: string): { content: string; count: number } {
  const before = (content.match(/\n{3,}/g) || []).length;
  const cleaned = content.replace(/\n{3,}/g, '\n\n');
  return { content: cleaned, count: before };
}

function countTodoComments(content: string): number {
  const matches = content.match(/\/\/\s*(TODO|FIXME|XXX|HACK|BUG):/gi);
  return matches ? matches.length : 0;
}

function processFile(filePath: string): boolean {
  stats.filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // 1. Remove console logs
  const consoleResult = removeConsoleLogs(content);
  content = consoleResult.content;
  stats.consoleLogs += consoleResult.count;
  
  // 2. Remove commented code
  const commentResult = removeCommentedCode(content);
  content = commentResult.content;
  stats.commentedCode += commentResult.count;
  
  // 3. Remove excessive empty lines
  const emptyResult = removeExcessiveEmptyLines(content);
  content = emptyResult.content;
  stats.emptyLines += emptyResult.count;
  
  // 4. Count TODO comments (just report, don't remove)
  stats.todoComments += countTodoComments(content);
  
  // Check if modified
  if (content !== original) {
    stats.filesModified++;
    
    if (VERBOSE) {
      console.log(`📝 ${filePath.replace(process.cwd(), '')}`);
    }
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content);
    }
    
    return true;
  }
  
  return false;
}

function main() {
  console.log('🧹 Dead Code Removal - Nauti One v4.0\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`📂 Scanning ${files.length} files...\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`\n========================================\nDEAD CODE REMOVAL REPORT\n========================================\n\nFiles Processed: ${stats.filesProcessed}\nFiles Modified: ${stats.filesModified}\n\nRemoved:\n  - console.log/debug/info: ${stats.consoleLogs}\n  - Commented code lines: ${stats.commentedCode}\n  - Excessive empty lines: ${stats.emptyLines}\n\nFound:\n  - TODO/FIXME comments: ${stats.todoComments}\n\n========================================\n`);
  
  if (DRY_RUN && stats.filesModified > 0) {
    console.log('💡 Run without --dry-run to apply changes\n');
  }
  
  if (!DRY_RUN && stats.filesModified > 0) {
    console.log('✅ Changes applied!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run lint --fix');
    console.log('   2. Run: npm run build');
    console.log('   3. Run: npm test');
  }
  
  // Save report
  fs.writeFileSync('dead-code-report.json', JSON.stringify(stats, null, 2));
  console.log('\n📊 Report saved to: dead-code-report.json');
}

main();
