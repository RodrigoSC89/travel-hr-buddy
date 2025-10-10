#!/usr/bin/env node

/**
 * SCRIPT TO TRACK ALL TODOs AND FIXMEs
 * Generates a comprehensive TODO_TRACKER.md file
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

function extractTodos(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const todos = [];
    
    lines.forEach((line, index) => {
      const todoMatch = line.match(/(TODO|FIXME):\s*(.+)/i);
      if (todoMatch) {
        todos.push({
          file: filePath,
          line: index + 1,
          type: todoMatch[1].toUpperCase(),
          context: todoMatch[2].trim(),
          fullLine: line.trim()
        });
      }
    });
    
    return todos;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log("🔍 TRACKING TODOs AND FIXMEs");
  console.log("==============================");
  
  // Find all TypeScript and TSX files in src/
  const files = glob.sync("src/**/*.{ts,tsx}");
  
  let allTodos = [];
  
  files.forEach(file => {
    const todos = extractTodos(file);
    allTodos = allTodos.concat(todos);
  });
  
  // Generate markdown content
  let markdown = "# TODO Tracker\n\n";
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `**Total Items:** ${allTodos.length}\n\n`;
  
  // Group by type
  const fixmes = allTodos.filter(t => t.type === "FIXME");
  const todos = allTodos.filter(t => t.type === "TODO");
  
  markdown += `## Summary\n\n`;
  markdown += `- 🔴 **FIXME:** ${fixmes.length} (High Priority)\n`;
  markdown += `- 🟡 **TODO:** ${todos.length} (Normal Priority)\n\n`;
  
  markdown += `---\n\n`;
  
  // FIXMEs section
  if (fixmes.length > 0) {
    markdown += `## 🔴 FIXMEs (High Priority)\n\n`;
    fixmes.forEach((item, index) => {
      markdown += `### ${index + 1}. ${item.context}\n\n`;
      markdown += `- **File:** \`${item.file}\`\n`;
      markdown += `- **Line:** ${item.line}\n`;
      markdown += `- **Code:** \`${item.fullLine}\`\n\n`;
    });
    markdown += `---\n\n`;
  }
  
  // TODOs section
  if (todos.length > 0) {
    markdown += `## 🟡 TODOs (Normal Priority)\n\n`;
    todos.forEach((item, index) => {
      markdown += `### ${index + 1}. ${item.context}\n\n`;
      markdown += `- **File:** \`${item.file}\`\n`;
      markdown += `- **Line:** ${item.line}\n`;
      markdown += `- **Code:** \`${item.fullLine}\`\n\n`;
    });
  }
  
  // Write to file
  const outputPath = path.join(process.cwd(), "TODO_TRACKER.md");
  fs.writeFileSync(outputPath, markdown, "utf8");
  
  console.log("\n📊 RESULTS:");
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- FIXMEs found: ${fixmes.length}`);
  console.log(`- TODOs found: ${todos.length}`);
  console.log(`- Total items: ${allTodos.length}`);
  console.log(`\n✅ TODO_TRACKER.md generated at: ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { extractTodos, main };
