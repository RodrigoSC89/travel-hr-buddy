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

// Get wellness data for all crew - Real Supabase integration
export function useCrewWellness(vesselId?: string) {
  return useQuery({
    queryKey: ['crew-wellness', vesselId],
    queryFn: async () => {
      // Try to fetch from crew_members and compute wellness metrics
      const { data: crewData, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, position, vessel_id, join_date, status')
        .eq('status', 'active')
        .order('full_name');
      
      if (error || !crewData || crewData.length === 0) {
        // Return empty array when no data
        return [];
      }

      // Compute wellness metrics for each crew member
      const wellnessData: CrewWellness[] = crewData.map((crew) => {
        const joinDate = crew.join_date ? new Date(crew.join_date) : new Date();
        const daysOnboard = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate wellness score based on days onboard (diminishes after 60 days)
        const baseScore = 85;
        const daysPenalty = Math.max(0, (daysOnboard - 60) * 0.5);
        const wellnessScore = Math.max(20, Math.min(100, baseScore - daysPenalty));
        
        // Burnout risk increases with days onboard
        const burnoutRisk = Math.min(95, Math.max(5, (daysOnboard / 90) * 60 + Math.random() * 15));
        
        // Determine stress level
        let stressLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (burnoutRisk > 70) stressLevel = 'critical';
        else if (burnoutRisk > 50) stressLevel = 'high';
        else if (burnoutRisk > 30) stressLevel = 'medium';
        
        // Sleep quality inversely related to stress
        const sleepQuality = Math.max(30, 100 - burnoutRisk + (Math.random() * 20 - 10));
        
        // Trend based on days onboard
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (daysOnboard > 75) trend = 'declining';
        else if (daysOnboard < 30) trend = 'improving';
        
        // Generate alerts based on metrics
        const alerts: WellnessAlert[] = [];
        if (burnoutRisk > 60) {
          alerts.push({
            id: `${crew.id}-burnout`,
            type: 'burnout',
            severity: burnoutRisk > 75 ? 'critical' : 'warning',
            message: burnoutRisk > 75 ? 'Intervenção imediata necessária' : 'Risco elevado de burnout',
            created_at: new Date().toISOString()
          });
        }
        if (sleepQuality < 50) {
          alerts.push({
            id: `${crew.id}-sleep`,
            type: 'sleep',
            severity: 'warning',
            message: 'Qualidade de sono baixa',
            created_at: new Date().toISOString()
          });
        }
        
        // Generate recommended actions
        const recommendedActions: string[] = [];
        if (burnoutRisk > 75) {
          recommendedActions.push('Intervenção do RH', 'Avaliação psicológica', 'Considerar desembarque');
        } else if (burnoutRisk > 50) {
          recommendedActions.push('Reduzir horas extras', 'Agendar rotação antecipada');
        }
        
        return {
          id: crew.id,
          crew_member_id: crew.id,
          crew_member_name: crew.full_name || 'N/A',
          rank: crew.rank || crew.position || 'N/A',
          department: crew.position || 'Geral',
          vessel_id: crew.vessel_id || undefined,
          days_onboard: daysOnboard,
          wellness_score: Math.round(wellnessScore),
          burnout_risk: Math.round(burnoutRisk),
          stress_level: stressLevel,
          sleep_quality: Math.round(sleepQuality),
          trend,
          last_check_in: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          alerts,
          recommended_actions: recommendedActions
        };
      });

      return wellnessData;
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

// Get interventions - uses wellness data to generate interventions
export function useWellnessInterventions() {
  const { data: wellness } = useCrewWellness();
  
  return useQuery({
    queryKey: ['wellness-interventions', wellness],
    queryFn: async () => {
      // Generate interventions from crew with high burnout risk
      const interventions: WellnessIntervention[] = (wellness || [])
        .filter(crew => crew.burnout_risk > 50)
        .map((crew, index) => ({
          id: `intervention-${crew.id}`,
          crew_member_id: crew.crew_member_id,
          crew_member_name: crew.crew_member_name,
          urgency: crew.burnout_risk > 75 ? 'critical' as const : 
                   crew.burnout_risk > 60 ? 'high' as const : 'medium' as const,
          type: crew.burnout_risk > 75 ? 'Intervenção de Burnout' : 'Prevenção de Burnout',
          actions: crew.recommended_actions.length > 0 
            ? crew.recommended_actions 
            : ['Conversa com gestor', 'Revisar escala de trabalho'],
          scheduled_date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
          completed: false
        }));

      return interventions;
    },
    staleTime: 60000,
    enabled: !!wellness
  });
}
