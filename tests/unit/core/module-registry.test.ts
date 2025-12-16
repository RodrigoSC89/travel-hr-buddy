/**
 * Module Registry Test Suite
 * Verifica integridade do registro de módulos
 */
import { describe, it, expect } from 'vitest';
import { MODULE_REGISTRY, type ModuleDefinition } from '@/modules/registry';

describe('Module Registry', () => {
  describe('Registry Structure', () => {
    it('should have a valid registry object', () => {
      expect(MODULE_REGISTRY).toBeDefined();
      expect(typeof MODULE_REGISTRY).toBe('object');
    });

    it('should have at least 10 modules', () => {
      const moduleCount = Object.keys(MODULE_REGISTRY).length;
      expect(moduleCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Module Definitions', () => {
    const modules = Object.values(MODULE_REGISTRY);

    it('all modules should have required fields', () => {
      modules.forEach((module: ModuleDefinition) => {
        expect(module.id).toBeDefined();
        expect(module.name).toBeDefined();
        expect(module.category).toBeDefined();
        expect(module.path).toBeDefined();
        expect(module.description).toBeDefined();
        expect(module.status).toBeDefined();
      });
    });

    it('all active modules should have valid routes', () => {
      const activeModules = modules.filter(m => m.status === 'active');
      
      activeModules.forEach((module: ModuleDefinition) => {
        // Modules can have routes or be core modules without routes
        if (module.route) {
          expect(module.route).toMatch(/^\//);
        }
      });
    });

    it('module categories should be valid', () => {
      const validCategories = [
        'core', 'operations', 'compliance', 'intelligence',
        'emergency', 'logistics', 'planning', 'hr', 'maintenance',
        'connectivity', 'workspace', 'assistants', 'finance',
        'documents', 'configuration', 'features'
      ];

      modules.forEach((module: ModuleDefinition) => {
        expect(validCategories).toContain(module.category);
      });
    });

    it('module statuses should be valid', () => {
      const validStatuses = ['active', 'deprecated', 'beta', 'experimental', 'incomplete'];

      modules.forEach((module: ModuleDefinition) => {
        expect(validStatuses).toContain(module.status);
      });
    });
  });

  describe('Unified Modules', () => {
    it('should have Nautilus Academy module', () => {
      const academy = Object.values(MODULE_REGISTRY).find(
        m => m.route === '/nautilus-academy'
      );
      expect(academy).toBeDefined();
    });

    it('should have Nautilus People module', () => {
      const people = Object.values(MODULE_REGISTRY).find(
        m => m.route === '/nautilus-people'
      );
      expect(people).toBeDefined();
    });

    it('should have Nautilus AI Hub module', () => {
      const aiHub = Object.values(MODULE_REGISTRY).find(
        m => m.route === '/nautilus-ai-hub'
      );
      expect(aiHub).toBeDefined();
    });

    it('should have Subsea Operations module', () => {
      const subsea = Object.values(MODULE_REGISTRY).find(
        m => m.route === '/subsea-operations'
      );
      expect(subsea).toBeDefined();
    });
  });

  describe('No Duplicate Routes', () => {
    it('should not have duplicate routes', () => {
      const modules = Object.values(MODULE_REGISTRY);
      const routes = modules
        .filter(m => m.route)
        .map(m => m.route);
      
      const uniqueRoutes = new Set(routes);
      expect(routes.length).toBe(uniqueRoutes.size);
    });
  });
});
