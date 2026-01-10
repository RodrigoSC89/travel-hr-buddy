/**
 * Wellness AI Hooks - v4.0
 * Burnout prediction, wellness monitoring, interventions
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CrewWellness {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  rank: string;
  department: string;
  vessel_id?: string;
  days_onboard: number;
  wellness_score: number; // 0-100
  burnout_risk: number; // 0-100
  stress_level: 'low' | 'medium' | 'high' | 'critical';
  sleep_quality: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  last_check_in: string;
  alerts: WellnessAlert[];
  recommended_actions: string[];
}

export interface WellnessAlert {
  id: string;
  type: 'burnout' | 'stress' | 'sleep' | 'fatigue' | 'mental_health';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  created_at: string;
}

export interface WellnessIntervention {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  actions: string[];
  scheduled_date?: string;
  completed: boolean;
  notes?: string;
}

// Get wellness data for all crew
export function useCrewWellness(vesselId?: string) {
  return useQuery({
    queryKey: ['crew-wellness', vesselId],
    queryFn: async () => {
      // Mock data - in production, fetch from wellness_plans table
      const mockData: CrewWellness[] = [
        {
          id: '1',
          crew_member_id: 'cm1',
          crew_member_name: 'Carlos Silva',
          rank: 'Chief Engineer',
          department: 'Engine',
          days_onboard: 75,
          wellness_score: 42,
          burnout_risk: 68,
          stress_level: 'high',
          sleep_quality: 55,
          trend: 'declining',
          last_check_in: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          alerts: [
            { id: 'a1', type: 'burnout', severity: 'warning', message: 'Risco elevado de burnout', created_at: new Date().toISOString() },
            { id: 'a2', type: 'sleep', severity: 'warning', message: 'Qualidade de sono baixa', created_at: new Date().toISOString() },
          ],
          recommended_actions: ['Reduzir horas extras', 'Agendar rotação antecipada'],
        },
        {
          id: '2',
          crew_member_id: 'cm2',
          crew_member_name: 'Ana Costa',
          rank: '2nd Officer',
          department: 'Deck',
          days_onboard: 45,
          wellness_score: 78,
          burnout_risk: 22,
          stress_level: 'low',
          sleep_quality: 82,
          trend: 'stable',
          last_check_in: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          alerts: [],
          recommended_actions: [],
        },
        {
          id: '3',
          crew_member_id: 'cm3',
          crew_member_name: 'Roberto Ferreira',
          rank: 'Electrician',
          department: 'Engine',
          days_onboard: 95,
          wellness_score: 35,
          burnout_risk: 75,
          stress_level: 'critical',
          sleep_quality: 40,
          trend: 'declining',
          last_check_in: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          alerts: [
            { id: 'a3', type: 'burnout', severity: 'critical', message: 'Intervenção imediata necessária', created_at: new Date().toISOString() },
          ],
          recommended_actions: ['Intervenção do RH', 'Avaliação psicológica', 'Considerar desembarque'],
        },
        {
          id: '4',
          crew_member_id: 'cm4',
          crew_member_name: 'Marina Santos',
          rank: 'Cook',
          department: 'Catering',
          days_onboard: 30,
          wellness_score: 85,
          burnout_risk: 15,
          stress_level: 'low',
          sleep_quality: 88,
          trend: 'improving',
          last_check_in: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          alerts: [],
          recommended_actions: [],
        },
      ];
      
      return mockData;
    },
    staleTime: 60000,
  });
}

// Get wellness statistics
export function useWellnessStats() {
  const { data: wellness } = useCrewWellness();
  
  return {
    total: wellness?.length || 0,
    healthy: wellness?.filter(c => c.wellness_score >= 70).length || 0,
    atRisk: wellness?.filter(c => c.burnout_risk > 50).length || 0,
    critical: wellness?.filter(c => c.alerts.some(a => a.severity === 'critical')).length || 0,
    avgWellness: wellness?.length 
      ? Math.round(wellness.reduce((sum, c) => sum + c.wellness_score, 0) / wellness.length) 
      : 0,
    avgBurnoutRisk: wellness?.length
      ? Math.round(wellness.reduce((sum, c) => sum + c.burnout_risk, 0) / wellness.length)
      : 0,
  };
}

// AI Burnout Prediction
export function useBurnoutPrediction() {
  return useMutation({
    mutationFn: async (crewMemberId: string) => {
      const { data, error } = await supabase.functions.invoke('crew-wellness-ai', {
        body: {
          action: 'predict_burnout',
          crewMemberId,
        },
      });
      
      if (error) throw error;
      return data;
    },
  });
}

// Submit wellness check-in
export function useSubmitCheckIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checkIn: {
      crew_member_id: string;
      mood: number;
      energy: number;
      sleep_hours: number;
      stress_level: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('crew-wellness-ai', {
        body: {
          action: 'submit_checkin',
          ...checkIn,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-wellness'] });
      toast.success('Check-in registrado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro no check-in: ${error.message}`);
    },
  });
}

// Create intervention
export function useCreateIntervention() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (intervention: Omit<WellnessIntervention, 'id' | 'completed'>) => {
      // In real implementation, save to Supabase
      return { ...intervention, id: crypto.randomUUID(), completed: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-interventions'] });
      toast.success('Intervenção agendada com sucesso!');
    },
  });
}

// Get interventions
export function useWellnessInterventions() {
  return useQuery({
    queryKey: ['wellness-interventions'],
    queryFn: async () => {
      const mockInterventions: WellnessIntervention[] = [
        {
          id: '1',
          crew_member_id: 'cm3',
          crew_member_name: 'Roberto Ferreira',
          urgency: 'critical',
          type: 'Intervenção de Burnout',
          actions: ['Conversa com psicólogo', 'Redução de carga horária', 'Avaliação de desembarque'],
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
        },
        {
          id: '2',
          crew_member_id: 'cm1',
          crew_member_name: 'Carlos Silva',
          urgency: 'high',
          type: 'Prevenção de Burnout',
          actions: ['1-on-1 com gestor', 'Revisar escala de trabalho'],
          scheduled_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          completed: false,
        },
      ];
      
      return mockInterventions;
    },
    staleTime: 60000,
  });
}
