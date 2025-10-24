#!/usr/bin/env node

/**
 * Module Duplicate Analyzer - PATCH 68.0
 * Analyzes /src/modules/ for duplicate or overlapping functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULES_DIR = path.join(__dirname, '../src/modules');
const OUTPUT_FILE = path.join(__dirname, '../dev/logs/duplicated_modules_analysis.json');

// Known duplicate patterns
const DUPLICATE_PATTERNS = [
  { pattern: ['fleet', 'vessel-control'], category: 'operations' },
  { pattern: ['crew', 'crew-management'], category: 'operations' },
  { pattern: ['logger', 'logs-engine'], category: 'monitoring' },
  { pattern: ['audit-center', 'compliance-audit'], category: 'compliance' },
];

const analysis = {
  timestamp: new Date().toISOString(),
  totalModulesFound: 0,
  targetModuleCount: 39,
  duplicatesDetected: [],
  modulesToRemove: [],
  modulesToKeep: [],
  modulesToConsolidate: [],
  summary: {
    hasTests: [],
    noTests: [],
    hasTypeErrors: [],
    lowQuality: [],
    activelyUsed: [],
  }
};

function analyzeDirectory(dirPath) {
  const stats = {
    path: dirPath,
    name: path.basename(dirPath),
    fileCount: 0,
    hasTests: false,
    hasTypeErrors: false,
    hasAnyUsage: false,
    hasTsNoCheck: false,
    hasExports: false,
    importsCount: 0,
    complexity: 0,
  };

  try {
    const files = fs.readdirSync(dirPath, { recursive: true });
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      
      if (fs.statSync(fullPath).isFile()) {
        stats.fileCount++;
        
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for test indicators
        if (file.includes('.test.') || file.includes('.spec.')) {
          stats.hasTests = true;
        }
        
        // Check for @ts-nocheck
        if (content.includes('@ts-nocheck')) {
          stats.hasTsNoCheck = true;
        }
        
        // Check for exports
        if (content.includes('export ')) {
          stats.hasExports = true;
        }
        
        // Check for any usage
        if (content.includes(': any') || content.includes('any>')) {
          stats.hasAnyUsage = true;
        }
        
        // Count imports
        const importMatches = content.match(/^import /gm);
        if (importMatches) {
          stats.importsCount += importMatches.length;
        }
      }
    });
    
    // Calculate complexity score
    stats.complexity = stats.fileCount * 2 + stats.importsCount;
    
  } catch (error) {
    stats.error = error.message;
  }
  
  return stats;
}

function findModuleReferences(moduleName) {
  const references = [];
  const searchDirs = ['src'];
  
  function searchInDir(dir) {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          if (!file.name.startsWith('.') && file.name !== 'node_modules') {
            searchInDir(fullPath);
          }
        } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(`modules/${moduleName}`) || 
                content.includes(`'${moduleName}'`) ||
                content.includes(`"${moduleName}"`)) {
              references.push(fullPath);
            }
          } catch (e) {
            // Skip unreadable files
          }
        }
      });
    } catch (e) {
      // Skip unreadable directories
    }
  }
  
  searchDirs.forEach(dir => searchInDir(path.join(__dirname, '..', dir)));
  return references;
}

function analyzeModules() {
  console.log('🔍 Analyzing modules in:', MODULES_DIR);
  
  const modules = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  analysis.totalModulesFound = modules.length;
  console.log(`📊 Found ${modules.length} modules (target: 39)`);
  
  // Analyze each module
  modules.forEach(moduleName => {
    const modulePath = path.join(MODULES_DIR, moduleName);
    const stats = analyzeDirectory(modulePath);
    const references = findModuleReferences(moduleName);
    
    const moduleInfo = {
      name: moduleName,
      ...stats,
      references: references.length,
      referencedIn: references.slice(0, 5), // Sample of references
    };
    
    // Categorize modules
    if (stats.hasTests) {
      analysis.summary.hasTests.push(moduleName);
    } else {
      analysis.summary.noTests.push(moduleName);
    }
    
    if (stats.hasTsNoCheck || (stats.hasAnyUsage && stats.fileCount < 3)) {
      analysis.summary.lowQuality.push(moduleName);
    }
    
    if (references.length > 0) {
      analysis.summary.activelyUsed.push(moduleName);
    }
    
    // Decide whether to keep or remove
    if (stats.fileCount === 0 || (!stats.hasExports && references.length === 0)) {
      analysis.modulesToRemove.push({
        module: moduleName,
        reason: 'Empty or no exports and no references',
        confidence: 'high',
      });
    } else if (stats.hasTsNoCheck && !stats.hasTests && references.length === 0) {
      analysis.modulesToRemove.push({
        module: moduleName,
        reason: 'Has @ts-nocheck, no tests, and not used',
        confidence: 'high',
      });
    } else if (stats.hasTests || references.length > 3 || stats.complexity > 20) {
      analysis.modulesToKeep.push({
        module: moduleName,
        reason: `Tests: ${stats.hasTests}, References: ${references.length}, Complexity: ${stats.complexity}`,
        confidence: 'high',
      });
    } else if (references.length === 0 && stats.fileCount < 3) {
      analysis.modulesToRemove.push({
        module: moduleName,
        reason: 'Small module with no references',
        confidence: 'medium',
      });
    }
  });
  
  // Detect known duplicates
  DUPLICATE_PATTERNS.forEach(({ pattern, category }) => {
    const found = pattern.filter(p => modules.includes(p));
    if (found.length > 1) {
      analysis.duplicatesDetected.push({
        modules: found,
        category,
        suggestion: `Consider consolidating these into one module`,
      });
    }
  });
  
  // Generate recommendations
  analysis.recommendations = [
    `Remove ${analysis.modulesToRemove.length} unused/low-quality modules`,
    `Keep ${analysis.modulesToKeep.length} active modules with tests/references`,
    `Review ${analysis.duplicatesDetected.length} potential duplicates`,
    `Current: ${modules.length} → Target: 39 modules`,
  ];
  
  return analysis;
}

// Run analysis
try {
  const result = analyzeModules();
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log('\n✅ Analysis complete!');
  console.log(`📝 Report saved to: ${OUTPUT_FILE}`);
  console.log('\n📊 Summary:');
  console.log(`   Total modules: ${result.totalModulesFound}`);
  console.log(`   To remove: ${result.modulesToRemove.length}`);
  console.log(`   To keep: ${result.modulesToKeep.length}`);
  console.log(`   Duplicates detected: ${result.duplicatesDetected.length}`);
  console.log(`   Modules with tests: ${result.summary.hasTests.length}`);
  console.log(`   Actively used: ${result.summary.activelyUsed.length}`);
  
} catch (error) {
  console.error('❌ Error during analysis:', error);
  process.exit(1);
}
