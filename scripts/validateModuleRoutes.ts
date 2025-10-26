/**
 * PATCH 195.0 - Module Routes Validator
 * Validates module registry against actual routes and files
 */

import * as fs from 'fs';
import * as path from 'path';

interface Module {
  id: string;
  name: string;
  path: string;
  route: string;
  status: string;
  category: string;
  description: string;
  hasDatabase: boolean;
  hasMockData: boolean;
  version?: string;
  deprecatedIn?: string;
  replacedBy?: string;
}

interface Route {
  path: string;
  module: string;
  status: string;
  type: string;
  redirectTo?: string;
}

interface Registry {
  version: string;
  lastUpdated: string;
  modules: Module[];
  routes: Route[];
  statistics: {
    totalModules: number;
    activeModules: number;
    deprecatedModules: number;
    modulesWithRealData: number;
    modulesWithMockData: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export class ModuleValidator {
  private registry: Registry;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    const registryPath = path.join(projectRoot, 'modules-registry.json');
    
    if (!fs.existsSync(registryPath)) {
      throw new Error('modules-registry.json not found');
    }

    this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  }

  /**
   * Validate all modules and routes
   */
  validate(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      info: []
    };

    // Validate modules
    this.validateModules(result);

    // Validate routes
    this.validateRoutes(result);

    // Validate module files exist
    this.validateModuleFiles(result);

    // Validate App.tsx routes
    this.validateAppRoutes(result);

    // Check for ghost routes
    this.checkGhostRoutes(result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  private validateModules(result: ValidationResult): void {
    const activeModules = this.registry.modules.filter(m => m.status === 'active');
    const deprecatedModules = this.registry.modules.filter(m => m.status === 'deprecated');

    result.info.push(`Found ${this.registry.modules.length} total modules`);
    result.info.push(`Active modules: ${activeModules.length}`);
    result.info.push(`Deprecated modules: ${deprecatedModules.length}`);

    // Check for duplicate IDs
    const ids = new Set<string>();
    this.registry.modules.forEach(module => {
      if (ids.has(module.id)) {
        result.errors.push(`Duplicate module ID: ${module.id}`);
      }
      ids.add(module.id);
    });

    // Validate deprecated modules have replacement
    deprecatedModules.forEach(module => {
      if (!module.replacedBy) {
        result.warnings.push(`Deprecated module ${module.id} has no replacement specified`);
      }
    });

    // Check modules with mock data
    const mockDataModules = this.registry.modules.filter(m => m.hasMockData && m.status === 'active');
    if (mockDataModules.length > 0) {
      result.warnings.push(
        `${mockDataModules.length} active modules still use mock data: ${
          mockDataModules.map(m => m.id).join(', ')
        }`
      );
    }
  }

  private validateRoutes(result: ValidationResult): void {
    const activeRoutes = this.registry.routes.filter(r => r.status === 'active');
    const redirectRoutes = this.registry.routes.filter(r => r.status === 'redirect');

    result.info.push(`Found ${this.registry.routes.length} total routes`);
    result.info.push(`Active routes: ${activeRoutes.length}`);
    result.info.push(`Redirect routes: ${redirectRoutes.length}`);

    // Check for duplicate routes
    const paths = new Set<string>();
    this.registry.routes.forEach(route => {
      if (paths.has(route.path)) {
        result.errors.push(`Duplicate route path: ${route.path}`);
      }
      paths.add(route.path);
    });

    // Validate redirect targets exist
    redirectRoutes.forEach(route => {
      if (route.redirectTo) {
        const targetExists = this.registry.routes.some(
          r => r.path === route.redirectTo && r.status === 'active'
        );
        if (!targetExists) {
          result.errors.push(`Redirect route ${route.path} points to non-existent target: ${route.redirectTo}`);
        }
      }
    });

    // Validate all routes have a corresponding module
    this.registry.routes.forEach(route => {
      const moduleExists = this.registry.modules.some(m => m.id === route.module);
      if (!moduleExists) {
        result.errors.push(`Route ${route.path} references non-existent module: ${route.module}`);
      }
    });
  }

  private validateModuleFiles(result: ValidationResult): void {
    this.registry.modules
      .filter(m => m.status === 'active')
      .forEach(module => {
        const modulePath = path.join(this.projectRoot, 'src', module.path);
        const indexPath = path.join(modulePath, 'index.tsx');
        
        if (!fs.existsSync(indexPath)) {
          result.errors.push(`Module file not found: ${module.path}/index.tsx for module ${module.id}`);
        } else {
          result.info.push(`✓ Module file exists: ${module.id}`);
        }
      });
  }

  private validateAppRoutes(result: ValidationResult): void {
    const appTsxPath = path.join(this.projectRoot, 'src', 'App.tsx');
    
    if (!fs.existsSync(appTsxPath)) {
      result.errors.push('App.tsx not found');
      return;
    }

    const appContent = fs.readFileSync(appTsxPath, 'utf-8');
    
    // Check if all active routes are in App.tsx
    this.registry.routes
      .filter(r => r.status === 'active')
      .forEach(route => {
        const routePattern = `path="${route.path}"`;
        if (!appContent.includes(routePattern)) {
          result.warnings.push(`Route ${route.path} not found in App.tsx`);
        }
      });

    // Check for deprecated routes still in App.tsx
    this.registry.modules
      .filter(m => m.status === 'deprecated')
      .forEach(module => {
        const routePattern = `path="${module.route}"`;
        if (appContent.includes(routePattern) && !appContent.includes('deprecated')) {
          result.warnings.push(`Deprecated route ${module.route} still active in App.tsx`);
        }
      });
  }

  private checkGhostRoutes(result: ValidationResult): void {
    const appTsxPath = path.join(this.projectRoot, 'src', 'App.tsx');
    
    if (!fs.existsSync(appTsxPath)) {
      return;
    }

    const appContent = fs.readFileSync(appTsxPath, 'utf-8');
    const routeMatches = appContent.matchAll(/path="([^"]+)"/g);
    
    for (const match of routeMatches) {
      const routePath = match[1];
      const isInRegistry = this.registry.routes.some(r => r.path === routePath);
      
      if (!isInRegistry && !routePath.startsWith(':') && !routePath.includes('*')) {
        result.warnings.push(`Ghost route found in App.tsx: ${routePath} (not in registry)`);
      }
    }
  }

  /**
   * Generate validation report
   */
  generateReport(): string {
    const result = this.validate();
    
    let report = '='.repeat(60) + '\n';
    report += 'MODULE REGISTRY VALIDATION REPORT\n';
    report += '='.repeat(60) + '\n\n';
    
    report += `Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Timestamp: ${new Date().toISOString()}\n\n`;
    
    if (result.errors.length > 0) {
      report += 'ERRORS:\n';
      result.errors.forEach(error => {
        report += `  ❌ ${error}\n`;
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += 'WARNINGS:\n';
      result.warnings.forEach(warning => {
        report += `  ⚠️  ${warning}\n`;
      });
      report += '\n';
    }
    
    if (result.info.length > 0) {
      report += 'INFORMATION:\n';
      result.info.forEach(info => {
        report += `  ℹ️  ${info}\n`;
      });
      report += '\n';
    }
    
    report += '='.repeat(60) + '\n';
    
    return report;
  }

  /**
   * List deprecated modules
   */
  listDeprecated(): Module[] {
    return this.registry.modules.filter(m => m.status === 'deprecated');
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.registry.statistics;
  }
}

// CLI execution
if (require.main === module) {
  try {
    const validator = new ModuleValidator();
    const report = validator.generateReport();
    console.log(report);
    
    const deprecated = validator.listDeprecated();
    if (deprecated.length > 0) {
      console.log('\nDEPRECATED MODULES:');
      deprecated.forEach(module => {
        console.log(`  - ${module.id} (${module.name})`);
        if (module.replacedBy) {
          console.log(`    → Replaced by: ${module.replacedBy}`);
        }
        if (module.deprecatedIn) {
          console.log(`    → Deprecated in: v${module.deprecatedIn}`);
        }
      });
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('Validation failed:', error.message);
    process.exit(1);
  }
}

export default ModuleValidator;
