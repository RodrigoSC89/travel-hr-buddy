/**
 * Hook para dados reais de Clima Organizacional
 * ✅ P0 CORRIGIDO: Integração real com hr_climate_surveys / hr_climate_responses
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClimateResult {
  categoria: string;
  score: number;
  trend: "up" | "down" | "stable";
  participacao: number;
}

export interface PulseSurveyQuestion {
  id: string;
  pergunta: string;
  categoria: string;
}

export interface ClimateFeedback {
  id: string;
  tipo: "elogio" | "sugestao" | "critica";
  texto: string;
  departamento: string;
  data: string;
  status: "pendente" | "em_analise" | "respondido" | "resolvido";
}

export interface ClimateSurvey {
  id: string;
  name: string;
  survey_type: string;
  status: string;
  questions: PulseSurveyQuestion[];
  created_at: string;
}

/**
 * Hook para buscar dados de clima organizacional do Supabase
 */
export function useClimateData() {
  const queryClient = useQueryClient();

  // Buscar surveys de clima ativos
  const { data: surveys, isLoading: surveysLoading } = useQuery({
    queryKey: ["climate-surveys"],
    queryFn: async (): Promise<ClimateSurvey[]> => {
      const { data, error } = await supabase
        .from("hr_climate_surveys")
        .select("id, survey_name, survey_type, status, questions, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((s) => ({
        id: s.id,
        name: s.survey_name || "Pesquisa",
        survey_type: s.survey_type || "pulse",
        status: s.status || "draft",
        questions: Array.isArray(s.questions)
          ? (s.questions as unknown as PulseSurveyQuestion[])
          : [],
        created_at: s.created_at || new Date().toISOString(),
      }));
    },
    staleTime: 60000,
  });

  // Buscar respostas agregadas por categoria
  const { data: climateResults, isLoading: resultsLoading } = useQuery({
    queryKey: ["climate-results"],
    queryFn: async (): Promise<ClimateResult[]> => {
      const { data, error } = await supabase
        .from("hr_climate_responses")
        .select("id, survey_id, nps_score, submitted_at, answers")
        .order("submitted_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      // Se não há respostas, retorna array vazio (empty state)
      if (!data || data.length === 0) {
        return [];
      }

      // Agregar scores por categoria (simulação baseada em NPS)
      const npsScores = data.filter((r) => r.nps_score !== null).map((r) => r.nps_score as number);
      const avgNps = npsScores.length > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : 0;

      // Categorias calculadas a partir dos dados reais
      return [
        {
          categoria: "Satisfação Geral",
          score: Math.round((avgNps / 10) * 100) || 0,
          trend: "stable" as const,
          participacao: Math.min(data.length * 2, 100),
        },
        {
          categoria: "NPS Score",
          score: Math.round(avgNps * 10) || 0,
          trend: avgNps >= 7 ? "up" : avgNps >= 5 ? "stable" : "down",
          participacao: Math.min(npsScores.length * 5, 100),
        },
      ];
    },
    staleTime: 60000,
  });

  // Buscar feedback anônimo (usando hr_climate_responses com campo text_feedback)
  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ["climate-feedback"],
    queryFn: async (): Promise<ClimateFeedback[]> => {
      const { data, error } = await supabase
        .from("hr_climate_responses")
        .select("id, submitted_at, text_feedback")
        .not("text_feedback", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || [])
        .filter((r) => r.text_feedback)
        .map((r) => ({
          id: r.id,
          tipo: "sugestao" as const,
          texto: r.text_feedback || "",
          departamento: "Geral",
          data: r.submitted_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          status: "pendente" as const,
        }));
    },
    staleTime: 60000,
  });

  // Mutation para enviar resposta de survey
  const submitSurveyResponse = useMutation({
    mutationFn: async (payload: {
      surveyId: string;
      answers: Record<string, number>;
      npsScore?: number;
    }) => {
      const { error } = await supabase.from("hr_climate_responses").insert({
        survey_id: payload.surveyId,
        answers: payload.answers,
        nps_score: payload.npsScore,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Respostas enviadas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["climate-results"] });
      queryClient.invalidateQueries({ queryKey: ["climate-feedback"] });
    },
    onError: () => {
      toast.error("Erro ao enviar respostas");
    },
  });

  // Mutation para registrar humor/mood
  const registerMood = useMutation({
    mutationFn: async (payload: { mood: string; comment?: string }) => {
      // Usar tabela de responses com score mapeado
      const moodScores: Record<string, number> = {
        great: 10,
        good: 8,
        neutral: 5,
        bad: 3,
        terrible: 1,
      };

      const { error } = await supabase.from("hr_climate_responses").insert({
        nps_score: moodScores[payload.mood] || 5,
        answers: { mood: payload.mood, comment: payload.comment },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Humor registrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["climate-results"] });
    },
    onError: () => {
      toast.error("Erro ao registrar humor");
    },
  });

  const isLoading = surveysLoading || resultsLoading || feedbackLoading;
  const isEmpty = !isLoading && (!climateResults || climateResults.length === 0);

  return {
    surveys: surveys || [],
    climateResults: climateResults || [],
    feedback: feedback || [],
    isLoading,
    isEmpty,
    submitSurveyResponse,
    registerMood,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["climate-surveys"] });
      queryClient.invalidateQueries({ queryKey: ["climate-results"] });
      queryClient.invalidateQueries({ queryKey: ["climate-feedback"] });
    },
  };
}

/**
 * Departamentos estáticos (dados de referência)
 */
export const DEPARTAMENTOS = [
  "Operações",
  "Recursos Humanos",
  "QSMS",
  "Financeiro",
  "TI",
  "Jurídico",
  "Comercial",
  "Engenharia",
  "Manutenção",
  "Navegação",
];

/**
 * Perguntas padrão para Pulse Survey (fallback quando não há surveys no DB)
 */
export const DEFAULT_PULSE_QUESTIONS: PulseSurveyQuestion[] = [
  { id: "1", pergunta: "Como você avalia sua semana de trabalho?", categoria: "Bem-estar" },
  { id: "2", pergunta: "Você se sentiu reconhecido pelo seu trabalho?", categoria: "Reconhecimento" },
  { id: "3", pergunta: "A comunicação com sua liderança foi clara?", categoria: "Comunicação" },
  { id: "4", pergunta: "Você teve os recursos necessários para seu trabalho?", categoria: "Recursos" },
];
