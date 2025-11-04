/**
 * Module Verification Tests
 * 
 * Tests to verify the module structure and documentation
 * Based on the comprehensive verification performed in PATCH-XXX
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

describe('Module Verification', () => {
  const modulesDir = join(process.cwd(), 'src', 'modules');
  const docsModulesDir = join(process.cwd(), 'docs', 'modules');
  const registryPath = join(process.cwd(), 'modules-registry.json');
  const completeRegistryPath = join(process.cwd(), 'modules-registry-complete.json');

  it('should have src/modules directory', () => {
    expect(existsSync(modulesDir)).toBe(true);
  });

  it('should have docs/modules directory', () => {
    expect(existsSync(docsModulesDir)).toBe(true);
  });

  it('should have modules-registry.json', () => {
    expect(existsSync(registryPath)).toBe(true);
  });

  it('should have modules-registry-complete.json', () => {
    expect(existsSync(completeRegistryPath)).toBe(true);
  });

  it('should have at least 140 module directories', () => {
    if (!existsSync(modulesDir)) return;
    
    const modules = readdirSync(modulesDir).filter(item => {
      const fullPath = join(modulesDir, item);
      return statSync(fullPath).isDirectory();
    });

    expect(modules.length).toBeGreaterThanOrEqual(140);
  });

  it('should have comprehensive documentation coverage', () => {
    if (!existsSync(modulesDir) || !existsSync(docsModulesDir)) return;
    
    const modules = readdirSync(modulesDir).filter(item => {
      const fullPath = join(modulesDir, item);
      return statSync(fullPath).isDirectory();
    });

    const docFiles = readdirSync(docsModulesDir).filter(file => 
      file.endsWith('.md') && file !== 'README.md' && file !== 'INDEX.md'
    );

    // Should have documentation for at least 95% of modules
    const coverageRatio = docFiles.length / modules.length;
    expect(coverageRatio).toBeGreaterThanOrEqual(0.95);
  });

  it('should have valid complete registry structure', () => {
    if (!existsSync(completeRegistryPath)) return;
    
    const registryContent = readFileSync(completeRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    expect(registry).toHaveProperty('version');
    expect(registry).toHaveProperty('lastUpdated');
    expect(registry).toHaveProperty('modules');
    expect(registry).toHaveProperty('statistics');
    expect(Array.isArray(registry.modules)).toBe(true);
  });

  it('should have complete registry with at least 140 modules', () => {
    if (!existsSync(completeRegistryPath)) return;
    
    const registryContent = readFileSync(completeRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    expect(registry.modules.length).toBeGreaterThanOrEqual(140);
  });

  it('should have proper module structure in complete registry', () => {
    if (!existsSync(completeRegistryPath)) return;
    
    const registryContent = readFileSync(completeRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    if (registry.modules.length === 0) return;

    const firstModule = registry.modules[0];
    expect(firstModule).toHaveProperty('id');
    expect(firstModule).toHaveProperty('name');
    expect(firstModule).toHaveProperty('path');
    expect(firstModule).toHaveProperty('status');
    expect(firstModule).toHaveProperty('category');
    expect(firstModule).toHaveProperty('description');
  });

  it('should categorize modules properly', () => {
    if (!existsSync(completeRegistryPath)) return;
    
    const registryContent = readFileSync(completeRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    const categories = new Set(registry.modules.map((m: any) => m.category));
    
    // Should have multiple categories
    expect(categories.size).toBeGreaterThanOrEqual(10);
    
    // Should have expected categories
    const expectedCategories = [
      'core', 'operations', 'compliance', 'intelligence',
      'communication', 'maritime', 'documents', 'travel'
    ];
    
    expectedCategories.forEach(cat => {
      expect(categories.has(cat)).toBe(true);
    });
  });

  it('should have statistics in complete registry', () => {
    if (!existsSync(completeRegistryPath)) return;
    
    const registryContent = readFileSync(completeRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    expect(registry.statistics).toHaveProperty('totalModules');
    expect(registry.statistics).toHaveProperty('activeModules');
    expect(registry.statistics).toHaveProperty('modulesByCategory');
    
    expect(registry.statistics.totalModules).toBe(registry.modules.length);
  });

  it('should have verification report documentation', () => {
    const verificationReportPath = join(process.cwd(), 'MODULE_VERIFICATION_REPORT.md');
    expect(existsSync(verificationReportPath)).toBe(true);
  });

  it('should have verification summary documentation', () => {
    const verificationSummaryPath = join(process.cwd(), 'MODULES_VERIFICATION_SUMMARY.md');
    expect(existsSync(verificationSummaryPath)).toBe(true);
  });

  it('should have core modules present', () => {
    if (!existsSync(modulesDir)) return;
    
    const coreModules = ['core', 'shared', 'ui'];
    const existingModules = readdirSync(modulesDir);

    coreModules.forEach(module => {
      expect(existingModules).toContain(module);
    });
  });

  it('should have compliance modules present', () => {
    if (!existsSync(modulesDir)) return;
    
    const complianceModules = ['compliance', 'audit', 'ism-audits'];
    const existingModules = readdirSync(modulesDir);

    complianceModules.forEach(module => {
      expect(existingModules).toContain(module);
    });
  });

  it('should have maritime modules present', () => {
    if (!existsSync(modulesDir)) return;
    
    const maritimeModules = [
      'navigation-copilot', 'route-planner', 'sensors-hub',
      'weather-dashboard', 'satellite-tracker'
    ];
    const existingModules = readdirSync(modulesDir);

    const foundCount = maritimeModules.filter(module => 
      existingModules.includes(module)
    ).length;

    // At least 3 of 5 maritime modules should exist
    expect(foundCount).toBeGreaterThanOrEqual(3);
  });

  it('should have AI/Intelligence modules present', () => {
    if (!existsSync(modulesDir)) return;
    
    const aiModules = [
      'ai', 'assistant', 'intelligence', 'analytics',
      'deep-risk-ai', 'coordination-ai'
    ];
    const existingModules = readdirSync(modulesDir);

    const foundCount = aiModules.filter(module => 
      existingModules.includes(module)
    ).length;

    // At least 4 of 6 AI modules should exist
    expect(foundCount).toBeGreaterThanOrEqual(4);
  });

  it('should have communication modules present', () => {
    if (!existsSync(modulesDir)) return;
    
    const commModules = ['communication', 'communication-center'];
    const existingModules = readdirSync(modulesDir);

    const foundCount = commModules.filter(module => 
      existingModules.includes(module)
    ).length;

    // At least one communication module should exist
    expect(foundCount).toBeGreaterThanOrEqual(1);
  });
});

describe('Module Documentation Verification', () => {
  const verificationReportPath = join(process.cwd(), 'MODULE_VERIFICATION_REPORT.md');
  const verificationSummaryPath = join(process.cwd(), 'MODULES_VERIFICATION_SUMMARY.md');

  it('should have comprehensive verification report', () => {
    if (!existsSync(verificationReportPath)) return;
    
    const content = readFileSync(verificationReportPath, 'utf-8');
    
    // Should contain key sections
    expect(content).toContain('Executive Summary');
    expect(content).toContain('Verified Module Structure');
    expect(content).toContain('Documentation Coverage');
    expect(content).toContain('Recommendations');
  });

  it('should have detailed verification summary', () => {
    if (!existsSync(verificationSummaryPath)) return;
    
    const content = readFileSync(verificationSummaryPath, 'utf-8');
    
    // Should contain verification checklist
    expect(content).toContain('Verification Results');
    expect(content).toContain('Module Categories Verified');
    expect(content).toContain('Conclusion');
  });

  it('verification report should document 140+ modules', () => {
    if (!existsSync(verificationReportPath)) return;
    
    const content = readFileSync(verificationReportPath, 'utf-8');
    
    // Should mention the actual module count
    expect(content).toMatch(/14[0-9].*modules?/i);
  });

  it('should document all 10 problem statement categories', () => {
    if (!existsSync(verificationSummaryPath)) return;
    
    const content = readFileSync(verificationSummaryPath, 'utf-8');
    
    // Should verify all 10 categories from problem statement
    const categories = [
      'Core Operational',
      'AI & Intelligence',
      'Compliance',
      'Communication',
      'Maritime',
      'Documents',
      'Travel',
      'Experimental',
      'Admin',
      'Suggested'
    ];

    categories.forEach(category => {
      expect(content).toContain(category);
    });
  });
});
