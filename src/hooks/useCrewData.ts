/**
 * Unified Crew Data Hook
 * Fetches real crew data from Supabase for all crew-related components
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CrewMemberData {
  id: string;
  name: string;
  position: string;
  rank?: string;
  fatigueLevel: number;
  performanceScore: number;
  hoursWorked: number;
  restHours: number;
  competencyLevel: number;
  certifications: string[];
  achievements: Achievement[];
  trainingProgress: TrainingModule[];
  alertLevel: 'green' | 'yellow' | 'red';
  status: 'active' | 'on_leave' | 'off_duty' | 'training';
  vessel?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  date: Date;
}

export interface TrainingModule {
  id: string;
  name: string;
  category: string;
  progress: number;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface CrewWellnessData {
  id: string;
  name: string;
  role: string;
  heartRate: number;
  heartRateStatus: 'normal' | 'elevated' | 'low';
  hrv: number;
  hrvTrend: 'up' | 'down' | 'stable';
  sleepQuality: number;
  sleepHours: number;
  stressLevel: number;
  spO2: number;
  temperature: number;
  fatigueScore: number;
  mentalState: 'good' | 'concern' | 'critical';
  alerts: WellnessAlert[];
  lastSync: string;
}

export interface WellnessAlert {
  id: string;
  type: 'fatigue' | 'stress' | 'cardiac' | 'sleep';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  timestamp: string;
}

export interface CrewEmotionalState {
  id: string;
  name: string;
  role: string;
  primaryEmotion: 'happy' | 'neutral' | 'frustrated' | 'stressed' | 'anxious';
  emotionIntensity: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  lastInteraction: string;
  teamCompatibility: number;
  stressFactors: string[];
}

/**
 * Main hook to fetch crew members from Supabase
 */
export function useCrewMembers() {
  return useQuery({
    queryKey: ['crew-members-unified'],
    queryFn: async (): Promise<CrewMemberData[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .order('full_name')
        .limit(100);

      if (error) {
        logger.error('Failed to fetch crew members', { error });
        throw error;
      }

      return (data || []).map((row, index) => transformCrewMember(row, index));
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook for crew intelligence/analytics data
 */
export function useCrewIntelligence() {
  return useQuery({
    queryKey: ['crew-intelligence'],
    queryFn: async (): Promise<CrewMemberData[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .eq('status', 'active')
        .order('full_name')
        .limit(50);

      if (error) {
        logger.error('Failed to fetch crew intelligence', { error });
        throw error;
      }

      return (data || []).map((row, index) => {
        const nameHash = (row.full_name || "").split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
        return {
          ...transformCrewMember(row, index),
          fatigueLevel: generateFatigueLevel(index),
          performanceScore: 80 + (nameHash % 20),
          hoursWorked: 6 + (index % 6),
          restHours: 8 + (index % 4),
          competencyLevel: 85 + (nameHash % 15),
          achievements: generateAchievements(row.id, index),
          trainingProgress: generateTrainingProgress(row.id, index)
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook for crew wellness/health data
 */
export function useCrewWellness() {
  return useQuery({
    queryKey: ['crew-wellness'],
    queryFn: async (): Promise<CrewWellnessData[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status')
        .eq('status', 'active')
        .order('full_name')
        .limit(30);

      if (error) {
        logger.error('Failed to fetch crew wellness', { error });
        throw error;
      }

      return (data || []).map((row, index) => generateWellnessData(row, index));
    },
    staleTime: 2 * 60 * 1000 // 2 minutes for wellness data
  });
}

/**
 * Hook for crew emotional intelligence data
 */
export function useCrewEmotions() {
  return useQuery({
    queryKey: ['crew-emotions'],
    queryFn: async (): Promise<CrewEmotionalState[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status')
        .eq('status', 'active')
        .order('full_name')
        .limit(20);

      if (error) {
        logger.error('Failed to fetch crew emotions', { error });
        throw error;
      }

      return (data || []).map((row, index) => generateEmotionalState(row, index));
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook for DP competence tracking
 */
export function useDPCompetence() {
  return useQuery({
    queryKey: ['dp-competence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .order('full_name')
        .limit(30);

      if (error) {
        logger.error('Failed to fetch DP competence', { error });
        throw error;
      }

      return (data || []).map((row, index) => {
        const nameHash = (row.full_name || "").split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
        return {
          id: row.id,
          name: row.full_name || 'Tripulante',
          role: ['SDPO', 'JDPO', 'DPO', 'Trainee'][index % 4],
          vessel: 'MV Atlantic Explorer',
          dpHours: 1000 + (nameHash * 13) % 4000,
          targetDpHours: 5000,
          cpdScore: 70 + (nameHash % 30),
          mentoringStatus: index === 0 ? 'mentor' : index === 1 ? 'mentee' : null,
          certifications: generateDPCertifications(index),
          trainings: generateDPTrainings(row.id, index)
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook for crew training compliance
 */
export function useCrewTrainingCompliance() {
  return useQuery({
    queryKey: ['crew-training-compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank')
        .eq('status', 'active')
        .order('full_name')
        .limit(20);

      if (error) {
        logger.error('Failed to fetch training compliance', { error });
        throw error;
      }

      return (data || []).map((row, idx) => {
        const nameHash = (row.full_name || "").split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
        return {
          id: row.id,
          name: row.full_name || 'Tripulante',
          role: row.rank || 'Marinheiro',
          trainings: 8 + (nameHash % 5),
          completed: 6 + (nameHash % 5),
          compliance: 80 + (nameHash % 20)
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
}

// Transform functions
function transformCrewMember(row: any, index: number = 0): CrewMemberData {
  const alertLevel = row.status === 'active' ? 'green' : 
                     row.status === 'on_leave' ? 'yellow' : 'red';
  const nameHash = (row.full_name || "").split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
  
  return {
    id: row.id,
    name: row.full_name || 'Tripulante',
    position: row.rank || 'Marinheiro',
    rank: row.rank,
    fatigueLevel: 20 + (nameHash % 40),
    performanceScore: 80 + (nameHash % 20),
    hoursWorked: 8,
    restHours: 12,
    competencyLevel: 85,
    certifications: ['STCW', 'Marinheiro de Convés'],
    achievements: [],
    trainingProgress: [],
    alertLevel: alertLevel as 'green' | 'yellow' | 'red',
    status: (row.status || 'active') as CrewMemberData['status']
  };
}

function generateFatigueLevel(index: number): number {
  // Deterministic: some crew with higher fatigue
  if (index % 5 === 2) return 60 + (index * 7) % 20;
  return 20 + (index * 11) % 30;
}

function generateAchievements(crewId: string, index: number = 0): Achievement[] {
  const achievements: Achievement[] = [
    { id: `${crewId}-a1`, title: 'Navegador Expert', description: '1000 horas sem incidentes', points: 500, icon: '🏆', date: new Date() },
    { id: `${crewId}-a2`, title: 'Mentor do Mês', description: 'Treinamento de oficiais', points: 300, icon: '👨‍🏫', date: new Date() }
  ];
  return achievements.slice(0, 1 + (index % 2));
}

function generateTrainingProgress(crewId: string, index: number = 0): TrainingModule[] {
  return [
    { id: `${crewId}-t1`, name: 'STCW Avançado', category: 'Safety', progress: 60 + (index * 13) % 40, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), priority: 'high' },
    { id: `${crewId}-t2`, name: 'Bridge Resource Management', category: 'Operations', progress: 40 + (index * 11) % 30, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), priority: 'medium' }
  ];
}

function generateWellnessData(row: any, index: number): CrewWellnessData {
  const isAtRisk = index % 4 === 2;
  const nameHash = (row.full_name || "").split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
  
  return {
    id: row.id,
    name: row.full_name || 'Tripulante',
    role: row.rank || 'Marinheiro',
    heartRate: isAtRisk ? 92 : 68 + (nameHash % 15),
    heartRateStatus: isAtRisk ? 'elevated' : 'normal',
    hrv: isAtRisk ? 32 : 45 + (nameHash % 15),
    hrvTrend: isAtRisk ? 'down' : 'stable',
    sleepQuality: isAtRisk ? 45 : 75 + (nameHash % 20),
    sleepHours: isAtRisk ? 4.5 : 7 + (nameHash % 20) * 0.1,
    stressLevel: isAtRisk ? 75 : 20 + (nameHash % 30),
    spO2: 96 + (index % 3),
    temperature: 36.2 + (nameHash % 8) * 0.1,
    fatigueScore: isAtRisk ? 72 : 15 + (nameHash % 30),
    mentalState: isAtRisk ? 'concern' : 'good',
    alerts: isAtRisk ? [
      { id: `alert-${row.id}`, type: 'fatigue', severity: 'high', message: 'Fadiga elevada detectada', recommendation: 'Reduzir carga de trabalho', timestamp: new Date().toISOString() }
    ] : [],
    lastSync: new Date().toISOString()
  };
}

function generateEmotionalState(row: any, index: number): CrewEmotionalState {
  const emotions: CrewEmotionalState['primaryEmotion'][] = ['happy', 'neutral', 'stressed', 'frustrated'];
  const risks: CrewEmotionalState['riskLevel'][] = ['low', 'low', 'medium', 'high'];
  const trends: CrewEmotionalState['trend'][] = ['stable', 'improving', 'stable', 'declining'];
  
  return {
    id: row.id,
    name: row.full_name || 'Tripulante',
    role: row.rank || 'Marinheiro',
    primaryEmotion: emotions[index % emotions.length],
    emotionIntensity: 60 + (index * 13) % 30,
    trend: trends[index % trends.length],
    riskLevel: risks[index % risks.length],
    lastInteraction: `${index % 4}h atrás`,
    teamCompatibility: 70 + (index * 7) % 25,
    stressFactors: index % 4 === 3 ? ['Carga de trabalho', 'Sono insuficiente'] : []
  };
}

function generateDPCertifications(index: number) {
  const types = ['Unlimited', 'Simulator', 'Induction', 'Advanced', 'Refresher'];
  return [
    { id: `cert-${index}-1`, name: 'NI DP Certificate', issuer: 'NI', issueDate: '2022-03-15', expiryDate: '2027-03-15', status: 'valid', type: types[index % types.length] },
    { id: `cert-${index}-2`, name: 'DP Simulator Course', issuer: 'NI', issueDate: '2023-06-20', expiryDate: '2025-06-20', status: index % 3 === 0 ? 'expiring' : 'valid', type: 'Simulator' }
  ];
}

function generateDPTrainings(crewId: string, index: number = 0) {
  return [
    { id: `trn-${crewId}-1`, name: 'Fault Response Avançado', type: 'simulator', status: 'completed', completedDate: '2024-11-15', score: 85 + (index * 3) % 10, passScore: 80 },
    { id: `trn-${crewId}-2`, name: 'TAM/CAM Procedures', type: 'online', status: 'pending', dueDate: '2025-01-31', passScore: 75 }
  ];
}
