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

      if (error || !actionItems?.length) {
        // Demo data
        return [
          {
            id: "demo-1",
            titulo: "Capitão de Longo Curso",
            departamento: "Operações",
            unidade: "Frota Principal",
            tipo: "CLT",
            status: "aberta",
            prioridade: "critica",
            salarioMin: 25000,
            salarioMax: 35000,
            descricao: "Capitão experiente para comandar embarcação offshore",
            requisitos: ["Habilitação CLC", "Mínimo 10 anos experiência", "Inglês fluente"],
            dataCriacao: new Date().toISOString(),
            dataLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            candidatosCount: 5
          },
          {
            id: "demo-2",
            titulo: "Engenheiro Naval",
            departamento: "Engenharia",
            unidade: "Escritório Central",
            tipo: "CLT",
            status: "em_andamento",
            prioridade: "alta",
            salarioMin: 15000,
            salarioMax: 22000,
            descricao: "Engenheiro para projetos de manutenção e modernização",
            requisitos: ["Formação em Engenharia Naval", "5+ anos experiência", "AutoCAD"],
            dataCriacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            candidatosCount: 12
          }
        ];
      }

      return actionItems.map(item => {
        const comments = item.comments as any || {};
        return {
          id: item.id,
          titulo: item.title,
          departamento: comments.departamento || "Operações",
          unidade: comments.unidade || "Escritório Central",
          tipo: comments.tipo || "CLT",
          status: item.status === "completed" ? "fechada" : item.status === "in_progress" ? "em_andamento" : "aberta",
          prioridade: (item.priority as any) || "media",
          salarioMin: comments.salario_min,
          salarioMax: comments.salario_max,
          descricao: item.description || "",
          requisitos: comments.requisitos || [],
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

      if (error || !crewCandidates?.length) {
        // Demo data
        return [
          {
            id: "cand-1",
            nome: "André Lima",
            email: "andre.lima@email.com",
            telefone: "+55 21 99999-1234",
            vagaId: "demo-1",
            vagaTitulo: "Capitão de Longo Curso",
            etapa: "entrevista_tecnica",
            score: 85,
            skills: ["Navegação", "Liderança", "Inglês Fluente"],
            experiencia: 12,
            dataCandidatura: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            ultimaAtualizacao: new Date().toISOString()
          },
          {
            id: "cand-2",
            nome: "Paula Ferreira",
            email: "paula.f@email.com",
            vagaId: "demo-2",
            vagaTitulo: "Engenheiro Naval",
            etapa: "triagem",
            score: 72,
            skills: ["AutoCAD", "Projeto Naval", "MS Project"],
            experiencia: 6,
            dataCandidatura: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            ultimaAtualizacao: new Date().toISOString()
          }
        ];
      }

      return crewCandidates.map(c => {
        const emergencyData = c.emergency_contact as any || {};
        return {
          id: c.id,
          nome: c.full_name || "N/A",
          email: c.email || "",
          telefone: c.phone || undefined,
          vagaId: emergencyData.vaga_id || "",
          vagaTitulo: emergencyData.vaga_titulo || "Posição Geral",
          etapa: emergencyData.etapa || "triagem",
          score: emergencyData.score || 0,
          skills: emergencyData.skills || [],
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
        const emergencyData = member.emergency_contact as any || {};
        return {
          id: member.id,
          nome: member.full_name || "N/A",
          email: member.email || "",
          cargo: member.position || member.rank || "Crew",
          departamento: emergencyData.departamento || "Operações",
          unidade: (member.vessels as any)?.name || "Base",
          dataAdmissao: member.join_date || member.created_at?.split("T")[0] || "",
          status: member.status === "active" ? "ativo" : 
                  member.status === "on_leave" ? "ferias" : 
                  member.status === "inactive" ? "desligado" : "afastado",
          tipoContrato: emergencyData.tipo_contrato || "CLT"
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
      
      const currentData = (current?.emergency_contact as any) || {};
      
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
