#!/usr/bin/env node
/**
 * GATE B — NO MOCK DATA IN PRODUCTION
 * Blocks MOCK_, SAMPLE_, FAKE_, DUMMY_ and hardcoded mock data
 * 
 * Usage: node scripts/gates/gate-mocks.js [--staged]
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
  /[\\/]__mocks__[\\/]/,
  // Allowed mock files
  /mockData\.ts$/,
  /mock-data\.ts$/,
];

const MOCK_PATTERNS = [
  { pattern: /\bMOCK_[A-Z_]+\b/, name: 'MOCK_ constant' },
  { pattern: /\bSAMPLE_[A-Z_]+\b/, name: 'SAMPLE_ constant' },
  { pattern: /\bFAKE_[A-Z_]+\b/, name: 'FAKE_ constant' },
  { pattern: /\bDUMMY_[A-Z_]+\b/, name: 'DUMMY_ constant' },
  { pattern: /\bmockData\b/, name: 'mockData variable' },
  { pattern: /\bsampleData\b/, name: 'sampleData variable' },
  { pattern: /\bfakeData\b/, name: 'fakeData variable' },
  { pattern: /\bdummyData\b/, name: 'dummyData variable' },
  { pattern: /getMock[A-Z]\w*\(/, name: 'getMock* function call' },
  { pattern: /\/\/\s*TODO:\s*replace\s+with\s+real/i, name: 'TODO: replace with real' },
  { pattern: /\/\/\s*FIXME:\s*mock/i, name: 'FIXME: mock' },
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
    // Skip pure comments explaining why something exists
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') && !MOCK_PATTERNS.some(p => p.pattern.test(line))) return;
    
    MOCK_PATTERNS.forEach(({ pattern, name }) => {
      if (pattern.test(line)) {
        // Skip if it's @deprecated annotation
        if (line.includes('@deprecated')) return;
        
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
  
  console.log(`\n${BOLD}${CYAN}🔍 GATE B — NO MOCK DATA IN PRODUCTION${RESET}\n`);
  
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
    console.log(`${GREEN}✅ No mock data violations found!${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${RED}${BOLD}❌ Found ${allViolations.length} mock data violations:${RESET}\n`);
  
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
  
  console.log(`${CYAN}💡 Fix: Replace mock data with real Supabase queries${RESET}`);
  console.log(`   Example: const { data } = useQuery({ queryKey: ['entities'], queryFn: fetchEntities });`);
  console.log('');
  
  process.exit(1);
}

main();
