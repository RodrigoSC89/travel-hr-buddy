#!/usr/bin/env npx ts-node
/**
 * Complete Codebase Audit Script
 * Comprehensive analysis of code quality, dead code, and optimization opportunities
 * 
 * Usage: npx ts-node scripts/audit-codebase.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AuditReport {
  timestamp: string;
  summary: {
    totalFiles: number;
    totalLines: number;
    totalComponents: number;
    totalHooks: number;
    totalRoutes: number;
  };
  issues: {
    deadRoutes: number;
    unusedComponents: number;
    consoleLogs: number;
    todoComments: number;
    largeFiles: number;
    duplicateCode: number;
  };
  recommendations: string[];
  health: 'excellent' | 'good' | 'needs-attention' | 'critical';
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function countLines(files: string[]): number {
  let total = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    total += content.split('\n').length;
  }
  return total;
}

function countConsoleLogs(files: string[]): number {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/console\.(log|debug|info)\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function countTodoComments(files: string[]): number {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/\/\/\s*(TODO|FIXME|XXX|HACK|BUG):/gi);
    if (matches) count += matches.length;
  }
  return count;
}

function findLargeFiles(files: string[], threshold: number = 500): string[] {
  const largeFiles: string[] = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n').length;
    if (lines > threshold) {
      largeFiles.push(`${file.replace(process.cwd(), '')} (${lines} lines)`);
    }
  }
  return largeFiles;
}

function countComponents(files: string[]): number {
  let count = 0;
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/export\s+(const|function)\s+[A-Z]/g);
    if (matches) count += matches.length;
    if (content.includes('export default')) count++;
  }
  return count;
}

function countHooks(files: string[]): number {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/export\s+(const|function)\s+use[A-Z]/g);
    if (matches) count += matches.length;
  }
  return count;
}

function countRoutes(files: string[]): number {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/<Route\s+/g);
    if (matches) count += matches.length;
  }
  return count;
}

function generateRecommendations(report: Partial<AuditReport>): string[] {
  const recommendations: string[] = [];
  
  if ((report.issues?.consoleLogs ?? 0) > 50) {
    recommendations.push('Run "npx ts-node scripts/remove-dead-code.ts" to remove console.logs');
  }
  
  if ((report.issues?.todoComments ?? 0) > 20) {
    recommendations.push('Address TODO/FIXME comments - consider creating issues for them');
  }
  
  if ((report.issues?.largeFiles ?? 0) > 10) {
    recommendations.push('Refactor large files (>500 lines) into smaller, focused modules');
  }
  
  if ((report.issues?.unusedComponents ?? 0) > 5) {
    recommendations.push('Run "npx ts-node scripts/find-unused-components.ts" and remove unused code');
  }
  
  if ((report.issues?.deadRoutes ?? 0) > 0) {
    recommendations.push('Run "npx ts-node scripts/find-dead-routes.ts" and clean up unused routes');
  }
  
  return recommendations;
}

function calculateHealth(report: Partial<AuditReport>): 'excellent' | 'good' | 'needs-attention' | 'critical' {
  const issues = report.issues!;
  const totalIssues = Object.values(issues).reduce((a, b) => a + b, 0);
  
  if (totalIssues < 20) return 'excellent';
  if (totalIssues < 50) return 'good';
  if (totalIssues < 100) return 'needs-attention';
  return 'critical';
}

async function main() {
  console.log('🔍 Running Complete Codebase Audit...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx']);
  
  console.log(`📂 Analyzing ${files.length} source files...\n`);
  
  // Gather metrics
  const totalLines = countLines(files);
  const consoleLogs = countConsoleLogs(files);
  const todoComments = countTodoComments(files);
  const largeFiles = findLargeFiles(files);
  const totalComponents = countComponents(files);
  const totalHooks = countHooks(files);
  const totalRoutes = countRoutes(files);
  
  // Check for previous analysis files
  let deadRoutes = 0;
  let unusedComponents = 0;
  
  if (fs.existsSync('dead-routes.json')) {
    const data = JSON.parse(fs.readFileSync('dead-routes.json', 'utf-8'));
    deadRoutes = data.summary?.deadRoutes ?? 0;
  }
  
  if (fs.existsSync('unused-components.json')) {
    const data = JSON.parse(fs.readFileSync('unused-components.json', 'utf-8'));
    unusedComponents = data.summary?.unusedComponents ?? 0;
  }
  
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      totalLines,
      totalComponents,
      totalHooks,
      totalRoutes,
    },
    issues: {
      deadRoutes,
      unusedComponents,
      consoleLogs,
      todoComments,
      largeFiles: largeFiles.length,
      duplicateCode: 0, // Would need jscpd for this
    },
    recommendations: [],
    health: 'good',
  };
  
  report.recommendations = generateRecommendations(report);
  report.health = calculateHealth(report);
  
  // Print report
  console.log(`
========================================
CODEBASE AUDIT REPORT - Nauti One v4.0
========================================

📊 SUMMARY
-----------
Total Files: ${report.summary.totalFiles}
Total Lines: ${report.summary.totalLines.toLocaleString()}
Components: ${report.summary.totalComponents}
Custom Hooks: ${report.summary.totalHooks}
Routes: ${report.summary.totalRoutes}

⚠️  ISSUES FOUND
-----------------
Dead Routes: ${report.issues.deadRoutes}
Unused Components: ${report.issues.unusedComponents}
Console Logs: ${report.issues.consoleLogs}
TODO/FIXME Comments: ${report.issues.todoComments}
Large Files (>500 lines): ${report.issues.largeFiles}

🏥 HEALTH: ${report.health.toUpperCase()}
${report.health === 'excellent' ? '🟢' : report.health === 'good' ? '🟡' : '🔴'}

========================================
`);
  
  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:\n');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    console.log('');
  }
  
  if (largeFiles.length > 0 && largeFiles.length <= 20) {
    console.log('📁 LARGE FILES:\n');
    largeFiles.slice(0, 10).forEach(f => {
      console.log(`   - ${f}`);
    });
    if (largeFiles.length > 10) {
      console.log(`   ... and ${largeFiles.length - 10} more`);
    }
    console.log('');
  }
  
  // Save report
  fs.writeFileSync('codebase-audit.json', JSON.stringify(report, null, 2));
  console.log('✅ Full report saved to: codebase-audit.json\n');
  
  // Next steps
  console.log('📋 NEXT STEPS:');
  console.log('   1. npx ts-node scripts/find-dead-routes.ts');
  console.log('   2. npx ts-node scripts/find-unused-components.ts');
  console.log('   3. npx ts-node scripts/remove-dead-code.ts --dry-run');
  console.log('   4. npm run lint --fix');
  console.log('   5. npm run build');
}

main();
