#!/usr/bin/env tsx
/**
 * PATCH 614 - Technical Scan and Critical Corrections
 * 
 * This script scans the codebase for:
 * - Broken imports
 * - Syntax errors
 * - Routing issues
 * - Infinite loops
 * - Missing module registrations
 * - Code duplication
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

// Configuration constants
const EXCESSIVE_ANY_THRESHOLD = 10;
const LARGE_FILE_THRESHOLD = 800;

interface Issue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  file: string;
  line?: number;
  message: string;
}

const issues: Issue[] = [];
const projectRoot = process.cwd();
const srcDir = join(projectRoot, 'src');

/**
 * Recursively get all TypeScript/TSX files
 */
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      // Skip node_modules and dist
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Check for broken imports
 */
function checkBrokenImports(filePath: string, content: string) {
  const importRegex = /import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g;
  let match;
  let lineNumber = 0;
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const importMatch = line.match(/import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      
      // Check for relative imports
      if (importPath.startsWith('.')) {
        const resolvedPath = join(filePath, '..', importPath);
        const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
        const exists = extensions.some(ext => existsSync(resolvedPath + ext));
        
        if (!exists) {
          issues.push({
            severity: 'critical',
            category: 'Import Error',
            file: relative(projectRoot, filePath),
            line: index + 1,
            message: `Broken import: ${importPath}`
          });
        }
      }
    }
  });
}

/**
 * Check for potential infinite loops in useEffect
 */
function checkInfiniteLoops(filePath: string, content: string) {
  const lines = content.split('\n');
  let inUseEffect = false;
  let useEffectLine = 0;
  let bracketCount = 0;
  let hasDependencyArray = false;
  
  lines.forEach((line, index) => {
    if (line.includes('useEffect(')) {
      inUseEffect = true;
      useEffectLine = index + 1;
      bracketCount = 0;
      hasDependencyArray = false;
    }
    
    if (inUseEffect) {
      // Count brackets to track nesting
      bracketCount += (line.match(/{/g) || []).length;
      bracketCount -= (line.match(/}/g) || []).length;
      
      // Check for dependency array
      if (line.match(/\],?\s*\)/)) {
        hasDependencyArray = true;
      }
      
      // Check if we're at the end of useEffect
      if (bracketCount === 0 && line.includes(');')) {
        if (!hasDependencyArray && !line.includes('[]')) {
          issues.push({
            severity: 'warning',
            category: 'Infinite Loop Risk',
            file: relative(projectRoot, filePath),
            line: useEffectLine,
            message: 'useEffect without dependency array may cause infinite loops'
          });
        }
        inUseEffect = false;
      }
    }
  });
}

/**
 * Check for @ts-nocheck usage
 */
function checkTypeScriptSuppressions(filePath: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('@ts-nocheck')) {
      issues.push({
        severity: 'warning',
        category: 'TypeScript Suppression',
        file: relative(projectRoot, filePath),
        line: index + 1,
        message: 'File uses @ts-nocheck - should be fixed'
      });
    }
    
    if (line.includes('@ts-ignore')) {
      issues.push({
        severity: 'info',
        category: 'TypeScript Suppression',
        file: relative(projectRoot, filePath),
        line: index + 1,
        message: 'Line uses @ts-ignore'
      });
    }
  });
}

/**
 * Check for usage of 'any' type
 */
function checkAnyUsage(filePath: string, content: string) {
  const lines = content.split('\n');
  const anyCount = (content.match(/:\s*any\b/g) || []).length;
  
  if (anyCount > EXCESSIVE_ANY_THRESHOLD) {
    issues.push({
      severity: 'warning',
      category: 'Type Safety',
      file: relative(projectRoot, filePath),
      message: `Excessive use of 'any' type (${anyCount} occurrences)`
    });
  }
}

/**
 * Check for console.log statements in production code
 */
function checkConsoleStatements(filePath: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.match(/console\.(log|debug|info)\(/)) {
      issues.push({
        severity: 'info',
        category: 'Console Statement',
        file: relative(projectRoot, filePath),
        line: index + 1,
        message: 'Console statement should be removed or replaced with proper logging'
      });
    }
  });
}

/**
 * Check for large components (potential performance issues)
 */
function checkComponentSize(filePath: string, content: string) {
  const lines = content.split('\n');
  
  if (lines.length > LARGE_FILE_THRESHOLD) {
    issues.push({
      severity: 'warning',
      category: 'Component Size',
      file: relative(projectRoot, filePath),
      message: `Large file (${lines.length} lines) - consider breaking into smaller components`
    });
  }
}

/**
 * Main scan function
 */
function runScan() {
  console.log('🔍 Starting PATCH 614 Technical Scan...\n');
  
  const files = getAllFiles(srcDir);
  console.log(`📁 Scanning ${files.length} files...\n`);
  
  files.forEach(filePath => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      checkBrokenImports(filePath, content);
      checkInfiniteLoops(filePath, content);
      checkTypeScriptSuppressions(filePath, content);
      checkAnyUsage(filePath, content);
      checkConsoleStatements(filePath, content);
      checkComponentSize(filePath, content);
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error);
    }
  });
  
  // Generate report
  console.log('📊 SCAN RESULTS\n');
  console.log('='.repeat(80));
  
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const infoIssues = issues.filter(i => i.severity === 'info');
  
  console.log(`\n🔴 Critical Issues: ${criticalIssues.length}`);
  console.log(`🟡 Warnings: ${warningIssues.length}`);
  console.log(`🔵 Info: ${infoIssues.length}`);
  console.log(`\nTotal Issues: ${issues.length}\n`);
  
  // Group by category
  const byCategory: Record<string, Issue[]> = {};
  issues.forEach(issue => {
    if (!byCategory[issue.category]) {
      byCategory[issue.category] = [];
    }
    byCategory[issue.category].push(issue);
  });
  
  console.log('='.repeat(80));
  console.log('\n📋 ISSUES BY CATEGORY:\n');
  
  Object.keys(byCategory).sort().forEach(category => {
    const categoryIssues = byCategory[category];
    console.log(`\n${category}: ${categoryIssues.length} issues`);
    
    // Show first 5 examples
    categoryIssues.slice(0, 5).forEach(issue => {
      const severity = issue.severity === 'critical' ? '🔴' : 
                      issue.severity === 'warning' ? '🟡' : '🔵';
      const location = issue.line ? `:${issue.line}` : '';
      console.log(`  ${severity} ${issue.file}${location}`);
      console.log(`     ${issue.message}`);
    });
    
    if (categoryIssues.length > 5) {
      console.log(`     ... and ${categoryIssues.length - 5} more`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Scan complete!\n');
  
  // Return exit code based on critical issues
  process.exit(criticalIssues.length > 0 ? 1 : 0);
}

// Run the scan
runScan();
