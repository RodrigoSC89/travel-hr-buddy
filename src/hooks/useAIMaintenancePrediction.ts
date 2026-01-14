/**
 * useAIMaintenancePrediction - Hook de IA para Manutenção Preditiva
 * Previsão de falhas, planos preventivos automáticos, ROI
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Equipment {
  id: string;
  name: string;
  type: string;
  vessel_id: string;
  vessel_name: string;
  status: 'operational' | 'degraded' | 'critical' | 'offline';
  health_score: number; // 0-100
  last_maintenance: string;
  next_scheduled: string;
  runtime_hours: number;
  failure_probability: number; // 0-100
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

export function useAIMaintenancePrediction(vesselId?: string) {
  const queryClient = useQueryClient();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  // Query: Equipamentos
  const equipmentQuery = useQuery({
    queryKey: ['maintenance-equipment', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('health_score', { ascending: true });

      if (error) return getMockEquipment();
      return data?.length ? data : getMockEquipment();
    },
    staleTime: 60000,
  });

  // Query: Previsões de falha
  const predictionsQuery = useQuery({
    queryKey: ['maintenance-predictions', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('failure_predictions')
        .select('*')
        .order('probability', { ascending: false });

      if (error) return getMockPredictions();
      return data || getMockPredictions();
    },
  });

  // Query: Planos de manutenção
  const plansQuery = useQuery({
    queryKey: ['maintenance-plans', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) return [];
      return data || [];
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
  const stats = {
    totalEquipment: equipmentQuery.data?.length || 0,
    operational: equipmentQuery.data?.filter((e: any) => e.status === 'operational').length || 0,
    degraded: equipmentQuery.data?.filter((e: any) => e.status === 'degraded').length || 0,
    critical: equipmentQuery.data?.filter((e: any) => e.status === 'critical').length || 0,
    predictions: predictionsQuery.data?.length || 0,
    highRisk: predictionsQuery.data?.filter((p: any) => p.probability > 70).length || 0,
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

    // Refetch
    refetch: () => {
      equipmentQuery.refetch();
      predictionsQuery.refetch();
      plansQuery.refetch();
    },
  };
}

function getMockEquipment(): Equipment[] {
  return [
    {
      id: '1',
      name: 'Motor Principal #1',
      type: 'main_engine',
      vessel_id: 'v1',
      vessel_name: 'Nauti Alpha',
      status: 'degraded',
      health_score: 65,
      last_maintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_scheduled: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      runtime_hours: 12500,
      failure_probability: 35,
    },
    {
      id: '2',
      name: 'Sistema DP',
      type: 'dp_system',
      vessel_id: 'v1',
      vessel_name: 'Nauti Alpha',
      status: 'operational',
      health_score: 92,
      last_maintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      next_scheduled: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      runtime_hours: 8000,
      failure_probability: 8,
    },
    {
      id: '3',
      name: 'Gerador #2',
      type: 'generator',
      vessel_id: 'v1',
      vessel_name: 'Nauti Alpha',
      status: 'critical',
      health_score: 42,
      last_maintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      next_scheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      runtime_hours: 18000,
      failure_probability: 72,
    },
  ];
}

function getMockPredictions(): FailurePrediction[] {
  return [
    {
      id: '1',
      equipment_id: '3',
      equipment_name: 'Gerador #2',
      failure_type: 'Falha de rolamento',
      probability: 72,
      estimated_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 89,
      impact: 'high',
      recommended_action: 'Substituição preventiva do rolamento principal',
      cost_if_failure: 150000,
      cost_prevention: 25000,
    },
    {
      id: '2',
      equipment_id: '1',
      equipment_name: 'Motor Principal #1',
      failure_type: 'Desgaste de vedação',
      probability: 45,
      estimated_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 75,
      impact: 'medium',
      recommended_action: 'Inspeção e substituição das vedações',
      cost_if_failure: 80000,
      cost_prevention: 12000,
    },
  ];
}

export default useAIMaintenancePrediction;
