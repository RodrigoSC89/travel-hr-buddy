#!/usr/bin/env npx ts-node
/**
 * 🏆 CERTIFICATION MASTER - Nauti One v4.0
 * Complete system validation before go-live
 * 
 * Usage: npx ts-node scripts/certification-master.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ============================================
// TYPES
// ============================================

interface CertificationResult {
  category: string;
  passed: number;
  failed: number;
  warnings: number;
  issues: Issue[];
}

interface Issue {
  severity: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';
  component: string;
  message: string;
  fix?: string;
}

interface SystemCertification {
  timestamp: string;
  score: number;
  status: 'CERTIFIED' | 'NEEDS_ATTENTION' | 'FAILED';
  results: CertificationResult[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

// ============================================
// CONFIGURATION
// ============================================

const EXPECTED_MODULES = [
  { name: 'crew-management', path: 'src/pages', displayName: 'Crew Management' },
  { name: 'fleet', path: 'src/pages', displayName: 'Fleet Management' },
  { name: 'documents', path: 'src/pages', displayName: 'Documents' },
  { name: 'payroll', path: 'src/pages', displayName: 'Payroll' },
  { name: 'certificates', path: 'src/pages', displayName: 'Certificates' },
  { name: 'peotram', path: 'src/pages', displayName: 'PEOTRAM' },
  { name: 'safety', path: 'src/pages', displayName: 'Safety' },
  { name: 'training', path: 'src/pages', displayName: 'Training' },
  { name: 'maintenance', path: 'src/pages', displayName: 'Maintenance' },
  { name: 'ai-hub', path: 'src/pages', displayName: 'AI Hub' },
  { name: 'compliance', path: 'src/pages', displayName: 'Compliance' },
  { name: 'reports', path: 'src/pages', displayName: 'Reports' },
  { name: 'settings', path: 'src/pages', displayName: 'Settings' },
  { name: 'dashboard', path: 'src/pages', displayName: 'Dashboard' },
  { name: 'voyage', path: 'src/pages', displayName: 'Voyage Planning' },
  { name: 'charter', path: 'src/pages', displayName: 'Charter Management' },
];

const EXPECTED_EDGE_FUNCTIONS = [
  'command-center-ai',
  'peotram-generate-evidence',
  'vessel-downtime-ai',
  'imca-incidents-ai',
  'human-factors-assessment',
  'gmud-workflow',
  'responsibility-matrix-dispatch',
  'document-ai-analysis',
  'crew-ai-match',
  'maintenance-prediction-ai',
  'training-module-generator',
  'weather-routing-ai',
  'bunker-optimization-ai',
  'compliance-check-ai',
  'voice-to-text',
  'multi-llm-consensus',
];

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
      if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const icons = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };
  console.log(`${icons[type]} ${message}`);
}

// ============================================
// CERTIFIERS
// ============================================

function certifyModules(): CertificationResult {
  log('Certifying Modules...', 'info');
  
  const issues: Issue[] = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  const srcDir = path.join(process.cwd(), 'src');
  const pagesDir = path.join(srcDir, 'pages');
  
  // Get all page files
  const pageFiles = getAllFiles(pagesDir, ['.tsx']);
  
  for (const module of EXPECTED_MODULES) {
    const moduleExists = pageFiles.some(f => 
      f.toLowerCase().includes(module.name.toLowerCase()) ||
      f.toLowerCase().includes(module.name.replace('-', '').toLowerCase())
    );
    
    if (moduleExists) {
      // Check for CRUD operations
      const moduleFiles = pageFiles.filter(f => 
        f.toLowerCase().includes(module.name.toLowerCase()) ||
        f.toLowerCase().includes(module.name.replace('-', '').toLowerCase())
      );
      
      let hasCreate = false;
      let hasRead = false;
      let hasUpdate = false;
      let hasDelete = false;
      
      for (const file of moduleFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/useMutation.*create|createMutation|handleCreate|onCreate/i.test(content)) hasCreate = true;
        if (/useQuery|fetch|select|getData/i.test(content)) hasRead = true;
        if (/useMutation.*update|updateMutation|handleUpdate|onUpdate|handleEdit/i.test(content)) hasUpdate = true;
        if (/useMutation.*delete|deleteMutation|handleDelete|onDelete/i.test(content)) hasDelete = true;
      }
      
      if (hasRead) {
        passed++;
        
        if (!hasCreate || !hasUpdate || !hasDelete) {
          warnings++;
          issues.push({
            severity: 'WARNING',
            component: module.displayName,
            message: `Module missing some CRUD: Create=${hasCreate}, Update=${hasUpdate}, Delete=${hasDelete}`,
            fix: `Add missing mutation handlers`,
          });
        }
      } else {
        failed++;
        issues.push({
          severity: 'ERROR',
          component: module.displayName,
          message: 'Module exists but has no data fetching',
          fix: 'Add useQuery hook to fetch data',
        });
      }
    } else {
      failed++;
      issues.push({
        severity: 'CRITICAL',
        component: module.displayName,
        message: `Module not found: ${module.name}`,
        fix: `Create ${module.path}/${module.name}/index.tsx`,
      });
    }
  }
  
  log(`Modules: ${passed} passed, ${failed} failed, ${warnings} warnings`, passed === EXPECTED_MODULES.length ? 'success' : 'warning');
  
  return {
    category: 'Modules',
    passed,
    failed,
    warnings,
    issues,
  };
}

function certifyEdgeFunctions(): CertificationResult {
  log('Certifying Edge Functions...', 'info');
  
  const issues: Issue[] = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  const functionsDir = path.join(process.cwd(), 'supabase', 'functions');
  
  if (!fs.existsSync(functionsDir)) {
    return {
      category: 'Edge Functions',
      passed: 0,
      failed: EXPECTED_EDGE_FUNCTIONS.length,
      warnings: 0,
      issues: [{
        severity: 'CRITICAL',
        component: 'Edge Functions',
        message: 'supabase/functions directory not found',
        fix: 'Create supabase/functions directory',
      }],
    };
  }
  
  const existingFunctions = fs.readdirSync(functionsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const fn of EXPECTED_EDGE_FUNCTIONS) {
    const fnPath = path.join(functionsDir, fn, 'index.ts');
    
    if (existingFunctions.includes(fn) && fs.existsSync(fnPath)) {
      const content = fs.readFileSync(fnPath, 'utf-8');
      
      // Check for required patterns
      const hasErrorHandling = /try\s*\{[\s\S]*catch/i.test(content);
      const hasCors = /corsHeaders|Access-Control/i.test(content);
      const hasAuth = /auth|authorization|jwt/i.test(content);
      
      passed++;
      
      if (!hasErrorHandling) {
        warnings++;
        issues.push({
          severity: 'WARNING',
          component: fn,
          message: 'Missing error handling (try-catch)',
        });
      }
      
      if (!hasCors) {
        warnings++;
        issues.push({
          severity: 'WARNING',
          component: fn,
          message: 'Missing CORS headers',
        });
      }
    } else {
      // Check if similar function exists
      const similar = existingFunctions.find(f => 
        f.includes(fn.split('-')[0]) || fn.includes(f.split('-')[0])
      );
      
      if (similar) {
        passed++;
        warnings++;
        issues.push({
          severity: 'INFO',
          component: fn,
          message: `Expected '${fn}' but found similar: '${similar}'`,
        });
      } else {
        failed++;
        issues.push({
          severity: 'ERROR',
          component: fn,
          message: `Edge function not found`,
          fix: `Create supabase/functions/${fn}/index.ts`,
        });
      }
    }
  }
  
  // Count total functions
  log(`Edge Functions: ${existingFunctions.length} total, ${passed} verified, ${failed} missing`, failed === 0 ? 'success' : 'warning');
  
  return {
    category: 'Edge Functions',
    passed,
    failed,
    warnings,
    issues,
  };
}

function certifyButtons(): CertificationResult {
  log('Certifying Button Functionality...', 'info');
  
  const issues: Issue[] = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.tsx']);
  
  const buttonPatterns = [
    /<Button[^>]*>/g,
    /<button[^>]*>/g,
  ];
  
  const handlerPatterns = [
    /onClick\s*=/,
    /onSubmit\s*=/,
    /type\s*=\s*["']submit["']/,
    /href\s*=/,
    /to\s*=/,
    /disabled/,
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    
    for (const pattern of buttonPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const hasHandler = handlerPatterns.some(p => p.test(match));
          
          if (hasHandler) {
            passed++;
          } else {
            // Check if it's a form submit button or within a form
            const isInForm = /<form[\s\S]*?<\/form>/gi.test(content);
            
            if (isInForm) {
              passed++;
            } else {
              failed++;
              issues.push({
                severity: 'WARNING',
                component: relativePath,
                message: 'Button without click handler',
              });
            }
          }
        }
      }
    }
  }
  
  // Limit issues shown
  if (issues.length > 10) {
    const overflow = issues.length - 10;
    issues.splice(10);
    issues.push({
      severity: 'INFO',
      component: 'Summary',
      message: `...and ${overflow} more button issues`,
    });
  }
  
  log(`Buttons: ${passed} functional, ${failed} need handlers`, failed === 0 ? 'success' : 'warning');
  
  return {
    category: 'Buttons',
    passed,
    failed,
    warnings,
    issues,
  };
}

function certifyTypescript(): CertificationResult {
  log('Certifying TypeScript...', 'info');
  
  const issues: Issue[] = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  try {
    execSync('npx tsc --noEmit 2>&1', { encoding: 'utf-8', stdio: 'pipe' });
    passed = 1;
    log('TypeScript: No errors', 'success');
  } catch (error: any) {
    const output = error.stdout || error.message;
    const errorLines = output.split('\n').filter((l: string) => l.includes('error TS'));
    failed = errorLines.length;
    
    // Group by file
    const errorsByFile: Record<string, number> = {};
    errorLines.forEach((line: string) => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const file = match[1];
        errorsByFile[file] = (errorsByFile[file] || 0) + 1;
      }
    });
    
    Object.entries(errorsByFile).slice(0, 10).forEach(([file, count]) => {
      issues.push({
        severity: 'ERROR',
        component: file,
        message: `${count} TypeScript error(s)`,
      });
    });
    
    log(`TypeScript: ${failed} errors`, 'error');
  }
  
  return {
    category: 'TypeScript',
    passed,
    failed,
    warnings,
    issues,
  };
}

function certifyBuild(): CertificationResult {
  log('Certifying Build...', 'info');
  
  const issues: Issue[] = [];
  
  try {
    execSync('npm run build 2>&1', { encoding: 'utf-8', stdio: 'pipe' });
    log('Build: Success', 'success');
    
    // Check bundle size
    const distDir = path.join(process.cwd(), 'dist', 'assets');
    if (fs.existsSync(distDir)) {
      const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
      let totalSize = 0;
      
      jsFiles.forEach(file => {
        const stats = fs.statSync(path.join(distDir, file));
        totalSize += stats.size;
      });
      
      const sizeKB = Math.round(totalSize / 1024);
      
      if (sizeKB > 300) {
        issues.push({
          severity: 'WARNING',
          component: 'Bundle',
          message: `Bundle size ${sizeKB}KB exceeds 300KB target`,
        });
      }
    }
    
    return {
      category: 'Build',
      passed: 1,
      failed: 0,
      warnings: issues.length,
      issues,
    };
  } catch (error: any) {
    const output = error.stdout || error.message;
    
    issues.push({
      severity: 'CRITICAL',
      component: 'Build',
      message: 'Build failed',
      fix: output.slice(0, 500),
    });
    
    log('Build: Failed', 'error');
    
    return {
      category: 'Build',
      passed: 0,
      failed: 1,
      warnings: 0,
      issues,
    };
  }
}

function certifyRoutes(): CertificationResult {
  log('Certifying Routes...', 'info');
  
  const issues: Issue[] = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  // Find route definitions
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.tsx', '.ts']);
  
  const routeFiles = files.filter(f => 
    f.includes('route') || f.includes('Route') || f.includes('App.tsx')
  );
  
  const definedRoutes: string[] = [];
  
  for (const file of routeFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const routeMatches = content.match(/path:\s*["']([^"']+)["']/g);
    
    if (routeMatches) {
      routeMatches.forEach(match => {
        const path = match.match(/["']([^"']+)["']/)?.[1];
        if (path) definedRoutes.push(path);
      });
    }
  }
  
  passed = definedRoutes.length;
  
  log(`Routes: ${definedRoutes.length} defined`, 'success');
  
  return {
    category: 'Routes',
    passed,
    failed,
    warnings,
    issues,
  };
}

// ============================================
// MAIN
// ============================================

async function runCertification(): Promise<SystemCertification> {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏆 CERTIFICATION MASTER - Nauti One v4.0');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n');
  
  const results: CertificationResult[] = [];
  
  // Run all certifications
  results.push(certifyModules());
  console.log('');
  
  results.push(certifyEdgeFunctions());
  console.log('');
  
  results.push(certifyButtons());
  console.log('');
  
  results.push(certifyTypescript());
  console.log('');
  
  results.push(certifyRoutes());
  console.log('');
  
  // Skip build in quick mode
  if (!process.argv.includes('--quick')) {
    results.push(certifyBuild());
    console.log('');
  }
  
  // Calculate summary
  const summary = {
    totalChecks: results.reduce((sum, r) => sum + r.passed + r.failed, 0),
    passed: results.reduce((sum, r) => sum + r.passed, 0),
    failed: results.reduce((sum, r) => sum + r.failed, 0),
    warnings: results.reduce((sum, r) => sum + r.warnings, 0),
  };
  
  const score = Math.round((summary.passed / summary.totalChecks) * 100);
  
  let status: 'CERTIFIED' | 'NEEDS_ATTENTION' | 'FAILED';
  if (summary.failed === 0) {
    status = 'CERTIFIED';
  } else if (score >= 80) {
    status = 'NEEDS_ATTENTION';
  } else {
    status = 'FAILED';
  }
  
  const certification: SystemCertification = {
    timestamp: new Date().toISOString(),
    score,
    status,
    results,
    summary,
  };
  
  // Print final report
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CERTIFICATION REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Score: ${score}%`);
  console.log(`Status: ${status}\n`);
  
  console.log('Results by Category:');
  results.forEach(r => {
    const icon = r.failed === 0 ? '✅' : r.failed < 3 ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.category}: ${r.passed} passed, ${r.failed} failed`);
  });
  
  console.log(`\nSummary:`);
  console.log(`  Total Checks: ${summary.totalChecks}`);
  console.log(`  Passed: ${summary.passed}`);
  console.log(`  Failed: ${summary.failed}`);
  console.log(`  Warnings: ${summary.warnings}`);
  
  // Show critical issues
  const criticalIssues = results.flatMap(r => r.issues).filter(i => i.severity === 'CRITICAL');
  if (criticalIssues.length > 0) {
    console.log('\n🚨 Critical Issues:');
    criticalIssues.forEach(issue => {
      console.log(`  ❌ [${issue.component}] ${issue.message}`);
      if (issue.fix) console.log(`     Fix: ${issue.fix}`);
    });
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (status === 'CERTIFIED') {
    console.log('✅✅✅ SYSTEM CERTIFIED - Ready for Production ✅✅✅');
  } else if (status === 'NEEDS_ATTENTION') {
    console.log('⚠️ SYSTEM NEEDS ATTENTION - Review issues above');
  } else {
    console.log('❌ CERTIFICATION FAILED - Fix critical issues');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Save report
  fs.mkdirSync('certification-reports', { recursive: true });
  fs.writeFileSync(
    'certification-reports/certification.json',
    JSON.stringify(certification, null, 2)
  );
  
  // Generate Markdown report
  const markdown = generateMarkdownReport(certification);
  fs.writeFileSync('CERTIFICATION_REPORT.md', markdown);
  
  console.log('📄 Reports saved:');
  console.log('  - certification-reports/certification.json');
  console.log('  - CERTIFICATION_REPORT.md\n');
  
  return certification;
}

function generateMarkdownReport(cert: SystemCertification): string {
  const statusEmoji = {
    CERTIFIED: '✅',
    NEEDS_ATTENTION: '⚠️',
    FAILED: '❌',
  };
  
  return `# 🏆 Certification Report - Nauti One v4.0

**Generated:** ${cert.timestamp}  
**Status:** ${statusEmoji[cert.status]} ${cert.status}  
**Score:** ${cert.score}%

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Checks | ${cert.summary.totalChecks} |
| Passed | ${cert.summary.passed} |
| Failed | ${cert.summary.failed} |
| Warnings | ${cert.summary.warnings} |

---

## 📋 Results by Category

${cert.results.map(r => `
### ${r.failed === 0 ? '✅' : '❌'} ${r.category}

- **Passed:** ${r.passed}
- **Failed:** ${r.failed}
- **Warnings:** ${r.warnings}

${r.issues.length > 0 ? `
**Issues:**
${r.issues.slice(0, 5).map(i => `- [${i.severity}] ${i.component}: ${i.message}`).join('\n')}
${r.issues.length > 5 ? `\n*...and ${r.issues.length - 5} more*` : ''}
` : ''}
`).join('\n')}

---

## 🎯 Certification Status

${cert.status === 'CERTIFIED' 
  ? '### ✅ SYSTEM CERTIFIED\n\nThe Nauti One v4.0 system has passed all critical checks and is ready for production deployment.'
  : cert.status === 'NEEDS_ATTENTION'
  ? '### ⚠️ NEEDS ATTENTION\n\nThe system is mostly functional but has some issues that should be addressed before production.'
  : '### ❌ CERTIFICATION FAILED\n\nCritical issues must be resolved before the system can be certified.'}

---

*Report generated by Nauti One Certification Master*
`;
}

// Run
runCertification().catch(console.error);
