/**
 * PATCH OPS-V7 — OPS_REAL Mode
 * 
 * Controla o modo de operação do sistema:
 * - OPS_REAL: Produção marítima real (sem módulos preview, integrações bloqueadas se não configuradas)
 * - DEV: Desenvolvimento (todos os módulos visíveis)
 * - DEMO: Demonstração (dados de exemplo permitidos)
 */

export type AppMode = 'OPS_REAL' | 'DEV' | 'DEMO';

/**
 * Obtém o modo de operação atual
 */
export function getAppMode(): AppMode {
  const mode = import.meta.env.VITE_APP_MODE || 'DEV';
  
  if (['OPS_REAL', 'DEV', 'DEMO'].includes(mode)) {
    return mode as AppMode;
  }
  
  return 'DEV';
}

/**
 * Verifica se está em modo de operação real
 */
export function isOpsRealMode(): boolean {
  return getAppMode() === 'OPS_REAL';
}

/**
 * Verifica se módulos Preview/Labs devem ser exibidos
 */
export function shouldShowPreviewModules(): boolean {
  return getAppMode() !== 'OPS_REAL';
}

/**
 * Verifica se dados de demonstração são permitidos
 */
export function allowDemoData(): boolean {
  return getAppMode() === 'DEMO';
}

/**
 * Lista de módulos que são Preview/Labs (não aparecem em OPS_REAL)
 * 
 * CRITÉRIO: Módulos com mock data, simulações ou funcionalidades incompletas
 * Em OPS_REAL, estes módulos são ocultados para evitar confusão operacional
 */
export const PREVIEW_MODULES = [
  // AI Experimental
  'revolutionary-ai',
  'quantum-navigation',
  'blockchain-certificates',
  'autonomous-vessel',
  'digital-twin-advanced',
  'sonar-ai-experimental',
  'mission-simulation',
  'mission-autonomy',
  'empathy-core',
  
  // AI Observability (mock data)
  'ai-observability',
  'ai-explainability',
  'autonomous-agent',
  
  // Outros com mock
  'satellite-optimizer',
  'voice-hotword',
  'session-replay',
  'bi-forecast-examples',
  'action-plans-notifications',
  
  // Integrações não configuradas
  'satellite-tracker',
  'ais-tracking-advanced',
];

/**
 * Lista de módulos CORE (obrigatórios para OPS_REAL)
 */
export const CORE_MODULES = [
  'fleet',
  'voyage',
  'mission',
  'logistics',
  'maintenance',
  'compliance',
  'documents',
  'communication',
  'incidents',
];

/**
 * Verifica se um módulo está disponível no modo atual
 */
export function isModuleAvailable(modulePath: string): boolean {
  const mode = getAppMode();
  
  // Em modo DEV/DEMO, todos os módulos estão disponíveis
  if (mode !== 'OPS_REAL') {
    return true;
  }
  
  // Em OPS_REAL, módulos Preview não estão disponíveis
  const normalizedPath = modulePath.toLowerCase();
  
  for (const preview of PREVIEW_MODULES) {
    if (normalizedPath.includes(preview)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Filtra rotas do sidebar baseado no modo de operação
 */
export function filterSidebarForOpsMode<T extends { path: string }>(routes: T[]): T[] {
  if (!isOpsRealMode()) {
    return routes;
  }
  
  return routes.filter(route => isModuleAvailable(route.path));
}

/**
 * Retorna configuração de segurança para OPS_REAL
 */
export function getOpsSecurityConfig() {
  return {
    // Bloquear ações sem autenticação
    requireAuth: isOpsRealMode(),
    
    // Exigir audit log para mutações
    requireAuditLog: isOpsRealMode(),
    
    // Bloquear integrações não configuradas
    blockUnconfiguredIntegrations: isOpsRealMode(),
    
    // Exigir confirmação para ações destrutivas
    requireConfirmDestructive: true,
  };
}

/**
 * Hook para componentes que precisam verificar o modo
 */
export function useOpsMode() {
  const mode = getAppMode();
  
  return {
    mode,
    isOpsReal: mode === 'OPS_REAL',
    isDev: mode === 'DEV',
    isDemo: mode === 'DEMO',
    showPreviewModules: shouldShowPreviewModules(),
    allowDemoData: allowDemoData(),
  };
}
