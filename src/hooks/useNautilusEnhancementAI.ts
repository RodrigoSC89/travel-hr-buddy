/**
 * Hook for Nautilus Enhancement AI
 * Provides access to all lovable-level AI improvements
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type EnhancementType = 
  | 'workflow_analyze' 
  | 'workflow_optimize' 
  | 'calendar_optimize' 
  | 'journaling_generate' 
  | 'audit_analyze'
  | 'voyage_plan'
  | 'route_cost_analyze'
  | 'resource_availability'
  | 'emergency_guidance'
  | 'training_simulate'
  | 'wellbeing_analyze'
  | 'connectivity_status'
  | 'logistics_optimize'
  | 'port_integration';

interface EnhancementResponse<T = any> {
  success: boolean;
  response: T;
  type: EnhancementType;
  timestamp: string;
  error?: string;
}

export function useNautilusEnhancementAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoke = useCallback(async <T = any>(
    type: EnhancementType,
    message?: string,
    context?: Record<string, any>
  ): Promise<EnhancementResponse<T> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('nautilus-enhancement-ai', {
        body: { type, message, context }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.code === 'RATE_LIMIT') {
        toast({
          title: 'Limite de requisições',
          description: 'Tente novamente em alguns minutos.',
          variant: 'destructive'
        });
        throw new Error('Rate limit exceeded');
      }

      if (data?.code === 'CREDITS_EXHAUSTED') {
        toast({
          title: 'Créditos IA esgotados',
          description: 'Adicione mais créditos para continuar.',
          variant: 'destructive'
        });
        throw new Error('Credits exhausted');
      }

      return data as EnhancementResponse<T>;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('[useNautilusEnhancementAI]', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Specific methods for each enhancement type
  const analyzeWorkflow = useCallback((nodes: any[], edges: any[], prompt?: string) => 
    invoke('workflow_analyze', prompt, { nodes, edges }), [invoke]);

  const optimizeWorkflow = useCallback((nodes: any[], edges: any[]) => 
    invoke('workflow_optimize', 'Otimize este workflow', { nodes, edges }), [invoke]);

  const optimizeCalendar = useCallback((events: any[]) => 
    invoke('calendar_optimize', 'Otimize este calendário', { events }), [invoke]);

  const generateJournal = useCallback((vesselData: any, date?: string) => 
    invoke('journaling_generate', `Gere o journal do dia ${date || new Date().toISOString().split('T')[0]}`, { vessel: vesselData }), [invoke]);

  const analyzeAudit = useCallback((entries: any[]) => 
    invoke('audit_analyze', 'Analise estes logs de auditoria', { entries }), [invoke]);

  const planVoyage = useCallback((origin: string, destination: string, vessel: any, constraints?: any) => 
    invoke('voyage_plan', `Planeje viagem de ${origin} para ${destination}`, { origin, destination, vessel, constraints }), [invoke]);

  const analyzeRouteCost = useCallback((route: any, vessel: any) => 
    invoke('route_cost_analyze', 'Analise custos desta rota', { route, vessel }), [invoke]);

  const checkResourceAvailability = useCallback((resources: any[], timeframe?: string) => 
    invoke('resource_availability', 'Verifique disponibilidade de recursos', { resources, timeframe }), [invoke]);

  const getEmergencyGuidance = useCallback((emergencyType: string, context?: any) => 
    invoke('emergency_guidance', `Orientação para emergência: ${emergencyType}`, { emergencyType, ...context }), [invoke]);

  const simulateTraining = useCallback((scenarioType: string, participants?: any[]) => 
    invoke('training_simulate', `Simule cenário: ${scenarioType}`, { scenarioType, participants }), [invoke]);

  const analyzeWellbeing = useCallback((crewData: any[]) => 
    invoke('wellbeing_analyze', 'Analise bem-estar da tripulação', { crew: crewData }), [invoke]);

  const checkConnectivity = useCallback((vesselId: string) => 
    invoke('connectivity_status', 'Status de conectividade', { vesselId }), [invoke]);

  const optimizeLogistics = useCallback((bases: any[], cargo: any) => 
    invoke('logistics_optimize', 'Otimize logística multi-base', { bases, cargo }), [invoke]);

  const integratePort = useCallback((portCode: string, vesselId: string) => 
    invoke('port_integration', `Integração com porto ${portCode}`, { portCode, vesselId }), [invoke]);

  return {
    isLoading,
    error,
    invoke,
    // Workflow
    analyzeWorkflow,
    optimizeWorkflow,
    // Calendar
    optimizeCalendar,
    // Journaling
    generateJournal,
    // Audit
    analyzeAudit,
    // Voyage
    planVoyage,
    // Cost Analysis
    analyzeRouteCost,
    // Resources
    checkResourceAvailability,
    // Emergency
    getEmergencyGuidance,
    // Training
    simulateTraining,
    // Wellbeing
    analyzeWellbeing,
    // Connectivity
    checkConnectivity,
    // Logistics
    optimizeLogistics,
    // Port
    integratePort
  };
}
