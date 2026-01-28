/**
 * useSelfHealing Hook
 * Interface for self-healing system management
 */

import { useState, useCallback } from 'react';
import { 
  selfHealingSystemEngine,
  type SystemComponent,
  type SystemHealth,
  type HealingReport
} from '@/lib/ai/engines';
import { toast } from 'sonner';

export function useSelfHealing() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const registerComponent = useCallback((component: SystemComponent) => {
    selfHealingSystemEngine.registerComponent(component);
    refreshHealth();
  }, []);

  const updateMetrics = useCallback((componentId: string, metrics: Partial<SystemComponent['metrics']>) => {
    selfHealingSystemEngine.updateComponentMetrics(componentId, metrics);
    refreshHealth();
  }, []);

  const refreshHealth = useCallback(() => {
    const health = selfHealingSystemEngine.getSystemHealth();
    setSystemHealth(health);
    
    if (health.overallStatus === 'critical') {
      toast.error(`🚨 Sistema em estado crítico: ${health.activeIssues.length} problema(s)`);
    }
    
    return health;
  }, []);

  const resolveIssue = useCallback((issueId: string, resolution: string) => {
    selfHealingSystemEngine.resolveIssue(issueId, resolution);
    refreshHealth();
    toast.success('Problema resolvido manualmente');
  }, []);

  const generateReport = useCallback((startDate: Date, endDate: Date): HealingReport => {
    return selfHealingSystemEngine.generateReport(startDate, endDate);
  }, []);

  const getRules = useCallback(() => {
    return selfHealingSystemEngine.getRules();
  }, []);

  const toggleRule = useCallback((ruleId: string, enabled: boolean) => {
    selfHealingSystemEngine.toggleRule(ruleId, enabled);
    toast.info(`Regra ${enabled ? 'ativada' : 'desativada'}`);
  }, []);

  return {
    systemHealth,
    registerComponent,
    updateMetrics,
    refreshHealth,
    resolveIssue,
    generateReport,
    getRules,
    toggleRule
  };
}
