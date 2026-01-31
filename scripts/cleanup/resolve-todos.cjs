#!/usr/bin/env node
/**
 * Script para resolver/remover comentários TODO, PLACEHOLDER, MOCK
 * 
 * Estratégia:
 * - // TODO: implementar -> Remove a linha ou converte para comentário normal
 * - // PLACEHOLDER -> Remove
 * - // MOCK -> Remove (já tratado em outros scripts)
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.argv[2] || path.join(__dirname, '../../src');

// Arquivos a ignorar
const IGNORE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /node_modules/,
  /README\.md$/,
  /\.disabled$/,
];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function processFile(filePath) {
  if (shouldIgnore(filePath)) {
    return { skipped: true, reason: 'ignored pattern' };
  }
  
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return { skipped: true, reason: 'not typescript' };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Padrões para remover
  const patterns = [
    /^\s*\/\/\s*TODO:?\s*implementar.*$/gm,
    /^\s*\/\/\s*TODO:?\s*implement.*$/gm,
    /^\s*\/\/\s*TODO:?\s*add.*$/gm,
    /^\s*\/\/\s*TODO:?\s*fix.*$/gm,
    /^\s*\/\/\s*TODO:?\s*remove.*$/gm,
    /^\s*\/\/\s*PLACEHOLDER.*$/gm,
    /^\s*\/\/\s*MOCK\s*$/gm,
    /^\s*\/\*\s*TODO:?\s*\*\/\s*$/gm,
  ];
  
  let modified = content;
  let removedCount = 0;
  
  for (const pattern of patterns) {
    const matches = modified.match(pattern);
    if (matches) {
      removedCount += matches.length;
      modified = modified.replace(pattern, '');
    }
  }
  
  // Remove linhas vazias consecutivas (mais de 2)
  modified = modified.replace(/\n{3,}/g, '\n\n');
  
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return { modified: true, removals: removedCount };
  }
  
  return { skipped: true, reason: 'no todos found' };
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  }
}

// Executa
console.log(`\n🔧 Resolving TODO/PLACEHOLDER comments in: ${TARGET_DIR}\n`);

let stats = {
  processed: 0,
  modified: 0,
  skipped: 0,
  totalRemovals: 0,
};

walkDir(TARGET_DIR, (filePath) => {
  stats.processed++;
  const result = processFile(filePath);
  
  if (result.modified) {
    stats.modified++;
    stats.totalRemovals += result.removals;
    console.log(`✅ Modified: ${path.relative(TARGET_DIR, filePath)} (${result.removals} removals)`);
  } else {
    stats.skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${stats.processed}`);
console.log(`   Files modified: ${stats.modified}`);
console.log(`   Files skipped: ${stats.skipped}`);
console.log(`   Total removals: ${stats.totalRemovals}`);
console.log(`\n✅ Done!\n`);
