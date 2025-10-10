#!/usr/bin/env node

/**
 * SCRIPT TO FIX EMPTY FINALLY BLOCKS
 * Adds comments to empty finally blocks to satisfy ESLint
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

function fixEmptyFinallyBlocks(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let newContent = content;
    
    // Pattern to match empty finally blocks
    const patterns = [
      /finally\s*\{\s*\}/g,
      /finally\s*\{[\s\n]*\}/g
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, (match) => {
          modified = true;
          return `finally {\n      // Cleanup - no action needed\n    }`;
        });
        pattern.lastIndex = 0;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log("🔧 FIXING EMPTY FINALLY BLOCKS");
  console.log("===============================");
  
  // Find all TypeScript and TSX files in src/
  const files = glob.sync("src/**/*.{ts,tsx}");
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixEmptyFinallyBlocks(file)) {
      fixedCount++;
    }
  });
  
  console.log("\n📊 RESULTS:");
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files fixed: ${fixedCount}`);
  console.log("\n✅ Empty finally blocks fixed!");
}

if (require.main === module) {
  main();
}

module.exports = { fixEmptyFinallyBlocks, main };
