#!/usr/bin/env node
/**
 * GATE A — NO CONSOLE IN PRODUCTION
 * Blocks console.log, console.warn, console.error in production code
 * 
 * Usage: node scripts/gates/gate-console.js [--staged]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PRODUCTION_PATHS = [
  'src',
  'supabase/functions',
  'supabase/migrations'
];

const EXCLUDED_PATTERNS = [
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
  /[\\/]tests[\\/]/,
  /[\\/]__tests__[\\/]/,
  /[\\/]e2e[\\/]/,
  /[\\/]mocks[\\/]/,
  // Allow in logger itself
  /[\\/]lib[\\/]logger\.(ts|js)$/,
  // Allow in service workers
  /sw.*\.js$/,
];

const CONSOLE_PATTERNS = [
  /console\.log\s*\(/,
  /console\.warn\s*\(/,
  /console\.error\s*\(/,
  /console\.debug\s*\(/,
  /console\.info\s*\(/,
];

// Colors for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function isProductionFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Check if in production paths
  const inProductionPath = PRODUCTION_PATHS.some(p => normalizedPath.includes(p));
  if (!inProductionPath) return false;
  
  // Check if excluded
  const isExcluded = EXCLUDED_PATTERNS.some(pattern => pattern.test(normalizedPath));
  return !isExcluded;
}

function findViolations(filePath, content) {
  const violations = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Skip comments
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) return;
    
    CONSOLE_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          content: line.trim().substring(0, 100),
          pattern: pattern.toString()
        });
      }
    });
  });
  
  return violations;
}

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    // Skip node_modules and dist
    if (item === 'node_modules' || item === 'dist' || item === '.git') continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (/\.(ts|tsx|js|jsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getStagedFiles() {
  try {
    const result = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return result.split('\n').filter(f => f && /\.(ts|tsx|js|jsx)$/.test(f));
  } catch {
    return [];
  }
}

function main() {
  const isStaged = process.argv.includes('--staged');
  const baseDir = process.cwd();
  
  console.log(`\n${BOLD}${CYAN}🔍 GATE A — NO CONSOLE IN PRODUCTION${RESET}\n`);
  
  let files;
  if (isStaged) {
    files = getStagedFiles().map(f => path.join(baseDir, f));
    console.log(`Scanning ${files.length} staged files...\n`);
  } else {
    files = [];
    PRODUCTION_PATHS.forEach(p => {
      getAllFiles(path.join(baseDir, p), files);
    });
    console.log(`Scanning ${files.length} production files...\n`);
  }
  
  const allViolations = [];
  
  for (const file of files) {
    if (!isProductionFile(file)) continue;
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf8');
    const violations = findViolations(file, content);
    allViolations.push(...violations);
  }
  
  if (allViolations.length === 0) {
    console.log(`${GREEN}✅ No console.log violations found!${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${RED}${BOLD}❌ Found ${allViolations.length} console violations:${RESET}\n`);
  
  // Group by file
  const byFile = {};
  allViolations.forEach(v => {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
  });
  
  Object.entries(byFile).forEach(([file, violations]) => {
    const relativePath = path.relative(baseDir, file);
    console.log(`${YELLOW}📁 ${relativePath}${RESET}`);
    violations.forEach(v => {
      console.log(`   ${RED}Line ${v.line}:${RESET} ${v.content}`);
    });
    console.log('');
  });
  
  console.log(`${CYAN}💡 Fix: Replace console.* with logger from @/lib/logger${RESET}`);
  console.log(`   Example: import { logger } from '@/lib/logger';`);
  console.log(`            logger.info('message');`);
  console.log(`            logger.error('error', error);`);
  console.log('');
  
  process.exit(1);
}

main();
