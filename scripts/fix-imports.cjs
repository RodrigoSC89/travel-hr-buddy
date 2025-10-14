#!/usr/bin/env node

const fs = require("fs");
const glob = require("glob");

function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    
    // Pattern 1: "import { \nimport { logger } from "@/lib/logger";\n"
    // Should be: "import { logger } from "@/lib/logger";\nimport {\n"
    const badPattern1 = /import \{ \nimport \{ logger \} from ["']@\/lib\/logger["'];\n/g;
    
    if (badPattern1.test(content)) {
      content = content.replace(badPattern1, 'import { logger } from "@/lib/logger";\nimport {\n');
      modified = true;
    }
    
    // Pattern 2: Duplicate logger imports on consecutive lines
    const badPattern2 = /import \{ logger \} from ["']@\/lib\/logger["'];[\r\n]+import \{ logger \} from ["']@\/lib\/logger["'];/g;
    
    if (badPattern2.test(content)) {
      content = content.replace(badPattern2, 'import { logger } from "@/lib/logger";');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log("🔧 Fixing malformed imports...");
  
  const files = glob.sync("src/**/*.{ts,tsx}");
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixImports(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
}

if (require.main === module) {
  main();
}

module.exports = { fixImports };
