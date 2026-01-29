/**
 * AI Document Assistant Engine
 * Intelligent document analysis, summarization, and Q&A
 * PATCH 865 - All-in-One EDMS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  documentName: string;
  analysisType: AnalysisType;
  results: AnalysisResult;
  confidence: number;
  processingTime: number;
  analyzedAt: Date;
  analyzedBy: string;
}

export type AnalysisType = 
  | "summary"
  | "classification"
  | "entity_extraction"
  | "compliance_check"
  | "risk_assessment"
  | "comparison"
  | "translation"
  | "qa";

export interface AnalysisResult {
  summary?: DocumentSummary;
  classification?: DocumentClassification;
  entities?: ExtractedEntity[];
  compliance?: ComplianceResult;
  risks?: RiskAssessment[];
  comparison?: ComparisonResult;
  translation?: TranslationResult;
  qa?: QAResult;
}

export interface DocumentSummary {
  executive: string;
  detailed: string;
  keyPoints: string[];
  actionItems: string[];
  wordCount: number;
  readingTime: number;
}

export interface DocumentClassification {
  primaryCategory: string;
  subcategories: string[];
  documentType: string;
  department: string;
  confidentiality: "public" | "internal" | "confidential" | "restricted";
  regulatoryRelevance: string[];
  tags: string[];
  confidence: number;
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  context: string;
  position: { start: number; end: number };
  confidence: number;
  normalized?: string;
}

export type EntityType = 
  | "person"
  | "organization"
  | "vessel"
  | "port"
  | "date"
  | "money"
  | "regulation"
  | "certificate"
  | "imo_number"
  | "mmsi"
  | "coordinates"
  | "email"
  | "phone";

export interface ComplianceResult {
  overallStatus: "compliant" | "non_compliant" | "needs_review";
  score: number;
  regulations: RegulationCheck[];
  missingElements: string[];
  recommendations: string[];
}

export interface RegulationCheck {
  regulation: string;
  requirement: string;
  status: "met" | "not_met" | "partial" | "not_applicable";
  evidence?: string;
  gap?: string;
}

export interface RiskAssessment {
  riskId: string;
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  likelihood: "rare" | "unlikely" | "possible" | "likely" | "almost_certain";
  impact: string;
  mitigation: string;
  owner?: string;
}

export interface ComparisonResult {
  documentA: string;
  documentB: string;
  similarity: number;
  differences: DocumentDifference[];
  addedSections: string[];
  removedSections: string[];
  modifiedSections: string[];
}

export interface DocumentDifference {
  section: string;
  type: "added" | "removed" | "modified";
  originalText?: string;
  newText?: string;
  significance: "minor" | "moderate" | "major";
}

export interface TranslationResult {
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  preservedFormatting: boolean;
  technicalTermsGlossary: Record<string, string>;
}

export interface QAResult {
  question: string;
  answer: string;
  confidence: number;
  sources: QASource[];
  relatedQuestions: string[];
}

export interface QASource {
  documentId: string;
  documentName: string;
  excerpt: string;
  relevance: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    documentId?: string;
    analysisType?: AnalysisType;
    sources?: QASource[];
  };
}

// Maritime-specific entity patterns
const MARITIME_PATTERNS = {
  IMO_NUMBER: /\bIMO\s*(\d{7})\b/gi,
  MMSI: /\b(\d{9})\b/g,
  COORDINATES: /(\d{1,3}[°]\s*\d{1,2}[′']\s*\d{1,2}(?:\.\d+)?[″"]?\s*[NSEW])/gi,
  STCW_CODE: /\bSTCW\s*(?:Convention|Code)?\s*(?:Regulation|Standard)?\s*([A-Z]-?\d+(?:\.\d+)?(?:\.\d+)?)\b/gi,
  MLC_STANDARD: /\bMLC\s*(?:2006)?\s*(?:Standard|Guideline|Regulation)?\s*([A-Z]\d+(?:\.\d+)?)\b/gi,
  SOLAS_REG: /\bSOLAS\s*(?:Chapter)?\s*([IVX]+(?:-\d+)?(?:\/\d+)?)\b/gi,
  MARPOL_ANNEX: /\bMARPOL\s*(?:Annex)?\s*([IVX]+)\b/gi
};

// Maritime vocabulary for classification
const MARITIME_CATEGORIES: Record<string, string[]> = {
  navigation: ["voyage", "route", "waypoint", "chart", "ECDIS", "GPS", "radar", "AIS"],
  safety: ["drill", "emergency", "SOLAS", "LSA", "FFE", "muster", "lifeboat", "fire"],
  crew: ["seafarer", "manning", "MLC", "SEA", "contract", "wages", "rest hours"],
  cargo: ["stowage", "manifest", "B/L", "cargo plan", "dangerous goods", "IMDG"],
  machinery: ["engine", "maintenance", "PMS", "overhaul", "spare parts", "fuel"],
  environment: ["MARPOL", "ballast", "emissions", "garbage", "oil record", "SOPEP"],
  compliance: ["PSC", "ISM", "ISPS", "audit", "certification", "flag state"],
  training: ["STCW", "certificate", "course", "competency", "endorsement"]
};

class AIDocumentAssistantEngine {
  private analyses: Map<string, DocumentAnalysis> = new Map();
  private chatHistories: Map<string, ChatMessage[]> = new Map();

  /**
   * Analyze document and generate comprehensive insights
   */
  async analyzeDocument(
    documentId: string,
    documentName: string,
    content: string,
    analysisTypes: AnalysisType[],
    userId: string
  ): Promise<DocumentAnalysis> {
    const startTime = Date.now();

    const results: AnalysisResult = {};

    for (const type of analysisTypes) {
      switch (type) {
        case "summary":
          results.summary = await this.generateSummary(content);
          break;
        case "classification":
          results.classification = await this.classifyDocument(content);
          break;
        case "entity_extraction":
          results.entities = await this.extractEntities(content);
          break;
        case "compliance_check":
          results.compliance = await this.checkCompliance(content);
          break;
        case "risk_assessment":
          results.risks = await this.assessRisks(content);
          break;
      }
    }

    const processingTime = Date.now() - startTime;

    const analysis: DocumentAnalysis = {
      id: `analysis-${Date.now()}`,
      documentId,
      documentName,
      analysisType: analysisTypes[0],
      results,
      confidence: this.calculateOverallConfidence(results),
      processingTime,
      analyzedAt: new Date(),
      analyzedBy: userId
    };

    this.analyses.set(analysis.id, analysis);

    // Log analysis
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Document analysis: ${documentName}`,
        module_name: "ai_document_assistant",
        interaction_type: "document_analysis",
        ai_response: JSON.stringify({
          analysisId: analysis.id,
          types: analysisTypes,
          confidence: analysis.confidence
        })
      });
    } catch (error) {
      logger.error("Error logging analysis", error as Error);
    }

    return analysis;
  }

  /**
   * Generate document summary
   */
  private async generateSummary(content: string): Promise<DocumentSummary> {
    const words = content.split(/\s+/);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    // Extract key sentences (simplified algorithm)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = sentences.slice(0, 5).map(s => s.trim());

    // Find action items (sentences with action verbs)
    const actionVerbs = ["must", "shall", "should", "require", "ensure", "verify", "complete", "submit"];
    const actionItems = sentences
      .filter(s => actionVerbs.some(v => s.toLowerCase().includes(v)))
      .slice(0, 5)
      .map(s => s.trim());

    return {
      executive: keyPoints.slice(0, 2).join(". ") + ".",
      detailed: sentences.slice(0, 10).join(". ") + ".",
      keyPoints,
      actionItems,
      wordCount,
      readingTime
    };
  }

  /**
   * Classify document using maritime vocabulary
   */
  private async classifyDocument(content: string): Promise<DocumentClassification> {
    const lowerContent = content.toLowerCase();
    const categoryScores: Record<string, number> = {};

    // Score each category based on keyword matches
    for (const [category, keywords] of Object.entries(MARITIME_CATEGORIES)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = content.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      categoryScores[category] = score;
    }

    // Find primary category
    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a);
    
    const primaryCategory = sortedCategories[0]?.[0] || "general";
    const subcategories = sortedCategories
      .slice(1, 4)
      .filter(([, score]) => score > 0)
      .map(([cat]) => cat);

    // Detect document type
    let documentType = "general";
    if (lowerContent.includes("contract") || lowerContent.includes("agreement")) {
      documentType = "contract";
    } else if (lowerContent.includes("checklist")) {
      documentType = "checklist";
    } else if (lowerContent.includes("report") || lowerContent.includes("incident")) {
      documentType = "report";
    } else if (lowerContent.includes("certificate") || lowerContent.includes("certification")) {
      documentType = "certificate";
    } else if (lowerContent.includes("procedure") || lowerContent.includes("manual")) {
      documentType = "procedure";
    }

    // Detect regulatory relevance
    const regulatoryRelevance: string[] = [];
    if (MARITIME_PATTERNS.STCW_CODE.test(content)) regulatoryRelevance.push("STCW");
    if (MARITIME_PATTERNS.MLC_STANDARD.test(content)) regulatoryRelevance.push("MLC 2006");
    if (MARITIME_PATTERNS.SOLAS_REG.test(content)) regulatoryRelevance.push("SOLAS");
    if (MARITIME_PATTERNS.MARPOL_ANNEX.test(content)) regulatoryRelevance.push("MARPOL");
    if (lowerContent.includes("ism code")) regulatoryRelevance.push("ISM Code");
    if (lowerContent.includes("isps")) regulatoryRelevance.push("ISPS Code");

    // Determine confidentiality
    let confidentiality: "public" | "internal" | "confidential" | "restricted" = "internal";
    if (lowerContent.includes("confidential") || lowerContent.includes("restricted")) {
      confidentiality = "confidential";
    } else if (lowerContent.includes("secret") || lowerContent.includes("classified")) {
      confidentiality = "restricted";
    } else if (lowerContent.includes("public")) {
      confidentiality = "public";
    }

    return {
      primaryCategory,
      subcategories,
      documentType,
      department: this.inferDepartment(primaryCategory),
      confidentiality,
      regulatoryRelevance,
      tags: [...subcategories, ...regulatoryRelevance],
      confidence: Math.min(0.95, 0.5 + (sortedCategories[0]?.[1] || 0) * 0.05)
    };
  }

  /**
   * Extract entities from document
   */
  private async extractEntities(content: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    // Extract IMO numbers
    let match;
    const imoRegex = new RegExp(MARITIME_PATTERNS.IMO_NUMBER);
    while ((match = imoRegex.exec(content)) !== null) {
      entities.push({
        type: "imo_number",
        value: match[0],
        context: content.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
        position: { start: match.index, end: match.index + match[0].length },
        confidence: 0.95,
        normalized: `IMO ${match[1]}`
      });
    }

    // Extract dates
    const dateRegex = /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;
    while ((match = dateRegex.exec(content)) !== null) {
      entities.push({
        type: "date",
        value: match[0],
        context: content.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
        position: { start: match.index, end: match.index + match[0].length },
        confidence: 0.9
      });
    }

    // Extract coordinates
    const coordRegex = new RegExp(MARITIME_PATTERNS.COORDINATES);
    while ((match = coordRegex.exec(content)) !== null) {
      entities.push({
        type: "coordinates",
        value: match[0],
        context: content.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
        position: { start: match.index, end: match.index + match[0].length },
        confidence: 0.85
      });
    }

    // Extract money values
    const moneyRegex = /\b(USD|EUR|GBP|JPY)?\s*[$€£¥]?\s*[\d,]+(?:\.\d{2})?\s*(USD|EUR|GBP|JPY|dollars?|euros?|pounds?)?\b/gi;
    while ((match = moneyRegex.exec(content)) !== null) {
      if (match[0].match(/\d/)) {
        entities.push({
          type: "money",
          value: match[0].trim(),
          context: content.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
          position: { start: match.index, end: match.index + match[0].length },
          confidence: 0.85
        });
      }
    }

    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    while ((match = emailRegex.exec(content)) !== null) {
      entities.push({
        type: "email",
        value: match[0],
        context: content.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
        position: { start: match.index, end: match.index + match[0].length },
        confidence: 0.98
      });
    }

    // Extract regulation references
    const regulationPatterns = [
      { pattern: MARITIME_PATTERNS.STCW_CODE, type: "regulation" as EntityType, prefix: "STCW" },
      { pattern: MARITIME_PATTERNS.MLC_STANDARD, type: "regulation" as EntityType, prefix: "MLC" },
      { pattern: MARITIME_PATTERNS.SOLAS_REG, type: "regulation" as EntityType, prefix: "SOLAS" }
    ];

    for (const { pattern, type, prefix } of regulationPatterns) {
      const regex = new RegExp(pattern);
      while ((match = regex.exec(content)) !== null) {
        entities.push({
          type,
          value: match[0],
          context: content.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
          position: { start: match.index, end: match.index + match[0].length },
          confidence: 0.9,
          normalized: `${prefix} ${match[1]}`
        });
      }
    }

    return entities;
  }

  /**
   * Check document compliance
   */
  private async checkCompliance(content: string): Promise<ComplianceResult> {
    const regulations: RegulationCheck[] = [];
    const missingElements: string[] = [];
    const recommendations: string[] = [];

    // Check for common required elements
    const requiredElements = [
      { name: "Document Date", pattern: /\bdate[d]?:?\s*\d/i },
      { name: "Author/Prepared By", pattern: /\b(prepared by|author|created by):?\s*\w/i },
      { name: "Approval Signature", pattern: /\b(approved|approved by|signature):?\s*\w/i },
      { name: "Version Number", pattern: /\b(version|rev|revision):?\s*[\d.]/i },
      { name: "Reference Number", pattern: /\b(ref|reference|doc[ument]?\s*no):?\s*\w/i }
    ];

    let metCount = 0;
    for (const element of requiredElements) {
      const met = element.pattern.test(content);
      if (met) metCount++;
      else missingElements.push(element.name);

      regulations.push({
        regulation: "Document Control",
        requirement: element.name,
        status: met ? "met" : "not_met",
        evidence: met ? "Found in document" : undefined,
        gap: met ? undefined : `Missing ${element.name}`
      });
    }

    // Calculate score
    const score = (metCount / requiredElements.length) * 100;

    // Generate recommendations
    if (missingElements.length > 0) {
      recommendations.push(`Add missing elements: ${missingElements.join(", ")}`);
    }
    if (score < 80) {
      recommendations.push("Consider using a standardized template for better compliance");
    }

    return {
      overallStatus: score >= 80 ? "compliant" : score >= 50 ? "needs_review" : "non_compliant",
      score,
      regulations,
      missingElements,
      recommendations
    };
  }

  /**
   * Assess document risks
   */
  private async assessRisks(content: string): Promise<RiskAssessment[]> {
    const risks: RiskAssessment[] = [];
    const lowerContent = content.toLowerCase();

    // Check for risk indicators
    const riskIndicators = [
      {
        category: "Regulatory",
        keywords: ["non-compliance", "deficiency", "violation", "penalty"],
        severity: "high" as const
      },
      {
        category: "Safety",
        keywords: ["incident", "accident", "injury", "hazard", "danger"],
        severity: "critical" as const
      },
      {
        category: "Operational",
        keywords: ["delay", "failure", "breakdown", "malfunction"],
        severity: "medium" as const
      },
      {
        category: "Financial",
        keywords: ["overdue", "unpaid", "penalty", "fine", "claim"],
        severity: "high" as const
      }
    ];

    for (const indicator of riskIndicators) {
      for (const keyword of indicator.keywords) {
        if (lowerContent.includes(keyword)) {
          const context = this.extractContext(content, keyword);
          risks.push({
            riskId: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            category: indicator.category,
            description: `Document contains reference to "${keyword}"`,
            severity: indicator.severity,
            likelihood: "possible",
            impact: `Potential ${indicator.category.toLowerCase()} impact`,
            mitigation: `Review and address "${keyword}" reference`
          });
          break; // One risk per category
        }
      }
    }

    return risks;
  }

  /**
   * Answer questions about document
   */
  async askQuestion(
    documentId: string,
    documentName: string,
    content: string,
    question: string,
    userId: string
  ): Promise<QAResult> {
    // Simple Q&A implementation
    // In production, use semantic search and LLM
    
    const lowerQuestion = question.toLowerCase();
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Find relevant sentences
    const questionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 3);
    const scoredSentences = sentences.map(sentence => {
      const lowerSentence = sentence.toLowerCase();
      let score = 0;
      for (const word of questionWords) {
        if (lowerSentence.includes(word)) score++;
      }
      return { sentence, score };
    });

    scoredSentences.sort((a, b) => b.score - a.score);
    const topSentences = scoredSentences.slice(0, 3);

    const answer = topSentences.length > 0 && topSentences[0].score > 0
      ? topSentences.map(s => s.sentence.trim()).join(". ") + "."
      : "I couldn't find a direct answer to your question in this document. Please try rephrasing or ask a different question.";

    const confidence = topSentences[0]?.score 
      ? Math.min(0.95, topSentences[0].score / questionWords.length)
      : 0.3;

    // Store in chat history
    const chatId = `${documentId}-${userId}`;
    const history = this.chatHistories.get(chatId) || [];
    history.push(
      { id: `msg-${Date.now()}-1`, role: "user", content: question, timestamp: new Date() },
      { id: `msg-${Date.now()}-2`, role: "assistant", content: answer, timestamp: new Date(), metadata: { documentId } }
    );
    this.chatHistories.set(chatId, history);

    return {
      question,
      answer,
      confidence,
      sources: [{
        documentId,
        documentName,
        excerpt: topSentences[0]?.sentence.trim() || "",
        relevance: confidence
      }],
      relatedQuestions: this.generateRelatedQuestions(content, question)
    };
  }

  /**
   * Compare two documents
   */
  async compareDocuments(
    docAId: string,
    docAContent: string,
    docBId: string,
    docBContent: string
  ): Promise<ComparisonResult> {
    const sentencesA = docAContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s);
    const sentencesB = docBContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s);

    const setA = new Set(sentencesA);
    const setB = new Set(sentencesB);

    const addedSections = sentencesB.filter(s => !setA.has(s));
    const removedSections = sentencesA.filter(s => !setB.has(s));
    const commonSections = sentencesA.filter(s => setB.has(s));

    const similarity = commonSections.length / Math.max(sentencesA.length, sentencesB.length) * 100;

    const differences: DocumentDifference[] = [
      ...addedSections.map(s => ({
        section: s.substring(0, 50) + "...",
        type: "added" as const,
        newText: s,
        significance: "moderate" as const
      })),
      ...removedSections.map(s => ({
        section: s.substring(0, 50) + "...",
        type: "removed" as const,
        originalText: s,
        significance: "moderate" as const
      }))
    ];

    return {
      documentA: docAId,
      documentB: docBId,
      similarity,
      differences,
      addedSections: addedSections.slice(0, 10),
      removedSections: removedSections.slice(0, 10),
      modifiedSections: []
    };
  }

  /**
   * Get chat history for document
   */
  getChatHistory(documentId: string, userId: string): ChatMessage[] {
    return this.chatHistories.get(`${documentId}-${userId}`) || [];
  }

  /**
   * Clear chat history
   */
  clearChatHistory(documentId: string, userId: string): void {
    this.chatHistories.delete(`${documentId}-${userId}`);
  }

  /**
   * Get analysis by ID
   */
  getAnalysis(analysisId: string): DocumentAnalysis | undefined {
    return this.analyses.get(analysisId);
  }

  // Helper methods
  private inferDepartment(category: string): string {
    const departmentMap: Record<string, string> = {
      navigation: "Navigation",
      safety: "Safety & Quality",
      crew: "Human Resources",
      cargo: "Operations",
      machinery: "Technical",
      environment: "Environmental",
      compliance: "Compliance",
      training: "Training"
    };
    return departmentMap[category] || "General";
  }

  private extractContext(content: string, keyword: string): string {
    const index = content.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return "";
    return content.substring(Math.max(0, index - 50), Math.min(content.length, index + keyword.length + 50));
  }

  private calculateOverallConfidence(results: AnalysisResult): number {
    const confidences: number[] = [];
    if (results.classification) confidences.push(results.classification.confidence);
    if (results.entities) confidences.push(Math.min(0.95, 0.7 + results.entities.length * 0.01));
    if (results.compliance) confidences.push(results.compliance.score / 100);
    return confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0.5;
  }

  private generateRelatedQuestions(content: string, originalQuestion: string): string[] {
    const questions: string[] = [];
    
    // Extract potential question topics from content
    if (content.toLowerCase().includes("certificate")) {
      questions.push("When do the certificates expire?");
    }
    if (content.toLowerCase().includes("training")) {
      questions.push("What training is required?");
    }
    if (content.toLowerCase().includes("safety")) {
      questions.push("What are the safety requirements?");
    }
    if (content.toLowerCase().includes("compliance")) {
      questions.push("What is the compliance status?");
    }

    return questions.slice(0, 3);
  }
}

export const aiDocumentAssistantEngine = new AIDocumentAssistantEngine();
