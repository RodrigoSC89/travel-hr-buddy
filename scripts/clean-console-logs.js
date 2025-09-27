#!/usr/bin/env node

/**
 * SCRIPT DE REMOÇÃO DE CONSOLE.LOGS PARA PRODUÇÃO
 * Remove todos os console.log, console.error, etc. dos arquivos
 * Mantém apenas os essenciais para debugging em produção
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Padrões a serem removidos
const consolePatterns = [
  /console\.log\([^)]*\);?\s*$/gm,
  /console\.error\([^)]*\);?\s*$/gm,
  /console\.warn\([^)]*\);?\s*$/gm,
  /console\.info\([^)]*\);?\s*$/gm,
  /console\.debug\([^)]*\);?\s*$/gm,
  /debugger;?\s*$/gm
];

// Padrões críticos que devem ser mantidos
const keepPatterns = [
  /console\.error\(['"]Critical:|Error:/,
  /console\.error\(['"]Security:/,
  /console\.error\(['"]Auth:/
];

function shouldKeepConsole(line) {
  return keepPatterns.some(pattern => pattern.test(line));
}

function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;
    
    const lines = content.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmedLine = line.trim();
      
      // Manter linhas críticas
      if (shouldKeepConsole(trimmedLine)) {
        return true;
      }
      
      // Remover console logs normais
      return !consolePatterns.some(pattern => pattern.test(trimmedLine));
    });
    
    cleanedContent = cleanedLines.join('\n');
    
    if (cleanedContent !== content) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🧹 LIMPEZA DE CONSOLE.LOGS PARA PRODUÇÃO');
  console.log('==========================================');
  
  // Arquivos TypeScript e JavaScript em src/
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
  
  let cleanedCount = 0;
  
  files.forEach(file => {
    if (cleanFile(file)) {
      cleanedCount++;
    }
  });
  
  console.log('\n📊 RESULTADOS:');
  console.log(`- Arquivos processados: ${files.length}`);
  console.log(`- Arquivos limpos: ${cleanedCount}`);
  console.log('\n✅ Limpeza concluída! Sistema pronto para produção.');
}

if (require.main === module) {
  main();
}

module.exports = { cleanFile, main };