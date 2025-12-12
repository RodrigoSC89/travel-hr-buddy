/**
 * PATCH 354: Advanced NLP Service for Document Analysis
 * Entity extraction, classification, and summarization
 */

import { logger } from "@/lib/logger";

export interface EntityExtraction {
  type: string;
  value: string;
  confidence: number;
  position?: {
    start: number;
    end: number;
  };
}

export interface DateExtraction {
  date: string;
  format: string;
  context: string;
}

export interface KeywordExtraction {
  keyword: string;
  frequency: number;
  relevance: number;
}

export interface NLPAnalysisResult {
  classification: string;
  entities: EntityExtraction[];
  dates: DateExtraction[];
  keywords: KeywordExtraction[];
  summary: string;
  language: string;
  confidence: number;
}

export class NLPService {
  // Email pattern
  private emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  
  // Phone patterns (international)
  private phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g;
  
  // Currency amounts
  private currencyRegex = /(?:R\$|US\$|\$|€|£)\s*[\d,]+\.?\d*/g;
  
  // Date patterns
  private dateRegex = /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi;
  
  // ID/Document numbers
  private documentNumberRegex = /\b(?:CPF|CNPJ|RG|ID|NO|NUM|#)\s*[:.]?\s*[\d\.\-\/]+\b/gi;

  /**
   * Analyze text and extract entities
   */
  async analyzeText(text: string): Promise<NLPAnalysisResult> {
    try {
      const startTime = Date.now();

      // Extract entities
      const entities = this.extractEntities(text);
      
      // Extract dates
      const dates = this.extractDates(text);
      
      // Extract keywords
      const keywords = this.extractKeywords(text);
      
      // Classify document
      const classification = this.classifyDocument(text, entities);
      
      // Detect language
      const language = this.detectLanguage(text);
      
      // Generate summary
      const summary = this.generateSummary(text);
      
      // Calculate overall confidence
      const confidence = this.calculateConfidence(entities, classification);

      const processingTime = Date.now() - startTime;
      logger.info(`NLP analysis completed in ${processingTime}ms`);

      return {
        classification,
        entities,
        dates,
        keywords,
        summary,
        language,
        confidence
      });
    } catch (error) {
      logger.error("Error in NLP analysis:", error);
      throw error;
    }
  }

  /**
   * Extract named entities from text
   */
  private extractEntities(text: string): EntityExtraction[] {
    const entities: EntityExtraction[] = [];

    // Extract emails
    const emails = text.match(this.emailRegex) || [];
    emails.forEach(email => {
      entities.push({
        type: "email",
        value: email,
        confidence: 0.95
      });
    });

    // Extract phone numbers
    const phones = text.match(this.phoneRegex) || [];
    phones.forEach(phone => {
      if (phone.replace(/\D/g, "").length >= 8) {
        entities.push({
          type: "phone",
          value: phone.trim(),
          confidence: 0.85
        });
      }
    });

    // Extract currency amounts
    const amounts = text.match(this.currencyRegex) || [];
    amounts.forEach(amount => {
      entities.push({
        type: "amount",
        value: amount.trim(),
        confidence: 0.9
      });
    });

    // Extract document numbers
    const docNumbers = text.match(this.documentNumberRegex) || [];
    docNumbers.forEach(docNum => {
      entities.push({
        type: "document_number",
        value: docNum.trim(),
        confidence: 0.8
      });
    });

    // Extract organization names (simplified heuristic)
    const orgPatterns = [
      /\b(?:LTDA|S\.A\.|Inc\.|Corp\.|LLC|Ltd\.)\b/gi,
      /\b[A-Z][a-z]+\s+(?:Company|Corporation|Industries|Group|Holdings)\b/g
    ];
    
    orgPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(org => {
        entities.push({
          type: "organization",
          value: org.trim(),
          confidence: 0.7
        });
      });
    });

    // Extract person names (basic heuristic - capitalized words)
    const words = text.split(/\s+/);
    const capitalizedSequences: string[] = [];
    let currentSequence: string[] = [];
    
    words.forEach(word => {
      if (/^[A-Z][a-z]+$/.test(word) && word.length > 2) {
        currentSequence.push(word);
      } else {
        if (currentSequence.length >= 2) {
          capitalizedSequences.push(currentSequence.join(" "));
        }
        currentSequence = [];
      }
    });
    
    if (currentSequence.length >= 2) {
      capitalizedSequences.push(currentSequence.join(" "));
    }

    capitalizedSequences.forEach(name => {
      // Filter out common non-name sequences
      if (!name.match(/^(The|For|From|With|About)\s/)) {
        entities.push({
          type: "person",
          value: name,
          confidence: 0.6
        });
      }
    });

    return entities;
  }

  /**
   * Extract and parse dates from text
   */
  private extractDates(text: string): DateExtraction[] {
    const dates: DateExtraction[] = [];
    const dateMatches = text.match(this.dateRegex) || [];

    dateMatches.forEach(dateStr => {
      // Get context around the date (10 words before and after)
      const index = text.indexOf(dateStr);
      const contextStart = Math.max(0, index - 50);
      const contextEnd = Math.min(text.length, index + dateStr.length + 50);
      const context = text.substring(contextStart, contextEnd).trim();

      dates.push({
        date: dateStr,
        format: this.detectDateFormat(dateStr),
        context
      });
    });

    return dates;
  }

  /**
   * Detect date format
   */
  private detectDateFormat(dateStr: string): string {
    if (/\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(dateStr)) {
      return "YYYY-MM-DD";
    } else if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/.test(dateStr)) {
      return "DD-MM-YYYY";
    } else if (/\d{1,2}\s+[A-Za-z]+\s+\d{4}/.test(dateStr)) {
      return "DD Month YYYY";
    }
    return "unknown";
  }

  /**
   * Extract keywords and their frequencies
   */
  private extractKeywords(text: string): KeywordExtraction[] {
    // Remove common stop words
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
      "be", "have", "has", "had", "do", "does", "did", "will", "would",
      "should", "could", "may", "might", "must", "can", "this", "that",
      "these", "those", "i", "you", "he", "she", "it", "we", "they", "me",
      "him", "her", "us", "them", "o", "a", "e", "de", "da", "do", "para",
      "com", "em", "por", "um", "uma", "os", "as", "dos", "das"
    ]);

    // Tokenize and clean
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    // Count frequencies
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    // Calculate relevance scores (TF-IDF simplified)
    const keywords: KeywordExtraction[] = [];
    const maxFreq = Math.max(...Array.from(wordCounts.values()));

    wordCounts.forEach((frequency, keyword) => {
      const relevance = frequency / maxFreq;
      if (frequency > 1) { // Only include words that appear more than once
        keywords.push({
          keyword,
          frequency,
          relevance: Math.round(relevance * 100) / 100
        });
      }
    });

    // Sort by relevance and return top keywords
    return keywords
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);
  }

  /**
   * Classify document type based on content
   */
  private classifyDocument(text: string, entities: EntityExtraction[]): string {
    const lowerText = text.toLowerCase();

    // Contract indicators
    if (lowerText.includes("contrato") || lowerText.includes("contract") ||
        lowerText.includes("acordo") || lowerText.includes("agreement") ||
        (lowerText.includes("parte") && lowerText.includes("assinatura"))) {
      return "contract";
    }

    // Invoice indicators
    if (lowerText.includes("fatura") || lowerText.includes("invoice") ||
        lowerText.includes("nota fiscal") || lowerText.includes("boleto") ||
        entities.filter(e => e.type === "amount").length > 2) {
      return "invoice";
    }

    // Report indicators
    if (lowerText.includes("relatório") || lowerText.includes("report") ||
        lowerText.includes("análise") || lowerText.includes("analysis") ||
        lowerText.includes("resumo") || lowerText.includes("summary")) {
      return "report";
    }

    // Certificate indicators
    if (lowerText.includes("certificado") || lowerText.includes("certificate") ||
        lowerText.includes("diploma") || lowerText.includes("atestado")) {
      return "certificate";
    }

    // Letter indicators
    if (lowerText.includes("prezado") || lowerText.includes("dear") ||
        lowerText.includes("atenciosamente") || lowerText.includes("sincerely")) {
      return "letter";
    }

    // Form indicators
    if (lowerText.includes("formulário") || lowerText.includes("form") ||
        lowerText.includes("cadastro") || lowerText.includes("registration")) {
      return "form";
    }

    return "document";
  }

  /**
   * Detect document language
   */
  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const portugueseIndicators = ["de", "da", "do", "para", "com", "em", "por", "que", "não", "ser", "está"];
    const englishIndicators = ["the", "is", "at", "which", "on", "be", "are", "with", "for", "this"];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let portugueseScore = 0;
    let englishScore = 0;

    words.forEach(word => {
      if (portugueseIndicators.includes(word)) portugueseScore++;
      if (englishIndicators.includes(word)) englishScore++;
    });

    if (portugueseScore > englishScore) {
      return "por";
    } else if (englishScore > portugueseScore) {
      return "eng";
    }

    return "unknown";
  }

  /**
   * Generate a simple extractive summary
   */
  private generateSummary(text: string, maxSentences: number = 3): string {
    // Split into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    if (sentences.length === 0) {
      return text.substring(0, 200) + (text.length > 200 ? "..." : "");
    }

    if (sentences.length <= maxSentences) {
      return sentences.join(". ") + ".";
    }

    // Score sentences by length and position (first sentences are often more important)
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      score: sentence.length + (sentences.length - index) * 10
    }));

    // Sort by score and take top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    const topSentences = scoredSentences
      .slice(0, maxSentences)
      .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));

    return topSentences.map(s => s.sentence).join(". ") + ".";
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(entities: EntityExtraction[], classification: string): number {
    let confidence = 0.5; // Base confidence

    // More entities increase confidence
    confidence += Math.min(entities.length * 0.05, 0.3);

    // High-confidence entities increase overall confidence
    const avgEntityConfidence = entities.length > 0
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0;
    confidence += avgEntityConfidence * 0.2;

    // Specific classification (not 'document') increases confidence
    if (classification !== "document") {
      confidence += 0.1;
    }

    return Math.min(Math.round(confidence * 100) / 100, 1.0);
  }

  /**
   * Extract tables from text (simplified)
   */
  extractTables(text: string): any[] {
    const tables: any[] = [];
    
    // Look for patterns that indicate tables
    // This is a simplified implementation
    const lines = text.split("\n");
    let currentTable: string[] = [];
    let inTable = false;

    lines.forEach(line => {
      // Detect table-like patterns (multiple tabs or pipes)
      const hasTabs = (line.match(/\t/g) || []).length >= 2;
      const hasPipes = (line.match(/\|/g) || []).length >= 2;

      if (hasTabs || hasPipes) {
        inTable = true;
        currentTable.push(line);
      } else if (inTable && line.trim().length === 0) {
        if (currentTable.length > 0) {
          tables.push({
            raw: currentTable.join("\n"),
            rows: currentTable.length
          });
          currentTable = [];
        }
        inTable = false;
      } else if (inTable) {
        currentTable.push(line);
      }
    });

    if (currentTable.length > 0) {
      tables.push({
        raw: currentTable.join("\n"),
        rows: currentTable.length
      });
    }

    return tables;
  }

  /**
   * Extract highlights (important sentences)
   */
  extractHighlights(text: string, maxHighlights: number = 5): any[] {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30);

    // Score sentences for importance
    const highlights = sentences.map((sentence, index) => {
      let score = 0;

      // Contains numbers
      if (/\d+/.test(sentence)) score += 2;

      // Contains currency
      if (this.currencyRegex.test(sentence)) score += 3;

      // Contains dates
      if (this.dateRegex.test(sentence)) score += 2;

      // Contains capitalized words (names, places)
      const capitalWords = sentence.match(/\b[A-Z][a-z]+\b/g) || [];
      score += capitalWords.length;

      // Position (earlier sentences are often more important)
      score += Math.max(0, 5 - index);

      return {
        text: sentence,
        position: index,
        relevance: score / 10
      });
    });

    return highlights
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxHighlights);
  }
}

// Export singleton instance
export const nlpService = new NLPService();
