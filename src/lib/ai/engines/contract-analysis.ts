/**
 * Contract Analysis NLP Engine
 * Extração automática de cláusulas de risco e oportunidades de negociação
 * Nível: Assistivo
 */

export interface ContractDocument {
  documentId: string;
  title: string;
  contractType: ContractType;
  parties: ContractParty[];
  effectiveDate: Date;
  expirationDate: Date;
  value: number;
  currency: string;
  rawText: string;
  metadata: Record<string, unknown>;
}

export type ContractType = 
  | 'charter_party'
  | 'employment'
  | 'service_agreement'
  | 'supply_contract'
  | 'maintenance'
  | 'insurance'
  | 'agency'
  | 'nda'
  | 'other';

export interface ContractParty {
  name: string;
  role: 'owner' | 'charterer' | 'employer' | 'employee' | 'supplier' | 'client' | 'other';
  jurisdiction: string;
}

export interface ContractAnalysisResult {
  analysisId: string;
  documentId: string;
  title: string;
  contractType: ContractType;
  analyzedAt: Date;
  keyTerms: KeyTerm[];
  riskClauses: RiskClause[];
  obligations: ContractObligation[];
  financialTerms: FinancialTerm[];
  negotiationOpportunities: NegotiationOpportunity[];
  complianceFlags: ComplianceFlag[];
  summary: ContractSummary;
  confidence: number;
}

export interface KeyTerm {
  termId: string;
  category: TermCategory;
  term: string;
  value: string;
  location: TextLocation;
  importance: 'critical' | 'important' | 'standard';
}

export type TermCategory = 
  | 'duration'
  | 'payment'
  | 'termination'
  | 'liability'
  | 'insurance'
  | 'confidentiality'
  | 'jurisdiction'
  | 'force_majeure'
  | 'performance'
  | 'delivery';

export interface TextLocation {
  page: number;
  paragraph: number;
  startChar: number;
  endChar: number;
  excerpt: string;
}

export interface RiskClause {
  clauseId: string;
  category: RiskCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  originalText: string;
  location: TextLocation;
  riskScore: number;
  potentialImpact: string;
  mitigation: string;
  marketStandard: boolean;
}

export type RiskCategory = 
  | 'unlimited_liability'
  | 'indemnification'
  | 'termination_penalty'
  | 'exclusivity'
  | 'non_compete'
  | 'ip_ownership'
  | 'price_escalation'
  | 'performance_guarantee'
  | 'delay_penalty'
  | 'warranty'
  | 'jurisdiction_unfavorable'
  | 'automatic_renewal';

export interface ContractObligation {
  obligationId: string;
  party: string;
  type: ObligationType;
  description: string;
  deadline: Date | null;
  frequency: string | null;
  consequences: string;
  location: TextLocation;
}

export type ObligationType = 
  | 'payment'
  | 'delivery'
  | 'performance'
  | 'reporting'
  | 'notification'
  | 'insurance'
  | 'compliance'
  | 'confidentiality';

export interface FinancialTerm {
  termId: string;
  type: FinancialTermType;
  baseAmount: number;
  currency: string;
  frequency: string;
  conditions: string;
  escalationClause: string | null;
  location: TextLocation;
}

export type FinancialTermType = 
  | 'hire_rate'
  | 'salary'
  | 'fee'
  | 'penalty'
  | 'bonus'
  | 'deposit'
  | 'insurance_premium'
  | 'maintenance_fund';

export interface NegotiationOpportunity {
  opportunityId: string;
  category: string;
  currentTerm: string;
  suggestedChange: string;
  rationale: string;
  potentialSaving: number | null;
  difficulty: 'easy' | 'moderate' | 'difficult';
  marketBenchmark: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ComplianceFlag {
  flagId: string;
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'review_needed';
  gap: string | null;
  recommendation: string;
}

export interface ContractSummary {
  executiveSummary: string;
  keyDates: Array<{ description: string; date: Date }>;
  totalValue: number;
  currency: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  comparisonToMarket: 'favorable' | 'standard' | 'unfavorable';
}

class ContractAnalysisEngine {
  private readonly RISK_PATTERNS: Array<{
    pattern: RegExp;
    category: RiskCategory;
    severity: RiskClause['severity'];
    title: string;
    mitigation: string;
  }> = [
    {
      pattern: /unlimited\s+liabilit|without\s+limit|no\s+cap\s+on\s+liability|sem\s+limite\s+de\s+responsabilidade/i,
      category: 'unlimited_liability',
      severity: 'critical',
      title: 'Responsabilidade Ilimitada',
      mitigation: 'Negociar cap de responsabilidade (geralmente 100-200% do valor do contrato)'
    },
    {
      pattern: /indemnif|indeniza|hold\s+harmless|isentar\s+de\s+responsabilidade/i,
      category: 'indemnification',
      severity: 'high',
      title: 'Cláusula de Indenização',
      mitigation: 'Verificar escopo e limitar a atos de negligência grave'
    },
    {
      pattern: /terminat.*penalty|multa.*rescis|early\s+termination.*fee/i,
      category: 'termination_penalty',
      severity: 'medium',
      title: 'Penalidade de Rescisão',
      mitigation: 'Negociar período de aviso prévio sem penalidade'
    },
    {
      pattern: /exclusiv|exclusividade/i,
      category: 'exclusivity',
      severity: 'medium',
      title: 'Cláusula de Exclusividade',
      mitigation: 'Definir escopo geográfico e temporal limitado'
    },
    {
      pattern: /non-?compete|não\s+concorrência|proibi.*competir/i,
      category: 'non_compete',
      severity: 'high',
      title: 'Cláusula de Não-Competição',
      mitigation: 'Limitar duração (máx 1-2 anos) e escopo geográfico'
    },
    {
      pattern: /intellectual\s+property.*transfer|propriedade\s+intelectual.*transferência|ip\s+ownership/i,
      category: 'ip_ownership',
      severity: 'high',
      title: 'Transferência de Propriedade Intelectual',
      mitigation: 'Manter direitos sobre IP desenvolvido antes do contrato'
    },
    {
      pattern: /price\s+escalat|reajuste\s+de\s+pre[cç]o|adjustment.*rate/i,
      category: 'price_escalation',
      severity: 'medium',
      title: 'Cláusula de Reajuste de Preço',
      mitigation: 'Vincular a índice de mercado com cap anual'
    },
    {
      pattern: /performance\s+guarantee|garantia\s+de\s+performance|performance\s+bond/i,
      category: 'performance_guarantee',
      severity: 'medium',
      title: 'Garantia de Performance',
      mitigation: 'Definir KPIs claros e mensuráveis'
    },
    {
      pattern: /delay.*penalty|multa.*atraso|liquidated\s+damages/i,
      category: 'delay_penalty',
      severity: 'medium',
      title: 'Penalidade por Atraso',
      mitigation: 'Incluir grace period e cap total'
    },
    {
      pattern: /auto.*renew|renovação\s+automática|automatically\s+extend/i,
      category: 'automatic_renewal',
      severity: 'low',
      title: 'Renovação Automática',
      mitigation: 'Adicionar período de aviso para não-renovação'
    }
  ];

  private readonly OBLIGATION_PATTERNS: Array<{
    pattern: RegExp;
    type: ObligationType;
    party: 'either' | 'first' | 'second';
  }> = [
    { pattern: /shall\s+pay|pagará|deve\s+pagar|payment\s+of/i, type: 'payment', party: 'either' },
    { pattern: /shall\s+deliver|entregará|deve\s+entregar/i, type: 'delivery', party: 'either' },
    { pattern: /shall\s+perform|executará|deve\s+executar/i, type: 'performance', party: 'either' },
    { pattern: /shall\s+report|reportará|deve\s+reportar/i, type: 'reporting', party: 'either' },
    { pattern: /shall\s+notify|notificará|deve\s+notificar/i, type: 'notification', party: 'either' },
    { pattern: /shall\s+maintain\s+insurance|seguro|insurance\s+policy/i, type: 'insurance', party: 'either' }
  ];

  analyzeContract(document: ContractDocument): ContractAnalysisResult {
    const keyTerms = this.extractKeyTerms(document);
    const riskClauses = this.identifyRiskClauses(document);
    const obligations = this.extractObligations(document);
    const financialTerms = this.extractFinancialTerms(document);
    const negotiationOpportunities = this.identifyNegotiationOpportunities(riskClauses, financialTerms, document);
    const complianceFlags = this.checkCompliance(document);
    const summary = this.generateSummary(document, riskClauses, financialTerms, keyTerms);

    return {
      analysisId: crypto.randomUUID(),
      documentId: document.documentId,
      title: document.title,
      contractType: document.contractType,
      analyzedAt: new Date(),
      keyTerms,
      riskClauses,
      obligations,
      financialTerms,
      negotiationOpportunities,
      complianceFlags,
      summary,
      confidence: this.calculateConfidence(document, keyTerms, riskClauses)
    };
  }

  private extractKeyTerms(document: ContractDocument): KeyTerm[] {
    const terms: KeyTerm[] = [];
    const text = document.rawText;

    // Duration
    const durationMatch = text.match(/(?:term|duration|período|vigência).*?(\d+)\s*(?:years?|anos?|months?|meses)/i);
    if (durationMatch) {
      terms.push({
        termId: crypto.randomUUID(),
        category: 'duration',
        term: 'Duração do Contrato',
        value: durationMatch[0],
        location: this.createLocation(text, durationMatch.index || 0, durationMatch[0].length),
        importance: 'critical'
      });
    }

    // Payment terms
    const paymentMatch = text.match(/(?:payment|pagamento).*?(\d+)\s*(?:days?|dias)/i);
    if (paymentMatch) {
      terms.push({
        termId: crypto.randomUUID(),
        category: 'payment',
        term: 'Prazo de Pagamento',
        value: paymentMatch[0],
        location: this.createLocation(text, paymentMatch.index || 0, paymentMatch[0].length),
        importance: 'important'
      });
    }

    // Termination notice
    const terminationMatch = text.match(/(?:termination|rescisão).*?notice.*?(\d+)\s*(?:days?|dias|months?|meses)/i);
    if (terminationMatch) {
      terms.push({
        termId: crypto.randomUUID(),
        category: 'termination',
        term: 'Aviso de Rescisão',
        value: terminationMatch[0],
        location: this.createLocation(text, terminationMatch.index || 0, terminationMatch[0].length),
        importance: 'important'
      });
    }

    // Liability cap
    const liabilityMatch = text.match(/(?:liability|responsabilidade).*?(?:cap|limit|máximo).*?(\$|USD|EUR|BRL)?\s*[\d,.]+/i);
    if (liabilityMatch) {
      terms.push({
        termId: crypto.randomUUID(),
        category: 'liability',
        term: 'Limite de Responsabilidade',
        value: liabilityMatch[0],
        location: this.createLocation(text, liabilityMatch.index || 0, liabilityMatch[0].length),
        importance: 'critical'
      });
    }

    // Jurisdiction
    const jurisdictionMatch = text.match(/(?:governing\s+law|jurisdiction|lei\s+aplicável|foro).*?(?:of\s+)?(\w+(?:\s+\w+)?)/i);
    if (jurisdictionMatch) {
      terms.push({
        termId: crypto.randomUUID(),
        category: 'jurisdiction',
        term: 'Jurisdição',
        value: jurisdictionMatch[0],
        location: this.createLocation(text, jurisdictionMatch.index || 0, jurisdictionMatch[0].length),
        importance: 'important'
      });
    }

    // Insurance requirements
    const insuranceMatch = text.match(/(?:insurance|seguro).*?(?:\$|USD|EUR|BRL)\s*[\d,.]+(?:\s*(?:million|milhões))?/i);
    if (insuranceMatch) {
      terms.push({
        termId: crypto.randomUUID(),
        category: 'insurance',
        term: 'Requisitos de Seguro',
        value: insuranceMatch[0],
        location: this.createLocation(text, insuranceMatch.index || 0, insuranceMatch[0].length),
        importance: 'important'
      });
    }

    return terms;
  }

  private identifyRiskClauses(document: ContractDocument): RiskClause[] {
    const risks: RiskClause[] = [];
    const text = document.rawText;

    for (const riskPattern of this.RISK_PATTERNS) {
      const matches = text.matchAll(new RegExp(riskPattern.pattern, 'gi'));
      
      for (const match of matches) {
        if (match.index === undefined) continue;

        // Extract surrounding context
        const start = Math.max(0, match.index - 100);
        const end = Math.min(text.length, match.index + match[0].length + 200);
        const context = text.substring(start, end);

        risks.push({
          clauseId: crypto.randomUUID(),
          category: riskPattern.category,
          severity: riskPattern.severity,
          title: riskPattern.title,
          description: this.generateRiskDescription(riskPattern.category, context),
          originalText: context.trim(),
          location: this.createLocation(text, match.index, match[0].length),
          riskScore: this.calculateRiskScore(riskPattern.severity),
          potentialImpact: this.assessPotentialImpact(riskPattern.category, document),
          mitigation: riskPattern.mitigation,
          marketStandard: this.isMarketStandard(riskPattern.category, context)
        });
      }
    }

    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }

  private extractObligations(document: ContractDocument): ContractObligation[] {
    const obligations: ContractObligation[] = [];
    const text = document.rawText;
    const sentences = text.split(/[.;]/);

    for (const sentence of sentences) {
      for (const pattern of this.OBLIGATION_PATTERNS) {
        if (pattern.pattern.test(sentence)) {
          obligations.push({
            obligationId: crypto.randomUUID(),
            party: this.identifyObligor(sentence, document.parties),
            type: pattern.type,
            description: sentence.trim().substring(0, 200),
            deadline: this.extractDeadline(sentence),
            frequency: this.extractFrequency(sentence),
            consequences: this.extractConsequences(sentence),
            location: this.createLocation(text, text.indexOf(sentence), sentence.length)
          });
          break;
        }
      }
    }

    return obligations;
  }

  private extractFinancialTerms(document: ContractDocument): FinancialTerm[] {
    const terms: FinancialTerm[] = [];
    const text = document.rawText;

    // Extract monetary values with context
    const moneyPattern = /(?:(?:\$|USD|EUR|BRL|GBP)\s*)?[\d,]+(?:\.\d{2})?(?:\s*(?:million|thousand|milhões|mil))?\s*(?:per\s+(?:day|month|year|annum)|por\s+(?:dia|mês|ano))?/gi;
    const matches = text.matchAll(moneyPattern);

    for (const match of matches) {
      if (match.index === undefined) continue;
      
      const contextStart = Math.max(0, match.index - 50);
      const contextEnd = Math.min(text.length, match.index + match[0].length + 50);
      const context = text.substring(contextStart, contextEnd);

      const termType = this.classifyFinancialTerm(context);
      if (termType) {
        terms.push({
          termId: crypto.randomUUID(),
          type: termType,
          baseAmount: this.parseAmount(match[0]),
          currency: this.extractCurrency(match[0]) || document.currency,
          frequency: this.extractFrequency(context) || 'one-time',
          conditions: this.extractConditions(context),
          escalationClause: this.extractEscalation(context),
          location: this.createLocation(text, match.index, match[0].length)
        });
      }
    }

    return terms;
  }

  private identifyNegotiationOpportunities(
    risks: RiskClause[],
    financialTerms: FinancialTerm[],
    document: ContractDocument
  ): NegotiationOpportunity[] {
    const opportunities: NegotiationOpportunity[] = [];

    // Risk-based opportunities
    for (const risk of risks.filter(r => r.severity === 'critical' || r.severity === 'high')) {
      opportunities.push({
        opportunityId: crypto.randomUUID(),
        category: 'risk_reduction',
        currentTerm: risk.originalText.substring(0, 100),
        suggestedChange: risk.mitigation,
        rationale: `Cláusula de ${risk.title} apresenta risco ${risk.severity}`,
        potentialSaving: null,
        difficulty: risk.marketStandard ? 'moderate' : 'easy',
        marketBenchmark: risk.marketStandard ? 'Padrão de mercado' : 'Acima do padrão de mercado',
        priority: risk.severity === 'critical' ? 'high' : 'medium'
      });
    }

    // Financial opportunities
    for (const term of financialTerms) {
      if (term.type === 'penalty' && term.baseAmount > document.value * 0.1) {
        opportunities.push({
          opportunityId: crypto.randomUUID(),
          category: 'financial',
          currentTerm: `Penalidade de ${term.currency} ${term.baseAmount.toLocaleString()}`,
          suggestedChange: `Negociar cap de ${Math.round(document.value * 0.05).toLocaleString()}`,
          rationale: 'Penalidade acima de 10% do valor do contrato',
          potentialSaving: term.baseAmount - document.value * 0.05,
          difficulty: 'moderate',
          marketBenchmark: '3-5% do valor do contrato',
          priority: 'high'
        });
      }

      if (!term.escalationClause && term.type === 'hire_rate') {
        opportunities.push({
          opportunityId: crypto.randomUUID(),
          category: 'financial',
          currentTerm: 'Taxa sem cláusula de reajuste',
          suggestedChange: 'Incluir reajuste anual vinculado ao IPCA ou índice marítimo',
          rationale: 'Proteção contra inflação em contratos de longo prazo',
          potentialSaving: null,
          difficulty: 'easy',
          marketBenchmark: 'Reajuste anual é padrão em contratos >12 meses',
          priority: document.expirationDate.getTime() - document.effectiveDate.getTime() > 365 * 24 * 60 * 60 * 1000 ? 'high' : 'low'
        });
      }
    }

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private checkCompliance(document: ContractDocument): ComplianceFlag[] {
    const flags: ComplianceFlag[] = [];

    // MLC 2006 compliance for employment contracts
    if (document.contractType === 'employment') {
      const hasRestHours = /rest\s+hour|horas?\s+de\s+descanso/i.test(document.rawText);
      if (!hasRestHours) {
        flags.push({
          flagId: crypto.randomUUID(),
          regulation: 'MLC 2006',
          requirement: 'Definição de horas de trabalho e descanso',
          status: 'review_needed',
          gap: 'Cláusula de horas de descanso não identificada',
          recommendation: 'Incluir cláusula conforme Regulamento 2.3 da MLC 2006'
        });
      }

      const hasRepatriation = /repatriation|repatriação/i.test(document.rawText);
      if (!hasRepatriation) {
        flags.push({
          flagId: crypto.randomUUID(),
          regulation: 'MLC 2006',
          requirement: 'Direito de repatriação',
          status: 'non_compliant',
          gap: 'Cláusula de repatriação não encontrada',
          recommendation: 'Incluir direitos de repatriação conforme Regulamento 2.5'
        });
      }
    }

    // Charter party specific
    if (document.contractType === 'charter_party') {
      const hasISM = /ism\s+code|código\s+ism/i.test(document.rawText);
      if (!hasISM) {
        flags.push({
          flagId: crypto.randomUUID(),
          regulation: 'ISM Code',
          requirement: 'Referência ao Código ISM',
          status: 'review_needed',
          gap: 'Referência ao ISM Code não encontrada',
          recommendation: 'Incluir cláusula de conformidade ISM'
        });
      }
    }

    return flags;
  }

  private generateSummary(
    document: ContractDocument,
    risks: RiskClause[],
    financialTerms: FinancialTerm[],
    keyTerms: KeyTerm[]
  ): ContractSummary {
    const criticalRisks = risks.filter(r => r.severity === 'critical').length;
    const highRisks = risks.filter(r => r.severity === 'high').length;
    
    const riskScore = Math.min(100, criticalRisks * 25 + highRisks * 15 + risks.length * 5);
    
    const keyDates: Array<{ description: string; date: Date }> = [
      { description: 'Início do Contrato', date: document.effectiveDate },
      { description: 'Término do Contrato', date: document.expirationDate }
    ];

    const durationTerm = keyTerms.find(t => t.category === 'duration');
    const paymentTerm = keyTerms.find(t => t.category === 'payment');

    const executiveSummary = `Contrato de ${this.getContractTypeName(document.contractType)} entre ${document.parties.map(p => p.name).join(' e ')}. ` +
      `Valor total: ${document.currency} ${document.value.toLocaleString()}. ` +
      `Vigência: ${durationTerm?.value || 'a ser determinado'}. ` +
      `Identificados ${risks.length} cláusulas de risco, sendo ${criticalRisks} críticas. ` +
      `Condições de pagamento: ${paymentTerm?.value || 'conforme contrato'}.`;

    const recommendedActions: string[] = [];
    if (criticalRisks > 0) {
      recommendedActions.push('Renegociar cláusulas de risco crítico antes da assinatura');
    }
    if (risks.some(r => r.category === 'unlimited_liability')) {
      recommendedActions.push('Estabelecer cap de responsabilidade');
    }
    if (financialTerms.some(t => t.type === 'penalty' && t.baseAmount > document.value * 0.1)) {
      recommendedActions.push('Reduzir penalidades para máximo de 5% do valor');
    }

    return {
      executiveSummary,
      keyDates,
      totalValue: document.value,
      currency: document.currency,
      riskScore,
      riskLevel: riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low',
      recommendedActions,
      comparisonToMarket: riskScore >= 60 ? 'unfavorable' : riskScore >= 35 ? 'standard' : 'favorable'
    };
  }

  private createLocation(text: string, index: number, length: number): TextLocation {
    const beforeText = text.substring(0, index);
    const paragraphs = beforeText.split(/\n\n+/);
    const lines = beforeText.split('\n');
    
    return {
      page: Math.floor(lines.length / 50) + 1, // Estimate ~50 lines per page
      paragraph: paragraphs.length,
      startChar: index,
      endChar: index + length,
      excerpt: text.substring(Math.max(0, index - 20), index + length + 20)
    };
  }

  private generateRiskDescription(category: RiskCategory, context: string): string {
    const descriptions: Record<RiskCategory, string> = {
      unlimited_liability: 'Exposição a responsabilidade sem limite financeiro',
      indemnification: 'Obrigação de indenizar a contraparte por perdas',
      termination_penalty: 'Penalidade financeira em caso de rescisão antecipada',
      exclusivity: 'Restrição de trabalhar com outras partes',
      non_compete: 'Proibição de competir após término do contrato',
      ip_ownership: 'Transferência de direitos de propriedade intelectual',
      price_escalation: 'Possibilidade de aumento de preços',
      performance_guarantee: 'Obrigação de atingir metas de performance',
      delay_penalty: 'Multa por atraso no cumprimento de obrigações',
      warranty: 'Garantia sobre produtos ou serviços',
      jurisdiction_unfavorable: 'Foro em jurisdição potencialmente desfavorável',
      automatic_renewal: 'Renovação automática sem consentimento explícito'
    };
    return descriptions[category];
  }

  private calculateRiskScore(severity: RiskClause['severity']): number {
    const scores = { critical: 90, high: 70, medium: 45, low: 20 };
    return scores[severity];
  }

  private assessPotentialImpact(category: RiskCategory, document: ContractDocument): string {
    if (category === 'unlimited_liability') {
      return `Exposição potencial ilimitada - valor do contrato: ${document.currency} ${document.value.toLocaleString()}`;
    }
    if (category === 'termination_penalty') {
      return `Penalidade potencial de até ${document.currency} ${(document.value * 0.3).toLocaleString()} (estimado)`;
    }
    return 'Impacto a ser avaliado caso a caso';
  }

  private isMarketStandard(category: RiskCategory, context: string): boolean {
    // Simplified - would need industry benchmarks
    const nonStandard: RiskCategory[] = ['unlimited_liability', 'non_compete'];
    return !nonStandard.includes(category);
  }

  private identifyObligor(sentence: string, parties: ContractParty[]): string {
    for (const party of parties) {
      if (sentence.toLowerCase().includes(party.name.toLowerCase())) {
        return party.name;
      }
    }
    return 'A ser determinado';
  }

  private extractDeadline(text: string): Date | null {
    const deadlineMatch = text.match(/within\s+(\d+)\s+(days?|months?)/i);
    if (deadlineMatch) {
      const amount = parseInt(deadlineMatch[1]);
      const unit = deadlineMatch[2].toLowerCase().startsWith('day') ? 'days' : 'months';
      const date = new Date();
      if (unit === 'days') {
        date.setDate(date.getDate() + amount);
      } else {
        date.setMonth(date.getMonth() + amount);
      }
      return date;
    }
    return null;
  }

  private extractFrequency(text: string): string | null {
    if (/monthly|mensalmente/i.test(text)) return 'monthly';
    if (/quarterly|trimestralmente/i.test(text)) return 'quarterly';
    if (/annually|yearly|anualmente/i.test(text)) return 'annually';
    if (/weekly|semanalmente/i.test(text)) return 'weekly';
    if (/daily|diariamente/i.test(text)) return 'daily';
    return null;
  }

  private extractConsequences(text: string): string {
    const consequenceMatch = text.match(/(?:otherwise|failure|caso contrário|sob pena).{0,100}/i);
    return consequenceMatch ? consequenceMatch[0] : 'Não especificado';
  }

  private classifyFinancialTerm(context: string): FinancialTermType | null {
    if (/hire|frete|afretamento/i.test(context)) return 'hire_rate';
    if (/salary|salário|wages/i.test(context)) return 'salary';
    if (/fee|taxa|honorários/i.test(context)) return 'fee';
    if (/penalty|multa|penalidade/i.test(context)) return 'penalty';
    if (/bonus|bônus/i.test(context)) return 'bonus';
    if (/deposit|depósito|caução/i.test(context)) return 'deposit';
    if (/insurance|seguro/i.test(context)) return 'insurance_premium';
    return null;
  }

  private parseAmount(text: string): number {
    const cleanText = text.replace(/[^\d.,]/g, '').replace(',', '');
    let amount = parseFloat(cleanText) || 0;
    if (/million|milhões/i.test(text)) amount *= 1000000;
    if (/thousand|mil/i.test(text)) amount *= 1000;
    return amount;
  }

  private extractCurrency(text: string): string | null {
    if (/\$|USD/i.test(text)) return 'USD';
    if (/EUR|€/i.test(text)) return 'EUR';
    if (/BRL|R\$/i.test(text)) return 'BRL';
    if (/GBP|£/i.test(text)) return 'GBP';
    return null;
  }

  private extractConditions(text: string): string {
    const conditionMatch = text.match(/(?:if|when|upon|se|quando|mediante).{0,50}/i);
    return conditionMatch ? conditionMatch[0].trim() : 'Sem condições específicas';
  }

  private extractEscalation(context: string): string | null {
    const escalationMatch = context.match(/(?:adjust|escalat|increase|reajust).{0,100}/i);
    return escalationMatch ? escalationMatch[0].trim() : null;
  }

  private calculateConfidence(
    document: ContractDocument,
    keyTerms: KeyTerm[],
    risks: RiskClause[]
  ): number {
    let confidence = 0.6; // Base

    // More text = potentially more accurate
    if (document.rawText.length > 10000) confidence += 0.1;
    if (document.rawText.length > 50000) confidence += 0.1;

    // Found key terms = better analysis
    confidence += Math.min(0.15, keyTerms.length * 0.025);

    // Multiple risk patterns found = more comprehensive
    confidence += Math.min(0.05, risks.length * 0.01);

    return Math.min(0.95, confidence);
  }

  private getContractTypeName(type: ContractType): string {
    const names: Record<ContractType, string> = {
      charter_party: 'Afretamento',
      employment: 'Trabalho',
      service_agreement: 'Prestação de Serviços',
      supply_contract: 'Fornecimento',
      maintenance: 'Manutenção',
      insurance: 'Seguro',
      agency: 'Agenciamento',
      nda: 'Confidencialidade',
      other: 'Geral'
    };
    return names[type];
  }
}

export const contractAnalysisEngine = new ContractAnalysisEngine();
