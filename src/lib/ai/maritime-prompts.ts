/**
 * Maritime AI Prompts System
 * Sistema unificado de prompts contextualizados para todas as IAs do Nautilus One
 * 
 * @module maritime-prompts
 */

// =====================================
// Tipos e Interfaces
// =====================================

export interface OperationalContext {
  // Contexto do usuário
  userId?: string;
  userName?: string;
  userRole?: string;
  userPermissions?: string[];
  
  // Contexto do módulo
  moduleId?: string;
  moduleName?: string;
  currentScreen?: string;
  
  // Contexto operacional
  vesselName?: string;
  vesselId?: string;
  vesselType?: string;
  portLocation?: string;
  operationalStatus?: string;
  
  // Contexto temporal
  timezone?: string;
  localTime?: string;
  
  // Ações recentes
  recentActions?: string[];
  
  // Estado do sistema
  systemState?: Record<string, unknown>;
  
  // Alertas ativos
  activeAlerts?: Array<{ type: string; message: string; severity: string }>;
}

export interface PromptEnhancementOptions {
  includeContext?: boolean;
  language?: 'pt-BR' | 'en';
  responseFormat?: 'text' | 'json' | 'markdown';
  maxResponseLength?: 'short' | 'medium' | 'long';
  technicalLevel?: 'basic' | 'intermediate' | 'expert';
}

// =====================================
// Prompts Base por Módulo
// =====================================

export const MODULE_PROMPTS: Record<string, string> = {
  // Core Maritime Operations
  default: `Você é o assistente de IA do Nautilus One, uma plataforma de gestão marítima offshore.
Seja preciso, técnico e focado em segurança operacional. Use terminologia marítima adequada.`,

  compliance: `Você é um especialista em Compliance Marítimo do Nautilus One.
Sua expertise inclui: ISO 37301, MLC 2006, STCW, ISM Code, SOLAS, MARPOL.
Forneça análises detalhadas de conformidade com recomendações acionáveis e prazos.`,

  maintenance: `Você é um especialista em Manutenção Marítima do Nautilus One.
Sua expertise inclui: manutenção preventiva/preditiva, CMMS, análise de falhas, gestão de sobressalentes.
Priorize segurança, minimize downtime e otimize custos operacionais.`,

  crew: `Você é um especialista em Gestão de Tripulação do Nautilus One.
Sua expertise inclui: escalas, certificações, compliance trabalhista, MLC 2006, bem-estar da tripulação.
Considere questões de fadiga, competências e requisitos legais em suas análises.`,

  safety: `Você é um especialista em Segurança Marítima do Nautilus One.
Sua expertise inclui: SMS/ISM, análise de riscos, investigação de incidentes, drills, PPE.
Priorize a segurança da vida humana no mar (SOLAS) em todas as recomendações.`,

  navigation: `Você é um especialista em Navegação do Nautilus One.
Sua expertise inclui: ECDIS, GNSS, previsão meteorológica, planejamento de rotas, AIS.
Forneça análises precisas considerando condições metocean e segurança da navegação.`,

  environment: `Você é um especialista em Gestão Ambiental Marítima do Nautilus One.
Sua expertise inclui: MARPOL, gestão de resíduos, emissões, eficiência energética, ESG.
Balanceie compliance ambiental com eficiência operacional.`,

  documents: `Você é um especialista em Gestão Documental Marítima do Nautilus One.
Sua expertise inclui: certificados de classe, ISM, ISPS, contratos de tripulação, manifests.
Extraia informações chave, identifique datas críticas e classifique documentos corretamente.`,

  training: `Você é um especialista em Treinamento Marítimo do Nautilus One.
Sua expertise inclui: STCW, competências, simuladores, e-learning, avaliação de performance.
Personalize conteúdo ao nível do tripulante e identifique gaps de competência.`,

  finance: `Você é um especialista em Finanças Marítimas do Nautilus One.
Sua expertise inclui: OPEX/CAPEX, bunker costs, port fees, payroll, orçamentos de embarcação.
Forneça análises financeiras precisas com insights para otimização de custos.`,

  drydock: `Você é um especialista em Docagem e Reparos do Nautilus One.
Sua expertise inclui: planejamento de docagem, orçamentos, especificações técnicas, estaleiros.
Estime custos, prazos e identifique potenciais riscos em projetos de docagem.`,

  tracking: `Você é um especialista em Rastreamento GNSS do Nautilus One.
Sua expertise inclui: GNSS/DGNSS, AIS, monitoramento de frota, análise de trajetórias.
Forneça predições precisas e identifique anomalias em padrões de navegação.`,

  command: `Você é o Copiloto de IA do Centro de Comando Nautilus.
Acesse dados em tempo real de todos os módulos para fornecer visão operacional completa.
Priorize alertas críticos, identifique tendências e sugira ações proativas.`,

  audit: `Você é um especialista em Auditorias Marítimas do Nautilus One.
Sua expertise inclui: PSC, vetting, ISM audits, ISPS, class surveys.
Analise achados, identifique não-conformidades recorrentes e sugira ações corretivas.`,

  voyager: `Você é um especialista em Planejamento de Viagem do Nautilus One.
Sua expertise inclui: voyage planning, bunker optimization, port operations, charter parties.
Otimize rotas considerando weather, custos e requisitos comerciais.`,
};

// =====================================
// Instruções de Resposta
// =====================================

const RESPONSE_INSTRUCTIONS = {
  'pt-BR': {
    json: `
FORMATO DE RESPOSTA:
- Responda SEMPRE em JSON válido
- Use aspas duplas para strings
- Não inclua texto fora do JSON`,

    markdown: `
FORMATO DE RESPOSTA:
- Use markdown para estruturar a resposta
- Use headers (##) para seções
- Use listas para itens
- Use **negrito** para termos importantes`,

    text: `
FORMATO DE RESPOSTA:
- Seja claro e direto
- Use parágrafos curtos
- Destaque informações críticas`,

    short: `Seja conciso. Máximo 2-3 parágrafos.`,
    medium: `Forneça uma resposta balanceada com 4-6 parágrafos.`,
    long: `Forneça uma análise detalhada e completa.`,

    basic: `Use linguagem simples, evite jargão técnico excessivo.`,
    intermediate: `Use terminologia técnica com explicações quando necessário.`,
    expert: `Use terminologia técnica avançada sem simplificações.`,
  },
  'en': {
    json: `
RESPONSE FORMAT:
- Always respond in valid JSON
- Use double quotes for strings
- Do not include text outside JSON`,

    markdown: `
RESPONSE FORMAT:
- Use markdown to structure response
- Use headers (##) for sections
- Use lists for items
- Use **bold** for important terms`,

    text: `
RESPONSE FORMAT:
- Be clear and direct
- Use short paragraphs
- Highlight critical information`,

    short: `Be concise. Maximum 2-3 paragraphs.`,
    medium: `Provide a balanced response with 4-6 paragraphs.`,
    long: `Provide a detailed and complete analysis.`,

    basic: `Use simple language, avoid excessive technical jargon.`,
    intermediate: `Use technical terminology with explanations when needed.`,
    expert: `Use advanced technical terminology without simplification.`,
  }
};

// =====================================
// Funções de Construção de Prompt
// =====================================

/**
 * Constrói contexto operacional para incluir no prompt
 */
function buildContextBlock(context: OperationalContext, language: 'pt-BR' | 'en'): string {
  const labels = language === 'pt-BR' ? {
    title: 'CONTEXTO OPERACIONAL',
    user: 'Usuário',
    role: 'Função',
    module: 'Módulo',
    screen: 'Tela',
    vessel: 'Embarcação',
    status: 'Status',
    location: 'Localização',
    time: 'Horário Local',
    recentActions: 'Ações Recentes',
    activeAlerts: 'Alertas Ativos',
  } : {
    title: 'OPERATIONAL CONTEXT',
    user: 'User',
    role: 'Role',
    module: 'Module',
    screen: 'Screen',
    vessel: 'Vessel',
    status: 'Status',
    location: 'Location',
    time: 'Local Time',
    recentActions: 'Recent Actions',
    activeAlerts: 'Active Alerts',
  };

  const parts: string[] = [`\n${labels.title}:`];

  if (context.userName) parts.push(`- ${labels.user}: ${context.userName}`);
  if (context.userRole) parts.push(`- ${labels.role}: ${context.userRole}`);
  if (context.moduleName) parts.push(`- ${labels.module}: ${context.moduleName}`);
  if (context.currentScreen) parts.push(`- ${labels.screen}: ${context.currentScreen}`);
  if (context.vesselName) parts.push(`- ${labels.vessel}: ${context.vesselName} (${context.vesselType || 'N/A'})`);
  if (context.operationalStatus) parts.push(`- ${labels.status}: ${context.operationalStatus}`);
  if (context.portLocation) parts.push(`- ${labels.location}: ${context.portLocation}`);
  if (context.localTime) parts.push(`- ${labels.time}: ${context.localTime}`);

  if (context.recentActions?.length) {
    parts.push(`- ${labels.recentActions}:`);
    context.recentActions.slice(0, 5).forEach(action => {
      parts.push(`  • ${action}`);
    });
  }

  if (context.activeAlerts?.length) {
    parts.push(`- ${labels.activeAlerts}:`);
    context.activeAlerts.slice(0, 3).forEach(alert => {
      parts.push(`  • [${alert.severity.toUpperCase()}] ${alert.message}`);
    });
  }

  return parts.join('\n');
}

/**
 * Constrói o system prompt completo
 */
export function buildSystemPrompt(
  moduleId: string = 'default',
  context?: OperationalContext,
  options: PromptEnhancementOptions = {}
): string {
  const {
    includeContext = true,
    language = 'pt-BR',
    responseFormat = 'text',
    maxResponseLength = 'medium',
    technicalLevel = 'intermediate',
  } = options;

  const parts: string[] = [];

  // 1. Prompt base do módulo
  const basePrompt = MODULE_PROMPTS[moduleId] || MODULE_PROMPTS.default;
  parts.push(basePrompt);

  // 2. Contexto operacional
  if (includeContext && context) {
    parts.push(buildContextBlock(context, language));
  }

  // 3. Instruções de resposta
  const instructions = RESPONSE_INSTRUCTIONS[language];
  parts.push(instructions[responseFormat]);
  parts.push(instructions[maxResponseLength]);
  parts.push(instructions[technicalLevel]);

  // 4. Diretrizes finais
  if (language === 'pt-BR') {
    parts.push(`
DIRETRIZES:
- Responda em português brasileiro
- Seja preciso e acionável
- Priorize segurança operacional
- Cite regulamentações quando relevante
- Indique níveis de urgência quando aplicável`);
  } else {
    parts.push(`
GUIDELINES:
- Respond in English
- Be precise and actionable
- Prioritize operational safety
- Cite regulations when relevant
- Indicate urgency levels when applicable`);
  }

  return parts.join('\n\n');
}

/**
 * Aprimora um prompt do usuário com contexto adicional
 */
export function enhanceUserPrompt(
  userPrompt: string,
  context?: OperationalContext,
  additionalContext?: string
): string {
  const parts: string[] = [userPrompt];

  if (additionalContext) {
    parts.push(`\nContexto adicional: ${additionalContext}`);
  }

  if (context?.systemState && Object.keys(context.systemState).length > 0) {
    parts.push(`\nDados do sistema: ${JSON.stringify(context.systemState)}`);
  }

  return parts.join('\n');
}

/**
 * Cria prompt para análise de documento
 */
export function buildDocumentAnalysisPrompt(
  documentType: string,
  extractedText: string,
  analysisGoal: 'classify' | 'extract' | 'summarize' | 'validate'
): string {
  const goals = {
    classify: `Classifique este documento marítimo e identifique:
1. Tipo de documento (certificado, contrato, relatório, etc.)
2. Categoria (safety, compliance, crew, navigation, etc.)
3. Entidade emissora
4. Data de validade (se aplicável)
5. Nível de criticidade`,

    extract: `Extraia as seguintes informações do documento:
1. Datas importantes (emissão, validade, vencimento)
2. Nomes e identificadores (embarcação, tripulantes, empresas)
3. Números de referência (certificados, contratos, IMO)
4. Requisitos e condições
5. Assinaturas e aprovações`,

    summarize: `Forneça um resumo executivo do documento incluindo:
1. Objetivo principal do documento
2. Partes envolvidas
3. Principais termos e condições
4. Ações requeridas
5. Datas críticas`,

    validate: `Valide o documento verificando:
1. Campos obrigatórios preenchidos
2. Datas dentro da validade
3. Conformidade com padrões (IMO, MLC, STCW)
4. Inconsistências ou erros
5. Documentos relacionados necessários`,
  };

  return `Tipo de documento informado: ${documentType}

${goals[analysisGoal]}

TEXTO DO DOCUMENTO:
${extractedText}

Responda em JSON estruturado.`;
}

/**
 * Cria prompt para análise de compliance
 */
export function buildComplianceAnalysisPrompt(
  framework: string,
  data: Record<string, unknown>
): string {
  return `Analise os dados de compliance para o framework ${framework}.

DADOS:
${JSON.stringify(data, null, 2)}

Forneça:
1. Score de conformidade (0-100)
2. Itens em conformidade
3. Não-conformidades identificadas
4. Recomendações prioritárias
5. Prazo sugerido para correções
6. Riscos de não-ação

Responda em JSON estruturado.`;
}

/**
 * Cria prompt para predição de manutenção
 */
export function buildMaintenancePredictionPrompt(
  equipmentType: string,
  historicalData: unknown[],
  currentReadings: Record<string, number>
): string {
  return `Analise os dados de manutenção para ${equipmentType}.

HISTÓRICO DE MANUTENÇÕES:
${JSON.stringify(historicalData, null, 2)}

LEITURAS ATUAIS:
${JSON.stringify(currentReadings, null, 2)}

Forneça:
1. Probabilidade de falha nos próximos 30/60/90 dias
2. Componentes com maior risco
3. Ações preventivas recomendadas
4. Estimativa de custos de manutenção preventiva vs corretiva
5. Impacto operacional se não realizada

Responda em JSON estruturado.`;
}

// =====================================
// Cache de Prompts
// =====================================

const promptCache = new Map<string, { prompt: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém prompt do cache ou constrói novo
 */
export function getCachedSystemPrompt(
  moduleId: string,
  context?: OperationalContext,
  options?: PromptEnhancementOptions
): string {
  // Contexto sem dados voláteis para cache key
  const stableContext = context ? {
    userRole: context.userRole,
    moduleName: context.moduleName,
    vesselType: context.vesselType,
  } : null;
  
  const cacheKey = JSON.stringify({ moduleId, stableContext, options });
  const cached = promptCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.prompt;
  }
  
  const prompt = buildSystemPrompt(moduleId, context, options);
  promptCache.set(cacheKey, { prompt, timestamp: Date.now() });
  
  return prompt;
}

/**
 * Limpa cache de prompts
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

// =====================================
// Exports
// =====================================

export {
  buildContextBlock,
  RESPONSE_INSTRUCTIONS,
};
