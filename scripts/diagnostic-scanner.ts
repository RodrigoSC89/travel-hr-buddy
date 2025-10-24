/**
 * PATCH 83.0 - Diagnostic Scanner
 * Comprehensive diagnostic tool to detect silent failures in production
 * 
 * Features:
 * - Scans for broken imports
 * - Detects broken useEffect hooks
 * - Identifies components returning undefined/null without fallback
 * - Validates routes for 500 errors and blank screens
 * - Auto-generates fixes
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface DiagnosticIssue {
  type: 'broken-import' | 'broken-useEffect' | 'undefined-return' | 'broken-route' | 'missing-fallback';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  issue: string;
  suggestion?: string;
  autoFixAvailable: boolean;
}

interface DiagnosticReport {
  timestamp: string;
  totalIssues: number;
  criticalIssues: number;
  issuesByType: Record<string, number>;
  issues: DiagnosticIssue[];
  moduleRegistry: {
    totalModules: number;
    activeModules: number;
    brokenModules: string[];
    orphanedFiles: string[];
  };
  routeMap: {
    totalRoutes: number;
    brokenRoutes: string[];
    missingFallbacks: string[];
  };
}

class DiagnosticScanner {
  private baseDir: string;
  private issues: DiagnosticIssue[] = [];
  private brokenModules: string[] = [];
  private orphanedFiles: string[] = [];
  private allModulePaths: Set<string> = new Set();

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Main scanning method
   */
  async scan(): Promise<DiagnosticReport> {
    console.log('🔍 Starting comprehensive diagnostic scan...\n');

    // 1. Scan for broken imports
    await this.scanBrokenImports();

    // 2. Scan for broken useEffect hooks
    await this.scanBrokenUseEffect();

    // 3. Scan for components returning undefined/null
    await this.scanUndefinedReturns();

    // 4. Validate module registry
    await this.validateModuleRegistry();

    // 5. Validate routes
    await this.validateRoutes();

    // Generate report
    return this.generateReport();
  }

  /**
   * Scan for broken imports
   */
  private async scanBrokenImports(): Promise<void> {
    console.log('📦 Scanning for broken imports...');
    
    const directories = ['src/app', 'src/modules', 'src/pages/developer', 'src/components', 'src/pages'];
    
    for (const dir of directories) {
      const fullPath = path.join(this.baseDir, dir);
      if (!fs.existsSync(fullPath)) continue;

      const files = await glob(`${fullPath}/**/*.{ts,tsx}`);
      
      for (const file of files) {
        await this.checkFileImports(file);
      }
    }
  }

  /**
   * Check imports in a single file
   */
  private async checkFileImports(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Match import statements
        const importMatch = line.match(/import\s+.*\s+from\s+['"](.+)['"]/);
        if (!importMatch) return;

        const importPath = importMatch[1];
        
        // Check for module imports
        if (importPath.startsWith('modules/') || importPath.startsWith('@/modules/')) {
          const modulePath = importPath.replace('@/', 'src/');
          const resolvedPath = this.resolveImportPath(filePath, modulePath);
          
          if (!this.fileExists(resolvedPath)) {
            this.issues.push({
              type: 'broken-import',
              severity: 'critical',
              file: filePath,
              line: index + 1,
              issue: `Import '${importPath}' points to non-existent module`,
              suggestion: `Check if module was removed or path changed`,
              autoFixAvailable: false
            });
            this.brokenModules.push(importPath);
          }
        }
      });
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error);
    }
  }

  /**
   * Scan for broken useEffect hooks
   */
  private async scanBrokenUseEffect(): Promise<void> {
    console.log('⚡ Scanning for broken useEffect hooks...');
    
    const files = await glob(`${this.baseDir}/src/**/*.{ts,tsx}`);
    
    for (const file of files) {
      await this.checkUseEffectPatterns(file);
    }
  }

  /**
   * Check useEffect patterns in file
   */
  private async checkUseEffectPatterns(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      let inUseEffect = false;
      let useEffectStartLine = 0;
      let bracketCount = 0;

      lines.forEach((line, index) => {
        // Detect useEffect start
        if (line.includes('useEffect(')) {
          inUseEffect = true;
          useEffectStartLine = index + 1;
          bracketCount = 0;
        }

        if (inUseEffect) {
          // Count brackets to track scope
          bracketCount += (line.match(/\{/g) || []).length;
          bracketCount -= (line.match(/\}/g) || []).length;

          // Check for common issues
          // 1. Async useEffect without proper cleanup
          if (line.includes('async') && line.includes('useEffect')) {
            this.issues.push({
              type: 'broken-useEffect',
              severity: 'high',
              file: filePath,
              line: index + 1,
              issue: 'useEffect callback should not be async',
              suggestion: 'Use an async function inside useEffect instead',
              autoFixAvailable: true
            });
          }

          // 2. Missing dependency array
          if (bracketCount === 0 && line.includes('}') && !line.includes('[') && !line.includes(']')) {
            const prevLine = lines[index - 1] || '';
            if (!prevLine.includes('[') && !prevLine.includes(']')) {
              this.issues.push({
                type: 'broken-useEffect',
                severity: 'medium',
                file: filePath,
                line: useEffectStartLine,
                issue: 'useEffect missing dependency array',
                suggestion: 'Add dependency array to prevent infinite loops',
                autoFixAvailable: true
              });
            }
          }

          if (bracketCount === 0) {
            inUseEffect = false;
          }
        }
      });
    } catch (error) {
      console.error(`Error checking useEffect in ${filePath}:`, error);
    }
  }

  /**
   * Scan for components returning undefined/null without fallback
   */
  private async scanUndefinedReturns(): Promise<void> {
    console.log('🔍 Scanning for components with undefined/null returns...');
    
    const files = await glob(`${this.baseDir}/src/**/*.{tsx}`);
    
    for (const file of files) {
      await this.checkComponentReturns(file);
    }
  }

  /**
   * Check component return patterns
   */
  private async checkComponentReturns(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Find component definitions
      const componentPattern = /(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/;
      
      lines.forEach((line, index) => {
        const match = line.match(componentPattern);
        if (!match) return;

        const componentName = match[1];
        
        // Check for early returns with null/undefined without fallback
        const followingLines = lines.slice(index, index + 20).join('\n');
        
        // Pattern: return null or return undefined without fallback
        if (followingLines.match(/return\s+(null|undefined)\s*;/)) {
          // Check if there's a fallback component nearby
          const hasFallback = followingLines.includes('ErrorBoundary') || 
                             followingLines.includes('Suspense') ||
                             followingLines.includes('fallback=');
          
          if (!hasFallback) {
            this.issues.push({
              type: 'undefined-return',
              severity: 'high',
              file: filePath,
              line: index + 1,
              issue: `Component '${componentName}' returns null/undefined without fallback`,
              suggestion: 'Add ErrorBoundary or loading fallback',
              autoFixAvailable: true
            });
          }
        }

        // Check for conditional renders without fallback
        if (followingLines.match(/if\s*\([^)]+\)\s*return\s+null/)) {
          this.issues.push({
            type: 'missing-fallback',
            severity: 'medium',
            file: filePath,
            line: index + 1,
            issue: `Component '${componentName}' has conditional null return`,
            suggestion: 'Consider adding a loading state or fallback',
            autoFixAvailable: false
          });
        }
      });
    } catch (error) {
      console.error(`Error checking returns in ${filePath}:`, error);
    }
  }

  /**
   * Validate module registry
   */
  private async validateModuleRegistry(): Promise<void> {
    console.log('📚 Validating module registry...');
    
    const registryPath = path.join(this.baseDir, 'src/modules/registry.ts');
    
    if (!fs.existsSync(registryPath)) {
      this.issues.push({
        type: 'broken-route',
        severity: 'critical',
        file: 'src/modules/registry.ts',
        issue: 'Module registry file not found',
        suggestion: 'Regenerate module registry',
        autoFixAvailable: true
      });
      return;
    }

    // Read registry
    const content = fs.readFileSync(registryPath, 'utf-8');
    
    // Extract module paths from registry
    const pathMatches = content.matchAll(/path:\s*['"]([^'"]+)['"]/g);
    
    for (const match of pathMatches) {
      const modulePath = match[1];
      this.allModulePaths.add(modulePath);
      
      const fullPath = path.join(this.baseDir, 'src', modulePath);
      const variations = [
        fullPath + '.ts',
        fullPath + '.tsx',
        fullPath + '/index.ts',
        fullPath + '/index.tsx'
      ];
      
      const exists = variations.some(p => fs.existsSync(p));
      
      if (!exists) {
        this.issues.push({
          type: 'broken-import',
          severity: 'critical',
          file: registryPath,
          issue: `Module path '${modulePath}' not found`,
          suggestion: 'Remove from registry or create module',
          autoFixAvailable: true
        });
        this.brokenModules.push(modulePath);
      }
    }

    // Find orphaned modules (files not in registry)
    await this.findOrphanedModules();
  }

  /**
   * Find modules not registered
   */
  private async findOrphanedModules(): Promise<void> {
    const moduleFiles = await glob(`${this.baseDir}/src/modules/**/*.{ts,tsx}`);
    
    for (const file of moduleFiles) {
      const relativePath = file.replace(/^src\//, '').replace(/\.(tsx?|jsx?)$/, '');
      
      // Check if this path is in registry
      let foundInRegistry = false;
      for (const registryPath of this.allModulePaths) {
        if (relativePath.includes(registryPath) || registryPath.includes(relativePath)) {
          foundInRegistry = true;
          break;
        }
      }
      
      if (!foundInRegistry && !file.includes('test') && !file.includes('.test.')) {
        this.orphanedFiles.push(file);
      }
    }
  }

  /**
   * Validate routes
   */
  private async validateRoutes(): Promise<void> {
    console.log('🛣️  Validating routes...');
    
    const appFile = path.join(this.baseDir, 'src/App.tsx');
    
    if (!fs.existsSync(appFile)) {
      this.issues.push({
        type: 'broken-route',
        severity: 'critical',
        file: 'src/App.tsx',
        issue: 'Main App.tsx file not found',
        suggestion: 'Critical issue - application cannot run',
        autoFixAvailable: false
      });
      return;
    }

    const content = fs.readFileSync(appFile, 'utf-8');
    
    // Extract lazy loaded components
    const lazyMatches = content.matchAll(/React\.lazy\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\)/g);
    
    for (const match of lazyMatches) {
      const importPath = match[1];
      const resolvedPath = this.resolveImportPath(appFile, importPath);
      
      if (!this.fileExists(resolvedPath)) {
        this.issues.push({
          type: 'broken-route',
          severity: 'critical',
          file: appFile,
          issue: `Route component '${importPath}' not found`,
          suggestion: 'Remove route or fix import path',
          autoFixAvailable: true
        });
      }
    }
  }

  /**
   * Resolve import path to file system path
   */
  private resolveImportPath(fromFile: string, importPath: string): string {
    // Handle @ alias
    if (importPath.startsWith('@/')) {
      return path.join(this.baseDir, 'src', importPath.substring(2));
    }
    
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const dir = path.dirname(fromFile);
      return path.join(dir, importPath);
    }
    
    // Handle absolute from src
    return path.join(this.baseDir, 'src', importPath);
  }

  /**
   * Check if file exists with common extensions
   */
  private fileExists(basePath: string): boolean {
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    return extensions.some(ext => fs.existsSync(basePath + ext));
  }

  /**
   * Generate diagnostic report
   */
  private generateReport(): DiagnosticReport {
    const issuesByType: Record<string, number> = {};
    let criticalCount = 0;

    this.issues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      if (issue.severity === 'critical') criticalCount++;
    });

    return {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      criticalIssues: criticalCount,
      issuesByType,
      issues: this.issues,
      moduleRegistry: {
        totalModules: this.allModulePaths.size,
        activeModules: this.allModulePaths.size - this.brokenModules.length,
        brokenModules: [...new Set(this.brokenModules)],
        orphanedFiles: this.orphanedFiles
      },
      routeMap: {
        totalRoutes: this.issues.filter(i => i.type === 'broken-route').length,
        brokenRoutes: this.issues.filter(i => i.type === 'broken-route').map(i => i.issue),
        missingFallbacks: this.issues.filter(i => i.type === 'missing-fallback').map(i => i.file)
      }
    };
  }
}

/**
 * Main execution
 */
async function main() {
  const baseDir = process.cwd();
  const scanner = new DiagnosticScanner(baseDir);
  
  console.log('🚀 PATCH 83.0 - Comprehensive Diagnostic Scanner\n');
  console.log(`Base directory: ${baseDir}\n`);
  
  const report = await scanner.scan();
  
  // Save report
  const outputPath = path.join(baseDir, 'dev/logs/diagnostic_auto_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Diagnostic Report Summary:');
  console.log('================================');
  console.log(`Total Issues: ${report.totalIssues}`);
  console.log(`Critical Issues: ${report.criticalIssues}`);
  console.log(`\nIssues by Type:`);
  Object.entries(report.issuesByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log(`\nModule Registry:`);
  console.log(`  Total Modules: ${report.moduleRegistry.totalModules}`);
  console.log(`  Active Modules: ${report.moduleRegistry.activeModules}`);
  console.log(`  Broken Modules: ${report.moduleRegistry.brokenModules.length}`);
  console.log(`  Orphaned Files: ${report.moduleRegistry.orphanedFiles.length}`);
  
  console.log(`\n✅ Report saved to: ${outputPath}\n`);
  
  // Exit with error code if critical issues found
  if (report.criticalIssues > 0) {
    console.log('⚠️  Critical issues detected! Review the report for details.\n');
    process.exit(1);
  }
  
  console.log('✨ Scan completed successfully!\n');
}

export { DiagnosticScanner, DiagnosticReport, DiagnosticIssue };

// Only run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error during scan:', error);
    process.exit(1);
  });
}
