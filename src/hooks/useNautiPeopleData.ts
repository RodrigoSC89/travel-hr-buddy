/**
 * Hook para dados do Nauti People Hub - dados reais do Supabase
 * Substitui mockVagas, mockCandidatos, mockColaboradores
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Vaga {
  id: string;
  titulo: string;
  departamento: string;
  unidade: string;
  tipo: string;
  status: "aberta" | "em_andamento" | "fechada" | "cancelada";
  prioridade: "critica" | "alta" | "media" | "baixa";
  salarioMin?: number;
  salarioMax?: number;
  descricao: string;
  requisitos: string[];
  dataCriacao: string;
  dataLimite?: string;
  responsavel?: string;
  candidatosCount: number;
}

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  vagaId: string;
  vagaTitulo: string;
  etapa: string;
  score: number;
  skills: string[];
  experiencia: number;
  dataCandidatura: string;
  ultimaAtualizacao: string;
  observacoes?: string;
  curriculo?: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  unidade: string;
  dataAdmissao: string;
  status: "ativo" | "ferias" | "afastado" | "desligado";
  gestorId?: string;
  salario?: number;
  tipoContrato: string;
}

export function useNautiPeopleData() {
  const queryClient = useQueryClient();

  // Fetch job openings (vagas) from action_items with recruitment context
  const vagasQuery = useQuery({
    queryKey: ["nauti-people-vagas"],
    queryFn: async (): Promise<Vaga[]> => {
      const { data: actionItems, error } = await supabase
        .from("action_items")
        .select("*")
        .eq("source_module", "recruitment")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!actionItems?.length) return [];

      return actionItems.map(item => {
        const comments = (item.comments as Record<string, unknown>) || {};
        return {
          id: item.id,
          titulo: item.title,
          departamento: (comments.departamento as string) || "Operações",
          unidade: (comments.unidade as string) || "Escritório Central",
          tipo: (comments.tipo as string) || "CLT",
          status: item.status === "completed" ? "fechada" : item.status === "in_progress" ? "em_andamento" : "aberta",
          prioridade: ((item.priority as string) || "media") as "alta" | "baixa" | "critica" | "media",
          salarioMin: comments.salario_min as number | undefined,
          salarioMax: comments.salario_max as number | undefined,
          descricao: item.description || "",
          requisitos: (comments.requisitos as string[]) || [],
          dataCriacao: item.created_at || "",
          dataLimite: item.due_date || undefined,
          responsavel: item.assigned_to_name || undefined,
          candidatosCount: 0
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch candidates
  const candidatosQuery = useQuery({
    queryKey: ["nauti-people-candidatos"],
    queryFn: async (): Promise<Candidato[]> => {
      // Try crew_members with pending status or candidate flag
      const { data: crewCandidates, error } = await supabase
        .from("crew_members")
        .select("*")
        .or("status.eq.pending,status.eq.candidate,status.eq.applicant")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!crewCandidates?.length) return [];

      return crewCandidates.map(c => {
        const emergencyData = (c.emergency_contact ?? {}) as Record<string, unknown>;
        return {
          id: c.id,
          nome: c.full_name || "N/A",
          email: c.email || "",
          telefone: c.phone || undefined,
          vagaId: String(emergencyData.vaga_id ?? ""),
          vagaTitulo: String(emergencyData.vaga_titulo ?? "Posição Geral"),
          etapa: String(emergencyData.etapa ?? "triagem"),
          score: Number(emergencyData.score ?? 0),
          skills: (emergencyData.skills as string[]) || [],
          experiencia: c.experience_years || 0,
          dataCandidatura: c.created_at || "",
          ultimaAtualizacao: c.updated_at || c.created_at || ""
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch employees (colaboradores)
  const colaboradoresQuery = useQuery({
    queryKey: ["nauti-people-colaboradores"],
    queryFn: async (): Promise<Colaborador[]> => {
      const { data: crewMembers, error } = await supabase
        .from("crew_members")
        .select(`
          *,
          vessels(name)
        `)
        .in("status", ["active", "on_leave", "inactive"])
        .order("full_name");

      if (error || !crewMembers?.length) {
        return [];
      }

      return crewMembers.map(member => {
        const emergencyData = (member.emergency_contact ?? {}) as Record<string, unknown>;
        const vesselData = (member.vessels ?? {}) as Record<string, unknown>;
        return {
          id: member.id,
          nome: member.full_name || "N/A",
          email: member.email || "",
          cargo: member.position || member.rank || "Crew",
          departamento: String(emergencyData.departamento ?? "Operações"),
          unidade: String(vesselData.name ?? "Base"),
          dataAdmissao: member.join_date || member.created_at?.split("T")[0] || "",
          status: member.status === "active" ? "ativo" : 
                  member.status === "on_leave" ? "ferias" : 
                  member.status === "inactive" ? "desligado" : "afastado",
          tipoContrato: String(emergencyData.tipo_contrato ?? "CLT")
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Update candidate stage mutation
  const updateCandidatoEtapa = useMutation({
    mutationFn: async ({ candidatoId, novaEtapa }: { candidatoId: string; novaEtapa: string }) => {
      // Get current emergency_contact data first
      const { data: current } = await supabase
        .from("crew_members")
        .select("emergency_contact")
        .eq("id", candidatoId)
        .single();
      
      const currentData = (current?.emergency_contact ?? {}) as Record<string, unknown>;
      
      const { error } = await supabase
        .from("crew_members")
        .update({
          emergency_contact: { ...currentData, etapa: novaEtapa },
          updated_at: new Date().toISOString()
        })
        .eq("id", candidatoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nauti-people-candidatos"] });
      toast.success("Etapa atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar etapa");
    }
  });

  // Create vaga mutation
  const criarVaga = useMutation({
    mutationFn: async (vaga: Omit<Vaga, "id" | "candidatosCount" | "dataCriacao">) => {
      const { data, error } = await supabase
        .from("action_items")
        .insert({
          title: vaga.titulo,
          description: vaga.descricao,
          source_module: "recruitment",
          priority: vaga.prioridade,
          status: "open",
          due_date: vaga.dataLimite,
          comments: {
            departamento: vaga.departamento,
            unidade: vaga.unidade,
            tipo: vaga.tipo,
            requisitos: vaga.requisitos,
            salario_min: vaga.salarioMin,
            salario_max: vaga.salarioMax
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nauti-people-vagas"] });
      toast.success("Vaga criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar vaga");
    }
  });

  // Statistics
  const stats = {
    totalVagas: vagasQuery.data?.length || 0,
    vagasAbertas: vagasQuery.data?.filter(v => v.status === "aberta").length || 0,
    vagasCriticas: vagasQuery.data?.filter(v => v.prioridade === "critica").length || 0,
    totalCandidatos: candidatosQuery.data?.length || 0,
    totalColaboradores: colaboradoresQuery.data?.length || 0,
    colaboradoresAtivos: colaboradoresQuery.data?.filter(c => c.status === "ativo").length || 0
  };

  return {
    vagas: vagasQuery.data || [],
    candidatos: candidatosQuery.data || [],
    colaboradores: colaboradoresQuery.data || [],
    isLoading: vagasQuery.isLoading || candidatosQuery.isLoading || colaboradoresQuery.isLoading,
    stats,
    updateCandidatoEtapa: updateCandidatoEtapa.mutate,
    criarVaga: criarVaga.mutate,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["nauti-people-vagas"] });
      queryClient.invalidateQueries({ queryKey: ["nauti-people-candidatos"] });
      queryClient.invalidateQueries({ queryKey: ["nauti-people-colaboradores"] });
    }
  };
}

// Re-export static reference data
export const departamentos = [
  'Operações', 'Recursos Humanos', 'QSMS', 'Financeiro', 'TI',
  'Jurídico', 'Comercial', 'Engenharia', 'Manutenção', 'Navegação'
];

export const unidades = [
  'Escritório Central', 'Plataforma Nautilus-A', 'Plataforma Nautilus-B',
  'Plataforma Nautilus-C', 'Base de Apoio Macaé', 'Terminal Santos', 'Terminal Itajaí'
];

export const cargos = [
  'Capitão', 'Imediato', 'Engenheiro Chefe', 'Oficial de Máquinas',
  'Oficial de Náutica', 'Marinheiro de Convés', 'Marinheiro de Máquinas',
  'Cozinheiro', 'Taifeiro', 'Técnico de Segurança', 'Analista de RH', 'Coordenador Financeiro'
];

export const etapasRecrutamento = [
  'triagem', 'entrevista_rh', 'entrevista_tecnica', 'teste_pratico',
  'proposta', 'contratado', 'recusado'
];
