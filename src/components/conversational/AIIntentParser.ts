/**
 * AI Intent Parser
 * Parses natural language commands into actionable intents
 */

import type { ParsedIntent, IntentType, IntentEntity } from './types';

// Module keywords mapping
const moduleKeywords: Record<string, string[]> = {
  '/dashboard': ['dashboard', 'painel', 'início', 'home', 'visão geral'],
  '/fleet': ['frota', 'embarcações', 'navios', 'vessels', 'fleet'],
  '/crew': ['tripulação', 'tripulantes', 'crew', 'marinheiros', 'equipe'],
  '/documents': ['documentos', 'docs', 'arquivos', 'certificados', 'documents'],
  '/maintenance': ['manutenção', 'maintenance', 'reparos', 'inspeção'],
  '/compliance': ['compliance', 'conformidade', 'regulamentação', 'normas'],
  '/reports': ['relatórios', 'reports', 'análises', 'estatísticas'],
  '/alerts': ['alertas', 'notificações', 'avisos', 'alerts'],
  '/nautilus-command': ['comando', 'command', 'cockpit', 'central', 'controle'],
};

// Action keywords
const actionKeywords: Record<string, string[]> = {
  create: ['criar', 'novo', 'adicionar', 'cadastrar', 'create', 'add', 'new'],
  view: ['ver', 'mostrar', 'exibir', 'visualizar', 'show', 'view', 'display'],
  edit: ['editar', 'alterar', 'modificar', 'atualizar', 'edit', 'update', 'change'],
  delete: ['excluir', 'deletar', 'remover', 'apagar', 'delete', 'remove'],
  search: ['buscar', 'pesquisar', 'encontrar', 'procurar', 'search', 'find'],
  report: ['relatório', 'report', 'gerar', 'exportar', 'generate'],
  analyze: ['analisar', 'análise', 'analyze', 'avaliar', 'verificar'],
};

// Status keywords
const statusKeywords: Record<string, string[]> = {
  active: ['ativo', 'ativos', 'active', 'operacional', 'funcionando'],
  inactive: ['inativo', 'inativos', 'inactive', 'parado', 'desativado'],
  maintenance: ['manutenção', 'maintenance', 'reparo', 'conserto'],
  critical: ['crítico', 'critical', 'urgente', 'emergência'],
  warning: ['alerta', 'warning', 'atenção', 'cuidado'],
};

export function parseIntent(query: string): ParsedIntent {
  const normalizedQuery = query.toLowerCase().trim();
  const entities: IntentEntity[] = [];
  let intentType: IntentType = 'unknown';
  let confidence = 0.5;
  let suggestedRoute: string | undefined;
  let suggestedAction: string | undefined;

  // Check for navigation intent
  for (const [route, keywords] of Object.entries(moduleKeywords)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword)) {
        intentType = 'navigate';
        suggestedRoute = route;
        confidence = 0.85;
        entities.push({ type: 'module', value: keyword, normalized: route });
        break;
      }
    }
    if (suggestedRoute) break;
  }

  // Check for action intent
  for (const [action, keywords] of Object.entries(actionKeywords)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword)) {
        if (intentType === 'unknown') {
          intentType = 'action';
        }
        suggestedAction = action;
        confidence = Math.max(confidence, 0.75);
        break;
      }
    }
    if (suggestedAction) break;
  }

  // Check for status entities
  for (const [status, keywords] of Object.entries(statusKeywords)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword)) {
        entities.push({ type: 'status', value: keyword, normalized: status });
        break;
      }
    }
  }

  // Check for query patterns
  const queryPatterns = [
    /quantos?/i,
    /qual|quais/i,
    /onde/i,
    /quando/i,
    /como/i,
    /status/i,
    /situação/i,
  ];

  if (queryPatterns.some(pattern => pattern.test(normalizedQuery))) {
    if (intentType === 'unknown') {
      intentType = 'query';
      confidence = 0.7;
    }
  }

  // Check for help intent
  if (/ajuda|help|como funciona|o que|explique/i.test(normalizedQuery)) {
    intentType = 'help';
    confidence = 0.9;
  }

  // Check for report intent
  if (/relatório|report|exportar|gerar|pdf|excel/i.test(normalizedQuery)) {
    intentType = 'report';
    confidence = 0.85;
  }

  return {
    type: intentType,
    confidence,
    entities,
    suggestedRoute,
    suggestedAction,
    rawQuery: query,
  };
}

export function generateResponse(intent: ParsedIntent): string {
  switch (intent.type) {
    case 'navigate':
      return `Navegando para ${intent.suggestedRoute}...`;
    case 'action':
      return `Executando ação: ${intent.suggestedAction}...`;
    case 'query':
      return `Buscando informações sobre: ${intent.rawQuery}`;
    case 'report':
      return `Gerando relatório solicitado...`;
    case 'help':
      return `Como posso ajudar? Você pode me pedir para navegar entre módulos, buscar informações, criar relatórios e muito mais.`;
    default:
      return `Entendi. Posso ajudar com: navegação, consultas, ações e relatórios. O que você precisa?`;
  }
}

export function getSuggestedActions(intent: ParsedIntent): Array<{ id: string; label: string; type: 'navigate' | 'execute' | 'query'; target: string }> {
  const suggestions = [];

  if (intent.suggestedRoute) {
    suggestions.push({
      id: 'nav-' + intent.suggestedRoute,
      label: `Ir para ${intent.suggestedRoute}`,
      type: 'navigate' as const,
      target: intent.suggestedRoute,
    });
  }

  // Add context-aware suggestions
  if (intent.type === 'query') {
    suggestions.push({
      id: 'query-dashboard',
      label: 'Ver Dashboard',
      type: 'navigate' as const,
      target: '/dashboard',
    });
  }

  if (intent.entities.some(e => e.type === 'status' && e.normalized === 'critical')) {
    suggestions.push({
      id: 'view-alerts',
      label: 'Ver Alertas Críticos',
      type: 'navigate' as const,
      target: '/alerts',
    });
  }

  return suggestions;
}
