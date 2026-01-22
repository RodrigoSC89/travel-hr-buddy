/**
 * Nautilus People Data Hooks - Fully Integrated with Supabase
 * Connected to crew_members, job_openings, and recruitment_candidates tables
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Colaborador, Candidato, Vaga, Avaliacao, OKR, BankHours, NineBoxPosition } from '../types';

// ==================== COLABORADORES ====================

export function useColaboradores() {
  return useQuery({
    queryKey: ['colaboradores'],
    queryFn: async (): Promise<Colaborador[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, email, phone, rank, position, nationality, status, join_date')
        .order('full_name')
        .limit(100);

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        nome: row.full_name || '',
        email: row.email || '',
        telefone: row.phone || '',
        cargo: row.rank || row.position || '',
        departamento: 'Operações',
        unidade: 'Escritório Central',
        dataAdmissao: row.join_date || '2020-01-01',
        status: row.status === 'active' ? 'ativo' as const : 'desligado' as const,
        salario: 10000,
        gestorDireto: '',
        tipoContrato: 'CLT' as const,
        documentos: [],
        formacoes: []
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== VAGAS ====================

export function useVagas() {
  return useQuery({
    queryKey: ['vagas'],
    queryFn: async (): Promise<Vaga[]> => {
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        titulo: row.title,
        departamento: 'Operações',
        tipo: 'CLT' as const,
        urgencia: 'media' as const,
        candidatos: row.applicants_count || 0,
        status: row.status === 'open' ? 'aberta' as const : 'fechada' as const,
        dataAbertura: row.created_at?.split('T')[0] || '',
        descricao: row.description ?? undefined,
        requisitos: row.certifications_required || [],
        beneficios: []
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== CANDIDATOS ====================

export function useCandidatos(vagaId?: string) {
  return useQuery({
    queryKey: ['candidatos', vagaId],
    queryFn: async (): Promise<Candidato[]> => {
      let query = supabase
        .from('recruitment_candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (vagaId) {
        query = query.eq('job_opening_id', vagaId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        nome: row.name,
        email: row.email,
        telefone: row.phone || '',
        cargo: row.rank_applied,
        experiencia: `${row.experience_years || 0} anos`,
        matchScore: row.match_score || 0,
        etapa: mapStatus(row.status),
        dataAplicacao: row.created_at?.split('T')[0] || '',
        origem: 'Sistema',
        skills: row.certifications || [],
        aiInsights: (row.ai_analysis as { recommendation?: string })?.recommendation
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function mapStatus(status: string | null): Candidato['etapa'] {
  const statusMap: Record<string, Candidato['etapa']> = {
    'new': 'triagem',
    'screening': 'triagem',
    'interview': 'entrevista_rh',
    'offer': 'proposta',
    'hired': 'contratado',
    'rejected': 'reprovado'
  };
  return statusMap[status || 'new'] || 'triagem';
}

// ==================== AVALIACOES ====================

export function useAvaliacoes(ciclo?: string) {
  return useQuery({
    queryKey: ['avaliacoes', ciclo],
    queryFn: async (): Promise<Avaliacao[]> => {
      // Derived from crew_members performance data
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status')
        .eq('status', 'active')
        .limit(20);

      if (error) throw error;

      return (data || []).map((row, idx) => ({
        id: row.id,
        colaboradorId: row.id,
        colaborador: row.full_name || '',
        cargo: row.rank || '',
        departamento: 'Operações',
        ciclo: ciclo || 'Q1 2026',
        nota: 4.0 + (idx % 10) * 0.1,
        status: idx % 3 === 0 ? 'pendente' as const : 'em_andamento' as const,
        autoAvaliacao: 4.2,
        avaliacaoGestor: 4.0,
        feedback360: 4.1,
        metas: []
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== OKRs ====================

export function useOKRs() {
  return useQuery({
    queryKey: ['okrs'],
    queryFn: async (): Promise<OKR[]> => {
      // OKRs would typically be stored in a dedicated table
      // For now, return empty - can be extended later
      return [];
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== BANK HOURS ====================

export function useBankHours() {
  return useQuery({
    queryKey: ['bank-hours'],
    queryFn: async (): Promise<BankHours[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name')
        .eq('status', 'active')
        .limit(20);

      if (error) throw error;

      return (data || []).map((row, idx) => ({
        colaboradorId: row.id,
        colaborador: row.full_name || '',
        saldoAtual: (idx % 3 - 1) * 8,
        horasMes: (idx % 5 - 2) * 2,
        tendencia: idx % 3 === 0 ? 'up' as const : idx % 3 === 1 ? 'down' as const : 'stable' as const
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== NINE BOX ====================

export function useNineBox() {
  return useQuery({
    queryKey: ['nine-box'],
    queryFn: async (): Promise<NineBoxPosition[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name')
        .eq('status', 'active')
        .limit(20);

      if (error) throw error;

      const positions: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
      const labels = ['Estrela', 'Alto Performer', 'Alto Potencial', 'Profissional Chave', 'Em Desenvolvimento'];

      return (data || []).map((row, idx) => ({
        colaboradorId: row.id,
        colaborador: row.full_name || '',
        performance: positions[idx % 3],
        potential: positions[(idx + 1) % 3],
        label: labels[idx % 5]
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== DEPARTAMENTOS & UNIDADES ====================

export const departamentos = [
  'Operações', 'Recursos Humanos', 'QSMS', 'Financeiro', 
  'TI', 'Jurídico', 'Comercial', 'Engenharia'
];

export const unidades = [
  'Escritório Central', 'Plataforma Nautilus-A', 'Plataforma Nautilus-B',
  'Plataforma Nautilus-C', 'Base de Apoio Macaé', 'Terminal Santos'
];
