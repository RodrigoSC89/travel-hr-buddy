#!/usr/bin/env npx ts-node
/**
 * 🔍 Frontend Completeness Scanner
 * Zero-tolerance scan for frontend issues
 * 
 * Usage: npx ts-node scripts/frontend-completeness-scan.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

interface Issue {
  category: string;
  severity: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';
  file: string;
  line?: number;
  message: string;
  fix?: string;
}

interface ScanResult {
  category: string;
  count: number;
  issues: Issue[];
}

interface CompleteScanReport {
  timestamp: string;
  totalIssues: number;
  results: ScanResult[];
  score: number;
  status: 'COMPLETE' | 'NEEDS_FIXES' | 'CRITICAL';
}

// ============================================
// UTILITIES
// ============================================

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', 'coverage', '__tests__'].includes(item.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function getRelativePath(filePath: string): string {
  return filePath.replace(process.cwd() + '/', '');
}

// ============================================
// SCANNERS
// ============================================

function scanPlaceholders(files: string[]): ScanResult {
  const issues: Issue[] = [];
  const patterns = [
    { regex: /Coming Soon/gi, name: 'Coming Soon placeholder' },
    { regex: /\/\/\s*TODO:/gi, name: 'TODO comment' },
    { regex: /\/\/\s*FIXME:/gi, name: 'FIXME comment' },
    { regex: /\/\/\s*XXX:/gi, name: 'XXX comment' },
    { regex: /\/\/\s*HACK:/gi, name: 'HACK comment' },
    { regex: /\/\*\s*TODO/gi, name: 'TODO block comment' },
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          issues.push({
            category: 'Placeholders',
            severity: pattern.name.includes('FIXME') || pattern.name.includes('HACK') ? 'ERROR' : 'WARNING',
            file: getRelativePath(file),
            line: idx + 1,
            message: `Found ${pattern.name}`,
            fix: 'Implement or remove placeholder',
          });
          pattern.regex.lastIndex = 0;
        }
      }
    });
  }
  
  return { category: 'Placeholders & TODOs', count: issues.length, issues };
}

function scanButtons(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  const buttonPatterns = [
    /<Button[^>]*>/g,
    /<button[^>]*>/g,
  ];
  
  const handlerPatterns = [
    /onClick/,
    /onSubmit/,
    /type\s*=\s*["']submit["']/,
    /href\s*=/,
    /to\s*=/,
    /disabled/,
    /asChild/,
    /form\s*=/,
  ];
  
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      for (const pattern of buttonPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            const hasHandler = handlerPatterns.some(p => p.test(match));
            if (!hasHandler) {
              // Check if it's inside a form
              const surroundingCode = lines.slice(Math.max(0, idx - 10), idx + 5).join('\n');
              const isInForm = /<form/i.test(surroundingCode) && /<\/form>/i.test(surroundingCode);
              
              if (!isInForm) {
                issues.push({
                  category: 'Buttons',
                  severity: 'WARNING',
                  file: getRelativePath(file),
                  line: idx + 1,
                  message: 'Button without click handler',
                  fix: 'Add onClick handler or type="submit"',
                });
              }
            }
          }
        }
      }
    });
  }
  
  return { category: 'Non-functional Buttons', count: issues.length, issues };
}

function scanFormValidation(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for useForm without zodResolver
    if (/useForm\s*\(/.test(content)) {
      if (!content.includes('zodResolver') && !content.includes('yupResolver')) {
        // Check if it has any resolver
        if (!content.includes('resolver:')) {
          issues.push({
            category: 'Forms',
            severity: 'WARNING',
            file: getRelativePath(file),
            message: 'useForm without schema validation',
            fix: 'Add zodResolver with validation schema',
          });
        }
      }
    }
    
    // Check for <form> without onSubmit
    if (/<form[^>]*>/i.test(content) && !/<form[^>]*onSubmit/i.test(content)) {
      if (!content.includes('handleSubmit')) {
        issues.push({
          category: 'Forms',
          severity: 'WARNING',
          file: getRelativePath(file),
          message: 'Form without onSubmit handler',
          fix: 'Add onSubmit handler with form.handleSubmit',
        });
      }
    }
  }
  
  return { category: 'Form Validation', count: issues.length, issues };
}

function scanErrorHandling(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = getRelativePath(file);
    
    // Check useMutation without onError
    if (content.includes('useMutation')) {
      const mutationBlocks = content.match(/useMutation\s*\(\s*\{[\s\S]*?\}\s*\)/g) || [];
      
      for (const block of mutationBlocks) {
        if (!block.includes('onError')) {
          issues.push({
            category: 'Error Handling',
            severity: 'WARNING',
            file: relativePath,
            message: 'useMutation without onError handler',
            fix: 'Add onError callback with toast notification',
          });
        }
      }
    }
    
    // Check for empty catch blocks
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g;
    if (emptyCatchRegex.test(content)) {
      issues.push({
        category: 'Error Handling',
        severity: 'ERROR',
        file: relativePath,
        message: 'Empty catch block',
        fix: 'Add proper error handling in catch block',
      });
    }
  }
  
  return { category: 'Error Handling', count: issues.length, issues };
}

function scanLoadingStates(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = getRelativePath(file);
    
    // Check if component uses useQuery
    if (content.includes('useQuery')) {
      // Check for isLoading handling
      if (!content.includes('isLoading') && !content.includes('isPending')) {
        issues.push({
          category: 'Loading States',
          severity: 'WARNING',
          file: relativePath,
          message: 'useQuery without loading state handling',
          fix: 'Add isLoading check with loading UI',
        });
      }
    }
  }
  
  return { category: 'Loading States', count: issues.length, issues };
}

function scanConsoleLogs(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  for (const file of files) {
    // Skip logger files
    if (file.includes('logger')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      if (/console\.(log|debug|info)\s*\(/.test(line)) {
        // Skip if it's in a catch block (acceptable)
        const nearbyCode = lines.slice(Math.max(0, idx - 3), idx).join('\n');
        if (!nearbyCode.includes('catch')) {
          issues.push({
            category: 'Console Logs',
            severity: 'INFO',
            file: getRelativePath(file),
            line: idx + 1,
            message: 'Console statement in production code',
            fix: 'Remove or replace with logger',
          });
        }
      }
    });
  }
  
  return { category: 'Console Statements', count: issues.length, issues };
}

function scanTypeSafety(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const relativePath = getRelativePath(file);
    
    lines.forEach((line, idx) => {
      // Check for @ts-ignore
      if (/@ts-ignore/.test(line)) {
        issues.push({
          category: 'Type Safety',
          severity: 'WARNING',
          file: relativePath,
          line: idx + 1,
          message: '@ts-ignore suppression',
          fix: 'Fix the type error instead of suppressing',
        });
      }
      
      // Check for @ts-nocheck
      if (/@ts-nocheck/.test(line)) {
        issues.push({
          category: 'Type Safety',
          severity: 'CRITICAL',
          file: relativePath,
          line: idx + 1,
          message: '@ts-nocheck suppression',
          fix: 'Remove @ts-nocheck and fix all type errors',
        });
      }
      
      // Check for explicit any (but not in type definitions)
      if (/:\s*any\b/.test(line) && !line.includes('// eslint-disable')) {
        issues.push({
          category: 'Type Safety',
          severity: 'WARNING',
          file: relativePath,
          line: idx + 1,
          message: 'Explicit any type',
          fix: 'Replace with proper type',
        });
      }
    });
  }
  
  return { category: 'Type Safety', count: issues.length, issues };
}

function scanAccessibility(files: string[]): ScanResult {
  const issues: Issue[] = [];
  
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const relativePath = getRelativePath(file);
    
    lines.forEach((line, idx) => {
      // Check for images without alt
      if (/<img[^>]*>/.test(line) && !/<img[^>]*alt=/i.test(line)) {
        issues.push({
          category: 'Accessibility',
          severity: 'WARNING',
          file: relativePath,
          line: idx + 1,
          message: 'Image without alt attribute',
          fix: 'Add descriptive alt text',
        });
      }
      
      // Check for buttons with only icons (no aria-label)
      if (/<Button[^>]*>[^<]*<[^>]*Icon[^>]*\/>[^<]*<\/Button>/i.test(line)) {
        if (!/aria-label/i.test(line)) {
          issues.push({
            category: 'Accessibility',
            severity: 'INFO',
            file: relativePath,
            line: idx + 1,
            message: 'Icon-only button without aria-label',
            fix: 'Add aria-label for screen readers',
          });
        }
      }
    });
  }
  
  return { category: 'Accessibility', count: issues.length, issues };
}

// ============================================
// MAIN
// ============================================

async function runCompleteScan(): Promise<CompleteScanReport> {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 FRONTEND COMPLETENESS SCAN - ZERO TOLERANCE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx']);
  
  console.log(`📂 Scanning ${files.length} files...\n`);
  
  const results: ScanResult[] = [];
  
  // Run all scanners
  console.log('1️⃣  Scanning for placeholders...');
  results.push(scanPlaceholders(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : '❌'} ${results[results.length - 1].count} issues\n`);
  
  console.log('2️⃣  Scanning for non-functional buttons...');
  results.push(scanButtons(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : '⚠️'} ${results[results.length - 1].count} issues\n`);
  
  console.log('3️⃣  Scanning for form validation...');
  results.push(scanFormValidation(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : '⚠️'} ${results[results.length - 1].count} issues\n`);
  
  console.log('4️⃣  Scanning for error handling...');
  results.push(scanErrorHandling(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : '⚠️'} ${results[results.length - 1].count} issues\n`);
  
  console.log('5️⃣  Scanning for loading states...');
  results.push(scanLoadingStates(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : '⚠️'} ${results[results.length - 1].count} issues\n`);
  
  console.log('6️⃣  Scanning for console statements...');
  results.push(scanConsoleLogs(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : 'ℹ️'} ${results[results.length - 1].count} issues\n`);
  
  console.log('7️⃣  Scanning for type safety...');
  results.push(scanTypeSafety(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : '⚠️'} ${results[results.length - 1].count} issues\n`);
  
  console.log('8️⃣  Scanning for accessibility...');
  results.push(scanAccessibility(files));
  console.log(`   ${results[results.length - 1].count === 0 ? '✅' : 'ℹ️'} ${results[results.length - 1].count} issues\n`);
  
  // Calculate totals
  const totalIssues = results.reduce((sum, r) => sum + r.count, 0);
  const criticalCount = results.flatMap(r => r.issues).filter(i => i.severity === 'CRITICAL').length;
  const errorCount = results.flatMap(r => r.issues).filter(i => i.severity === 'ERROR').length;
  
  // Calculate score (100 - weighted issues)
  const score = Math.max(0, 100 - (criticalCount * 10) - (errorCount * 5) - (totalIssues - criticalCount - errorCount));
  
  let status: 'COMPLETE' | 'NEEDS_FIXES' | 'CRITICAL';
  if (criticalCount > 0) {
    status = 'CRITICAL';
  } else if (totalIssues > 0) {
    status = 'NEEDS_FIXES';
  } else {
    status = 'COMPLETE';
  }
  
  const report: CompleteScanReport = {
    timestamp: new Date().toISOString(),
    totalIssues,
    results,
    score,
    status,
  };
  
  // Print report
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 COMPLETENESS REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Score: ${score}%`);
  console.log(`Status: ${status}`);
  console.log(`Total Issues: ${totalIssues}\n`);
  
  console.log('Breakdown:');
  results.forEach(r => {
    const icon = r.count === 0 ? '✅' : r.count < 5 ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.category}: ${r.count}`);
  });
  
  // Show top issues
  if (totalIssues > 0) {
    console.log('\n🔥 Top Issues to Fix:');
    const allIssues = results.flatMap(r => r.issues)
      .sort((a, b) => {
        const severityOrder = { CRITICAL: 0, ERROR: 1, WARNING: 2, INFO: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 10);
    
    allIssues.forEach(issue => {
      const icon = issue.severity === 'CRITICAL' ? '🔴' : 
                   issue.severity === 'ERROR' ? '🟠' : 
                   issue.severity === 'WARNING' ? '🟡' : '🔵';
      console.log(`  ${icon} [${issue.file}${issue.line ? ':' + issue.line : ''}] ${issue.message}`);
    });
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (status === 'COMPLETE') {
    console.log('✅✅✅ FRONTEND IS 100% COMPLETE! ✅✅✅');
  } else if (status === 'CRITICAL') {
    console.log('❌ CRITICAL ISSUES FOUND - Must fix before deployment');
  } else {
    console.log('⚠️ FRONTEND NEEDS ATTENTION - Review issues above');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Save report
  fs.mkdirSync('completeness-reports', { recursive: true });
  fs.writeFileSync(
    'completeness-reports/scan-report.json',
    JSON.stringify(report, null, 2)
  );
  
  // Generate markdown report
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync('completeness-reports/SCAN_REPORT.md', markdown);
  
  console.log('📄 Reports saved:');
  console.log('  - completeness-reports/scan-report.json');
  console.log('  - completeness-reports/SCAN_REPORT.md\n');
  
  return report;
}

function generateMarkdownReport(report: CompleteScanReport): string {
  return `# 🔍 Frontend Completeness Scan Report

**Generated:** ${report.timestamp}  
**Score:** ${report.score}%  
**Status:** ${report.status}  
**Total Issues:** ${report.totalIssues}

---

## 📊 Summary by Category

| Category | Issues | Status |
|----------|--------|--------|
${report.results.map(r => 
  `| ${r.category} | ${r.count} | ${r.count === 0 ? '✅' : '⚠️'} |`
).join('\n')}

---

## 📝 Detailed Issues

${report.results.filter(r => r.count > 0).map(r => `
### ${r.category} (${r.count} issues)

${r.issues.slice(0, 20).map(i => 
  `- **[${i.severity}]** \`${i.file}${i.line ? ':' + i.line : ''}\`
  - ${i.message}
  ${i.fix ? `- Fix: ${i.fix}` : ''}`
).join('\n\n')}
${r.issues.length > 20 ? `\n*...and ${r.issues.length - 20} more*` : ''}
`).join('\n')}

---

## 🎯 Next Steps

${report.status === 'COMPLETE' ? 
  '✅ Frontend is complete! Ready for production.' :
  `1. Fix all CRITICAL issues first
2. Address ERROR level issues
3. Review WARNING items
4. Re-run scan to verify fixes`
}

---

*Report generated by Frontend Completeness Scanner*
`;
}

// Run
runCompleteScan().catch(console.error);
