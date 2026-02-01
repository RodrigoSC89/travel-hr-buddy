#!/usr/bin/env node
/**
 * GATE C — NO FAKE API IN PRODUCTION
 * Blocks Promise.resolve(fake), setTimeout(resolve), fake fallbacks
 * 
 * Usage: node scripts/gates/gate-fake-api.js [--staged]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PRODUCTION_PATHS = [
  'src',
  'supabase/functions'
];

const EXCLUDED_PATTERNS = [
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
  /[\\/]tests[\\/]/,
  /[\\/]__tests__[\\/]/,
  /[\\/]e2e[\\/]/,
  /[\\/]mocks[\\/]/,
  /[\\/]fixtures[\\/]/,
];

const FAKE_API_PATTERNS = [
  { pattern: /return\s+Promise\.resolve\s*\(/, name: 'Promise.resolve() fake return' },
  { pattern: /Promise\.resolve\s*\(\s*\[/, name: 'Promise.resolve([...]) fake array' },
  { pattern: /Promise\.resolve\s*\(\s*\{/, name: 'Promise.resolve({...}) fake object' },
  { pattern: /setTimeout\s*\([^)]*resolve/, name: 'setTimeout with resolve (fake delay)' },
  { pattern: /new\s+Promise\s*\(\s*\(\s*resolve\s*\)\s*=>\s*setTimeout/, name: 'new Promise with setTimeout' },
  { pattern: /await\s+new\s+Promise\s*\(\s*r\s*=>\s*setTimeout/, name: 'await fake delay' },
  { pattern: /\/\/\s*fake\s+(api|response|data)/i, name: 'Comment indicating fake API' },
  { pattern: /\/\/\s*simul(at|e)/i, name: 'Simulated response comment' },
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
    FAKE_API_PATTERNS.forEach(({ pattern, name }) => {
      if (pattern.test(line)) {
        // Skip if it's in a catch block for error handling
        if (line.includes('catch') && line.includes('Promise.resolve')) return;
        // Skip if it's a legitimate Promise chain
        if (line.includes('.then(') && line.includes('Promise.resolve')) return;
        
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
  
  console.log(`\n${BOLD}${CYAN}🔍 GATE C — NO FAKE API IN PRODUCTION${RESET}\n`);
  
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
    console.log(`${GREEN}✅ No fake API violations found!${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${RED}${BOLD}❌ Found ${allViolations.length} fake API violations:${RESET}\n`);
  
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
  
  console.log(`${CYAN}💡 Fix: Replace fake APIs with real Supabase calls${RESET}`);
  console.log(`   - Use supabase.from('table').select() for data`);
  console.log(`   - Use Edge Functions for complex operations`);
  console.log(`   - If external API unavailable, show "Service unavailable" in UI`);
  console.log('');
  
  process.exit(1);
}

main();
