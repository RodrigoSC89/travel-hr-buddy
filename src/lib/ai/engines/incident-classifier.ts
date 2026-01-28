/**
 * Incident Classifier AI Engine
 * Classificação automática de incidentes por severidade (NLP)
 */

export interface RawIncident {
  id: string;
  description: string;
  reported_by: string;
  reported_at: string;
  location?: string;
  vessel_id?: string;
  initial_category?: string;
  attachments?: string[];
}

export interface ClassifiedIncident {
  id: string;
  original_description: string;
  classification: IncidentClassification;
  severity: SeverityAssessment;
  suggested_actions: SuggestedAction[];
  similar_incidents: SimilarIncident[];
  compliance_implications: ComplianceImplication[];
  auto_escalation: AutoEscalation | null;
}

export interface IncidentClassification {
  primary_category: IncidentCategory;
  secondary_categories: IncidentCategory[];
  confidence: number;
  keywords_detected: string[];
  classification_reasoning: string;
}

export type IncidentCategory = 
  | 'near_miss'
  | 'minor_injury'
  | 'major_injury'
  | 'fatality'
  | 'environmental_spill'
  | 'equipment_damage'
  | 'security_breach'
  | 'navigation_incident'
  | 'fire_explosion'
  | 'collision'
  | 'grounding'
  | 'cargo_damage'
  | 'occupational_illness'
  | 'unsafe_condition'
  | 'unsafe_act';

export interface SeverityAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: SeverityFactor[];
  potential_consequences: string[];
  escalation_required: boolean;
}

export interface SeverityFactor {
  factor: string;
  weight: number;
  contribution: number;
  detected_indicators: string[];
}

export interface SuggestedAction {
  action: string;
  priority: 'immediate' | 'short_term' | 'medium_term';
  responsible_role: string;
  deadline_hours: number;
  resources_needed: string[];
}

export interface SimilarIncident {
  incident_id: string;
  description: string;
  date: string;
  similarity_score: number;
  outcome: string;
  lessons_learned: string[];
}

export interface ComplianceImplication {
  regulation: string;
  requirement: string;
  implication: string;
  reporting_required: boolean;
  deadline_days: number;
}

export interface AutoEscalation {
  triggered: boolean;
  reason: string;
  escalated_to: string[];
  notification_sent_at: string;
}

// Keyword dictionaries for classification
const CATEGORY_KEYWORDS: Record<IncidentCategory, string[]> = {
  near_miss: ['quase', 'almost', 'near miss', 'por pouco', 'evitado', 'avoided', 'close call'],
  minor_injury: ['ferimento leve', 'minor injury', 'corte', 'cut', 'arranhão', 'scratch', 'contusão', 'bruise'],
  major_injury: ['fratura', 'fracture', 'queimadura', 'burn', 'hospitalização', 'hospital', 'grave', 'serious'],
  fatality: ['óbito', 'death', 'fatal', 'mortal', 'falecimento'],
  environmental_spill: ['derramamento', 'spill', 'vazamento', 'leak', 'poluição', 'pollution', 'óleo', 'oil'],
  equipment_damage: ['dano', 'damage', 'quebra', 'break', 'falha', 'failure', 'avaria'],
  security_breach: ['segurança', 'security', 'invasão', 'intrusion', 'roubo', 'theft', 'pirataria', 'piracy'],
  navigation_incident: ['navegação', 'navigation', 'colisão', 'collision', 'encalhe', 'grounding'],
  fire_explosion: ['incêndio', 'fire', 'explosão', 'explosion', 'fogo', 'chamas', 'flames'],
  collision: ['colisão', 'collision', 'abalroamento', 'choque', 'impacto'],
  grounding: ['encalhe', 'grounding', 'encalhado', 'aground', 'toque no fundo'],
  cargo_damage: ['carga danificada', 'cargo damage', 'avaria de carga', 'perda de carga'],
  occupational_illness: ['doença ocupacional', 'illness', 'mal estar', 'intoxicação'],
  unsafe_condition: ['condição insegura', 'unsafe condition', 'risco', 'hazard', 'perigo'],
  unsafe_act: ['ato inseguro', 'unsafe act', 'negligência', 'imprudência', 'violação']
};

const SEVERITY_KEYWORDS = {
  critical: ['morte', 'fatal', 'explosão', 'incêndio', 'derramamento grande', 'hospitalização', 'amputação'],
  high: ['fratura', 'queimadura grave', 'vazamento', 'colisão', 'encalhe', 'lesão séria'],
  medium: ['ferimento', 'dano equipamento', 'near miss sério', 'contaminação'],
  low: ['arranhão', 'contusão leve', 'near miss', 'observação', 'condição']
};

const COMPLIANCE_REGULATIONS: Record<string, { regulation: string; categories: IncidentCategory[]; deadline_days: number }[]> = {
  imo: [
    { regulation: 'SOLAS', categories: ['fire_explosion', 'collision', 'grounding', 'fatality'], deadline_days: 3 },
    { regulation: 'MARPOL', categories: ['environmental_spill'], deadline_days: 1 },
    { regulation: 'ISM Code', categories: ['near_miss', 'unsafe_condition', 'unsafe_act'], deadline_days: 14 }
  ],
  flag_state: [
    { regulation: 'Flag State Reporting', categories: ['fatality', 'major_injury', 'collision'], deadline_days: 24 }
  ],
  port_state: [
    { regulation: 'Port State Control', categories: ['environmental_spill', 'security_breach'], deadline_days: 48 }
  ]
};

class IncidentClassifierEngine {
  /**
   * Classify an incident using NLP
   */
  classifyIncident(
    incident: RawIncident,
    historicalIncidents: RawIncident[] = []
  ): ClassifiedIncident {
    const text = incident.description.toLowerCase();
    
    // Classify incident
    const classification = this.performClassification(text);
    
    // Assess severity
    const severity = this.assessSeverity(text, classification);
    
    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(classification, severity);
    
    // Find similar incidents
    const similarIncidents = this.findSimilarIncidents(incident, historicalIncidents);
    
    // Check compliance implications
    const complianceImplications = this.checkComplianceImplications(classification);
    
    // Determine if auto-escalation needed
    const autoEscalation = this.evaluateAutoEscalation(classification, severity);

    return {
      id: incident.id,
      original_description: incident.description,
      classification,
      severity,
      suggested_actions: suggestedActions,
      similar_incidents: similarIncidents,
      compliance_implications: complianceImplications,
      auto_escalation: autoEscalation
    };
  }

  /**
   * Batch classify multiple incidents
   */
  batchClassify(
    incidents: RawIncident[],
    historicalIncidents: RawIncident[] = []
  ): ClassifiedIncident[] {
    return incidents.map(inc => this.classifyIncident(inc, historicalIncidents));
  }

  /**
   * Get classification statistics
   */
  getClassificationStats(
    classifiedIncidents: ClassifiedIncident[]
  ): {
    by_category: Record<IncidentCategory, number>;
    by_severity: Record<string, number>;
    escalation_rate: number;
    avg_confidence: number;
  } {
    const byCategory: Partial<Record<IncidentCategory, number>> = {};
    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    let escalations = 0;
    let totalConfidence = 0;

    classifiedIncidents.forEach(inc => {
      // Count by category
      const cat = inc.classification.primary_category;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      
      // Count by severity
      bySeverity[inc.severity.level]++;
      
      // Count escalations
      if (inc.auto_escalation?.triggered) escalations++;
      
      // Sum confidence
      totalConfidence += inc.classification.confidence;
    });

    return {
      by_category: byCategory as Record<IncidentCategory, number>,
      by_severity: bySeverity,
      escalation_rate: classifiedIncidents.length > 0 
        ? escalations / classifiedIncidents.length 
        : 0,
      avg_confidence: classifiedIncidents.length > 0 
        ? totalConfidence / classifiedIncidents.length 
        : 0
    };
  }

  private performClassification(text: string): IncidentClassification {
    const scores: Partial<Record<IncidentCategory, { score: number; keywords: string[] }>> = {};
    
    // Score each category based on keyword matches
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matchedKeywords = keywords.filter(kw => text.includes(kw.toLowerCase()));
      if (matchedKeywords.length > 0) {
        scores[category as IncidentCategory] = {
          score: matchedKeywords.length * 10 + (matchedKeywords.some(k => k.length > 5) ? 5 : 0),
          keywords: matchedKeywords
        };
      }
    }

    // Sort by score and get top categories
    const sortedCategories = Object.entries(scores)
      .sort(([, a], [, b]) => b.score - a.score);

    const primaryCategory = sortedCategories[0]?.[0] as IncidentCategory || 'unsafe_condition';
    const secondaryCategories = sortedCategories
      .slice(1, 3)
      .map(([cat]) => cat as IncidentCategory);

    const allKeywords = Object.values(scores).flatMap(s => s.keywords);
    const maxScore = sortedCategories[0]?.[1].score || 0;
    const confidence = Math.min(0.95, 0.5 + maxScore * 0.03);

    return {
      primary_category: primaryCategory,
      secondary_categories: secondaryCategories,
      confidence,
      keywords_detected: [...new Set(allKeywords)],
      classification_reasoning: this.generateReasoning(primaryCategory, allKeywords)
    };
  }

  private assessSeverity(text: string, classification: IncidentClassification): SeverityAssessment {
    const factors: SeverityFactor[] = [];
    let totalScore = 0;

    // Check severity keywords
    for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
      const matched = keywords.filter(kw => text.includes(kw.toLowerCase()));
      if (matched.length > 0) {
        const weight = level === 'critical' ? 40 : level === 'high' ? 30 : level === 'medium' ? 20 : 10;
        const contribution = matched.length * weight;
        totalScore += contribution;
        
        factors.push({
          factor: `Palavras-chave de severidade ${level}`,
          weight,
          contribution,
          detected_indicators: matched
        });
      }
    }

    // Category-based severity adjustment
    const highSeverityCategories: IncidentCategory[] = ['fatality', 'fire_explosion', 'collision', 'environmental_spill'];
    if (highSeverityCategories.includes(classification.primary_category)) {
      factors.push({
        factor: 'Categoria de alto risco',
        weight: 25,
        contribution: 25,
        detected_indicators: [classification.primary_category]
      });
      totalScore += 25;
    }

    // Normalize score to 0-100
    totalScore = Math.min(100, totalScore);

    // Determine level
    let level: SeverityAssessment['level'];
    if (totalScore >= 75) level = 'critical';
    else if (totalScore >= 50) level = 'high';
    else if (totalScore >= 25) level = 'medium';
    else level = 'low';

    return {
      level,
      score: totalScore,
      factors,
      potential_consequences: this.getPotentialConsequences(classification.primary_category, level),
      escalation_required: level === 'critical' || level === 'high'
    };
  }

  private generateSuggestedActions(
    classification: IncidentClassification,
    severity: SeverityAssessment
  ): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    // Immediate actions based on severity
    if (severity.level === 'critical') {
      actions.push({
        action: 'Acionar equipe de resposta a emergências',
        priority: 'immediate',
        responsible_role: 'Master/DPA',
        deadline_hours: 1,
        resources_needed: ['Equipe de emergência', 'Comunicações']
      });
      actions.push({
        action: 'Notificar autoridades competentes',
        priority: 'immediate',
        responsible_role: 'DPA',
        deadline_hours: 2,
        resources_needed: ['Contatos regulatórios']
      });
    }

    if (severity.level === 'high' || severity.level === 'critical') {
      actions.push({
        action: 'Isolar área do incidente e preservar evidências',
        priority: 'immediate',
        responsible_role: 'Safety Officer',
        deadline_hours: 4,
        resources_needed: ['Sinalização', 'Câmera/Fotos']
      });
    }

    // Category-specific actions
    switch (classification.primary_category) {
      case 'environmental_spill':
        actions.push({
          action: 'Implementar plano SOPEP',
          priority: 'immediate',
          responsible_role: 'Chief Officer',
          deadline_hours: 1,
          resources_needed: ['Kit SOPEP', 'Equipamento de contenção']
        });
        break;
      case 'fire_explosion':
        actions.push({
          action: 'Verificar sistemas de combate a incêndio',
          priority: 'immediate',
          responsible_role: 'Chief Engineer',
          deadline_hours: 2,
          resources_needed: ['Equipe de combate a incêndio']
        });
        break;
      case 'minor_injury':
      case 'major_injury':
        actions.push({
          action: 'Providenciar atendimento médico',
          priority: 'immediate',
          responsible_role: 'Medical Officer',
          deadline_hours: 1,
          resources_needed: ['Kit médico', 'Telemedicina']
        });
        break;
    }

    // Standard follow-up actions
    actions.push({
      action: 'Iniciar investigação de incidente',
      priority: 'short_term',
      responsible_role: 'Safety Officer',
      deadline_hours: 24,
      resources_needed: ['Formulário de investigação', 'Entrevistas']
    });

    actions.push({
      action: 'Registrar incidente no sistema QHSE',
      priority: 'short_term',
      responsible_role: 'Safety Officer',
      deadline_hours: 12,
      resources_needed: ['Sistema QHSE']
    });

    actions.push({
      action: 'Desenvolver ações corretivas e preventivas',
      priority: 'medium_term',
      responsible_role: 'DPA',
      deadline_hours: 168, // 7 days
      resources_needed: ['Análise de causa raiz']
    });

    return actions;
  }

  private findSimilarIncidents(
    incident: RawIncident,
    historical: RawIncident[]
  ): SimilarIncident[] {
    const incidentWords = new Set(
      incident.description.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    );

    return historical
      .map(hist => {
        const histWords = new Set(
          hist.description.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        );
        
        const intersection = [...incidentWords].filter(w => histWords.has(w));
        const similarity = intersection.length / Math.max(incidentWords.size, histWords.size);

        return {
          incident_id: hist.id,
          description: hist.description.slice(0, 100) + '...',
          date: hist.reported_at,
          similarity_score: similarity,
          outcome: 'Resolvido', // Placeholder
          lessons_learned: similarity > 0.3 ? ['Verificar procedimentos similares'] : []
        };
      })
      .filter(s => s.similarity_score > 0.2)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 5);
  }

  private checkComplianceImplications(
    classification: IncidentClassification
  ): ComplianceImplication[] {
    const implications: ComplianceImplication[] = [];
    const category = classification.primary_category;

    for (const [authority, regulations] of Object.entries(COMPLIANCE_REGULATIONS)) {
      for (const reg of regulations) {
        if (reg.categories.includes(category)) {
          implications.push({
            regulation: `${reg.regulation} (${authority.toUpperCase()})`,
            requirement: `Notificação obrigatória para ${category}`,
            implication: `Incidente deve ser reportado conforme ${reg.regulation}`,
            reporting_required: true,
            deadline_days: reg.deadline_days
          });
        }
      }
    }

    // Add ISM Code implication for all incidents
    if (implications.length === 0) {
      implications.push({
        regulation: 'ISM Code',
        requirement: 'Registro de incidente',
        implication: 'Documentar no sistema de gestão de segurança',
        reporting_required: false,
        deadline_days: 14
      });
    }

    return implications;
  }

  private evaluateAutoEscalation(
    classification: IncidentClassification,
    severity: SeverityAssessment
  ): AutoEscalation | null {
    const criticalCategories: IncidentCategory[] = [
      'fatality', 'major_injury', 'fire_explosion', 'collision', 
      'grounding', 'environmental_spill', 'security_breach'
    ];

    const shouldEscalate = 
      severity.level === 'critical' ||
      criticalCategories.includes(classification.primary_category);

    if (!shouldEscalate) return null;

    const escalatedTo: string[] = ['DPA'];
    
    if (severity.level === 'critical') {
      escalatedTo.push('Managing Director', 'Legal Department');
    }
    
    if (classification.primary_category === 'environmental_spill') {
      escalatedTo.push('Environmental Officer');
    }

    return {
      triggered: true,
      reason: `${classification.primary_category} com severidade ${severity.level}`,
      escalated_to: escalatedTo,
      notification_sent_at: new Date().toISOString()
    };
  }

  private generateReasoning(category: IncidentCategory, keywords: string[]): string {
    const categoryNames: Record<IncidentCategory, string> = {
      near_miss: 'Quase-acidente',
      minor_injury: 'Lesão leve',
      major_injury: 'Lesão grave',
      fatality: 'Fatalidade',
      environmental_spill: 'Derramamento ambiental',
      equipment_damage: 'Dano a equipamento',
      security_breach: 'Violação de segurança',
      navigation_incident: 'Incidente de navegação',
      fire_explosion: 'Incêndio/Explosão',
      collision: 'Colisão',
      grounding: 'Encalhe',
      cargo_damage: 'Dano à carga',
      occupational_illness: 'Doença ocupacional',
      unsafe_condition: 'Condição insegura',
      unsafe_act: 'Ato inseguro'
    };

    return `Classificado como "${categoryNames[category]}" com base nas palavras-chave detectadas: ${keywords.slice(0, 5).join(', ')}`;
  }

  private getPotentialConsequences(category: IncidentCategory, severity: string): string[] {
    const consequences: string[] = [];

    switch (category) {
      case 'fatality':
        consequences.push('Investigação de autoridades', 'Detenção de embarcação', 'Processos legais');
        break;
      case 'major_injury':
        consequences.push('Afastamento do tripulante', 'Investigação trabalhista', 'Custos médicos');
        break;
      case 'environmental_spill':
        consequences.push('Multas ambientais', 'Danos à reputação', 'Custos de remediação');
        break;
      case 'fire_explosion':
        consequences.push('Danos estruturais', 'Lesões múltiplas', 'Perda de carga');
        break;
      case 'collision':
      case 'grounding':
        consequences.push('Danos ao casco', 'Custos de reparo', 'Atraso operacional');
        break;
      default:
        consequences.push('Impacto operacional', 'Necessidade de correções');
    }

    if (severity === 'critical' || severity === 'high') {
      consequences.push('Notificação regulatória obrigatória');
    }

    return consequences;
  }
}

export const incidentClassifierEngine = new IncidentClassifierEngine();
