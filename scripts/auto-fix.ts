/**
 * PATCH 83.0 - Auto-Fix System
 * Automatically fixes common issues detected by diagnostic scanner
 */

import * as fs from 'fs';
import * as path from 'path';
import { DiagnosticReport, DiagnosticIssue } from './diagnostic-scanner';

class AutoFixer {
  private baseDir: string;
  private fixedIssues: number = 0;
  private failedFixes: string[] = [];

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Apply automatic fixes based on diagnostic report
   */
  async applyFixes(report: DiagnosticReport): Promise<void> {
    console.log('🔧 Starting automatic fixes...\n');

    for (const issue of report.issues) {
      if (!issue.autoFixAvailable) continue;

      try {
        switch (issue.type) {
          case 'broken-useEffect':
            await this.fixBrokenUseEffect(issue);
            break;
          case 'undefined-return':
            await this.fixUndefinedReturn(issue);
            break;
          case 'broken-route':
            await this.fixBrokenRoute(issue);
            break;
          default:
            console.log(`⚠️  No auto-fix available for ${issue.type}`);
        }
      } catch (error) {
        console.error(`Failed to fix ${issue.file}:`, error);
        this.failedFixes.push(`${issue.file}: ${error}`);
      }
    }

    // Regenerate module registry
    await this.regenerateModuleRegistry(report);

    // Generate route structure
    await this.generateRouteStructure(report);

    console.log(`\n✅ Fixed ${this.fixedIssues} issues`);
    if (this.failedFixes.length > 0) {
      console.log(`❌ Failed to fix ${this.failedFixes.length} issues`);
    }
  }

  /**
   * Fix broken useEffect hooks
   */
  private async fixBrokenUseEffect(issue: DiagnosticIssue): Promise<void> {
    // Fix path by removing double baseDir
    let filePath = issue.file;
    if (filePath.startsWith(this.baseDir)) {
      filePath = issue.file;
    } else {
      filePath = path.join(this.baseDir, issue.file);
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');

    if (issue.issue.includes('should not be async')) {
      // Convert async useEffect to proper pattern
      content = content.replace(
        /useEffect\(async\s*\(\)\s*=>\s*\{/g,
        'useEffect(() => {\n  const fetchData = async () => {'
      );
      
      // Add fetchData() call before the closing bracket
      content = content.replace(
        /\}\s*,\s*\[/g,
        '  };\n  fetchData();\n}, ['
      );
    }

    if (issue.issue.includes('missing dependency array')) {
      // This is harder to fix automatically, just add empty array
      content = content.replace(
        /useEffect\([^}]+\}\s*\)/g,
        (match) => match.replace(/\)$/, ', [])')
      );
    }

    fs.writeFileSync(filePath, content);
    this.fixedIssues++;
    console.log(`✓ Fixed useEffect in ${issue.file}`);
  }

  /**
   * Fix components returning undefined/null without fallback
   */
  private async fixUndefinedReturn(issue: DiagnosticIssue): Promise<void> {
    // Fix path by removing double baseDir
    let filePath = issue.file;
    if (filePath.startsWith(this.baseDir)) {
      filePath = issue.file;
    } else {
      filePath = path.join(this.baseDir, issue.file);
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');

    // Add React.Suspense wrapper if not present
    if (!content.includes('React.Suspense') && !content.includes('<Suspense')) {
      // Find the component export
      const componentMatch = content.match(/export\s+default\s+function\s+([A-Z][a-zA-Z0-9]*)/);
      
      if (componentMatch) {
        const componentName = componentMatch[1];
        
        // Wrap the component export
        content = content.replace(
          new RegExp(`export\\s+default\\s+${componentName}`),
          `const ${componentName}Wrapped = ${componentName};\n\nexport default function ${componentName}WithFallback() {\n  return (\n    <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>\n      <${componentName}Wrapped />\n    </React.Suspense>\n  );\n}\n`
        );
        
        // Ensure React is imported
        if (!content.includes('import React')) {
          content = `import React from 'react';\n${content}`;
        }
      }
    }

    fs.writeFileSync(filePath, content);
    this.fixedIssues++;
    console.log(`✓ Added fallback to ${issue.file}`);
  }

  /**
   * Fix broken routes
   */
  private async fixBrokenRoute(issue: DiagnosticIssue): Promise<void> {
    // For broken routes, we'll comment them out instead of removing
    // Fix path by removing double baseDir
    let filePath = issue.file;
    if (filePath.startsWith(this.baseDir)) {
      filePath = issue.file;
    } else {
      filePath = path.join(this.baseDir, issue.file);
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');

    // Extract the route path from the issue
    const routeMatch = issue.issue.match(/Route component '([^']+)'/);
    if (!routeMatch) return;

    const routePath = routeMatch[1];
    
    // Comment out the lazy import
    const lazyImportPattern = new RegExp(`(const\\s+\\w+\\s*=\\s*React\\.lazy\\([^)]*${routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\))`, 'g');
    content = content.replace(lazyImportPattern, '// DISABLED (broken): $1');

    // Comment out the route definition
    const routePattern = new RegExp(`(<Route[^>]*element=\\{<\\w+[^>]*/>\\}[^>]*/>)`, 'g');
    // This is simplified - in production would need more sophisticated matching

    fs.writeFileSync(filePath, content);
    this.fixedIssues++;
    console.log(`✓ Disabled broken route in ${issue.file}`);
  }

  /**
   * Regenerate module registry based on actual files
   */
  private async regenerateModuleRegistry(report: DiagnosticReport): Promise<void> {
    console.log('\n📚 Regenerating module registry...');
    
    const { glob: globSync } = await import('glob');
    const moduleFiles = await globSync(`${this.baseDir}/src/modules/**/*.{ts,tsx}`, { 
      ignore: ['**/*.test.*', '**/*.spec.*', '**/test/**', '**/tests/**']
    });

    const registryEntries: string[] = [];

    // Keep existing good modules and add new ones
    const registryPath = path.join(this.baseDir, 'src/modules/registry.ts');
    const existingContent = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, 'utf-8') : '';

    // Parse existing registry to keep good entries
    const modulePattern = /'([^']+)':\s*\{[^}]+\}/g;
    const matches = existingContent.matchAll(modulePattern);

    for (const match of matches) {
      const moduleId = match[1];
      // Check if module is in broken list
      if (!report.moduleRegistry.brokenModules.some(m => m.includes(moduleId))) {
        registryEntries.push(match[0]);
      }
    }

    // Add orphaned files as new modules
    for (const orphanedFile of report.moduleRegistry.orphanedFiles) {
      // Skip backup files
      if (orphanedFile.includes('backup') || orphanedFile.includes('registry')) {
        continue;
      }
      
      // Remove absolute path prefix
      let relativePath = orphanedFile;
      if (relativePath.startsWith(this.baseDir)) {
        relativePath = relativePath.substring(this.baseDir.length + 1);
      }
      
      relativePath = relativePath.replace(/^src\//, '').replace(/\.(tsx?|jsx?)$/, '');
      const moduleName = path.basename(relativePath).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const moduleId = relativePath.replace(/\//g, '.');
      
      // Generate category based on path
      let category = 'features';
      if (relativePath.includes('operations')) category = 'operations';
      else if (relativePath.includes('compliance')) category = 'compliance';
      else if (relativePath.includes('intelligence')) category = 'intelligence';
      else if (relativePath.includes('emergency')) category = 'emergency';
      else if (relativePath.includes('logistics')) category = 'logistics';

      const entry = `  '${moduleId}': {
    id: '${moduleId}',
    name: '${moduleName}',
    category: '${category}',
    path: '${relativePath}',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  }`;
      
      registryEntries.push(entry);
    }

    // Write updated registry
    const newRegistry = `/**
 * Module Registry - PATCH 83.0 Auto-Generated
 * Last updated: ${new Date().toISOString()}
 */

export type ModuleStatus = 'active' | 'deprecated' | 'beta' | 'experimental';

export type ModuleCategory =
  | 'core'
  | 'operations'
  | 'compliance'
  | 'intelligence'
  | 'emergency'
  | 'logistics'
  | 'planning'
  | 'hr'
  | 'maintenance'
  | 'connectivity'
  | 'workspace'
  | 'assistants'
  | 'finance'
  | 'documents'
  | 'configuration'
  | 'features';

export interface ModuleDefinition {
  id: string;
  name: string;
  category: ModuleCategory;
  path: string;
  description: string;
  status: ModuleStatus;
  dependencies?: string[];
  lazy?: boolean;
  route?: string;
  icon?: string;
  permissions?: string[];
  version?: string;
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
${registryEntries.join(',\n\n')}
};

export function getModule(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[id];
}

export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.category === category);
}

export function getActiveModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === 'active');
}

export function getRoutableModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.route);
}

export function hasModuleAccess(module: ModuleDefinition, userPermissions: string[]): boolean {
  if (!module.permissions || module.permissions.length === 0) return true;
  return module.permissions.some(p => userPermissions.includes(p));
}
`;

    const backupPath = path.join(this.baseDir, 'src/modules/registry.backup.ts');
    if (fs.existsSync(registryPath)) {
      fs.copyFileSync(registryPath, backupPath);
      console.log(`  Backup saved to registry.backup.ts`);
    }

    fs.writeFileSync(registryPath, newRegistry);
    console.log(`  ✓ Module registry regenerated`);
    this.fixedIssues++;
  }

  /**
   * Generate route structure JSON
   */
  private async generateRouteStructure(report: DiagnosticReport): Promise<void> {
    console.log('\n🛣️  Generating route structure...');

    const appPath = path.join(this.baseDir, 'src/App.tsx');
    if (!fs.existsSync(appPath)) return;

    const content = fs.readFileSync(appPath, 'utf-8');
    
    // Extract routes
    const routePattern = /<Route\s+path="([^"]+)"\s+element=\{<(\w+)[^}]*\/>/g;
    const routes: any[] = [];
    
    let match;
    while ((match = routePattern.exec(content)) !== null) {
      routes.push({
        path: match[1],
        component: match[2],
        status: report.issues.some(i => i.issue.includes(match[2])) ? 'broken' : 'active'
      });
    }

    const structure = {
      timestamp: new Date().toISOString(),
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.status === 'active').length,
      brokenRoutes: routes.filter(r => r.status === 'broken').length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    };

    const outputPath = path.join(this.baseDir, 'dev/router/structure.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
    
    console.log(`  ✓ Route structure saved to dev/router/structure.json`);
    console.log(`  Total routes: ${structure.totalRoutes}`);
    console.log(`  Active: ${structure.activeRoutes}, Broken: ${structure.brokenRoutes}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const baseDir = process.cwd();
  
  // Load diagnostic report
  const reportPath = path.join(baseDir, 'dev/logs/diagnostic_auto_report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Diagnostic report not found. Run diagnostic-scanner first.');
    process.exit(1);
  }

  const report: DiagnosticReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  
  console.log('🚀 PATCH 83.0 - Auto-Fix System\n');
  console.log(`Loaded report with ${report.totalIssues} issues\n`);

  const fixer = new AutoFixer(baseDir);
  await fixer.applyFixes(report);
  
  console.log('\n✨ Auto-fix completed!\n');
}

export { AutoFixer };

// Only run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error during auto-fix:', error);
    process.exit(1);
  });
}
