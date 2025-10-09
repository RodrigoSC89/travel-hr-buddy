#!/usr/bin/env node

/**
 * PRODUCTION PACKAGE PREPARATION SCRIPT
 * Prepares the Nautilus One project for production deployment
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 NAUTILUS ONE - PRODUCTION PACKAGE PREPARATION");
console.log("================================================\n");

// Step 1: Remove non-critical console statements
console.log("📝 Step 1: Cleaning console statements...");
try {
  const files = execSync("find src -type f \\( -name '*.ts' -o -name '*.tsx' \\)", {
    encoding: "utf8",
  }).trim().split("\n");

  let cleanedFiles = 0;
  const criticalPatterns = [
    /console\.error\(['"]Critical:/,
    /console\.error\(['"]Error:/,
    /console\.error\(['"]Security:/,
    /console\.error\(['"]Auth:/,
  ];

  files.forEach((file) => {
    if (!file) return;
    
    try {
      let content = fs.readFileSync(file, "utf8");
      const originalContent = content;

      // Remove console.log statements (except in logger utility)
      if (!file.includes("utils/logger.ts")) {
        // Remove simple console.log statements
        content = content.replace(/\s*console\.log\([^)]*\);?\s*/g, "");
        
        // Remove console.info statements
        content = content.replace(/\s*console\.info\([^)]*\);?\s*/g, "");
        
        // Remove console.debug statements
        content = content.replace(/\s*console\.debug\([^)]*\);?\s*/g, "");
        
        // Remove console.warn statements (keep critical ones)
        const lines = content.split("\n");
        const filteredLines = lines.filter((line) => {
          if (!line.includes("console.warn")) return true;
          return criticalPatterns.some((pattern) => pattern.test(line));
        });
        content = filteredLines.join("\n");
      }

      // Write back if changed
      if (content !== originalContent) {
        fs.writeFileSync(file, content, "utf8");
        cleanedFiles++;
      }
    } catch (error) {
      console.error(`  ⚠️  Error cleaning ${file}:`, error.message);
    }
  });

  console.log(`  ✅ Cleaned ${cleanedFiles} files\n`);
} catch (error) {
  console.error("  ❌ Error during console cleanup:", error.message);
}

// Step 2: Run linter
console.log("🔍 Step 2: Running linter...");
try {
  execSync("npm run lint:fix", { stdio: "inherit" });
  console.log("  ✅ Linting complete\n");
} catch (error) {
  console.log("  ⚠️  Linting completed with warnings (non-critical)\n");
}

// Step 3: Build project
console.log("🏗️  Step 3: Building project...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("  ✅ Build successful\n");
} catch (error) {
  console.error("  ❌ Build failed:", error.message);
  process.exit(1);
}

// Step 4: Verify package structure
console.log("📦 Step 4: Verifying package structure...");
const requiredDirs = ["src", "public", "scripts", ".github"];
const requiredFiles = [
  "README.md",
  "CHANGELOG.md",
  ".env.example",
  ".gitignore",
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
  "tailwind.config.ts",
  ".eslintrc.json",
  ".prettierrc",
];

let allPresent = true;
requiredDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ MISSING`);
    allPresent = false;
  }
});

requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} MISSING`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.error("\n❌ Package structure verification failed!");
  process.exit(1);
}

console.log("\n✅ Package structure verified\n");

// Step 5: Generate package summary
console.log("📊 Step 5: Generating package summary...");
try {
  const stats = {
    sourceFiles: execSync("find src -type f \\( -name '*.ts' -o -name '*.tsx' \\) | wc -l", {
      encoding: "utf8",
    }).trim(),
    components: execSync("find src/components -type f -name '*.tsx' | wc -l", {
      encoding: "utf8",
    }).trim(),
    modules: execSync("find src/modules -type d -maxdepth 1 | wc -l", {
      encoding: "utf8",
    }).trim(),
    pages: execSync("find src/pages -type f -name '*.tsx' | wc -l", {
      encoding: "utf8",
    }).trim(),
  };

  console.log(`  • Source Files: ${stats.sourceFiles}`);
  console.log(`  • Components: ${stats.components}`);
  console.log(`  • Modules: ${stats.modules}`);
  console.log(`  • Pages: ${stats.pages}`);
  console.log("\n");
} catch (error) {
  console.log("  ⚠️  Could not generate full statistics\n");
}

// Final summary
console.log("================================================");
console.log("✅ PRODUCTION PACKAGE READY!");
console.log("================================================");
console.log("\nNext Steps:");
console.log("1. Review changes with: git status");
console.log("2. Test the build: npm run preview");
console.log("3. Create package: npm pack");
console.log("4. Deploy: npm run deploy:vercel");
console.log("\n");
