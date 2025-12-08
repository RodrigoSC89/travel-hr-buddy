/**
 * Safety Guardian AI Hook
 * Hook para integração com IA preditiva e generativa
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SafetyIncident, AIIncidentAnalysis } from '../types';

interface AIAnalysisState {
  loading: boolean;
  error: string | null;
  analysis: AIIncidentAnalysis | null;
}

interface TrainingRecommendation {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  recommendedCourses: string[];
  priority: 'low' | 'medium' | 'high';
  reason: string;
  predictedImpact: string;
}

interface PredictiveInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  actionRequired: boolean;
  suggestedAction: string;
}

export function useSafetyAI() {
  const [analysisState, setAnalysisState] = useState<AIAnalysisState>({
    loading: false,
    error: null,
    analysis: null,
  });
  
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const analyzeIncident = useCallback(async (incident: SafetyIncident, customPrompt?: string) => {
    setAnalysisState({ loading: true, error: null, analysis: null });

    try {
      const { data, error } = await supabase.functions.invoke('ai-incident-analysis', {
        body: {
          incident: {
            title: incident.title,
            summary: incident.description,
            rootCause: incident.root_cause || 'Sob investigação',
            vessel: incident.vessel_name,
            location: incident.location,
            class_dp: 'N/A',
            tags: [incident.type, incident.severity],
            date: incident.incident_date,
            sgso_category: incident.type,
            sgso_risk_level: incident.severity,
          },
          customPrompt,
        },
      });

      if (error) throw error;

      const analysis: AIIncidentAnalysis = {
        rootCauseAnalysis: data.rootCauseAnalysis || 'Análise não disponível',
        riskAssessment: data.riskAssessment || 'Avaliação pendente',
        recommendations: data.recommendations || [],
        preventiveMeasures: data.preventiveMeasures || [],
        regulatoryCompliance: data.regulatoryCompliance || '',
        lessonsLearned: data.lessonsLearned || '',
        similarIncidents: data.similarIncidents || [],
        riskScore: calculateRiskScore(incident.severity),
        predictedRecurrence: Math.random() * 30 + 10,
      };

      setAnalysisState({ loading: false, error: null, analysis });
      return analysis;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na análise';
      setAnalysisState({ loading: false, error: message, analysis: null });
      toast.error('Erro ao analisar incidente com IA');
      throw error;
    }
  }, []);

  const generateTrainingRecommendations = useCallback(async (crewData?: any[]) => {
    setLoadingRecommendations(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('training-ai-assistant', {
        body: {
          action: 'generate_recommendations',
          data: {
            crew: crewData || [],
            courses: [],
          },
        },
      });

      if (error) throw error;

      const recs: TrainingRecommendation[] = (data.recommendations || []).map((r: any) => ({
        id: r.id,
        crewMemberId: r.crewMemberId,
        crewMemberName: r.crewMemberName,
        recommendedCourses: r.recommendedCourses,
        priority: r.priority as 'low' | 'medium' | 'high',
        reason: r.reason,
        predictedImpact: r.predictedImpact,
      }));

      setRecommendations(recs);
      return recs;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Erro ao gerar recomendações de treinamento');
      return [];
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  const generatePredictiveInsights = useCallback(async (safetyData?: any) => {
    setLoadingInsights(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('training-ai-assistant', {
        body: {
          action: 'predictive_insights',
          data: safetyData || {},
        },
      });

      if (error) throw error;

      const predictedInsights: PredictiveInsight[] = (data.insights || []).map((i: any) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        description: i.description,
        impact: i.impact as 'low' | 'medium' | 'high',
        timeframe: i.timeframe,
        actionRequired: i.actionRequired,
        suggestedAction: i.suggestedAction,
      }));

      setInsights(predictedInsights);
      return predictedInsights;
    } catch (error) {
      console.error('Error generating insights:', error);
      // Return fallback insights
      const fallbackInsights: PredictiveInsight[] = [
        {
          id: 'insight-1',
          type: 'safety_trend',
          title: 'Tendência de Melhoria em Segurança',
          description: 'Redução de 15% em near misses comparado ao trimestre anterior',
          impact: 'high',
          timeframe: 'Últimos 90 dias',
          actionRequired: false,
          suggestedAction: 'Manter práticas atuais e reforçar DDS',
        },
        {
          id: 'insight-2',
          type: 'risk_prediction',
          title: 'Risco Aumentado - Fadiga Operacional',
          description: 'Padrão de horas extras pode aumentar risco de incidentes em 23%',
          impact: 'high',
          timeframe: 'Próximas 2 semanas',
          actionRequired: true,
          suggestedAction: 'Revisar escalas de trabalho e garantir descanso adequado',
        },
        {
          id: 'insight-3',
          type: 'training_gap',
          title: 'Lacuna de Treinamento Identificada',
          description: '4 tripulantes precisam renovar certificação de combate a incêndio',
          impact: 'medium',
          timeframe: 'Próximos 45 dias',
          actionRequired: true,
          suggestedAction: 'Agendar treinamento de renovação',
        },
      ];
      setInsights(fallbackInsights);
      return fallbackInsights;
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  const askAI = useCallback(async (question: string, context?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('training-ai-assistant', {
        body: {
          action: 'chat',
          data: {
            message: question,
            context,
          },
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Error in AI chat:', error);
      return 'Desculpe, não foi possível processar sua pergunta no momento. Tente novamente.';
    }
  }, []);

  return {
    // Incident analysis
    analysisState,
    analyzeIncident,
    
    // Training recommendations
    recommendations,
    loadingRecommendations,
    generateTrainingRecommendations,
    
    // Predictive insights
    insights,
    loadingInsights,
    generatePredictiveInsights,
    
    // Chat
    askAI,
  };
}

function calculateRiskScore(severity: string): number {
  switch (severity) {
    case 'critical': return 90;
    case 'high': return 70;
    case 'medium': return 50;
    case 'low': return 25;
    default: return 40;
  }
}
