#!/usr/bin/env node
/**
 * GATE E — LIMIT ANY IN CRITICAL PATHS
 * Blocks 'any' type in hooks, services, lib, and Edge Functions
 * 
 * Usage: node scripts/gates/gate-any.js [--staged]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration - CRITICAL paths where any is strictly forbidden
const CRITICAL_PATHS = [
  'src/hooks',
  'src/services',
  'src/lib',
  'src/core',
  'supabase/functions'
];

const EXCLUDED_PATTERNS = [
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /[\\/]tests[\\/]/,
  /[\\/]__tests__[\\/]/,
  /[\\/]e2e[\\/]/,
  /\.d\.ts$/,
];

// Patterns that indicate use of 'any'
const ANY_PATTERNS = [
  { pattern: /:\s*any\b/, name: 'Type annotation :any' },
  { pattern: /<any>/, name: 'Generic <any>' },
  { pattern: /as\s+any\b/, name: 'Type assertion as any' },
  { pattern: /:\s*any\[\]/, name: 'Array type any[]' },
  { pattern: /Record<string,\s*any>/, name: 'Record<string, any>' },
  { pattern: /Promise<any>/, name: 'Promise<any>' },
];

// Colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function isCriticalFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  const inCriticalPath = CRITICAL_PATHS.some(p => normalizedPath.includes(p));
  if (!inCriticalPath) return false;
  
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
    
    ANY_PATTERNS.forEach(({ pattern, name }) => {
      if (pattern.test(line)) {
        // Check if it has TECHDEBT annotation (allowed temporarily)
        const prevLine = lines[index - 1] || '';
        if (prevLine.includes('TECHDEBT:ANY') || line.includes('TECHDEBT:ANY')) {
          return; // Skip documented tech debt
        }
        
        // Skip if it's a function parameter with explicit any for external libs
        if (line.includes('// eslint-disable-next-line')) return;
        
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
  
  console.log(`\n${BOLD}${CYAN}🔍 GATE E — LIMIT ANY IN CRITICAL PATHS${RESET}\n`);
  
  let files;
  if (isStaged) {
    files = getStagedFiles().map(f => path.join(baseDir, f));
    console.log(`Scanning ${files.length} staged files...\n`);
  } else {
    files = [];
    CRITICAL_PATHS.forEach(p => {
      getAllFiles(path.join(baseDir, p), files);
    });
    console.log(`Scanning ${files.length} critical files...\n`);
  }
  
  const allViolations = [];
  
  for (const file of files) {
    if (!isCriticalFile(file)) continue;
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf8');
    const violations = findViolations(file, content);
    allViolations.push(...violations);
  }
  
  if (allViolations.length === 0) {
    console.log(`${GREEN}✅ No 'any' violations in critical paths!${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${RED}${BOLD}❌ Found ${allViolations.length} 'any' violations in critical paths:${RESET}\n`);
  
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
  
  console.log(`${CYAN}💡 Fix: Replace 'any' with specific types${RESET}`);
  console.log(`   - Use 'unknown' + type guards for truly unknown types`);
  console.log(`   - Create interfaces for API responses`);
  console.log(`   - Use Record<string, unknown> instead of any`);
  console.log(`   - If unavoidable, document:`);
  console.log(`     // TECHDEBT:ANY <ticket> <reason> <deadline>`);
  console.log('');
  
  process.exit(1);
}

main();
