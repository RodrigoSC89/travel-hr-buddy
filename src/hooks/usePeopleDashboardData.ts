/**
 * Hook para dados do PeopleDashboard (Nauti People)
 * Substitui dados hardcoded por queries reais
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PeopleKPIs {
  totalColaboradores: number;
  novasContratacoes: number;
  desligamentos: number;
  turnover: number;
  climaScore: number;
  engajamento: number;
  metasConcluidas: number;
  treinamentosAtivos: number;
  vagasAbertas: number;
  candidatosPipeline: number;
}

export interface PeopleAlert {
  tipo: 'warning' | 'info' | 'danger' | 'success';
  texto: string;
  prioridade: 'alta' | 'media' | 'critica' | 'baixa';
}

// Hook para KPIs de pessoas
export function usePeopleKPIs() {
  return useQuery({
    queryKey: ["people-kpis"],
    queryFn: async (): Promise<PeopleKPIs> => {
      // Buscar contagem de tripulantes ativos
      const { count: totalCrew } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Buscar contratações recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newHires } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo);

      // Buscar treinamentos ativos
      const { count: activeTrainings } = await supabase
        .from("training_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

      // Buscar vagas abertas (se existir tabela)
      const { count: openPositions } = await supabase
        .from("crew_contracts")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      return {
        totalColaboradores: totalCrew || 0,
        novasContratacoes: newHires || 0,
        desligamentos: 0, // Calculado de histórico
        turnover: 0, // Calculado de métricas
        climaScore: 0, // Precisa de pesquisa de clima
        engajamento: 0, // Precisa de métricas
        metasConcluidas: 0, // Precisa de sistema de metas
        treinamentosAtivos: activeTrainings || 0,
        vagasAbertas: openPositions || 0,
        candidatosPipeline: 0 // Precisa de ATS
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para alertas de RH
export function usePeopleAlerts() {
  return useQuery({
    queryKey: ["people-alerts"],
    queryFn: async (): Promise<PeopleAlert[]> => {
      const alerts: PeopleAlert[] = [];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Certificados expirando
      const { count: expiringCerts } = await supabase
        .from("crew_documents")
        .select("*", { count: "exact", head: true })
        .lte("expiry_date", thirtyDaysFromNow.toISOString())
        .gte("expiry_date", now.toISOString());

      if (expiringCerts && expiringCerts > 0) {
        alerts.push({
          tipo: 'warning',
          texto: `${expiringCerts} certificados vencem em 30 dias`,
          prioridade: 'alta'
        });
      }

      // Treinamentos pendentes
      const { count: pendingTrainings } = await supabase
        .from("training_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (pendingTrainings && pendingTrainings > 0) {
        alerts.push({
          tipo: 'info',
          texto: `${pendingTrainings} treinamentos pendentes de conclusão`,
          prioridade: 'media'
        });
      }

      // Contratos expirando
      const { count: expiringContracts } = await supabase
        .from("crew_contracts")
        .select("*", { count: "exact", head: true })
        .lte("end_date", thirtyDaysFromNow.toISOString())
        .gte("end_date", now.toISOString())
        .eq("status", "active");

      if (expiringContracts && expiringContracts > 0) {
        alerts.push({
          tipo: 'danger',
          texto: `${expiringContracts} contratos expiram em 30 dias`,
          prioridade: 'critica'
        });
      }

      return alerts;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para aniversariantes
export function useBirthdays() {
  return useQuery({
    queryKey: ["people-birthdays"],
    queryFn: async () => {
      // crew_members não possui date_of_birth; buscar de profiles se disponível
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, position, join_date")
        .eq("status", "active")
        .not("join_date", "is", null)
        .limit(20);

      if (error || !data) return [];

      // Sem date_of_birth, exibimos aniversários de embarque (join_date)
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();

      return data
        .filter((crew) => {
          if (!crew.join_date) return false;
          const joinDate = new Date(crew.join_date);
          return joinDate.getMonth() === currentMonth && joinDate.getDate() >= currentDay;
        })
        .slice(0, 5)
        .map((crew) => {
          const joinDate = new Date(crew.join_date!);
          const isToday = joinDate.getDate() === currentDay;
          const isTomorrow = joinDate.getDate() === currentDay + 1;

          return {
            nome: crew.full_name,
            data: isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : `${joinDate.getDate()}/${joinDate.getMonth() + 1}`,
            departamento: crew.position || 'Operações'
          };
        });
    },
    staleTime: 1000 * 60 * 30,
  });
}
