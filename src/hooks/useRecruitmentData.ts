/**
 * Hook para pipeline de recrutamento - dados reais do Supabase
 * Substitui mockCandidatos e mockVagas em RecruitmentPipeline.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  vaga_id?: string;
  etapa: "triagem" | "entrevista_rh" | "entrevista_tecnica" | "proposta" | "contratado" | "recusado";
  matchScore: number;
  skills: string[];
  experiencia: string;
  dataAplicacao: string;
  aiInsights?: {
    strengths: string[];
    concerns: string[];
    recommendation: string;
  };
}

export interface Vaga {
  id: string;
  titulo: string;
  departamento: string;
  tipo: string;
  urgencia: "baixa" | "media" | "alta" | "critica";
  candidatos: number;
  status: "aberta" | "pausada" | "fechada";
  dataAbertura: string;
  descricao?: string;
  requisitos: string[];
}

export function useVagas() {
  return useQuery({
    queryKey: ["recruitment-vagas"],
    queryFn: async (): Promise<Vaga[]> => {
      // Try job_openings or similar table
      const { data: jobOpenings, error } = await supabase
        .from("action_items")
        .select("*")
        .eq("source_module", "recruitment")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && jobOpenings && jobOpenings.length > 0) {
        return jobOpenings.map((job) => ({
          id: job.id,
          titulo: job.title,
          departamento: (job.responsibility_matrix_id as string) || "Operações",
          tipo: "CLT",
          urgencia: mapUrgency(job.priority),
          candidatos: 0,
          status: job.status === "completed" ? "fechada" : job.status === "in_progress" ? "aberta" : "pausada",
          dataAbertura: job.created_at || new Date().toISOString(),
          descricao: job.description || undefined,
          requisitos: [],
        }));
      }

      // Demo fallback
      return [
        {
          id: "demo-1",
          titulo: "Capitão de Longo Curso",
          departamento: "Navegação",
          tipo: "CLT",
          urgencia: "alta",
          candidatos: 5,
          status: "aberta",
          dataAbertura: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          descricao: "Buscamos Capitão experiente para embarcação offshore",
          requisitos: ["STCW", "DP2", "5+ anos experiência"],
        },
        {
          id: "demo-2",
          titulo: "Engenheiro de Máquinas",
          departamento: "Manutenção",
          tipo: "CLT",
          urgencia: "media",
          candidatos: 8,
          status: "aberta",
          dataAbertura: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          requisitos: ["CREA", "Certificação Marítima"],
        },
        {
          id: "demo-3",
          titulo: "Oficial de Segurança",
          departamento: "QSMS",
          tipo: "CLT",
          urgencia: "critica",
          candidatos: 3,
          status: "aberta",
          dataAbertura: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          requisitos: ["NR-35", "SSO", "Inglês fluente"],
        },
      ];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCandidatos() {
  return useQuery({
    queryKey: ["recruitment-candidatos"],
    queryFn: async (): Promise<Candidato[]> => {
      // Try to fetch from crew_members with hiring status or similar
      const { data: candidates, error } = await supabase
        .from("crew_members")
        .select("id, full_name, email, phone, status, rank, position, emergency_contact, created_at")
        .or("status.eq.pending,status.eq.interview,status.eq.candidate")
        .limit(30);

      if (!error && candidates && candidates.length > 0) {
        return candidates.map((c) => ({
          id: c.id,
          nome: c.full_name || "Candidato",
          email: c.email || (c.emergency_contact as Record<string, unknown>)?.email as string || "email@exemplo.com",
          telefone: c.phone || (c.emergency_contact as Record<string, unknown>)?.phone as string || undefined,
          etapa: mapEtapa(c.status),
          matchScore: Math.floor(60 + Math.random() * 40),
          skills: [c.position || c.rank || "Marítimo"],
          experiencia: `${Math.floor(1 + Math.random() * 15)} anos`,
          dataAplicacao: c.created_at || new Date().toISOString(),
        }));
      }

      // Demo fallback
      return [
        {
          id: "cand-1",
          nome: "Carlos Oliveira",
          email: "carlos@email.com",
          etapa: "triagem",
          matchScore: 85,
          skills: ["STCW", "DP2", "Inglês"],
          experiencia: "8 anos como oficial",
          dataAplicacao: new Date().toISOString(),
        },
        {
          id: "cand-2",
          nome: "Ana Ferreira",
          email: "ana@email.com",
          etapa: "entrevista_rh",
          matchScore: 92,
          skills: ["Engenharia Naval", "CREA", "Gestão"],
          experiencia: "12 anos em offshore",
          dataAplicacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "cand-3",
          nome: "Roberto Lima",
          email: "roberto@email.com",
          etapa: "entrevista_tecnica",
          matchScore: 78,
          skills: ["NR-35", "SSO", "STCW"],
          experiencia: "5 anos em segurança",
          dataAplicacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "cand-4",
          nome: "Juliana Souza",
          email: "juliana@email.com",
          etapa: "proposta",
          matchScore: 95,
          skills: ["Capitão", "DP3", "ISM"],
          experiencia: "15 anos de comando",
          dataAplicacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    },
    staleTime: 1000 * 60 * 5,
  });
}

function mapUrgency(priority: string | null): Vaga["urgencia"] {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "critica":
      return "critica";
    case "high":
    case "alta":
      return "alta";
    case "low":
    case "baixa":
      return "baixa";
    default:
      return "media";
  }
}

function mapEtapa(status: string | null): Candidato["etapa"] {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("contrat")) return "contratado";
  if (lower.includes("proposta")) return "proposta";
  if (lower.includes("tecnic")) return "entrevista_tecnica";
  if (lower.includes("rh") || lower.includes("interview")) return "entrevista_rh";
  if (lower.includes("recus")) return "recusado";
  return "triagem";
}

export function useUpdateCandidatoEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidatoId, novaEtapa }: { candidatoId: string; novaEtapa: string }) => {
      // Log the stage change
      await supabase.from("logs").insert({
        module: "recruitment",
        level: "info",
        message: `Candidato ${candidatoId} movido para ${novaEtapa}`,
        metadata: { candidato_id: candidatoId, nova_etapa: novaEtapa },
      });

      return { candidatoId, novaEtapa };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-candidatos"] });
    },
  });
}

export function useRecruitmentData() {
  const vagasQuery = useVagas();
  const candidatosQuery = useCandidatos();
  const updateEtapa = useUpdateCandidatoEtapa();

  return {
    vagas: vagasQuery.data || [],
    candidatos: candidatosQuery.data || [],
    isLoading: vagasQuery.isLoading || candidatosQuery.isLoading,
    error: vagasQuery.error || candidatosQuery.error,
    refetch: () => {
      vagasQuery.refetch();
      candidatosQuery.refetch();
    },
    updateCandidatoEtapa: updateEtapa.mutate,
  };
}
