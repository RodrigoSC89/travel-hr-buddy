/**
 * Local LLM Fallback - PATCH 950
 * Offline-capable AI responses using cached patterns and rule-based logic
 */

import { logger } from '@/lib/logger';

// Domain-specific response templates
const DOMAIN_RESPONSES: Record<string, Record<string, string>> = {
  frota: {
    status: 'Com base nos dados em cache, a frota está operando normalmente. Para informações em tempo real, aguarde a conexão.',
    manutencao: 'Recomendo verificar o cronograma de manutenção preventiva. Em modo offline, consulte os dados salvos localmente.',
    combustivel: 'Monitore o consumo atual vs. a média histórica. Alertas de anomalia são gerados automaticamente.',
    eficiencia: 'A eficiência pode ser melhorada com rotas otimizadas e manutenção em dia. Consulte os relatórios salvos.',
  },
  tripulacao: {
    escala: 'A escala atual está disponível offline. Alterações serão sincronizadas quando houver conexão.',
    certificacoes: 'Verifique as certificações próximas ao vencimento no módulo de tripulação.',
    treinamento: 'Os módulos de treinamento offline estão disponíveis. Progresso será sincronizado depois.',
    descanso: 'O compliance com horas de descanso é monitorado automaticamente pelo sistema.',
  },
  manutencao: {
    preventiva: 'Manutenções preventivas agendadas estão listadas no calendário. Priorize por criticidade.',
    corretiva: 'Registre falhas imediatamente. O sistema criará ordem de serviço automaticamente.',
    estoque: 'Peças em estoque e níveis mínimos estão disponíveis offline.',
    historico: 'Histórico de manutenção está acessível para análise de padrões.',
  },
  seguranca: {
    checklist: 'Checklists de segurança devem ser completados antes de cada operação.',
    incidente: 'Registre incidentes imediatamente. Fotos e documentos podem ser anexados offline.',
    drill: 'Simulados de emergência devem ser realizados conforme cronograma IMO.',
    epi: 'Verifique disponibilidade e validade de EPIs no módulo de segurança.',
  },
  esg: {
    emissoes: 'Emissões são calculadas automaticamente com base no consumo de combustível.',
    residuos: 'Registre descarte de resíduos conforme MARPOL. Dados sincronizam quando online.',
    compliance: 'Status de compliance ambiental está disponível no dashboard ESG.',
    relatorio: 'Relatórios ESG podem ser gerados offline com dados em cache.',
  },
  documentos: {
    vencimento: 'Documentos próximos ao vencimento são destacados automaticamente.',
    upload: 'Documentos podem ser digitalizados offline. Upload ocorre quando conectar.',
    busca: 'Busca local disponível para documentos já baixados.',
    template: 'Templates de documentos estão disponíveis para preenchimento offline.',
  },
};

// Intent detection patterns
const INTENT_PATTERNS: Array<{ pattern: RegExp; domain: string; subIntent: string }> = [
  // Frota
  { pattern: /status.*frota|frota.*status|como.*frota/i, domain: 'frota', subIntent: 'status' },
  { pattern: /manuten[çc][ãa]o.*frota|frota.*manuten[çc][ãa]o/i, domain: 'frota', subIntent: 'manutencao' },
  { pattern: /combust[ií]vel|fuel|abastec/i, domain: 'frota', subIntent: 'combustivel' },
  { pattern: /efici[êe]ncia|otimiza[çc]/i, domain: 'frota', subIntent: 'eficiencia' },
  
  // Tripulação
  { pattern: /escala|jornada|turno/i, domain: 'tripulacao', subIntent: 'escala' },
  { pattern: /certifica[çc][ãa]o|certificado|habilitação/i, domain: 'tripulacao', subIntent: 'certificacoes' },
  { pattern: /treinamento|capacita[çc]/i, domain: 'tripulacao', subIntent: 'treinamento' },
  { pattern: /descanso|folga|hora.*trabalh/i, domain: 'tripulacao', subIntent: 'descanso' },
  
  // Manutenção
  { pattern: /preventiva|preven[çc][ãa]o/i, domain: 'manutencao', subIntent: 'preventiva' },
  { pattern: /corretiva|conserto|reparo|falha/i, domain: 'manutencao', subIntent: 'corretiva' },
  { pattern: /estoque|pe[çc]a|inventário/i, domain: 'manutencao', subIntent: 'estoque' },
  { pattern: /hist[óo]rico.*manuten/i, domain: 'manutencao', subIntent: 'historico' },
  
  // Segurança
  { pattern: /checklist|verifica[çc][ãa]o|inspe[çc][ãa]o/i, domain: 'seguranca', subIntent: 'checklist' },
  { pattern: /incidente|acidente|ocorr[êe]ncia/i, domain: 'seguranca', subIntent: 'incidente' },
  { pattern: /drill|simulado|emerg[êe]ncia/i, domain: 'seguranca', subIntent: 'drill' },
  { pattern: /epi|equipamento.*prote[çc]/i, domain: 'seguranca', subIntent: 'epi' },
  
  // ESG
  { pattern: /emiss[ãõ]o|carbono|co2/i, domain: 'esg', subIntent: 'emissoes' },
  { pattern: /res[ií]duo|descarte|lixo/i, domain: 'esg', subIntent: 'residuos' },
  { pattern: /compliance.*ambiental|ambiental.*compliance/i, domain: 'esg', subIntent: 'compliance' },
  { pattern: /relat[óo]rio.*esg|esg.*relat[óo]rio/i, domain: 'esg', subIntent: 'relatorio' },
  
  // Documentos
  { pattern: /documento.*venc|venc.*documento/i, domain: 'documentos', subIntent: 'vencimento' },
  { pattern: /upload|enviar.*doc|anexar/i, domain: 'documentos', subIntent: 'upload' },
  { pattern: /busca.*doc|procurar.*doc|encontrar.*doc/i, domain: 'documentos', subIntent: 'busca' },
  { pattern: /template|modelo.*doc/i, domain: 'documentos', subIntent: 'template' },
];

// Navigation intents (handled locally for instant response)
const NAVIGATION_INTENTS: Array<{ patterns: RegExp[]; route: string; label: string }> = [
  { patterns: [/ir.*dashboard|abrir.*dashboard|mostrar.*dashboard/i], route: '/dashboard', label: 'Dashboard' },
  { patterns: [/ir.*frota|abrir.*frota|mostrar.*embarca/i], route: '/fleet', label: 'Frota' },
  { patterns: [/ir.*tripula[çc]/i], route: '/crew', label: 'Tripulação' },
  { patterns: [/ir.*manuten[çc]/i], route: '/maintenance', label: 'Manutenção' },
  { patterns: [/ir.*document/i], route: '/documents', label: 'Documentos' },
  { patterns: [/ir.*relat[óo]rio/i], route: '/reports', label: 'Relatórios' },
  { patterns: [/ir.*esg|sustentabilidade/i], route: '/esg', label: 'ESG' },
  { patterns: [/ir.*configura[çc]/i], route: '/settings', label: 'Configurações' },
];

// Cached responses from previous API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

export interface LocalLLMResponse {
  text: string;
  confidence: number;
  source: 'cache' | 'pattern' | 'fallback';
  navigation?: { route: string; label: string };
  suggestions?: string[];
  offline: boolean;
}

/**
 * Generate local response without network
 */
export function generateLocalResponse(query: string): LocalLLMResponse {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check cache first
  const cacheKey = generateCacheKey(normalizedQuery);
  const cached = responseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug('[LocalLLM] Cache hit', { key: cacheKey });
    return {
      text: cached.response,
      confidence: 0.9,
      source: 'cache',
      offline: true,
    };
  }
  
  // Check for navigation intent
  for (const nav of NAVIGATION_INTENTS) {
    if (nav.patterns.some(p => p.test(query))) {
      return {
        text: `Navegando para ${nav.label}...`,
        confidence: 0.95,
        source: 'pattern',
        navigation: { route: nav.route, label: nav.label },
        offline: true,
      };
    }
  }
  
  // Check domain patterns
  for (const { pattern, domain, subIntent } of INTENT_PATTERNS) {
    if (pattern.test(query)) {
      const response = DOMAIN_RESPONSES[domain]?.[subIntent];
      
      if (response) {
        return {
          text: response,
          confidence: 0.75,
          source: 'pattern',
          suggestions: generateSuggestions(domain),
          offline: true,
        };
      }
    }
  }
  
  // Generic fallback
  return {
    text: getGenericFallback(normalizedQuery),
    confidence: 0.5,
    source: 'fallback',
    suggestions: [
      'Tente ser mais específico na sua pergunta',
      'Verifique o módulo correspondente diretamente',
      'Aguarde conexão para respostas mais detalhadas',
    ],
    offline: true,
  };
}

/**
 * Cache response from API for offline use
 */
export function cacheResponse(query: string, response: string): void {
  const key = generateCacheKey(query);
  responseCache.set(key, { response, timestamp: Date.now() });
  
  // Persist to localStorage
  try {
    const cacheData = Object.fromEntries(responseCache);
    localStorage.setItem('llm_response_cache', JSON.stringify(cacheData));
  } catch (error) {
    logger.warn('[LocalLLM] Failed to persist cache', { error });
  }
}

/**
 * Load cached responses from localStorage
 */
export function loadCachedResponses(): void {
  try {
    const stored = localStorage.getItem('llm_response_cache');
    if (stored) {
      const data = JSON.parse(stored);
      for (const [key, value] of Object.entries(data)) {
        responseCache.set(key, value as { response: string; timestamp: number });
      }
      logger.info('[LocalLLM] Loaded cached responses', { count: responseCache.size });
    }
  } catch (error) {
    logger.warn('[LocalLLM] Failed to load cache', { error });
  }
}

function generateCacheKey(query: string): string {
  // Normalize and create hash
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash = hash & hash;
  }
  return `llm-${Math.abs(hash).toString(16)}`;
}

function generateSuggestions(domain: string): string[] {
  const suggestions: Record<string, string[]> = {
    frota: ['Ver status de todas as embarcações', 'Verificar consumo de combustível', 'Agendar manutenção'],
    tripulacao: ['Ver escala atual', 'Verificar certificações', 'Acessar treinamentos'],
    manutencao: ['Ver ordens abertas', 'Consultar estoque', 'Agendar preventiva'],
    seguranca: ['Preencher checklist', 'Registrar incidente', 'Ver próximos drills'],
    esg: ['Ver emissões do mês', 'Registrar descarte', 'Gerar relatório'],
    documentos: ['Ver documentos a vencer', 'Buscar documento', 'Criar novo'],
  };
  
  return suggestions[domain] || [];
}

function getGenericFallback(query: string): string {
  if (query.includes('ajuda') || query.includes('help')) {
    return 'Posso ajudar com: gestão de frota, tripulação, manutenção, documentos, segurança e ESG. O que você precisa?';
  }
  
  if (query.includes('erro') || query.includes('problema')) {
    return 'Parece que você está enfrentando um problema. Verifique os logs do sistema ou tente novamente quando houver conexão.';
  }
  
  return 'Estou operando em modo offline com recursos limitados. Para respostas mais detalhadas, aguarde a conexão com o servidor.';
}

// Initialize on load
if (typeof window !== 'undefined') {
  loadCachedResponses();
}
