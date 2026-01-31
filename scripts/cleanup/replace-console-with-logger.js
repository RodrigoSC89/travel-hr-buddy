#!/usr/bin/env node
/**
 * Script para substituir console.* por logger.* em arquivos TypeScript
 * 
 * Uso: node scripts/cleanup/replace-console-with-logger.js [path]
 * 
 * REGRAS:
 * - console.log -> logger.debug (para logs de desenvolvimento)
 * - console.error -> logger.error
 * - console.warn -> logger.warn
 * - console.debug -> logger.debug
 * - console.info -> logger.info
 * 
 * IGNORA:
 * - Arquivos de teste (*.test.*, *.spec.*, __tests__/)
 * - Arquivos em node_modules/
 * - O próprio arquivo de logger
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
  /logger\.ts$/,
  /logger\.unified\.ts$/,
  /production-logger\.ts$/,
];

// Mapeamento de substituição
const REPLACEMENTS = [
  { from: /console\.log\(/g, to: 'logger.debug(' },
  { from: /console\.error\(/g, to: 'logger.error(' },
  { from: /console\.warn\(/g, to: 'logger.warn(' },
  { from: /console\.debug\(/g, to: 'logger.debug(' },
  { from: /console\.info\(/g, to: 'logger.info(' },
];

// Import statement para adicionar
const LOGGER_IMPORT = "import { logger } from '@/lib/logger';";
const LOGGER_IMPORT_ALT = "import { Logger } from '@/lib/utils/logger';";

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function hasLoggerImport(content) {
  return content.includes("from '@/lib/logger'") || 
         content.includes("from '@/lib/utils/logger'") ||
         content.includes('from "@/lib/logger"') ||
         content.includes('from "@/lib/utils/logger"');
}

function addLoggerImport(content) {
  // Encontra a última linha de import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].match(/^import\s*{/)) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex === -1) {
    // Se não há imports, adiciona no início
    return LOGGER_IMPORT + '\n\n' + content;
  }
  
  // Adiciona após o último import
  lines.splice(lastImportIndex + 1, 0, LOGGER_IMPORT);
  return lines.join('\n');
}

function processFile(filePath) {
  if (shouldIgnore(filePath)) {
    return { skipped: true, reason: 'ignored pattern' };
  }
  
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return { skipped: true, reason: 'not typescript' };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasConsole = /console\.(log|error|warn|debug|info)\(/g.test(content);
  
  if (!hasConsole) {
    return { skipped: true, reason: 'no console statements' };
  }
  
  let modified = content;
  let replacementCount = 0;
  
  // Aplica substituições
  for (const { from, to } of REPLACEMENTS) {
    const matches = modified.match(from);
    if (matches) {
      replacementCount += matches.length;
      modified = modified.replace(from, to);
    }
  }
  
  // Adiciona import do logger se necessário
  if (replacementCount > 0 && !hasLoggerImport(modified)) {
    modified = addLoggerImport(modified);
  }
  
  // Salva o arquivo
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return { modified: true, replacements: replacementCount };
  }
  
  return { skipped: true, reason: 'no changes needed' };
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
console.log(`\n🔧 Replacing console.* with logger.* in: ${TARGET_DIR}\n`);

let stats = {
  processed: 0,
  modified: 0,
  skipped: 0,
  totalReplacements: 0,
};

walkDir(TARGET_DIR, (filePath) => {
  stats.processed++;
  const result = processFile(filePath);
  
  if (result.modified) {
    stats.modified++;
    stats.totalReplacements += result.replacements;
    console.log(`✅ Modified: ${path.relative(TARGET_DIR, filePath)} (${result.replacements} replacements)`);
  } else {
    stats.skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${stats.processed}`);
console.log(`   Files modified: ${stats.modified}`);
console.log(`   Files skipped: ${stats.skipped}`);
console.log(`   Total replacements: ${stats.totalReplacements}`);
console.log(`\n✅ Done!\n`);
