#!/usr/bin/env node
/**
 * Script para corrigir imports quebrados pelo script de logger
 * 
 * Problema: O script anterior adicionou "import { logger }" no meio de imports multilinha
 * 
 * Padrão a corrigir:
 * import {
 * import { logger } from '@/lib/logger';
 *   SomeComponent,
 * 
 * Deve se tornar:
 * import { logger } from '@/lib/logger';
 * import {
 *   SomeComponent,
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.argv[2] || path.join(__dirname, '../../src');

// Regex para encontrar os padrões quebrados
const BROKEN_PATTERNS = [
  {
    pattern: /import\s*\{\s*\n\s*import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"];?\n/g,
    replacement: "import { logger } from '@/lib/logger';\nimport {\n"
  },
  {
    pattern: /import\s+type\s*\{\s*\n\s*import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"];?\n/g,
    replacement: "import { logger } from '@/lib/logger';\nimport type {\n"
  }
];

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return { skipped: true };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let wasModified = false;
  
  for (const { pattern, replacement } of BROKEN_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(modified)) {
      pattern.lastIndex = 0;
      modified = modified.replace(pattern, replacement);
      wasModified = true;
    }
  }
  
  if (wasModified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return { modified: true };
  }
  
  return { skipped: true };
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        walkDir(filePath, callback);
      } else if (stat.isFile()) {
        callback(filePath);
      }
    } catch (e) {
      // Ignore errors
    }
  }
}

// Executa
console.log(`\n🔧 Fixing broken logger imports in: ${TARGET_DIR}\n`);

let stats = {
  processed: 0,
  modified: 0,
  skipped: 0,
};

walkDir(TARGET_DIR, (filePath) => {
  stats.processed++;
  const result = processFile(filePath);
  
  if (result.modified) {
    stats.modified++;
    console.log(`✅ Fixed: ${path.relative(TARGET_DIR, filePath)}`);
  } else {
    stats.skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${stats.processed}`);
console.log(`   Files fixed: ${stats.modified}`);
console.log(`   Files skipped: ${stats.skipped}`);
console.log(`\n✅ Done!\n`);
