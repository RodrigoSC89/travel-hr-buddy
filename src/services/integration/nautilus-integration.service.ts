/**
 * Nautilus One Integration Service
 * 
 * Centralizes integration between all modules and ensures
 * consistent data flow across the application.
 */

import { logger } from "@/lib/logger";

export interface ModuleIntegration {
  moduleId: string;
  moduleName: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string | null;
  metrics: {
    totalItems: number;
    completedItems: number;
    pendingItems: number;
  };
}

export interface ComplianceScore {
  moduleId: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'compliant' | 'partial' | 'non-compliant';
}

class NautilusIntegrationService {
  private static instance: NautilusIntegrationService;
  private moduleIntegrations: Map<string, ModuleIntegration> = new Map();

  private constructor() {
    this.initializeModules();
  }

  static getInstance(): NautilusIntegrationService {
    if (!NautilusIntegrationService.instance) {
      NautilusIntegrationService.instance = new NautilusIntegrationService();
    }
    return NautilusIntegrationService.instance;
  }

  private initializeModules(): void {
    const modules: ModuleIntegration[] = [
      { moduleId: 'compliance.mlc-inspection', moduleName: 'MLC Inspection', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'compliance.pre-ovid', moduleName: 'Pre-OVID Inspection', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'compliance.imca-audit', moduleName: 'IMCA Audit', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'compliance.peotram', moduleName: 'PEOTRAM', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'compliance.sgso', moduleName: 'SGSO', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'operations.fleet', moduleName: 'Fleet Management', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'operations.crew', moduleName: 'Crew Management', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'maintenance.intelligent', moduleName: 'Manutenção Inteligente', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'hr.nautilus-academy', moduleName: 'Nautilus Academy', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'operations.safety-guardian', moduleName: 'Safety Guardian', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'operations.esg-emissions', moduleName: 'ESG & Emissões', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
      { moduleId: 'intelligence.nautilus-command', moduleName: 'Nautilus Command', status: 'active', lastSync: null, metrics: { totalItems: 0, completedItems: 0, pendingItems: 0 } },
    ];

    modules.forEach(module => {
      this.moduleIntegrations.set(module.moduleId, module);
    });

    logger.info("[NautilusIntegration] Modules initialized", { count: modules.length });
  }

  updateModuleMetrics(moduleId: string, metrics: Partial<ModuleIntegration['metrics']>): void {
    const module = this.moduleIntegrations.get(moduleId);
    if (module) {
      module.metrics = { ...module.metrics, ...metrics };
      module.lastSync = new Date().toISOString();
      this.moduleIntegrations.set(moduleId, module);
      logger.info("[NautilusIntegration] Module metrics updated", { moduleId, metrics });
    }
  }

  getModuleStatus(moduleId: string): ModuleIntegration | undefined {
    return this.moduleIntegrations.get(moduleId);
  }

  getAllModules(): ModuleIntegration[] {
    return Array.from(this.moduleIntegrations.values());
  }

  getActiveModules(): ModuleIntegration[] {
    return this.getAllModules().filter(m => m.status === 'active');
  }

  calculateOverallCompliance(): ComplianceScore {
    const modules = this.getActiveModules();
    let totalScore = 0;
    let maxScore = 0;

    modules.forEach(module => {
      if (module.metrics.totalItems > 0) {
        totalScore += module.metrics.completedItems;
        maxScore += module.metrics.totalItems;
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    return {
      moduleId: 'overall',
      score: totalScore,
      maxScore,
      percentage,
      status: percentage >= 85 ? 'compliant' : percentage >= 70 ? 'partial' : 'non-compliant'
    };
  }

  getComplianceByModule(): ComplianceScore[] {
    return this.getActiveModules().map(module => {
      const percentage = module.metrics.totalItems > 0 
        ? Math.round((module.metrics.completedItems / module.metrics.totalItems) * 100) 
        : 0;
      
      return {
        moduleId: module.moduleId,
        score: module.metrics.completedItems,
        maxScore: module.metrics.totalItems,
        percentage,
        status: percentage >= 85 ? 'compliant' : percentage >= 70 ? 'partial' : 'non-compliant'
      };
    });
  }

  syncAllModules(): void {
    this.moduleIntegrations.forEach((module, moduleId) => {
      module.lastSync = new Date().toISOString();
      this.moduleIntegrations.set(moduleId, module);
    });
    logger.info("[NautilusIntegration] All modules synced");
  }
}

export const nautilusIntegration = NautilusIntegrationService.getInstance();
