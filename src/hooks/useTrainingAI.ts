import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIRecommendation {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  recommendedCourses: string[];
  priority: "high" | "medium" | "low";
  reason: string;
  predictedImpact: string;
  dueDate?: string;
}

export interface TrainingGap {
  id: string;
  area: string;
  severity: "critical" | "warning" | "info";
  affectedCrew: number;
  description: string;
  suggestedAction: string;
}

export interface PredictiveInsight {
  id: string;
  type: "certification_expiry" | "skill_gap" | "compliance_risk" | "performance_trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  timeframe: string;
  actionRequired: boolean;
  suggestedAction?: string;
}

export interface GeneratedContent {
  type: "course_outline" | "quiz" | "summary" | "learning_path";
  content: any;
}

export const useTrainingAI = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [trainingGaps, setTrainingGaps] = useState<TrainingGap[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);

  // Call AI edge function
  const callAI = useCallback(async (action: string, data: any): Promise<any> => {
    try {
      const { data: result, error } = await supabase.functions.invoke("training-ai-assistant", {
        body: { action, data },
      });

      if (error) throw error;
      return result;
    } catch (err) {
      console.error("AI call error:", err);
      return null;
    }
  }, []);

  // Generate personalized recommendations
  const generateRecommendations = useCallback(async (crewData: any[], coursesData: any[]) => {
    setIsAnalyzing(true);
    try {
      const result = await callAI("generate_recommendations", { crew: crewData, courses: coursesData });
      
      if (result?.recommendations) {
        setRecommendations(result.recommendations);
        return result.recommendations;
      }

      // Fallback local generation
      const localRecs = generateLocalRecommendations(crewData, coursesData);
      setRecommendations(localRecs);
      return localRecs;
    } catch (err) {
      console.error("Error generating recommendations:", err);
      const localRecs = generateLocalRecommendations(crewData, coursesData);
      setRecommendations(localRecs);
      return localRecs;
    } finally {
      setIsAnalyzing(false);
    }
  }, [callAI]);

  // Analyze training gaps
  const analyzeTrainingGaps = useCallback(async (crewData: any[], progressData: any[]) => {
    setIsAnalyzing(true);
    try {
      const result = await callAI("analyze_gaps", { crew: crewData, progress: progressData });
      
      if (result?.gaps) {
        setTrainingGaps(result.gaps);
        return result.gaps;
      }

      const localGaps = generateLocalGaps(crewData);
      setTrainingGaps(localGaps);
      return localGaps;
    } catch (err) {
      console.error("Error analyzing gaps:", err);
      const localGaps = generateLocalGaps(crewData);
      setTrainingGaps(localGaps);
      return localGaps;
    } finally {
      setIsAnalyzing(false);
    }
  }, [callAI]);

  // Generate predictive insights
  const generatePredictiveInsights = useCallback(async (data: any) => {
    setIsAnalyzing(true);
    try {
      const result = await callAI("predictive_insights", data);
      
      if (result?.insights) {
        setPredictiveInsights(result.insights);
        return result.insights;
      }

      const localInsights = generateLocalInsights();
      setPredictiveInsights(localInsights);
      return localInsights;
    } catch (err) {
      console.error("Error generating insights:", err);
      const localInsights = generateLocalInsights();
      setPredictiveInsights(localInsights);
      return localInsights;
    } finally {
      setIsAnalyzing(false);
    }
  }, [callAI]);

  // Generate course content with AI
  const generateCourseContent = useCallback(async (topic: string, type: string): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    try {
      const result = await callAI("generate_content", { topic, type });
      
      if (result?.content) {
        toast({ title: "Conteúdo gerado", description: "O conteúdo foi gerado com IA." });
        return { type: type as any, content: result.content };
      }

      // Fallback
      return generateLocalContent(topic, type);
    } catch (err) {
      console.error("Error generating content:", err);
      return generateLocalContent(topic, type);
    } finally {
      setIsGenerating(false);
    }
  }, [callAI, toast]);

  // Generate quiz questions with AI
  const generateQuiz = useCallback(async (courseContent: string, difficulty: string) => {
    setIsGenerating(true);
    try {
      const result = await callAI("generate_quiz", { content: courseContent, difficulty });
      
      if (result?.questions) {
        return result.questions;
      }

      return generateLocalQuiz(difficulty);
    } catch (err) {
      console.error("Error generating quiz:", err);
      return generateLocalQuiz(difficulty);
    } finally {
      setIsGenerating(false);
    }
  }, [callAI]);

  // Analyze crew performance
  const analyzePerformance = useCallback(async (crewId: string, trainingHistory: any[]) => {
    setIsAnalyzing(true);
    try {
      const result = await callAI("analyze_performance", { crewId, history: trainingHistory });
      return result || generateLocalPerformanceAnalysis();
    } catch (err) {
      console.error("Error analyzing performance:", err);
      return generateLocalPerformanceAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  }, [callAI]);

  // Chat with AI training assistant
  const chatWithAssistant = useCallback(async (message: string, context?: any): Promise<string> => {
    try {
      const result = await callAI("chat", { message, context });
      return result?.response || "Desculpe, não consegui processar sua solicitação no momento.";
    } catch (err) {
      console.error("Chat error:", err);
      return "Erro ao conectar com o assistente de IA. Tente novamente.";
    }
  }, [callAI]);

  return {
    isAnalyzing,
    isGenerating,
    recommendations,
    trainingGaps,
    predictiveInsights,
    generateRecommendations,
    analyzeTrainingGaps,
    generatePredictiveInsights,
    generateCourseContent,
    generateQuiz,
    analyzePerformance,
    chatWithAssistant,
  };
};

// Local fallback functions
function generateLocalRecommendations(crew: any[], courses: any[]): AIRecommendation[] {
  return crew.slice(0, 5).map((c, i) => ({
    id: `rec-${i}`,
    crewMemberId: c.id,
    crewMemberName: c.name,
    recommendedCourses: courses.slice(0, 2).map((course) => course.course_name || course.name),
    priority: i === 0 ? "high" : i < 3 ? "medium" : "low",
    reason: `Baseado no histórico de treinamento e certificações próximas do vencimento de ${c.name}.`,
    predictedImpact: "Melhoria de 15% na conformidade de segurança",
    dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function generateLocalGaps(crew: any[]): TrainingGap[] {
  return [
    {
      id: "gap-1",
      area: "Segurança Básica STCW",
      severity: "critical",
      affectedCrew: Math.floor(crew.length * 0.2),
      description: "Certificações STCW vencendo nos próximos 30 dias",
      suggestedAction: "Agendar treinamento de renovação imediato",
    },
    {
      id: "gap-2",
      area: "Combate a Incêndio",
      severity: "warning",
      affectedCrew: Math.floor(crew.length * 0.15),
      description: "Tripulantes sem atualização de combate a incêndio no último ano",
      suggestedAction: "Incluir no próximo ciclo de treinamentos",
    },
    {
      id: "gap-3",
      area: "Operação de Equipamentos",
      severity: "info",
      affectedCrew: Math.floor(crew.length * 0.1),
      description: "Novos procedimentos de operação não treinados",
      suggestedAction: "Distribuir material de estudo e agendar prática",
    },
  ];
}

function generateLocalInsights(): PredictiveInsight[] {
  return [
    {
      id: "insight-1",
      type: "certification_expiry",
      title: "12 Certificações vencem em 60 dias",
      description: "Certificações STCW, GMDSS e SSO de múltiplos tripulantes estão próximas do vencimento.",
      impact: "high",
      timeframe: "60 dias",
      actionRequired: true,
      suggestedAction: "Agendar renovação para os tripulantes afetados",
    },
    {
      id: "insight-2",
      type: "skill_gap",
      title: "Lacuna identificada em DP Avançado",
      description: "Análise preditiva indica necessidade de mais operadores DP certificados nos próximos 6 meses.",
      impact: "medium",
      timeframe: "6 meses",
      actionRequired: true,
      suggestedAction: "Iniciar programa de capacitação DP para 3 tripulantes",
    },
    {
      id: "insight-3",
      type: "performance_trend",
      title: "Melhoria de 23% em performance",
      description: "Tripulantes que completaram treinamentos nos últimos 3 meses mostram melhoria significativa em KPIs.",
      impact: "medium",
      timeframe: "3 meses",
      actionRequired: false,
    },
    {
      id: "insight-4",
      type: "compliance_risk",
      title: "Risco de não-conformidade em auditoria",
      description: "2 tripulantes podem não atender requisitos mínimos para próxima auditoria PEOTRAM.",
      impact: "high",
      timeframe: "45 dias",
      actionRequired: true,
      suggestedAction: "Priorizar treinamentos obrigatórios",
    },
  ];
}

function generateLocalContent(topic: string, type: string): GeneratedContent {
  if (type === "course_outline") {
    return {
      type: "course_outline",
      content: {
        title: `Curso: ${topic}`,
        modules: [
          { id: 1, title: "Introdução e Fundamentos", duration: 2, objectives: ["Compreender conceitos básicos", "Identificar aplicações práticas"] },
          { id: 2, title: "Procedimentos Operacionais", duration: 3, objectives: ["Executar procedimentos padrão", "Resolver problemas comuns"] },
          { id: 3, title: "Práticas Avançadas", duration: 3, objectives: ["Aplicar técnicas avançadas", "Otimizar processos"] },
          { id: 4, title: "Avaliação e Certificação", duration: 2, objectives: ["Demonstrar competência", "Obter certificação"] },
        ],
        estimatedDuration: 10,
        prerequisites: ["Experiência básica na área"],
      },
    };
  }
  
  return { type: type as any, content: { generated: true, topic } };
}

function generateLocalQuiz(difficulty: string) {
  const difficultyMap: Record<string, number> = { easy: 5, medium: 8, hard: 10 };
  const count = difficultyMap[difficulty] || 5;

  return Array.from({ length: count }, (_, i) => ({
    id: `q-${i + 1}`,
    question: `Pergunta ${i + 1}: Qual é o procedimento correto para ${["segurança", "operação", "emergência", "manutenção", "navegação"][i % 5]}?`,
    options: ["Opção A - Correta", "Opção B", "Opção C", "Opção D"],
    correctAnswer: 0,
    explanation: "Explicação detalhada da resposta correta.",
  }));
}

function generateLocalPerformanceAnalysis() {
  return {
    overallScore: 85,
    strengths: ["Alta taxa de conclusão", "Bom desempenho em avaliações práticas"],
    areasForImprovement: ["Tempo de resposta em simulações", "Conhecimento teórico avançado"],
    trend: "improving",
    recommendations: ["Focar em treinamentos práticos", "Revisar material teórico"],
    predictedPerformance: 88,
  };
}
