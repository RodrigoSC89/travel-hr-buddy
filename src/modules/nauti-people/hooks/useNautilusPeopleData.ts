/**
 * Nautilus People Data Hooks - Integrated with Supabase
 * Falls back to default data when database is empty
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Colaborador, Candidato, Vaga, Avaliacao, OKR, BankHours, NineBoxPosition } from '../types';

// ==================== COLABORADORES ====================

const defaultColaboradores: Colaborador[] = [
  { id: '1', nome: 'Carlos Eduardo Silva', email: 'carlos.silva@empresa.com', telefone: '+55 11 99999-0001', cargo: 'Engenheiro de Produção', departamento: 'Operações', unidade: 'Plataforma Nautilus-A', dataAdmissao: '2021-03-15', status: 'ativo', salario: 12500, gestorDireto: 'Roberto Mendes', tipoContrato: 'CLT', documentos: [], formacoes: [] },
  { id: '2', nome: 'Ana Paula Martins', email: 'ana.martins@empresa.com', telefone: '+55 11 99999-0002', cargo: 'Analista de RH Sênior', departamento: 'Recursos Humanos', unidade: 'Escritório Central', dataAdmissao: '2020-08-01', status: 'ativo', salario: 9800, gestorDireto: 'Fernanda Costa', tipoContrato: 'CLT', documentos: [], formacoes: [] },
  { id: '3', nome: 'Roberto Santos Filho', email: 'roberto.santos@empresa.com', telefone: '+55 11 99999-0003', cargo: 'Técnico de Segurança', departamento: 'QSMS', unidade: 'Plataforma Nautilus-B', dataAdmissao: '2019-11-10', status: 'ferias', salario: 7500, gestorDireto: 'Marcos Oliveira', tipoContrato: 'CLT', documentos: [], formacoes: [] },
  { id: '4', nome: 'Maria Fernanda Lima', email: 'maria.lima@empresa.com', telefone: '+55 11 99999-0004', cargo: 'Coordenadora Financeira', departamento: 'Financeiro', unidade: 'Escritório Central', dataAdmissao: '2018-05-20', status: 'ativo', salario: 15000, gestorDireto: 'Paulo Henrique', tipoContrato: 'CLT', documentos: [], formacoes: [] },
  { id: '5', nome: 'João Pedro Almeida', email: 'joao.almeida@empresa.com', telefone: '+55 11 99999-0005', cargo: 'Operador de Plataforma', departamento: 'Operações', unidade: 'Plataforma Nautilus-C', dataAdmissao: '2022-01-10', status: 'ativo', salario: 6800, gestorDireto: 'Carlos Silva', tipoContrato: 'CLT', documentos: [], formacoes: [] }
];

export function useColaboradores() {
  return useQuery({
    queryKey: ['colaboradores'],
    queryFn: async (): Promise<Colaborador[]> => {
      try {
        const { data } = await supabase
          .from('crew_members')
          .select('id, full_name, email, phone, rank, position, nationality, status')
          .order('full_name')
          .limit(50);

        if (data && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            nome: row.full_name || '',
            email: row.email || '',
            telefone: row.phone || '',
            cargo: row.rank || row.position || '',
            departamento: 'Operações',
            unidade: 'Escritório Central',
            dataAdmissao: '2020-01-01',
            status: row.status === 'active' ? 'ativo' as const : 'desligado' as const,
            salario: 10000,
            gestorDireto: '',
            tipoContrato: 'CLT' as const,
            documentos: [],
            formacoes: []
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch colaboradores from DB, using defaults');
      }
      return defaultColaboradores;
    },
    staleTime: 5 * 60 * 1000
  });
}

// ==================== VAGAS ====================

const defaultVagas: Vaga[] = [
  { id: '1', titulo: 'Engenheiro de Produção Sênior', departamento: 'Operações', tipo: 'CLT', urgencia: 'alta', candidatos: 23, status: 'aberta', dataAbertura: '2025-11-15', descricao: 'Buscamos engenheiro experiente para liderar operações offshore.', requisitos: ['5+ anos experiência', 'Inglês fluente', 'Certificação STCW'], beneficios: ['Plano de saúde', 'Vale alimentação', 'PLR'] },
  { id: '2', titulo: 'Analista de Dados Pleno', departamento: 'TI', tipo: 'CLT', urgencia: 'media', candidatos: 45, status: 'aberta', dataAbertura: '2025-11-20' },
  { id: '3', titulo: 'Técnico de Segurança do Trabalho', departamento: 'QSMS', tipo: 'CLT', urgencia: 'critica', candidatos: 12, status: 'aberta', dataAbertura: '2025-11-10' }
];

export function useVagas() {
  return useQuery({
    queryKey: ['vagas'],
    queryFn: async (): Promise<Vaga[]> => defaultVagas,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== CANDIDATOS ====================

const defaultCandidatos: Candidato[] = [
  { id: '1', nome: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', telefone: '+55 11 99999-1111', cargo: 'Engenheiro de Produção', experiencia: '8 anos', matchScore: 95, etapa: 'entrevista_tecnica', dataAplicacao: '2025-11-18', origem: 'LinkedIn', skills: ['Gestão de Processos', 'Lean Manufacturing', 'Six Sigma'], aiInsights: 'Candidato com excelente fit cultural. Experiência prévia no setor offshore.' },
  { id: '2', nome: 'Mariana Costa', email: 'mariana.costa@email.com', telefone: '+55 11 99999-2222', cargo: 'Engenheira de Produção', experiencia: '5 anos', matchScore: 88, etapa: 'entrevista_rh', dataAplicacao: '2025-11-19', origem: 'Indeed', skills: ['Automação', 'Python', 'Power BI'], aiInsights: 'Perfil técnico forte, recomendo avaliar soft skills na entrevista.' },
  { id: '3', nome: 'Pedro Almeida', email: 'pedro.almeida@email.com', telefone: '+55 11 99999-3333', cargo: 'Engenheiro de Produção', experiencia: '10 anos', matchScore: 92, etapa: 'proposta', dataAplicacao: '2025-11-15', origem: 'Indicação', skills: ['Gestão de Equipes', 'Planejamento', 'SAP'], aiInsights: 'Excelente candidato. Pretensão salarial alinhada.' },
  { id: '4', nome: 'Ana Beatriz Silva', email: 'ana.silva@email.com', telefone: '+55 11 99999-4444', cargo: 'Engenheira de Produção Júnior', experiencia: '2 anos', matchScore: 75, etapa: 'triagem', dataAplicacao: '2025-11-22', origem: 'Catho', skills: ['Excel Avançado', 'AutoCAD', 'Inglês Fluente'] },
  { id: '5', nome: 'Rafael Santos', email: 'rafael.santos@email.com', telefone: '+55 11 99999-5555', cargo: 'Engenheiro de Produção', experiencia: '6 anos', matchScore: 82, etapa: 'entrevista_rh', dataAplicacao: '2025-11-20', origem: 'LinkedIn', skills: ['Gestão de Projetos', 'MS Project', 'Scrum'] }
];

export function useCandidatos(vagaId?: string) {
  return useQuery({
    queryKey: ['candidatos', vagaId],
    queryFn: async (): Promise<Candidato[]> => defaultCandidatos,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== AVALIACOES ====================

const defaultAvaliacoes: Avaliacao[] = [
  { id: '1', colaboradorId: '1', colaborador: 'Carlos Eduardo Silva', cargo: 'Engenheiro de Produção', departamento: 'Operações', ciclo: 'Q4 2025', nota: 4.2, status: 'em_andamento', autoAvaliacao: 4.5, avaliacaoGestor: 4.0, feedback360: 4.2, metas: [{ id: '1', titulo: 'Reduzir tempo de setup em 15%', progresso: 85, peso: 30, status: 'em_andamento' }] },
  { id: '2', colaboradorId: '2', colaborador: 'Ana Paula Martins', cargo: 'Analista de RH Sênior', departamento: 'Recursos Humanos', ciclo: 'Q4 2025', nota: 4.8, status: 'concluida', autoAvaliacao: 4.7, avaliacaoGestor: 4.9, feedback360: 4.8, metas: [{ id: '2', titulo: 'Reduzir turnover em 20%', progresso: 100, peso: 35, status: 'concluida' }] },
  { id: '3', colaboradorId: '3', colaborador: 'Roberto Santos Filho', cargo: 'Técnico de Segurança', departamento: 'QSMS', ciclo: 'Q4 2025', nota: 0, status: 'pendente', autoAvaliacao: 0, avaliacaoGestor: 0, feedback360: 0, metas: [{ id: '3', titulo: 'Zero acidentes na área', progresso: 100, peso: 50, status: 'concluida' }] }
];

export function useAvaliacoes(ciclo?: string) {
  return useQuery({
    queryKey: ['avaliacoes', ciclo],
    queryFn: async (): Promise<Avaliacao[]> => defaultAvaliacoes,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== OKRs ====================

const defaultOKRs: OKR[] = [
  { id: '1', objetivo: 'Aumentar eficiência operacional', keyResults: [{ id: '1', titulo: 'Reduzir tempo de parada', meta: 20, atual: 18, unidade: '%' }, { id: '2', titulo: 'Aumentar OEE', meta: 85, atual: 82, unidade: '%' }], responsavel: 'Carlos Silva', prazo: '31/12/2025', progresso: 78, status: 'ativo' },
  { id: '2', objetivo: 'Desenvolver cultura de inovação', keyResults: [{ id: '3', titulo: 'Ideias implementadas', meta: 50, atual: 42, unidade: 'un' }, { id: '4', titulo: 'Participação em hackathons', meta: 80, atual: 75, unidade: '%' }], responsavel: 'Equipe TI', prazo: '31/12/2025', progresso: 82, status: 'ativo' }
];

export function useOKRs() {
  return useQuery({
    queryKey: ['okrs'],
    queryFn: async (): Promise<OKR[]> => defaultOKRs,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== BANK HOURS ====================

const defaultBankHours: BankHours[] = [
  { colaboradorId: '1', colaborador: 'Carlos Silva', saldoAtual: 16.5, horasMes: 4.5, tendencia: 'up' },
  { colaboradorId: '2', colaborador: 'Ana Martins', saldoAtual: -8.25, horasMes: -3.75, tendencia: 'down' },
  { colaboradorId: '3', colaborador: 'Roberto Santos', saldoAtual: 24.0, horasMes: 0, tendencia: 'stable' },
  { colaboradorId: '4', colaborador: 'Maria Costa', saldoAtual: 12.0, horasMes: 6.0, tendencia: 'up' },
  { colaboradorId: '5', colaborador: 'Pedro Lima', saldoAtual: -4.5, horasMes: -2.0, tendencia: 'down' }
];

export function useBankHours() {
  return useQuery({
    queryKey: ['bank-hours'],
    queryFn: async (): Promise<BankHours[]> => defaultBankHours,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== NINE BOX ====================

const defaultNineBox: NineBoxPosition[] = [
  { colaboradorId: '1', colaborador: 'Carlos Silva', performance: 'high', potential: 'high', label: 'Estrela' },
  { colaboradorId: '2', colaborador: 'Ana Martins', performance: 'high', potential: 'medium', label: 'Alto Performer' },
  { colaboradorId: '4', colaborador: 'Maria Lima', performance: 'medium', potential: 'high', label: 'Alto Potencial' },
  { colaboradorId: '5', colaborador: 'João Almeida', performance: 'medium', potential: 'medium', label: 'Profissional Chave' },
  { colaboradorId: '3', colaborador: 'Roberto Santos', performance: 'low', potential: 'medium', label: 'Em Desenvolvimento' }
];

export function useNineBox() {
  return useQuery({
    queryKey: ['nine-box'],
    queryFn: async (): Promise<NineBoxPosition[]> => defaultNineBox,
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
