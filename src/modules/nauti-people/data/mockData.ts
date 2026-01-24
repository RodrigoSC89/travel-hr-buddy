/**
 * Data Exports for Nautilus People Hub
 * MIGRATED: Now exports empty arrays - real data comes from Supabase hooks
 * 
 * @deprecated Use hooks instead:
 * - useColaboradores() for employees
 * - useVagas() for job openings  
 * - useCandidatos() for candidates
 * - useAvaliacoes() for evaluations
 */

import type { 
  Colaborador, 
  Candidato, 
  Vaga, 
  Avaliacao, 
  OKR, 
  TimeRecord, 
  BankHours,
  AIInsight,
  Notification,
  NineBoxPosition
} from '../types';

// Empty arrays - components should use hooks for real Supabase data
export const mockColaboradores: Colaborador[] = [];
export const mockVagas: Vaga[] = [];
export const mockCandidatos: Candidato[] = [];
export const mockAvaliacoes: Avaliacao[] = [];
export const mockOKRs: OKR[] = [];
export const mockTimeRecords: TimeRecord[] = [];
export const mockBankHours: BankHours[] = [];
export const mockNineBox: NineBoxPosition[] = [];
export const mockAIInsights: AIInsight[] = [];
export const mockNotifications: Notification[] = [];

// Reference data - kept as these are static options
export const departamentos = [
  'Operações',
  'Recursos Humanos',
  'QSMS',
  'Financeiro',
  'TI',
  'Jurídico',
  'Comercial',
  'Engenharia',
  'Manutenção',
  'Navegação'
];

export const unidades = [
  'Escritório Central',
  'Plataforma Nautilus-A',
  'Plataforma Nautilus-B',
  'Plataforma Nautilus-C',
  'Base de Apoio Macaé',
  'Terminal Santos',
  'Terminal Itajaí'
];

export const cargos = [
  'Capitão',
  'Imediato',
  'Engenheiro Chefe',
  'Oficial de Máquinas',
  'Oficial de Náutica',
  'Marinheiro de Convés',
  'Marinheiro de Máquinas',
  'Cozinheiro',
  'Taifeiro',
  'Técnico de Segurança',
  'Analista de RH',
  'Coordenador Financeiro'
];

export const tiposContrato = ['CLT', 'PJ', 'Temporário', 'Estágio'];

export const statusColaborador = ['ativo', 'ferias', 'afastado', 'desligado'];

export const etapasRecrutamento = [
  'triagem',
  'entrevista_rh',
  'entrevista_tecnica',
  'teste_pratico',
  'proposta',
  'contratado',
  'recusado'
];

export const prioridadesVaga = ['critica', 'alta', 'media', 'baixa'];
