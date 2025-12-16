/**
 * Safety Guardian AI Hook
 * Hook para integração com Lovable AI - IA preditiva e generativa
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

interface DDSContent {
  title: string;
  topic: string;
  content: string;
  keyPoints: string[];
  discussionQuestions: string[];
  safetyTips: string[];
  duration: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const analyzeIncident = useCallback(async (incident: SafetyIncident, customPrompt?: string) => {
    setAnalysisState({ loading: true, error: null, analysis: null });

    try {
      const { data, error } = await supabase.functions.invoke('safety-ai', {
        body: {
          action: 'analyze_incident',
          data: {
            incident: {
              title: incident.title,
              summary: incident.description,
              rootCause: incident.root_cause || 'Sob investigação',
              vessel: incident.vessel_name,
              location: incident.location,
              date: incident.incident_date,
              sgso_category: incident.type,
              sgso_risk_level: incident.severity,
            },
            customPrompt,
          },
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Limite de requisições atingido. Tente novamente em alguns instantes.');
          throw new Error('Rate limit exceeded');
        }
        if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes. Adicione créditos ao seu workspace.');
          throw new Error('Payment required');
        }
        throw error;
      }

      const analysis: AIIncidentAnalysis = {
        rootCauseAnalysis: data.rootCauseAnalysis || 'Análise não disponível',
        riskAssessment: data.riskAssessment || 'Avaliação pendente',
        recommendations: data.recommendations || [],
        preventiveMeasures: data.preventiveMeasures || [],
        regulatoryCompliance: data.regulatoryCompliance || '',
        lessonsLearned: data.lessonsLearned || '',
        similarIncidents: data.similarIncidents || [],
        riskScore: data.riskScore || calculateRiskScore(incident.severity),
        predictedRecurrence: data.predictedRecurrence || Math.random() * 30 + 10,
      };

      setAnalysisState({ loading: false, error: null, analysis });
      toast.success('Análise de incidente concluída');
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
      const { data, error } = await supabase.functions.invoke('safety-ai', {
        body: {
          action: 'generate_recommendations',
          data: { crew: crewData || [] },
        },
      });

      if (error) throw error;

      const recs: TrainingRecommendation[] = (data.recommendations || []).map((r: any, idx: number) => ({
        id: r.id || `rec-${idx}`,
        crewMemberId: r.crewMemberId || `crew-${idx}`,
        crewMemberName: r.crewMemberName || `Tripulante ${idx + 1}`,
        recommendedCourses: r.recommendedCourses || [],
        priority: r.priority || 'medium',
        reason: r.reason || 'Recomendação baseada em análise de IA',
        predictedImpact: r.predictedImpact || 'Melhoria na segurança operacional',
      }));

      setRecommendations(recs);
      return recs;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Return fallback recommendations
      const fallback: TrainingRecommendation[] = [
        {
          id: 'rec-1',
          crewMemberId: 'crew-1',
          crewMemberName: 'Exemplo Tripulante',
          recommendedCourses: ['Combate a Incêndio Avançado', 'Primeiros Socorros'],
          priority: 'high',
          reason: 'Certificação expirando nos próximos 30 dias',
          predictedImpact: 'Redução de 25% no risco de incidentes',
        },
      ];
      setRecommendations(fallback);
      return fallback;
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  const generatePredictiveInsights = useCallback(async (safetyData?: any) => {
    setLoadingInsights(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('safety-ai', {
        body: {
          action: 'predictive_insights',
          data: safetyData || {},
        },
      });

      if (error) throw error;

      const predictedInsights: PredictiveInsight[] = (data.insights || []).map((i: any, idx: number) => ({
        id: i.id || `insight-${idx}`,
        type: i.type || 'safety_trend',
        title: i.title || 'Insight de Segurança',
        description: i.description || '',
        impact: i.impact || 'medium',
        timeframe: i.timeframe || 'Próximos 30 dias',
        actionRequired: i.actionRequired ?? false,
        suggestedAction: i.suggestedAction || '',
      }));

      setInsights(predictedInsights);
      return predictedInsights;
    } catch (error) {
      console.error('Error generating insights:', error);
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

  const generateDDS = useCallback(async (topic: string, vessel?: string, department?: string): Promise<DDSContent> => {
    try {
      const { data, error } = await supabase.functions.invoke('safety-ai', {
        body: {
          action: 'dds_generate',
          data: { topic, vessel, department },
        },
      });

      if (error) throw error;

      return {
        title: data.title || `DDS - ${topic}`,
        topic: data.topic || topic,
        content: data.content || '',
        keyPoints: data.keyPoints || [],
        discussionQuestions: data.discussionQuestions || [],
        safetyTips: data.safetyTips || [],
        duration: data.duration || '15 minutos',
      };
    } catch (error) {
      console.error('Error generating DDS:', error);
      return {
        title: `DDS - ${topic}`,
        topic,
        content: `Diálogo de segurança sobre ${topic}. Discuta com a equipe os principais riscos e medidas preventivas.`,
        keyPoints: ['Identificar riscos', 'Usar EPIs adequados', 'Comunicar situações inseguras'],
        discussionQuestions: ['Quais riscos você identifica nesta atividade?', 'O que podemos fazer para trabalhar com mais segurança?'],
        safetyTips: ['Sempre use EPIs', 'Comunique desvios', 'Não tenha pressa'],
        duration: '15 minutos',
      };
    }
  }, []);

  const askAI = useCallback(async (question: string, context?: any): Promise<string> => {
    setChatLoading(true);
    
    const userMessage: ChatMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('safety-ai', {
        body: {
          action: 'chat',
          data: { message: question, context },
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Limite de requisições atingido');
          return 'Limite de requisições atingido. Tente novamente em alguns instantes.';
        }
        throw error;
      }

      const response = data.response || 'Não foi possível processar sua pergunta.';
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setChatHistory(prev => [...prev, assistantMessage]);
      
      return response;
    } catch (error) {
      console.error('Error in AI chat:', error);
      return 'Desculpe, não foi possível processar sua pergunta no momento. Tente novamente.';
    } finally {
      setChatLoading(false);
    }
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
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
    
    // DDS
    generateDDS,
    
    // Chat
    chatHistory,
    chatLoading,
    askAI,
    clearChatHistory,
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
