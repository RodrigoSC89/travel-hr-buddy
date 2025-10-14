#!/usr/bin/env node

/**
 * SCRIPT DE SUBSTITUIÇÃO DE CONSOLE.* POR LOGGER
 * Substitui console.log, console.error, console.warn por logger equivalentes
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Padrões de substituição
const replacements = [
  {
    pattern: /console\.log\(/g,
    replacement: "logger.info(",
    loggerMethod: "info"
  },
  {
    pattern: /console\.error\(/g,
    replacement: "logger.error(",
    loggerMethod: "error"
  },
  {
    pattern: /console\.warn\(/g,
    replacement: "logger.warn(",
    loggerMethod: "warn"
  },
  {
    pattern: /console\.info\(/g,
    replacement: "logger.info(",
    loggerMethod: "info"
  },
  {
    pattern: /console\.debug\(/g,
    replacement: "logger.debug(",
    loggerMethod: "debug"
  }
];

function needsLoggerImport(content) {
  return /logger\.(info|error|warn|debug)/.test(content) && 
         !/import.*logger.*from.*["']@\/lib\/logger["']/.test(content) &&
         !/from.*["'].*\/lib\/logger["']/.test(content);
}

function addLoggerImport(content, filePath) {
  // Check if file already has imports
  const hasImports = /^import\s/m.test(content);
  
  if (!hasImports) {
    // No imports, add at the beginning
    return `import { logger } from "@/lib/logger";\n\n${content}`;
  }
  
  // Find the last import statement
  const lines = content.split("\n");
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) {
      lastImportIndex = i;
    } else if (lastImportIndex !== -1 && lines[i].trim() !== "") {
      break;
    }
  }
  
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, 'import { logger } from "@/lib/logger";');
    return lines.join("\n");
  }
  
  return `import { logger } from "@/lib/logger";\n\n${content}`;
}

function replaceConsoleInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    
    // Skip if it's the logger file itself
    if (filePath.includes("lib/logger.ts") || filePath.includes("lib\\logger.ts")) {
      return false;
    }
    
    // Skip test files for now (they often use console for test output)
    if (filePath.includes("/tests/") || filePath.includes("\\tests\\") || 
        filePath.includes(".test.") || filePath.includes(".spec.")) {
      return false;
    }
    
    // Apply replacements
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }
    
    // Add logger import if needed
    if (modified && needsLoggerImport(content)) {
      content = addLoggerImport(content, filePath);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log("🔄 SUBSTITUIÇÃO DE CONSOLE.* POR LOGGER");
  console.log("==========================================");
  
  // Process TypeScript and JavaScript files in src/
  const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/tests/**", "**/*.test.*", "**/*.spec.*"]
  });
  
  let modifiedCount = 0;
  
  files.forEach(file => {
    if (replaceConsoleInFile(file)) {
      console.log(`✅ Modified: ${file}`);
      modifiedCount++;
    }
  });
  
  console.log("\n📊 RESULTADOS:");
  console.log(`- Arquivos processados: ${files.length}`);
  console.log(`- Arquivos modificados: ${modifiedCount}`);
  console.log("\n✅ Substituição concluída!");
}

if (require.main === module) {
  main();
}

module.exports = { replaceConsoleInFile, main };
