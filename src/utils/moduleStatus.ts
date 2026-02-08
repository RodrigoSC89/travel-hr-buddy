/**
 * Module Status Utility
 * PATCH 624 - Utilitário para verificar e reportar status de módulos
 */
import { logger } from "@/lib/logger";

import { MODULE_REGISTRY, ModuleDefinition, ModuleStatus, ModuleCompleteness } from '@/modules/registry';

export interface ModuleStatusReport {
  totalModules: number;
  activeModules: number;
  incompleteModules: number;
  deprecatedModules: number;
  betaModules: number;
  byCompleteness: Record<ModuleCompleteness, string[]>;
  byCategory: Record<string, number>;
}

/**
 * Gera relatório de status dos módulos
 */
export function getModuleStatusReport(): ModuleStatusReport {
  const modules = Object.values(MODULE_REGISTRY);
  
  const report: ModuleStatusReport = {
    totalModules: modules.length,
    activeModules: 0,
    incompleteModules: 0,
    deprecatedModules: 0,
    betaModules: 0,
    byCompleteness: {
      '100%': [],
      'partial': [],
      'broken': [],
      'deprecated': [],
    },
    byCategory: {},
  };
  
  modules.forEach((module) => {
    // Contagem por status
    switch (module.status) {
      case 'active':
        report.activeModules++;
        break;
      case 'incomplete':
        report.incompleteModules++;
        break;
      case 'deprecated':
        report.deprecatedModules++;
        break;
      case 'beta':
      case 'experimental':
        report.betaModules++;
        break;
    }
    
    // Contagem por completeness
    const completeness = module.completeness || '100%';
    report.byCompleteness[completeness].push(module.id);
    
    // Contagem por categoria
    report.byCategory[module.category] = (report.byCategory[module.category] || 0) + 1;
  });
  
  return report;
}

/**
 * Lista módulos incompletos que precisam de atenção
 */
export function getIncompleteModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(
    (m) => m.status === 'incomplete' || m.completeness === 'partial' || m.completeness === 'broken'
  );
}

/**
 * Lista módulos ativos e prontos para uso
 */
export function getActiveModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(
    (m) => m.status === 'active' && m.completeness === '100%'
  );
}

/**
 * Verifica se um módulo está pronto para uso em produção
 */
export function isModuleReady(moduleId: string): boolean {
  const module = MODULE_REGISTRY[moduleId];
  if (!module) return false;
  
  return module.status === 'active' && module.completeness === '100%';
}

/**
 * Obtém módulos por categoria
 */
export function getModulesByCategory(category: string): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.category === category);
}

/**
 * Log do status dos módulos (dev only)
 * @deprecated Use getModuleStatusReport() instead for programmatic access
 */
export function logModuleStatus(): void {
  if (import.meta.env.PROD) return;
  
  const report = getModuleStatusReport();
  const incomplete = getIncompleteModules();
  
  logger.debug('📊 Module Status Report', {
    total: report.totalModules,
    active: report.activeModules,
    incomplete: report.incompleteModules,
    beta: report.betaModules,
    incompleteModules: incomplete.map(m => `${m.name} (${m.id}): ${m.completeness}`),
  });
}
