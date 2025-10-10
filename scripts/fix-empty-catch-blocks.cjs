#!/usr/bin/env node

/**
 * SCRIPT TO FIX EMPTY CATCH BLOCKS
 * Adds proper error handling to all empty catch blocks
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

function fixEmptyCatchBlocks(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let newContent = content;
    
    // Pattern to match empty catch blocks with various whitespace configurations
    // Matches: catch { }, catch (err) { }, catch (error) { }, etc.
    const patterns = [
      // catch { } or catch (e) { }
      /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g,
      // catch with only whitespace/newlines
      /catch\s*(?:\(([^)]*)\))?\s*\{[\s\n]*\}/g
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, (match) => {
          modified = true;
          // Extract the error parameter if it exists, otherwise use 'err'
          const paramMatch = match.match(/catch\s*\(([^)]*)\)/);
          const errorParam = paramMatch && paramMatch[1] ? paramMatch[1].trim() : 'err';
          
          return `catch (${errorParam}) {\n    console.warn('[EMPTY CATCH]', ${errorParam});\n  }`;
        });
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
  console.log("🔧 FIXING EMPTY CATCH BLOCKS");
  console.log("==============================");
  
  // Find all TypeScript and TSX files in src/
  const files = glob.sync("src/**/*.{ts,tsx}");
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixEmptyCatchBlocks(file)) {
      fixedCount++;
    }
  });
  
  console.log("\n📊 RESULTS:");
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files fixed: ${fixedCount}`);
  console.log("\n✅ Empty catch blocks fixed!");
}

if (require.main === module) {
  main();
}

module.exports = { fixEmptyCatchBlocks, main };
