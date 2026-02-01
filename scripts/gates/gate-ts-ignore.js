#!/usr/bin/env node
/**
 * GATE D — NO @ts-ignore/@ts-nocheck IN PRODUCTION
 * Blocks TypeScript suppression comments in production code
 * 
 * Usage: node scripts/gates/gate-ts-ignore.js [--staged]
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
];

const TS_IGNORE_PATTERNS = [
  { pattern: /@ts-ignore/, name: '@ts-ignore' },
  { pattern: /@ts-nocheck/, name: '@ts-nocheck' },
  { pattern: /@ts-expect-error/, name: '@ts-expect-error' },
];

// Colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function isProductionFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  const inProductionPath = PRODUCTION_PATHS.some(p => normalizedPath.includes(p));
  if (!inProductionPath) return false;
  
  const isExcluded = EXCLUDED_PATTERNS.some(pattern => pattern.test(normalizedPath));
  return !isExcluded;
}

function findViolations(filePath, content) {
  const violations = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    TS_IGNORE_PATTERNS.forEach(({ pattern, name }) => {
      if (pattern.test(line)) {
        // Check if it has TECHDEBT annotation (allowed temporarily)
        if (line.includes('TECHDEBT:') && line.includes('<ticket>')) {
          return; // Skip documented tech debt
        }
        
        violations.push({
          file: filePath,
          line: index + 1,
          content: line.trim().substring(0, 100),
          type: name
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
    
    if (item === 'node_modules' || item === 'dist' || item === '.git') continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getStagedFiles() {
  try {
    const result = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return result.split('\n').filter(f => f && /\.(ts|tsx)$/.test(f));
  } catch {
    return [];
  }
}

function main() {
  const isStaged = process.argv.includes('--staged');
  const baseDir = process.cwd();
  
  console.log(`\n${BOLD}${CYAN}🔍 GATE D — NO @ts-ignore IN PRODUCTION${RESET}\n`);
  
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
    console.log(`${GREEN}✅ No @ts-ignore violations found!${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${RED}${BOLD}❌ Found ${allViolations.length} @ts-ignore violations:${RESET}\n`);
  
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
      console.log(`   ${RED}Line ${v.line} (${v.type}):${RESET} ${v.content}`);
    });
    console.log('');
  });
  
  console.log(`${CYAN}💡 Fix options:${RESET}`);
  console.log(`   1. Create proper TypeScript interfaces/types`);
  console.log(`   2. Use type guards for runtime checks`);
  console.log(`   3. Fix the underlying type error`);
  console.log(`   4. If truly unavoidable, document with:`);
  console.log(`      // @ts-ignore TECHDEBT:<ticket> <reason> <deadline>`);
  console.log('');
  
  process.exit(1);
}

main();
