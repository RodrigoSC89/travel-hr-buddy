/**
 * useAIMaintenancePrediction - Hook de IA para Manutenção Preditiva
 * Previsão de falhas, planos preventivos automáticos, ROI
 * PATCH: Removed mock fallbacks and as any casts
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface Equipment {
  id: string;
  name: string;
  type: string;
  vessel_id: string;
  vessel_name: string;
  status: 'operational' | 'degraded' | 'critical' | 'offline';
  health_score: number;
  last_maintenance: string;
  next_scheduled: string;
  runtime_hours: number;
  failure_probability: number;
}

interface FailurePrediction {
  id: string;
  equipment_id: string;
  equipment_name: string;
  failure_type: string;
  probability: number;
  estimated_date: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
  cost_if_failure: number;
  cost_prevention: number;
}

interface MaintenancePlan {
  id: string;
  equipment_id: string;
  equipment_name: string;
  plan_type: 'preventive' | 'predictive' | 'corrective';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduled_date: string;
  estimated_duration: string;
  tasks: MaintenanceTask[];
  parts_required: string[];
  estimated_cost: number;
  ai_generated: boolean;
}

interface MaintenanceTask {
  id: string;
  description: string;
  sequence: number;
  estimated_time: string;
  requires_specialist: boolean;
}

interface MaintenanceROI {
  total_equipment: number;
  predictions_made: number;
  failures_prevented: number;
  downtime_avoided_hours: number;
  cost_savings: number;
  roi_percentage: number;
}

interface MaintenanceStats {
  totalEquipment: number;
  operational: number;
  degraded: number;
  critical: number;
  predictions: number;
  highRisk: number;
}

export interface UseAIMaintenancePredictionReturn {
  equipment: Equipment[];
  predictions: FailurePrediction[];
  plans: MaintenancePlan[];
  selectedEquipment: string | null;
  stats: MaintenanceStats;
  setSelectedEquipment: (id: string | null) => void;
  predictFailures: (equipmentId?: string) => Promise<FailurePrediction[]>;
  generatePlan: (equipmentId: string) => Promise<MaintenancePlan>;
  calculateROI: () => Promise<MaintenanceROI>;
  isLoading: boolean;
  isPredicting: boolean;
  isGeneratingPlan: boolean;
  isEmpty: boolean;
  refetch: () => void;
}

export function useAIMaintenancePrediction(vesselId?: string): UseAIMaintenancePredictionReturn {
  const queryClient = useQueryClient();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  // Query: Equipamentos - usando ai_maintenance_predictions
  const equipmentQuery = useQuery({
    queryKey: ['maintenance-equipment', vesselId],
    queryFn: async (): Promise<Equipment[]> => {
      let query = supabase
        .from('ai_maintenance_predictions')
        .select('*, vessel:vessels(name)')
        .order('failure_probability', { ascending: false })
        .limit(50);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('[useAIMaintenancePrediction] Error fetching equipment', { error: error.message });
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((pred) => ({
        id: pred.id,
        name: pred.equipment_name,
        type: pred.equipment_id.includes('engine') ? 'main_engine' : 
              pred.equipment_id.includes('dp') ? 'dp_system' : 'equipment',
        vessel_id: pred.vessel_id || '',
        vessel_name: (pred.vessel as { name?: string })?.name || 'Unknown',
        status: inferEquipmentStatus(pred.failure_probability),
        health_score: Math.round(100 - (pred.failure_probability || 0)),
        last_maintenance: pred.updated_at || pred.created_at,
        next_scheduled: pred.predicted_failure_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        runtime_hours: 0, // Not available in this table
        failure_probability: pred.failure_probability || 0,
      }));
    },
    staleTime: 60000,
  });

  // Query: Previsões de falha - mesma tabela, diferentes campos
  const predictionsQuery = useQuery({
    queryKey: ['maintenance-predictions', vesselId],
    queryFn: async (): Promise<FailurePrediction[]> => {
      let query = supabase
        .from('ai_maintenance_predictions')
        .select('*')
        .gte('failure_probability', 30)
        .order('failure_probability', { ascending: false })
        .limit(20);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('[useAIMaintenancePrediction] Error fetching predictions', { error: error.message });
        return [];
      }

      if (!data) return [];

      return data.map((pred) => ({
        id: pred.id,
        equipment_id: pred.equipment_id,
        equipment_name: pred.equipment_name,
        failure_type: extractFailureType(pred.risk_factors),
        probability: pred.failure_probability,
        estimated_date: pred.predicted_failure_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: pred.confidence || 75,
        impact: inferImpact(pred.failure_probability),
        recommended_action: pred.recommended_action || 'Inspeção preventiva recomendada',
        cost_if_failure: estimateCost(pred.failure_probability, true),
        cost_prevention: estimateCost(pred.failure_probability, false),
      }));
    },
  });

  // Query: Planos de manutenção - usando maintenance_records
  const plansQuery = useQuery({
    queryKey: ['maintenance-plans', vesselId],
    queryFn: async (): Promise<MaintenancePlan[]> => {
      let query = supabase
        .from('maintenance_records')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .limit(20);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('[useAIMaintenancePrediction] Error fetching plans', { error: error.message });
        return [];
      }

      if (!data) return [];

      type MaintenanceRow = typeof data[number];
      return data.map((record: MaintenanceRow) => ({
        id: record.id,
        equipment_id: record.id,
        equipment_name: record.description || 'Equipment',
        plan_type: (record.maintenance_type as MaintenancePlan['plan_type']) || 'preventive',
        priority: (record.priority as MaintenancePlan['priority']) || 'medium',
        scheduled_date: record.scheduled_date || new Date().toISOString(),
        estimated_duration: '4 hours',
        tasks: [],
        parts_required: [],
        estimated_cost: record.cost_estimate || 0,
        ai_generated: false,
      }));
    },
  });

  // Mutation: Prever falhas com ML
  const predictFailuresMutation = useMutation({
    mutationFn: async (equipmentId?: string): Promise<FailurePrediction[]> => {
      const { data, error } = await supabase.functions.invoke('maintenance-prediction-ai', {
        body: {
          action: 'predict_failures',
          equipmentId,
          vesselId,
        },
      });

      if (error) throw error;
      return data.predictions as FailurePrediction[];
    },
    onSuccess: (predictions) => {
      const critical = predictions.filter((p) => p.probability > 70).length;
      if (critical > 0) {
        toast.warning(`⚠️ ${critical} previsão(ões) crítica(s) detectada(s)!`);
      } else {
        toast.success('✅ Análise preditiva concluída!');
      }
      queryClient.invalidateQueries({ queryKey: ['maintenance-predictions'] });
    },
    onError: (error) => {
      logger.error('[useAIMaintenancePrediction] Predict failures failed', error);
      toast.error('Erro ao prever falhas');
    },
  });

  // Mutation: Gerar plano preventivo
  const generatePlanMutation = useMutation({
    mutationFn: async (equipmentId: string): Promise<MaintenancePlan> => {
      const { data, error } = await supabase.functions.invoke('maintenance-prediction-ai', {
        body: {
          action: 'generate_plan',
          equipmentId,
        },
      });

      if (error) throw error;
      return data.plan as MaintenancePlan;
    },
    onSuccess: () => {
      toast.success('📋 Plano de manutenção gerado!');
      queryClient.invalidateQueries({ queryKey: ['maintenance-plans'] });
    },
    onError: (error) => {
      logger.error('[useAIMaintenancePrediction] Generate plan failed', error);
      toast.error('Erro ao gerar plano');
    },
  });

  // Mutation: Calcular ROI
  const calculateROIMutation = useMutation({
    mutationFn: async (): Promise<MaintenanceROI> => {
      const { data, error } = await supabase.functions.invoke('maintenance-prediction-ai', {
        body: {
          action: 'calculate_roi',
          vesselId,
        },
      });

      if (error) throw error;
      return data.roi as MaintenanceROI;
    },
    onSuccess: (roi) => {
      toast.success(`💰 ROI calculado: ${roi.roi_percentage.toFixed(0)}%`);
    },
    onError: (error) => {
      logger.error('[useAIMaintenancePrediction] Calculate ROI failed', error);
      toast.error('Erro ao calcular ROI');
    },
  });

  // Actions
  const predictFailures = useCallback(
    async (equipmentId?: string) => {
      return predictFailuresMutation.mutateAsync(equipmentId);
    },
    [predictFailuresMutation]
  );

  const generatePlan = useCallback(
    async (equipmentId: string) => {
      return generatePlanMutation.mutateAsync(equipmentId);
    },
    [generatePlanMutation]
  );

  const calculateROI = useCallback(async () => {
    return calculateROIMutation.mutateAsync();
  }, [calculateROIMutation]);

  // Statistics
  const stats: MaintenanceStats = {
    totalEquipment: equipmentQuery.data?.length || 0,
    operational: equipmentQuery.data?.filter((e) => e.status === 'operational').length || 0,
    degraded: equipmentQuery.data?.filter((e) => e.status === 'degraded').length || 0,
    critical: equipmentQuery.data?.filter((e) => e.status === 'critical').length || 0,
    predictions: predictionsQuery.data?.length || 0,
    highRisk: predictionsQuery.data?.filter((p) => p.probability > 70).length || 0,
  };

  return {
    // Data
    equipment: equipmentQuery.data || [],
    predictions: predictionsQuery.data || [],
    plans: plansQuery.data || [],
    selectedEquipment,
    stats,

    // Actions
    setSelectedEquipment,
    predictFailures,
    generatePlan,
    calculateROI,

    // Loading
    isLoading: equipmentQuery.isLoading,
    isPredicting: predictFailuresMutation.isPending,
    isGeneratingPlan: generatePlanMutation.isPending,

    // Status flags
    isEmpty: (equipmentQuery.data?.length || 0) === 0,

    // Refetch
    refetch: () => {
      equipmentQuery.refetch();
      predictionsQuery.refetch();
      plansQuery.refetch();
    },
  };
}

function inferEquipmentStatus(failureProbability: number): Equipment['status'] {
  if (failureProbability >= 70) return 'critical';
  if (failureProbability >= 40) return 'degraded';
  if (failureProbability >= 0) return 'operational';
  return 'offline';
}

function inferImpact(probability: number): FailurePrediction['impact'] {
  if (probability >= 80) return 'critical';
  if (probability >= 60) return 'high';
  if (probability >= 30) return 'medium';
  return 'low';
}

function extractFailureType(riskFactors: unknown): string {
  if (!riskFactors) return 'Falha geral';
  if (typeof riskFactors === 'object' && riskFactors !== null) {
    const factors = riskFactors as Record<string, unknown>;
    if (factors.type) return String(factors.type);
    if (factors.failure_type) return String(factors.failure_type);
  }
  return 'Desgaste operacional';
}

function estimateCost(probability: number, isFailure: boolean): number {
  const baseCost = probability * 1000;
  return isFailure ? baseCost * 3 : baseCost;
}

export default useAIMaintenancePrediction;
