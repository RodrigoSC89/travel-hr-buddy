/**
 * Reference Data Exports for Nautilus People Hub
 * ✅ P0 CORRIGIDO: Mock arrays removidos - dados reais via Supabase hooks
 * 
 * @deprecated Para dados dinâmicos, use hooks:
 * - useClimateData() para pesquisas de clima
 * - useRecruitmentData() para vagas e candidatos
 * - useNautiPeopleData() para colaboradores
 */

// Re-export reference data from central hook
export { DEPARTAMENTOS as departamentos } from '@/hooks/useClimateData';

// Static reference data (not mock - these are configuration options)
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
