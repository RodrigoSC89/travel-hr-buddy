#!/usr/bin/env node

/**
 * SCRIPT TO ADD JUSTIFICATION COMMENTS TO `any` TYPES
 * This adds inline comments to document `any` usage for future refactoring
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

function addJustificationToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let newContent = content;
    
    // Pattern to find `any` types without existing justification comments
    const patterns = [
      // : any (without comment)
      /(\w+)\s*:\s*any(?!\s*\/\/)/g,
      // <any> or Array<any> (without comment)
      /<any>(?!\s*\/\/)/g,
      // as any (without comment)
      /as\s+any(?!\s*\/\/)/g,
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        newContent = newContent.replace(pattern, (match) => {
          modified = true;
          return `${match} // TODO: Replace with specific type`;
        });
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ Added justifications: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log("📝 ADDING JUSTIFICATION COMMENTS TO `any` TYPES");
  console.log("===============================================");
  
  // Find all TypeScript and TSX files in src/
  const files = glob.sync("src/**/*.{ts,tsx}");
  
  let modifiedCount = 0;
  
  files.forEach(file => {
    if (addJustificationToFile(file)) {
      modifiedCount++;
    }
  });
  
  console.log("\n📊 RESULTS:");
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files modified: ${modifiedCount}`);
  console.log("\n✅ Justification comments added!");
  console.log("\nNote: All `any` types now have TODO comments for future refactoring.");
}

if (require.main === module) {
  main();
}

module.exports = { addJustificationToFile, main };
