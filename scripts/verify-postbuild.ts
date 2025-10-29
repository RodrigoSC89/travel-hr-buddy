#!/usr/bin/env tsx
/**
 * Post-Build Verification Script - PATCH 505
 * Validates build output and checks for issues
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileSize {
  file: string;
  size: number;
  sizeKB: number;
  sizeMB: number;
}

interface VerificationResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  fileSizes: FileSize[];
  totalSize: number;
  routes: string[];
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): { kb: number; mb: number } {
  return {
    kb: Math.round(bytes / 1024 * 100) / 100,
    mb: Math.round(bytes / (1024 * 1024) * 100) / 100
  };
}

/**
 * Scan dist directory for main files
 */
function scanDistDirectory(): FileSize[] {
  const distDir = path.join(process.cwd(), 'dist');
  const files: FileSize[] = [];

  if (!fs.existsSync(distDir)) {
    return files;
  }

  // Scan for JS and CSS files
  function scanDir(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.js', '.css', '.html'].includes(ext)) {
            const size = getFileSize(fullPath);
            const formatted = formatBytes(size);
            files.push({
              file: path.relative(distDir, fullPath),
              size,
              sizeKB: formatted.kb,
              sizeMB: formatted.mb
            });
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  scanDir(distDir);
  return files;
}

/**
 * Check for oversized files
 */
function checkFileSizes(files: FileSize[]): string[] {
  const warnings: string[] = [];

  // Thresholds
  const MAX_JS_SIZE_MB = 5;
  const MAX_CSS_SIZE_MB = 1;

  files.forEach(file => {
    const ext = path.extname(file.file);

    if (ext === '.js' && file.sizeMB > MAX_JS_SIZE_MB) {
      warnings.push(`⚠️  Large JS file: ${file.file} (${file.sizeMB} MB)`);
    }

    if (ext === '.css' && file.sizeMB > MAX_CSS_SIZE_MB) {
      warnings.push(`⚠️  Large CSS file: ${file.file} (${file.sizeMB} MB)`);
    }
  });

  return warnings;
}

/**
 * Extract routes from build
 */
function extractRoutes(): string[] {
  const routes: string[] = [];
  const distDir = path.join(process.cwd(), 'dist');

  // Look for HTML files as route indicators
  function scanForHtml(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanForHtml(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          const relativePath = path.relative(distDir, fullPath);
          routes.push('/' + relativePath.replace(/\.html$/, '').replace(/\\/g, '/'));
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  if (fs.existsSync(distDir)) {
    scanForHtml(distDir);
  }

  // Add default routes
  if (routes.length === 0) {
    routes.push('/');
  }

  return routes;
}

/**
 * Verify required files exist
 */
function verifyRequiredFiles(): string[] {
  const errors: string[] = [];
  const distDir = path.join(process.cwd(), 'dist');

  const requiredFiles = [
    'index.html',
    'assets'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`❌ Missing required file/directory: ${file}`);
    }
  });

  return errors;
}

/**
 * Check for common issues
 */
function checkCommonIssues(): string[] {
  const warnings: string[] = [];
  const distDir = path.join(process.cwd(), 'dist');

  // Check if dist exists
  if (!fs.existsSync(distDir)) {
    return ['❌ dist directory not found. Run build first.'];
  }

  // Check for source maps in production
  function checkForSourceMaps(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          checkForSourceMaps(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.map')) {
          warnings.push(`⚠️  Source map found in production: ${path.relative(distDir, fullPath)}`);
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  checkForSourceMaps(distDir);

  return warnings;
}

/**
 * Generate verification report
 */
function generateReport(result: VerificationResult): string {
  const lines: string[] = [];

  lines.push('========================================');
  lines.push('  POST-BUILD VERIFICATION REPORT');
  lines.push('========================================\n');

  lines.push(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`);

  // File Sizes
  lines.push('📊 File Sizes:');
  lines.push('-'.repeat(60));
  
  const sortedFiles = result.fileSizes.sort((a, b) => b.size - a.size).slice(0, 10);
  sortedFiles.forEach(file => {
    lines.push(`  ${file.file.padEnd(40)} ${file.sizeMB.toFixed(2)} MB`);
  });

  const totalMB = formatBytes(result.totalSize).mb;
  lines.push(`\n  Total: ${totalMB.toFixed(2)} MB`);

  // Routes
  lines.push('\n\n🛣️  Active Routes:');
  lines.push('-'.repeat(60));
  result.routes.forEach(route => {
    lines.push(`  ${route}`);
  });

  // Warnings
  if (result.warnings.length > 0) {
    lines.push('\n\n⚠️  Warnings:');
    lines.push('-'.repeat(60));
    result.warnings.forEach(warning => {
      lines.push(`  ${warning}`);
    });
  }

  // Errors
  if (result.errors.length > 0) {
    lines.push('\n\n❌ Errors:');
    lines.push('-'.repeat(60));
    result.errors.forEach(error => {
      lines.push(`  ${error}`);
    });
  }

  lines.push('\n========================================\n');

  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Post-Build Verification - PATCH 505\n');

  const result: VerificationResult = {
    success: true,
    warnings: [],
    errors: [],
    fileSizes: [],
    totalSize: 0,
    routes: []
  };

  // Scan files
  console.log('Scanning build output...');
  result.fileSizes = scanDistDirectory();
  result.totalSize = result.fileSizes.reduce((sum, file) => sum + file.size, 0);

  // Check file sizes
  const sizeWarnings = checkFileSizes(result.fileSizes);
  result.warnings.push(...sizeWarnings);

  // Extract routes
  result.routes = extractRoutes();

  // Verify required files
  const fileErrors = verifyRequiredFiles();
  result.errors.push(...fileErrors);

  // Check common issues
  const issueWarnings = checkCommonIssues();
  result.warnings.push(...issueWarnings);

  // Set success status
  result.success = result.errors.length === 0;

  // Generate and display report
  const report = generateReport(result);
  console.log(report);

  // Save report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'postbuild-verification.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report saved to: ${reportPath}`);

  // Save JSON version
  const jsonReportPath = path.join(reportsDir, 'postbuild-verification.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(result, null, 2));
  console.log(`📄 JSON report saved to: ${jsonReportPath}`);

  // Exit with error if verification failed
  if (!result.success) {
    process.exit(1);
  }
}

// Run if executed directly
main();

export { scanDistDirectory, checkFileSizes, extractRoutes };
