/**
 * Fix Imports Script
 * 
 * Replaces React.lazy() with safeLazyImport() in all page files
 * This ensures consistent lazy loading with error handling across the application
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.resolve(__dirname, "../pages");

function fixImports(dir) {
  let fixedCount = 0;

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixedCount += fixImports(fullPath);
    } else if (file.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      let modified = false;

      // Check if file uses React.lazy
      if (content.includes("React.lazy")) {
        // Add safeLazyImport import if not present
        if (!content.includes("safeLazyImport")) {
          // Find the import section
          const importMatch = content.match(/^import.*from.*$/m);
          if (importMatch) {
            const insertPosition = content.indexOf(importMatch[0]) + importMatch[0].length;
            content =
              content.slice(0, insertPosition) +
              '\nimport { safeLazyImport } from "@/utils/safeLazyImport";' +
              content.slice(insertPosition);
            modified = true;
          }
        }

        // Replace React.lazy with safeLazyImport
        const reactLazyPattern = /React\.lazy\(/g;
        if (reactLazyPattern.test(content)) {
          content = content.replace(reactLazyPattern, "safeLazyImport(");
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, content);
          console.log(`✅ Corrigido: ${fullPath}`);
          fixedCount++;
        }
      }
    }
  }

  return fixedCount;
}

console.log("🔧 Iniciando correção de imports...\n");
const count = fixImports(pagesDir);
console.log(`\n✅ Total de arquivos corrigidos: ${count}`);
