#!/usr/bin/env node

/**
 * Deep Module Quality Analyzer - PATCH 68.0
 * Performs detailed code quality analysis on all modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULES_DIR = path.join(__dirname, '../src/modules');
const OUTPUT_FILE = path.join(__dirname, '../dev/logs/deep_module_analysis.json');

const analysis = {
  timestamp: new Date().toISOString(),
  modules: [],
  issues: {
    noExports: [],
    highAnyUsage: [],
    tsNoCheck: [],
    emptyOrMinimal: [],
    noTests: [],
    noReferences: [],
    duplicateFunctionality: []
  },
  recommendations: []
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    return {
      lines: lines.length,
      hasExport: /^export /m.test(content),
      hasDefaultExport: /^export default /m.test(content),
      tsNoCheck: content.includes('@ts-nocheck'),
      anyCount: (content.match(/:\s*any\b/g) || []).length,
      anyTypeCount: (content.match(/<any>/g) || []).length,
      importCount: (content.match(/^import /gm) || []).length,
      hasTests: filePath.includes('.test.') || filePath.includes('.spec.'),
      hasLogic: /function |const |let |class |interface |type /.test(content),
      isEmpty: content.trim().length < 50,
    };
  } catch (e) {
    return null;
  }
}

function analyzeModuleDirectory(modulePath, moduleName) {
  const stats = {
    name: moduleName,
    path: modulePath,
    files: [],
    totalLines: 0,
    totalAnyUsage: 0,
    hasTests: false,
    hasTsNoCheck: false,
    hasExports: false,
    isEmpty: true,
    fileCount: 0,
    componentCount: 0,
    score: 0
  };

  try {
    const walk = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const fileAnalysis = analyzeFile(fullPath);
          
          if (fileAnalysis) {
            stats.files.push({
              path: fullPath.replace(modulePath + '/', ''),
              ...fileAnalysis
            });
            
            stats.totalLines += fileAnalysis.lines;
            stats.totalAnyUsage += fileAnalysis.anyCount + fileAnalysis.anyTypeCount;
            stats.hasTests = stats.hasTests || fileAnalysis.hasTests;
            stats.hasTsNoCheck = stats.hasTsNoCheck || fileAnalysis.tsNoCheck;
            stats.hasExports = stats.hasExports || fileAnalysis.hasExport;
            stats.isEmpty = stats.isEmpty && fileAnalysis.isEmpty;
            stats.fileCount++;
            
            if (file.match(/\.tsx$/)) {
              stats.componentCount++;
            }
            
            if (fileAnalysis.hasLogic && !fileAnalysis.isEmpty) {
              stats.isEmpty = false;
            }
          }
        }
      });
    };
    
    walk(modulePath);
    
    // Calculate quality score (0-100)
    let score = 50; // Base score
    
    if (stats.hasTests) score += 20;
    if (stats.hasExports) score += 10;
    if (!stats.hasTsNoCheck) score += 10;
    if (stats.totalAnyUsage === 0) score += 10;
    if (stats.totalLines > 100) score += 5;
    if (stats.fileCount > 3) score += 5;
    if (stats.componentCount > 0) score += 5;
    
    if (stats.isEmpty) score -= 40;
    if (stats.hasTsNoCheck) score -= 15;
    if (stats.totalAnyUsage > 10) score -= 15;
    if (stats.fileCount === 0) score -= 50;
    
    stats.score = Math.max(0, Math.min(100, score));
    
  } catch (error) {
    stats.error = error.message;
    stats.score = 0;
  }
  
  return stats;
}

function findReferences(moduleName) {
  const references = [];
  const searchPaths = ['src'];
  
  const walk = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules' && !fullPath.includes('/modules/' + moduleName)) {
            walk(fullPath);
          }
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasRef = content.includes(`modules/${moduleName}`) || 
                          content.includes(`/${moduleName}/`) ||
                          content.includes(`'${moduleName}'`) ||
                          content.includes(`"${moduleName}"`);
            
            if (hasRef) {
              references.push(fullPath.replace(path.join(__dirname, '..') + '/', ''));
            }
          } catch (e) {
            // Skip
          }
        }
      });
    } catch (e) {
      // Skip
    }
  };
  
  searchPaths.forEach(p => walk(path.join(__dirname, '..', p)));
  return references;
}

console.log('🔍 Deep analysis of modules...\n');

const modules = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

modules.forEach((moduleName, index) => {
  console.log(`[${index + 1}/${modules.length}] Analyzing ${moduleName}...`);
  
  const modulePath = path.join(MODULES_DIR, moduleName);
  const moduleStats = analyzeModuleDirectory(modulePath, moduleName);
  const references = findReferences(moduleName);
  
  moduleStats.references = references.length;
  moduleStats.referencedIn = references.slice(0, 3);
  
  analysis.modules.push(moduleStats);
  
  // Categorize issues
  if (!moduleStats.hasExports && references.length === 0) {
    analysis.issues.noExports.push(moduleName);
  }
  
  if (moduleStats.totalAnyUsage > 5) {
    analysis.issues.highAnyUsage.push({
      module: moduleName,
      count: moduleStats.totalAnyUsage
    });
  }
  
  if (moduleStats.hasTsNoCheck) {
    analysis.issues.tsNoCheck.push(moduleName);
  }
  
  if (moduleStats.fileCount === 0 || moduleStats.isEmpty) {
    analysis.issues.emptyOrMinimal.push(moduleName);
  }
  
  if (!moduleStats.hasTests) {
    analysis.issues.noTests.push(moduleName);
  }
  
  if (references.length === 0) {
    analysis.issues.noReferences.push(moduleName);
  }
});

// Sort by score
analysis.modules.sort((a, b) => a.score - b.score);

// Generate recommendations
const lowQualityModules = analysis.modules.filter(m => m.score < 40);
const unusedModules = analysis.modules.filter(m => m.references === 0 && m.score < 60);

analysis.recommendations = [
  {
    priority: 'HIGH',
    action: 'Review for removal',
    modules: unusedModules.map(m => m.name),
    reason: 'No external references and low quality score'
  },
  {
    priority: 'HIGH',
    action: 'Fix TypeScript issues',
    modules: analysis.issues.tsNoCheck,
    reason: 'Using @ts-nocheck - may hide bugs'
  },
  {
    priority: 'MEDIUM',
    action: 'Reduce any usage',
    modules: analysis.issues.highAnyUsage.map(i => i.module),
    reason: 'High usage of any type - reduces type safety'
  },
  {
    priority: 'MEDIUM',
    action: 'Add tests',
    modules: analysis.issues.noTests,
    reason: 'No test coverage'
  },
  {
    priority: 'LOW',
    action: 'Consider consolidation',
    modules: lowQualityModules.map(m => m.name),
    reason: 'Low quality score - may need refactoring'
  }
];

// Write report
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysis, null, 2));

console.log('\n✅ Deep analysis complete!\n');
console.log('📊 Summary:');
console.log(`   Total modules: ${analysis.modules.length}`);
console.log(`   Low quality (score < 40): ${lowQualityModules.length}`);
console.log(`   Unused modules: ${unusedModules.length}`);
console.log(`   With @ts-nocheck: ${analysis.issues.tsNoCheck.length}`);
console.log(`   Without tests: ${analysis.issues.noTests.length}`);
console.log(`   High any usage: ${analysis.issues.highAnyUsage.length}`);
console.log('\n📝 Report saved to:', OUTPUT_FILE);

// Print top issues
console.log('\n🔴 Lowest Quality Modules:');
analysis.modules.slice(0, 5).forEach(m => {
  console.log(`   ${m.name}: score=${m.score}, refs=${m.references}, files=${m.fileCount}`);
});
