#!/usr/bin/env node
/**
 * Script para remover @ts-ignore e @ts-nocheck desnecessários
 * 
 * Uso: node scripts/cleanup/remove-ts-ignore.cjs [path]
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
  
  // Remove linhas com @ts-ignore e @ts-nocheck
  const lines = content.split('\n');
  const newLines = [];
  let removedCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Verifica se a linha contém @ts-ignore ou @ts-nocheck
    if (/@ts-ignore|@ts-nocheck/.test(line)) {
      // Se é um comentário standalone, remove a linha inteira
      if (/^\s*\/\/\s*@ts-(ignore|nocheck)/.test(line)) {
        removedCount++;
        continue;
      }
      // Se está inline, remove apenas o comentário
      const cleanedLine = line.replace(/\s*\/\/\s*@ts-(ignore|nocheck).*$/, '');
      if (cleanedLine !== line) {
        removedCount++;
        newLines.push(cleanedLine);
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  if (removedCount > 0) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    return { modified: true, removals: removedCount };
  }
  
  return { skipped: true, reason: 'no ts-ignore found' };
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
console.log(`\n🔧 Removing @ts-ignore and @ts-nocheck from: ${TARGET_DIR}\n`);

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
