/**
 * Mock AI Service v4.0
 * IA completamente funcional SEM precisar de API keys externas
 * Usa respostas inteligentes pré-programadas baseadas no contexto
 */

interface AIResponse {
  response: string;
  confidence: number;
  suggestions?: string[];
  sources?: string[];
  processingTime?: number;
}

interface PredictionResult {
  predictions: Array<{
    component: string;
    probability: number;
    daysUntilMaintenance: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: string[];
  confidence: number;
}

interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  compliance: boolean;
  expiryDate?: string;
  issues?: string[];
}

// Respostas contextuais inteligentes por categoria
const RESPONSES: Record<string, string[]> = {
  vessel: [
    "Com base nos dados da embarcação, recomendo inspeção nos equipamentos de convés antes da próxima viagem. Os registros mostram 98% de conformidade operacional.",
    "A embarcação está com documentação regular. Próxima inspeção PSC prevista para daqui 45 dias. Todos os certificados estatutários estão válidos.",
    "Identifiquei que a manutenção preventiva do motor principal está próxima do vencimento. Sugiro agendar para os próximos 15 dias.",
    "Análise do histórico mostra desempenho operacional acima da média. A taxa de utilização está em 87% nos últimos 30 dias.",
    "O consumo de combustível está 12% abaixo do esperado para este tipo de operação. Excelente eficiência operacional.",
  ],
  
  crew: [
    "A tripulação atual está com todos os certificados válidos. 2 certificados STCW vencem nos próximos 30 dias - já agendei alertas.",
    "Recomendo agendar treinamento de segurança para 3 tripulantes cujas certificações expiram em breve. Posso gerar o cronograma.",
    "A escala atual está balanceada conforme MLC 2006. Todos os tripulantes possuem as qualificações necessárias para suas funções.",
    "Análise de fadiga mostra todos os indicadores dentro dos limites regulatórios. Média de descanso: 11.2 horas/dia.",
    "Identificadas oportunidades de desenvolvimento para 4 tripulantes que podem assumir funções de maior responsabilidade.",
  ],
  
  maintenance: [
    "Com base no histórico e dados de sensores, sugiro manutenção preventiva no sistema hidráulico nos próximos 15 dias.",
    "A última manutenção foi realizada há 47 dias. Tudo dentro do cronograma planejado. Próxima inspeção classe em 120 dias.",
    "Identifiquei 3 itens pendentes de manutenção que podem ser realizados durante a próxima parada programada.",
    "Análise preditiva indica probabilidade de 23% de falha no compressor de ar nos próximos 60 dias. Recomendo inspeção.",
    "O MTBF (Mean Time Between Failures) está 15% acima da média da frota. Excelente desempenho de manutenção.",
  ],
  
  safety: [
    "Todos os equipamentos de segurança foram inspecionados recentemente. Status: Conforme. Próximo drill SOLAS em 7 dias.",
    "Recomendo drill de abandono nos próximos 7 dias conforme regulamento SOLAS. Posso gerar o checklist automaticamente.",
    "A última inspeção de segurança identificou 2 não conformidades leves, já corrigidas e documentadas no sistema.",
    "Análise de incidentes dos últimos 12 meses mostra redução de 35% em near-misses. Cultura de segurança fortalecida.",
    "EPIs verificados e dentro da validade. Próxima inspeção de botes salva-vidas programada para próxima semana.",
  ],
  
  compliance: [
    "A embarcação está em conformidade com MLC 2006. Próxima auditoria prevista para daqui 90 dias. Score atual: 98%.",
    "Documentação ISM está atualizada. Certificado SMC válido até dezembro de 2025. Nenhuma ação necessária.",
    "Todos os certificados estatutários estão válidos. ISPS code em conformidade. Flag State sem observações pendentes.",
    "Auditoria IMCA planejada para próximo mês. Baseado no checklist, prevejo aprovação com 3 observações menores.",
    "Compliance STCW em 100%. Todos os tripulantes com certificações válidas e registradas no sistema.",
  ],
  
  finance: [
    "Análise de custos operacionais mostra redução de 8% no trimestre. Principais economias em combustível e provisões.",
    "Budget de manutenção está 12% abaixo do previsto. Margem disponível para manutenções imprevistas.",
    "Receita da embarcação no mês atual: 15% acima da meta. Day rate competitivo para o segmento.",
    "Custo por dia operacional: $45,200. Benchmark do setor: $48,500. Performance financeira acima da média.",
    "Projeção de EBITDA para o trimestre: +22% vs. mesmo período ano anterior. Excelente resultado.",
  ],
  
  weather: [
    "Previsão para os próximos 3 dias indica condições favoráveis para navegação. Ventos de 10-15 nós de NE.",
    "Alerta: Sistema de baixa pressão se aproximando. Recomendo antecipar operações em 24h.",
    "Condições marítimas ideais para operações de carga. Ondulação prevista de 0.5-1.0m nas próximas 48h.",
    "Janela de tempo favorável para travessia entre dias 15-18. Após, previsão de ventos acima de 25 nós.",
    "Monitorando frente fria a 500mn. Impacto previsto em 72h. Preparar plano de contingência.",
  ],
  
  general: [
    "Posso ajudar com informações sobre embarcações, tripulação, manutenção, segurança, compliance e analytics.",
    "Estou analisando os dados do sistema. O que você gostaria de saber? Tenho acesso a todos os módulos.",
    "Tenho acesso a todos os dados operacionais em tempo real. Como posso auxiliar sua decisão?",
    "Nauti AI pronto para ajudar. Posso analisar dados, gerar relatórios, ou responder perguntas específicas.",
    "Sistema operando normalmente. Todos os módulos online. Em que posso ajudar?",
  ],
};

// Sugestões contextuais
const SUGGESTIONS: Record<string, string[]> = {
  vessel: [
    "Ver histórico de manutenção",
    "Verificar documentação",
    "Agendar inspeção",
    "Relatório de performance",
  ],
  crew: [
    "Listar certificados vencendo",
    "Ver escala de trabalho",
    "Agendar treinamentos",
    "Análise de competências",
  ],
  maintenance: [
    "Ver itens pendentes",
    "Histórico de manutenções",
    "Manutenção preventiva",
    "Análise preditiva",
  ],
  safety: [
    "Ver último drill",
    "Equipamentos de segurança",
    "Relatório de inspeção",
    "Histórico de incidentes",
  ],
  compliance: [
    "Status de certificados",
    "Próximas auditorias",
    "Não conformidades",
    "Gap analysis",
  ],
  finance: [
    "Relatório de custos",
    "Projeção de budget",
    "Análise de receita",
    "KPIs financeiros",
  ],
  weather: [
    "Previsão 7 dias",
    "Alertas ativos",
    "Histórico meteorológico",
    "Rotas alternativas",
  ],
  general: [
    "Status geral da frota",
    "Relatório executivo",
    "Alertas importantes",
    "Dashboard analytics",
  ],
};

export class MockAIService {
  private static instance: MockAIService;

  static getInstance(): MockAIService {
    if (!MockAIService.instance) {
      MockAIService.instance = new MockAIService();
    }
    return MockAIService.instance;
  }

  /**
   * Chat conversacional com IA
   */
  async chat(message: string, context?: Record<string, unknown>): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Simula delay de rede realista
    await this.simulateNetworkDelay();

    const category = this.detectCategory(message.toLowerCase());
    const responses = RESPONSES[category] || RESPONSES.general;
    const response = this.selectBestResponse(responses, message);

    return {
      response,
      confidence: 0.85 + Math.random() * 0.15,
      suggestions: SUGGESTIONS[category] || SUGGESTIONS.general,
      sources: this.generateSources(category),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Análise preditiva de manutenção
   */
  async predictMaintenance(vesselId: string): Promise<PredictionResult> {
    await this.simulateNetworkDelay(1000);

    const components = [
      { name: "Motor Principal", base: 0.15 },
      { name: "Sistema Hidráulico", base: 0.10 },
      { name: "Gerador Auxiliar", base: 0.12 },
      { name: "Sistema de Leme", base: 0.08 },
      { name: "Bomba de Lastro", base: 0.18 },
      { name: "Compressor de Ar", base: 0.14 },
    ];

    const predictions = components
      .map(comp => ({
        component: comp.name,
        probability: Math.min(0.95, comp.base + Math.random() * 0.6),
        daysUntilMaintenance: Math.floor(30 + Math.random() * 120),
        severity: this.calculateSeverity(comp.base + Math.random() * 0.5),
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 4);

    return {
      predictions,
      recommendations: [
        `Priorizar inspeção de ${predictions[0]?.component} nos próximos 30 dias`,
        "Monitorar parâmetros operacionais semanalmente",
        "Agendar manutenção preventiva conforme cronograma",
        "Verificar disponibilidade de peças de reposição críticas",
      ],
      confidence: 0.87,
    };
  }

  /**
   * Análise de documentos
   */
  async analyzeDocument(documentUrl: string, documentType?: string): Promise<DocumentAnalysis> {
    await this.simulateNetworkDelay(800);

    const docTypes = {
      certificate: {
        summary: "Certificado válido e em conformidade com regulamentações internacionais.",
        keyPoints: [
          "Emitido por autoridade competente",
          "Dentro do período de validade",
          "Todas as informações legíveis e corretas",
          "Assinaturas e carimbos presentes",
        ],
        compliance: true,
        expiryDate: this.generateFutureDate(180, 730),
      },
      contract: {
        summary: "Contrato analisado com termos comerciais padrão do setor marítimo.",
        keyPoints: [
          "Cláusulas de responsabilidade adequadas",
          "Termos de pagamento definidos",
          "Condições de rescisão especificadas",
          "Jurisdição e arbitragem claras",
        ],
        compliance: true,
      },
      report: {
        summary: "Relatório técnico com informações detalhadas e bem estruturadas.",
        keyPoints: [
          "Dados técnicos consistentes",
          "Metodologia adequada",
          "Conclusões suportadas por evidências",
          "Recomendações acionáveis",
        ],
        compliance: true,
      },
    };

    const type = documentType || 'certificate';
    const result = docTypes[type as keyof typeof docTypes] || docTypes.certificate;

    return {
      ...result,
      issues: Math.random() > 0.7 ? ["Considerar atualização de dados cadastrais"] : undefined,
    };
  }

  /**
   * Geração de relatório executivo
   */
  async generateExecutiveReport(params: {
    vesselId?: string;
    period?: string;
    type?: string;
  }): Promise<{
    title: string;
    sections: Array<{ heading: string; content: string }>;
    metrics: Record<string, number>;
    generatedAt: string;
  }> {
    await this.simulateNetworkDelay(1500);

    return {
      title: `Relatório Executivo - ${params.period || 'Mensal'}`,
      sections: [
        {
          heading: "Resumo Operacional",
          content: "Operações transcorreram dentro dos parâmetros esperados. Disponibilidade técnica de 98.5%, superando a meta de 95%. Nenhum incidente reportável no período.",
        },
        {
          heading: "Performance de Segurança",
          content: "Zero acidentes com afastamento. 3 near-misses reportados e investigados. Todos os drills realizados conforme cronograma SOLAS.",
        },
        {
          heading: "Compliance",
          content: "Todas as certificações válidas. Auditoria interna realizada sem não conformidades maiores. Próxima auditoria externa em 45 dias.",
        },
        {
          heading: "Aspectos Financeiros",
          content: "Custos operacionais 8% abaixo do budget. Economia principal em combustível devido a otimização de rotas. ROI projetado em linha com metas anuais.",
        },
      ],
      metrics: {
        disponibilidade: 98.5,
        seguranca: 100,
        compliance: 98,
        custoVsBudget: 92,
        satisfacaoTripulacao: 87,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Sugestões de otimização
   */
  async getOptimizationSuggestions(context: {
    area: string;
    currentMetrics?: Record<string, number>;
  }): Promise<{
    suggestions: Array<{
      title: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
      potentialSavings?: string;
    }>;
  }> {
    await this.simulateNetworkDelay(600);

    const suggestions = [
      {
        title: "Otimização de Rota",
        description: "Análise de dados históricos sugere rota alternativa com economia de 12% em combustível.",
        impact: 'high' as const,
        effort: 'low' as const,
        potentialSavings: "$15,000/mês",
      },
      {
        title: "Manutenção Preditiva",
        description: "Implementar sensores IoT no sistema de propulsão para antecipar falhas.",
        impact: 'high' as const,
        effort: 'medium' as const,
        potentialSavings: "$25,000/ano",
      },
      {
        title: "Gestão de Energia",
        description: "Otimizar horários de operação de equipamentos auxiliares durante navegação.",
        impact: 'medium' as const,
        effort: 'low' as const,
        potentialSavings: "$5,000/mês",
      },
      {
        title: "Treinamento de Tripulação",
        description: "Programa de eficiência operacional para reduzir tempo em manobras.",
        impact: 'medium' as const,
        effort: 'medium' as const,
        potentialSavings: "$8,000/mês",
      },
    ];

    return { suggestions };
  }

  // Métodos auxiliares privados
  private async simulateNetworkDelay(baseMs = 500): Promise<void> {
    const delay = baseMs + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private detectCategory(message: string): string {
    const keywords: Record<string, string[]> = {
      vessel: ['embarcação', 'navio', 'vessel', 'ship', 'frota', 'fleet'],
      crew: ['tripul', 'crew', 'marítimo', 'seafarer', 'capitão', 'captain', 'oficial'],
      maintenance: ['manutenção', 'maintenance', 'repair', 'conserto', 'peça', 'equipamento'],
      safety: ['segur', 'safety', 'acidente', 'incident', 'drill', 'epi', 'emergência'],
      compliance: ['compliance', 'mlc', 'ism', 'solas', 'certificado', 'auditoria', 'stcw'],
      finance: ['custo', 'budget', 'receita', 'finance', 'dinheiro', 'pagamento', 'fatura'],
      weather: ['tempo', 'weather', 'clima', 'vento', 'mar', 'ondas', 'previsão'],
    };

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => message.includes(word))) {
        return category;
      }
    }

    return 'general';
  }

  private selectBestResponse(responses: string[], message: string): string {
    // Seleciona resposta semi-aleatória mas consistente para a mesma pergunta
    const hash = message.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const index = Math.abs(hash) % responses.length;
    return responses[index];
  }

  private generateSources(category: string): string[] {
    const sources: Record<string, string[]> = {
      vessel: ["Registro de Operações", "Sistema de Monitoramento", "Log de Navegação"],
      crew: ["Sistema de RH", "Registros de Certificação", "Portal do Tripulante"],
      maintenance: ["PMS", "Histórico de OS", "Manual do Fabricante"],
      safety: ["ISM Code", "SOLAS", "Relatórios de Segurança"],
      compliance: ["MLC 2006", "STCW", "Flag State Requirements"],
      finance: ["Sistema Financeiro", "Relatórios Gerenciais", "Budget Anual"],
      weather: ["Serviço Meteorológico", "Dados Satélite", "Previsões NAVTEX"],
      general: ["Base de Conhecimento Nauti", "Dados Operacionais", "Analytics"],
    };

    return sources[category] || sources.general;
  }

  private calculateSeverity(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  private generateFutureDate(minDays: number, maxDays: number): string {
    const days = minDays + Math.floor(Math.random() * (maxDays - minDays));
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}

// Singleton export
export const mockAI = MockAIService.getInstance();

// Hook para usar em componentes React
export function useMockAI() {
  return mockAI;
}
