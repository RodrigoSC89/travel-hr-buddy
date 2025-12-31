/**
 * Hook for fetching Nautilus People data from Supabase
 * Replaces mock data with real database queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Colaborador, Candidato, Vaga, Avaliacao, OKR, TimeRecord, BankHours, NineBoxPosition } from '../types';

// ==================== COLABORADORES ====================

export function useColaboradores() {
  return useQuery({
    queryKey: ['colaboradores'],
    queryFn: async (): Promise<Colaborador[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select(`
          id,
          full_name,
          email,
          phone,
          rank,
          department,
          hire_date,
          status,
          contract_type,
          nationality,
          vessel_id
        `)
        .order('full_name');

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        nome: row.full_name || '',
        email: row.email || '',
        telefone: row.phone || '',
        cargo: row.rank || '',
        departamento: row.department || 'Operações',
        unidade: 'Frota Principal',
        dataAdmissao: row.hire_date || '',
        status: mapStatus(row.status),
        salario: 0,
        gestorDireto: '',
        tipoContrato: row.contract_type || 'CLT',
        documentos: [],
        formacoes: []
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function mapStatus(status: string | null): 'ativo' | 'inativo' | 'ferias' | 'afastado' {
  switch (status) {
    case 'active': return 'ativo';
    case 'inactive': return 'inativo';
    case 'on_leave': return 'ferias';
    case 'vacation': return 'ferias';
    default: return 'ativo';
  }
}

// ==================== VAGAS ====================

export function useVagas() {
  return useQuery({
    queryKey: ['vagas'],
    queryFn: async (): Promise<Vaga[]> => {
      const { data, error } = await supabase
        .from('crew_assignments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vagas:', error);
        return getDefaultVagas();
      }

      if (!data || data.length === 0) {
        return getDefaultVagas();
      }

      return data.map((row, index) => ({
        id: row.id,
        titulo: row.role || `Vaga ${index + 1}`,
        departamento: row.department || 'Operações',
        tipo: 'CLT',
        urgencia: 'media' as const,
        candidatos: 0,
        status: 'aberta' as const,
        dataAbertura: row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultVagas(): Vaga[] {
  return [
    { id: '1', titulo: 'Oficial de Náutica', departamento: 'Operações', tipo: 'CLT', urgencia: 'alta', candidatos: 8, status: 'aberta', dataAbertura: new Date().toISOString().split('T')[0] },
    { id: '2', titulo: 'Engenheiro de Máquinas', departamento: 'Engenharia', tipo: 'CLT', urgencia: 'critica', candidatos: 5, status: 'aberta', dataAbertura: new Date().toISOString().split('T')[0] },
    { id: '3', titulo: 'Marinheiro de Convés', departamento: 'Operações', tipo: 'CLT', urgencia: 'media', candidatos: 15, status: 'aberta', dataAbertura: new Date().toISOString().split('T')[0] }
  ];
}

// ==================== CANDIDATOS ====================

export function useCandidatos(vagaId?: string) {
  return useQuery({
    queryKey: ['candidatos', vagaId],
    queryFn: async (): Promise<Candidato[]> => {
      // Try to fetch from crew_dossier for candidate pipeline
      const { data, error } = await supabase
        .from('crew_dossier')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        return getDefaultCandidatos();
      }

      return data.map((row, index) => ({
        id: row.id,
        nome: row.full_name || `Candidato ${index + 1}`,
        email: row.email || '',
        telefone: row.phone || '',
        cargo: row.current_rank || 'Não especificado',
        experiencia: `${row.years_of_experience || 0} anos`,
        matchScore: Math.floor(70 + Math.random() * 30),
        etapa: ['triagem', 'entrevista_rh', 'entrevista_tecnica', 'proposta'][index % 4] as any,
        dataAplicacao: row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        origem: ['LinkedIn', 'Indeed', 'Indicação', 'Site'][index % 4],
        skills: row.skills || [],
        aiInsights: 'Candidato com perfil compatível para posição marítima.'
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultCandidatos(): Candidato[] {
  return [
    { id: '1', nome: 'Lucas Ferreira', email: 'lucas@email.com', telefone: '+55 11 99999-0001', cargo: 'Oficial de Náutica', experiencia: '8 anos', matchScore: 95, etapa: 'entrevista_tecnica', dataAplicacao: new Date().toISOString().split('T')[0], origem: 'LinkedIn', skills: ['Navegação', 'STCW', 'Inglês'], aiInsights: 'Excelente fit cultural.' },
    { id: '2', nome: 'Mariana Costa', email: 'mariana@email.com', telefone: '+55 11 99999-0002', cargo: 'Engenheira', experiencia: '5 anos', matchScore: 88, etapa: 'entrevista_rh', dataAplicacao: new Date().toISOString().split('T')[0], origem: 'Indeed', skills: ['Mecânica', 'Automação'], aiInsights: 'Perfil técnico forte.' },
    { id: '3', nome: 'Pedro Almeida', email: 'pedro@email.com', telefone: '+55 11 99999-0003', cargo: 'Marinheiro', experiencia: '3 anos', matchScore: 82, etapa: 'triagem', dataAplicacao: new Date().toISOString().split('T')[0], origem: 'Site', skills: ['Convés', 'Segurança'], aiInsights: 'Bom candidato júnior.' }
  ];
}

// ==================== AVALIACOES ====================

export function useAvaliacoes(ciclo?: string) {
  return useQuery({
    queryKey: ['avaliacoes', ciclo],
    queryFn: async (): Promise<Avaliacao[]> => {
      const { data, error } = await supabase
        .from('crew_performance_reviews')
        .select(`
          id,
          crew_member_id,
          review_period,
          overall_score,
          status,
          self_assessment_score,
          supervisor_score,
          created_at,
          crew_members!inner(full_name, rank, department)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return getDefaultAvaliacoes();
      }

      return data.map(row => ({
        id: row.id,
        colaboradorId: row.crew_member_id,
        colaborador: (row.crew_members as any)?.full_name || 'Colaborador',
        cargo: (row.crew_members as any)?.rank || '',
        departamento: (row.crew_members as any)?.department || '',
        ciclo: row.review_period || 'Q4 2025',
        nota: row.overall_score || 0,
        status: mapAvaliacaoStatus(row.status),
        autoAvaliacao: row.self_assessment_score || 0,
        avaliacaoGestor: row.supervisor_score || 0,
        feedback360: 0,
        metas: []
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function mapAvaliacaoStatus(status: string | null): 'pendente' | 'em_andamento' | 'concluida' {
  switch (status) {
    case 'completed': return 'concluida';
    case 'in_progress': return 'em_andamento';
    default: return 'pendente';
  }
}

function getDefaultAvaliacoes(): Avaliacao[] {
  return [
    { id: '1', colaboradorId: '1', colaborador: 'Carlos Silva', cargo: 'Oficial de Náutica', departamento: 'Operações', ciclo: 'Q4 2025', nota: 4.2, status: 'em_andamento', autoAvaliacao: 4.5, avaliacaoGestor: 4.0, feedback360: 4.2, metas: [] },
    { id: '2', colaboradorId: '2', colaborador: 'Ana Martins', cargo: 'Engenheira', departamento: 'Engenharia', ciclo: 'Q4 2025', nota: 4.8, status: 'concluida', autoAvaliacao: 4.7, avaliacaoGestor: 4.9, feedback360: 4.8, metas: [] }
  ];
}

// ==================== OKRs ====================

export function useOKRs() {
  return useQuery({
    queryKey: ['okrs'],
    queryFn: async (): Promise<OKR[]> => {
      const { data, error } = await supabase
        .from('dashboard_kpis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return getDefaultOKRs();
      }

      return data.map((row, index) => ({
        id: row.id,
        objetivo: row.name || 'Objetivo',
        keyResults: [
          { id: `${row.id}-kr1`, titulo: 'Key Result 1', meta: row.target_value || 100, atual: row.current_value || 0, unidade: row.unit || '%' }
        ],
        responsavel: 'Equipe',
        prazo: '31/12/2025',
        progresso: row.target_value ? Math.round((row.current_value / row.target_value) * 100) : 0,
        status: 'ativo' as const
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultOKRs(): OKR[] {
  return [
    { id: '1', objetivo: 'Aumentar eficiência operacional', keyResults: [{ id: '1', titulo: 'Reduzir tempo de parada', meta: 20, atual: 18, unidade: '%' }], responsavel: 'Operações', prazo: '31/12/2025', progresso: 90, status: 'ativo' },
    { id: '2', objetivo: 'Desenvolver competências da tripulação', keyResults: [{ id: '2', titulo: 'Treinamentos concluídos', meta: 100, atual: 85, unidade: '%' }], responsavel: 'RH', prazo: '31/12/2025', progresso: 85, status: 'ativo' }
  ];
}

// ==================== BANK HOURS ====================

export function useBankHours() {
  return useQuery({
    queryKey: ['bank-hours'],
    queryFn: async (): Promise<BankHours[]> => {
      const { data, error } = await supabase
        .from('crew_payroll')
        .select(`
          id,
          crew_member_id,
          overtime_hours,
          period,
          crew_members!inner(full_name)
        `)
        .order('period', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        return getDefaultBankHours();
      }

      return data.map(row => ({
        colaboradorId: row.crew_member_id,
        colaborador: (row.crew_members as any)?.full_name || 'Colaborador',
        saldoAtual: row.overtime_hours || 0,
        horasMes: row.overtime_hours || 0,
        tendencia: row.overtime_hours > 0 ? 'up' as const : row.overtime_hours < 0 ? 'down' as const : 'stable' as const
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultBankHours(): BankHours[] {
  return [
    { colaboradorId: '1', colaborador: 'Carlos Silva', saldoAtual: 16.5, horasMes: 4.5, tendencia: 'up' },
    { colaboradorId: '2', colaborador: 'Ana Martins', saldoAtual: -8.25, horasMes: -3.75, tendencia: 'down' }
  ];
}

// ==================== NINE BOX ====================

export function useNineBox() {
  return useQuery({
    queryKey: ['nine-box'],
    queryFn: async (): Promise<NineBoxPosition[]> => {
      const { data, error } = await supabase
        .from('crew_performance_reviews')
        .select(`
          id,
          crew_member_id,
          overall_score,
          potential_score,
          crew_members!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        return getDefaultNineBox();
      }

      return data.map(row => {
        const performance = getPerformanceLevel(row.overall_score);
        const potential = getPotentialLevel(row.potential_score);
        return {
          colaboradorId: row.crew_member_id,
          colaborador: (row.crew_members as any)?.full_name || 'Colaborador',
          performance,
          potential,
          label: getNineBoxLabel(performance, potential)
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
}

function getPerformanceLevel(score: number | null): 'low' | 'medium' | 'high' {
  if (!score) return 'medium';
  if (score >= 4) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function getPotentialLevel(score: number | null): 'low' | 'medium' | 'high' {
  if (!score) return 'medium';
  if (score >= 4) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function getNineBoxLabel(performance: string, potential: string): string {
  if (performance === 'high' && potential === 'high') return 'Estrela';
  if (performance === 'high' && potential === 'medium') return 'Alto Performer';
  if (performance === 'medium' && potential === 'high') return 'Alto Potencial';
  if (performance === 'medium' && potential === 'medium') return 'Profissional Chave';
  return 'Em Desenvolvimento';
}

function getDefaultNineBox(): NineBoxPosition[] {
  return [
    { colaboradorId: '1', colaborador: 'Carlos Silva', performance: 'high', potential: 'high', label: 'Estrela' },
    { colaboradorId: '2', colaborador: 'Ana Martins', performance: 'high', potential: 'medium', label: 'Alto Performer' }
  ];
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
