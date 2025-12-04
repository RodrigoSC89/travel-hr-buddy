#!/usr/bin/env node
/**
 * Weekly Quality Report Generator
 * Generates health metrics for bundle, tests, a11y, and security
 * PATCH: Audit Plan 2025 - Governance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const TIMESTAMP = new Date().toISOString().split('T')[0];

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const report = {
  generatedAt: new Date().toISOString(),
  version: getPackageVersion(),
  metrics: {
    bundle: {},
    tests: {},
    accessibility: {},
    security: {},
    performance: {},
  },
  issues: [],
  recommendations: [],
};

function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function runCommand(cmd, silent = true) {
  try {
    return execSync(cmd, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (error) {
    return null;
  }
}

function collectBundleMetrics() {
  console.log('📦 Collecting bundle metrics...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    report.issues.push('dist/ not found - run npm run build first');
    return;
  }
  
  const assetsPath = path.join(distPath, 'assets');
  
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    
    let totalJS = 0;
    let totalCSS = 0;
    let largestChunk = { name: '', size: 0 };
    
    files.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const size = fs.statSync(filePath).size;
      
      if (file.endsWith('.js')) {
        totalJS += size;
        if (size > largestChunk.size) {
          largestChunk = { name: file, size };
        }
      } else if (file.endsWith('.css')) {
        totalCSS += size;
      }
    });
    
    report.metrics.bundle = {
      totalJSKB: Math.round(totalJS / 1024),
      totalCSSKB: Math.round(totalCSS / 1024),
      estimatedGzipKB: Math.round((totalJS + totalCSS) * 0.35 / 1024),
      chunkCount: files.filter(f => f.endsWith('.js')).length,
      largestChunk: {
        name: largestChunk.name,
        sizeKB: Math.round(largestChunk.size / 1024),
      },
    };
    
    // Check budget
    if (report.metrics.bundle.estimatedGzipKB > 300) {
      report.issues.push(`Bundle size (${report.metrics.bundle.estimatedGzipKB}KB gzip) exceeds 300KB budget`);
    }
    
    if (report.metrics.bundle.largestChunk.sizeKB > 400) {
      report.recommendations.push(`Chunk ${largestChunk.name} is ${largestChunk.size / 1024}KB - consider splitting`);
    }
  }
}

function collectTestMetrics() {
  console.log('🧪 Collecting test metrics...');
  
  // Try to get test coverage
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (fs.existsSync(coveragePath)) {
    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
      report.metrics.tests = {
        linesCoverage: coverage.total?.lines?.pct || 0,
        branchesCoverage: coverage.total?.branches?.pct || 0,
        functionsCoverage: coverage.total?.functions?.pct || 0,
        statementsCoverage: coverage.total?.statements?.pct || 0,
      };
      
      if (report.metrics.tests.linesCoverage < 80) {
        report.issues.push(`Test coverage (${report.metrics.tests.linesCoverage}%) is below 80% target`);
      }
    } catch {
      report.metrics.tests = { error: 'Could not parse coverage report' };
    }
  } else {
    report.metrics.tests = { error: 'No coverage report found - run npm run test:coverage' };
  }
  
  // Count test files
  const testFiles = countFiles(path.join(process.cwd(), 'tests'), /\.test\.(ts|tsx)$/);
  const srcTestFiles = countFiles(path.join(process.cwd(), 'src', 'tests'), /\.test\.(ts|tsx)$/);
  
  report.metrics.tests.testFileCount = testFiles + srcTestFiles;
}

function countFiles(dir, pattern) {
  let count = 0;
  
  if (!fs.existsSync(dir)) return 0;
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += countFiles(fullPath, pattern);
    } else if (pattern.test(item)) {
      count++;
    }
  });
  
  return count;
}

function collectSecurityMetrics() {
  console.log('🔒 Collecting security metrics...');
  
  // Check for env validation
  const envValidationExists = fs.existsSync(path.join(process.cwd(), 'scripts', 'validate-api-keys.cjs'));
  
  // Check for security middleware
  const securityMiddlewareExists = fs.existsSync(path.join(process.cwd(), 'src', 'middleware', 'security.middleware.ts'));
  
  // Check for RLS tests
  const rlsTestsExist = fs.existsSync(path.join(process.cwd(), 'src', 'tests', 'security', 'rls-security.test.ts'));
  
  report.metrics.security = {
    envValidation: envValidationExists,
    securityMiddleware: securityMiddlewareExists,
    rlsTests: rlsTestsExist,
  };
  
  if (!envValidationExists) {
    report.recommendations.push('Add environment variable validation script');
  }
}

function collectPerformanceMetrics() {
  console.log('⚡ Collecting performance metrics...');
  
  // Check for Lighthouse config
  const lighthouseConfigExists = fs.existsSync(path.join(process.cwd(), 'lighthouserc.json'));
  const lighthouse2MbExists = fs.existsSync(path.join(process.cwd(), 'lighthouserc-2mb.json'));
  
  // Check for performance hooks
  const networkHooksExist = fs.existsSync(path.join(process.cwd(), 'src', 'hooks', 'useNetworkAwareLoading.ts'));
  const webVitalsExist = fs.existsSync(path.join(process.cwd(), 'src', 'lib', 'web-vitals-reporter.ts'));
  
  report.metrics.performance = {
    lighthouseConfig: lighthouseConfigExists,
    lighthouse2MbConfig: lighthouse2MbExists,
    networkAwareHooks: networkHooksExist,
    webVitalsReporter: webVitalsExist,
  };
}

function generateReport() {
  console.log('\n📊 Generating report...\n');
  
  collectBundleMetrics();
  collectTestMetrics();
  collectSecurityMetrics();
  collectPerformanceMetrics();
  
  // Calculate overall health score
  let score = 100;
  score -= report.issues.length * 10;
  score -= report.recommendations.length * 5;
  score = Math.max(0, score);
  
  report.healthScore = score;
  report.status = score >= 80 ? 'healthy' : score >= 60 ? 'needs-attention' : 'critical';
  
  // Save report
  const reportPath = path.join(REPORTS_DIR, `quality-report-${TIMESTAMP}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown summary
  const markdown = generateMarkdown();
  const mdPath = path.join(REPORTS_DIR, `quality-report-${TIMESTAMP}.md`);
  fs.writeFileSync(mdPath, markdown);
  
  // Print summary
  console.log('═══════════════════════════════════════');
  console.log(`📋 Quality Report - ${TIMESTAMP}`);
  console.log('═══════════════════════════════════════\n');
  
  console.log(`Health Score: ${report.healthScore}/100 (${report.status})`);
  console.log(`Version: ${report.version}\n`);
  
  console.log('Bundle Metrics:');
  console.log(`  Total JS: ${report.metrics.bundle.totalJSKB || 'N/A'}KB`);
  console.log(`  Estimated gzip: ${report.metrics.bundle.estimatedGzipKB || 'N/A'}KB`);
  console.log(`  Chunks: ${report.metrics.bundle.chunkCount || 'N/A'}\n`);
  
  console.log('Test Metrics:');
  console.log(`  Coverage: ${report.metrics.tests.linesCoverage || 'N/A'}%`);
  console.log(`  Test files: ${report.metrics.tests.testFileCount || 'N/A'}\n`);
  
  if (report.issues.length > 0) {
    console.log('⚠️  Issues:');
    report.issues.forEach(issue => console.log(`  - ${issue}`));
    console.log('');
  }
  
  if (report.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    console.log('');
  }
  
  console.log(`Reports saved to: ${REPORTS_DIR}/`);
}

function generateMarkdown() {
  return `# Quality Report - ${TIMESTAMP}

## Overview
- **Health Score**: ${report.healthScore}/100 (${report.status})
- **Version**: ${report.version}
- **Generated**: ${report.generatedAt}

## Bundle Metrics
| Metric | Value |
|--------|-------|
| Total JS | ${report.metrics.bundle.totalJSKB || 'N/A'} KB |
| Total CSS | ${report.metrics.bundle.totalCSSKB || 'N/A'} KB |
| Estimated Gzip | ${report.metrics.bundle.estimatedGzipKB || 'N/A'} KB |
| Chunk Count | ${report.metrics.bundle.chunkCount || 'N/A'} |
| Largest Chunk | ${report.metrics.bundle.largestChunk?.name || 'N/A'} (${report.metrics.bundle.largestChunk?.sizeKB || 'N/A'} KB) |

## Test Metrics
| Metric | Value |
|--------|-------|
| Line Coverage | ${report.metrics.tests.linesCoverage || 'N/A'}% |
| Branch Coverage | ${report.metrics.tests.branchesCoverage || 'N/A'}% |
| Test Files | ${report.metrics.tests.testFileCount || 'N/A'} |

## Security Checklist
- [${report.metrics.security.envValidation ? 'x' : ' '}] Environment validation
- [${report.metrics.security.securityMiddleware ? 'x' : ' '}] Security middleware
- [${report.metrics.security.rlsTests ? 'x' : ' '}] RLS tests

## Performance Checklist
- [${report.metrics.performance.lighthouseConfig ? 'x' : ' '}] Lighthouse config
- [${report.metrics.performance.lighthouse2MbConfig ? 'x' : ' '}] Lighthouse 2Mb config
- [${report.metrics.performance.networkAwareHooks ? 'x' : ' '}] Network-aware hooks
- [${report.metrics.performance.webVitalsReporter ? 'x' : ' '}] Web Vitals reporter

${report.issues.length > 0 ? `## Issues
${report.issues.map(i => `- ⚠️ ${i}`).join('\n')}` : ''}

${report.recommendations.length > 0 ? `## Recommendations
${report.recommendations.map(r => `- 💡 ${r}`).join('\n')}` : ''}
`;
}

// Run
generateReport();
