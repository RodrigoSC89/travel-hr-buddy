/**
 * Types for Nautilus People Hub
 */

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  cargo: string;
  departamento: string;
  unidade: string;
  dataAdmissao: string;
  status: "ativo" | "ferias" | "licenca" | "afastado" | "desligado";
  avatar?: string;
  salario?: number;
  gestorDireto?: string;
  tipoContrato: "CLT" | "PJ" | "Estágio" | "Temporário";
  documentos?: Documento[];
  formacoes?: Formacao[];
}

export interface Documento {
  id: string;
  tipo: string;
  nome: string;
  url: string;
  dataUpload: string;
  validade?: string;
  status: "valido" | "vencido" | "pendente";
}

export interface Formacao {
  id: string;
  instituicao: string;
  curso: string;
  nivel: "tecnico" | "graduacao" | "pos" | "mestrado" | "doutorado" | "certificacao";
  dataInicio: string;
  dataConclusao?: string;
  status: "cursando" | "concluido" | "trancado";
}

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  experiencia: string;
  matchScore: number;
  etapa: "triagem" | "entrevista_rh" | "entrevista_tecnica" | "proposta" | "contratado" | "reprovado";
  dataAplicacao: string;
  origem: string;
  skills: string[];
  curriculo?: string;
  aiInsights?: string;
  notas?: NotaCandidato[];
}

export interface NotaCandidato {
  id: string;
  autor: string;
  texto: string;
  data: string;
  etapa: string;
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
  requisitos?: string[];
  beneficios?: string[];
  faixaSalarial?: { min: number; max: number };
}

export interface Avaliacao {
  id: string;
  colaboradorId: string;
  colaborador: string;
  cargo: string;
  departamento: string;
  ciclo: string;
  nota: number;
  status: "pendente" | "em_andamento" | "concluida";
  autoAvaliacao: number;
  avaliacaoGestor: number;
  feedback360: number;
  metas: Meta[];
  feedbacks?: FeedbackItem[];
}

export interface Meta {
  id: string;
  titulo: string;
  descricao?: string;
  progresso: number;
  peso: number;
  prazo?: string;
  status: "pendente" | "em_andamento" | "concluida" | "cancelada";
}

export interface OKR {
  id: string;
  objetivo: string;
  keyResults: KeyResult[];
  responsavel: string;
  prazo: string;
  progresso: number;
  status: "ativo" | "concluido" | "cancelado";
}

export interface KeyResult {
  id: string;
  titulo: string;
  meta: number;
  atual: number;
  unidade: string;
}

export interface FeedbackItem {
  id: string;
  de: string;
  para: string;
  texto: string;
  tipo: "reconhecimento" | "construtivo" | "melhoria";
  data: string;
  anonimo: boolean;
}

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

export interface MoodEntry {
  id: string;
  userId: string;
  mood: "great" | "good" | "neutral" | "bad" | "terrible";
  comentario?: string;
  data: string;
}

export interface TimeRecord {
  id: string;
  colaboradorId: string;
  colaborador: string;
  data: string;
  entrada: string;
  saidaAlmoco: string;
  retornoAlmoco: string;
  saida: string;
  horasTrabalhadas: string;
  extras: string;
  status: "normal" | "atraso" | "falta" | "ferias" | "folga";
}

export interface BankHours {
  colaboradorId: string;
  colaborador: string;
  saldoAtual: number;
  horasMes: number;
  tendencia: "up" | "down" | "stable";
}

export interface Escala {
  id: string;
  nome: string;
  turno: "diurno" | "vespertino" | "noturno";
  horaInicio: string;
  horaFim: string;
  colaboradores: string[];
}

export interface NineBoxPosition {
  colaboradorId: string;
  colaborador: string;
  performance: "low" | "medium" | "high";
  potential: "low" | "medium" | "high";
  label: string;
}

export interface AIInsight {
  id: string;
  tipo: "alerta" | "oportunidade" | "tendencia" | "recomendacao";
  titulo: string;
  descricao: string;
  acao?: string;
  prioridade: "baixa" | "media" | "alta" | "critica";
  data: string;
  lida: boolean;
}

export interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  acaoUrl?: string;
}
