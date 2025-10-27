import Tesseract from 'tesseract.js';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentAnalysisResult {
  extractedText: string;
  confidence: number;
  language: string;
  entities: EntityExtraction[];
  dates: DateExtraction[];
  tables: TableExtraction[];
  highlights: TextHighlight[];
}

export interface EntityExtraction {
  type: string;
  value: string;
  confidence: number;
  position: { page: number; x: number; y: number };
}

export interface DateExtraction {
  date: string;
  format: string;
  confidence: number;
  context: string;
}

export interface TableExtraction {
  headers: string[];
  rows: string[][];
  position: { page: number; x: number; y: number };
  confidence: number;
}

export interface TextHighlight {
  text: string;
  page: number;
  position: { x: number; y: number; width: number; height: number };
  type: string;
  confidence: number;
}

export class AIDocumentService {
  /**
   * Perform OCR on an uploaded document
   */
  static async performOCR(fileUrl: string, fileType: string): Promise<{ text: string; confidence: number }> {
    try {
      // Check if file type is supported
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!supportedTypes.includes(fileType)) {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      const result = await Tesseract.recognize(fileUrl, 'eng', {
        logger: (m) => console.log(m),
      });

      return {
        text: result.data.text,
        confidence: result.data.confidence / 100, // Normalize to 0-1
      };
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to perform OCR on document');
    }
  }

  /**
   * Extract dates from text using regex patterns
   */
  static extractDates(text: string): DateExtraction[] {
    const dates: DateExtraction[] = [];
    
    // Common date patterns
    const patterns = [
      { regex: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, format: 'DD/MM/YYYY' },
      { regex: /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g, format: 'YYYY-MM-DD' },
      { regex: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi, format: 'Month DD, YYYY' },
    ];

    patterns.forEach(({ regex, format }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const startIndex = Math.max(0, match.index - 30);
        const endIndex = Math.min(text.length, match.index + match[0].length + 30);
        const context = text.substring(startIndex, endIndex).trim();

        dates.push({
          date: match[0],
          format,
          confidence: 0.85,
          context,
        });
      }
    });

    return dates;
  }

  /**
   * Extract entities (amounts, emails, phones, etc.)
   */
  static extractEntities(text: string): EntityExtraction[] {
    const entities: EntityExtraction[] = [];

    // Email pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        type: 'email',
        value: match[0],
        confidence: 0.95,
        position: { page: 1, x: 0, y: 0 },
      });
    }

    // Phone pattern
    const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.push({
        type: 'phone',
        value: match[0],
        confidence: 0.9,
        position: { page: 1, x: 0, y: 0 },
      });
    }

    // Currency amount pattern
    const amountRegex = /\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP)/g;
    while ((match = amountRegex.exec(text)) !== null) {
      entities.push({
        type: 'amount',
        value: match[0],
        confidence: 0.85,
        position: { page: 1, x: 0, y: 0 },
      });
    }

    return entities;
  }

  /**
   * Detect table structures in text (simplified)
   */
  static detectTables(text: string): TableExtraction[] {
    const tables: TableExtraction[] = [];
    
    // Simple table detection: lines with consistent separators
    const lines = text.split('\n');
    let currentTable: string[][] = [];
    let inTable = false;

    lines.forEach((line) => {
      const hasMultipleSeparators = (line.match(/\|/g) || []).length >= 2 ||
                                   (line.match(/\t/g) || []).length >= 2;

      if (hasMultipleSeparators) {
        const cells = line.split(/\||\\t/).map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 2) {
          currentTable.push(cells);
          inTable = true;
        }
      } else if (inTable && currentTable.length >= 2) {
        // End of table
        tables.push({
          headers: currentTable[0],
          rows: currentTable.slice(1),
          position: { page: 1, x: 0, y: 0 },
          confidence: 0.7,
        });
        currentTable = [];
        inTable = false;
      }
    });

    // Handle last table
    if (currentTable.length >= 2) {
      tables.push({
        headers: currentTable[0],
        rows: currentTable.slice(1),
        position: { page: 1, x: 0, y: 0 },
        confidence: 0.7,
      });
    }

    return tables;
  }

  /**
   * Classify document type based on content
   */
  static classifyDocument(text: string): { category: string; confidence: number } {
    const keywords = {
      invoice: ['invoice', 'bill', 'payment due', 'total amount', 'subtotal'],
      contract: ['agreement', 'party', 'terms and conditions', 'hereby', 'witness'],
      report: ['summary', 'analysis', 'findings', 'recommendations', 'conclusion'],
      certificate: ['certificate', 'certified', 'qualification', 'awarded', 'completion'],
      receipt: ['receipt', 'purchased', 'transaction', 'paid'],
    };

    const textLower = text.toLowerCase();
    let maxScore = 0;
    let category = 'other';

    Object.entries(keywords).forEach(([cat, words]) => {
      const score = words.filter(word => textLower.includes(word)).length;
      if (score > maxScore) {
        maxScore = score;
        category = cat;
      }
    });

    return {
      category,
      confidence: Math.min(maxScore / 3, 1), // Normalize
    };
  }

  /**
   * Generate highlights for important text sections
   */
  static generateHighlights(text: string, entities: EntityExtraction[]): TextHighlight[] {
    const highlights: TextHighlight[] = [];

    // Highlight entities
    entities.forEach((entity) => {
      const index = text.indexOf(entity.value);
      if (index !== -1) {
        highlights.push({
          text: entity.value,
          page: 1,
          position: { x: 0, y: 0, width: entity.value.length * 10, height: 20 },
          type: entity.type,
          confidence: entity.confidence,
        });
      }
    });

    // Highlight headers (lines in all caps or starting with number)
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.trim() && (line === line.toUpperCase() || /^\d+\./.test(line.trim()))) {
        highlights.push({
          text: line.trim(),
          page: 1,
          position: { x: 0, y: index * 20, width: line.length * 10, height: 20 },
          type: 'header',
          confidence: 0.8,
        });
      }
    });

    return highlights;
  }

  /**
   * Analyze document with full pipeline
   */
  static async analyzeDocument(documentId: string, fileUrl: string, fileType: string): Promise<DocumentAnalysisResult> {
    try {
      // Perform OCR
      const { text, confidence } = await this.performOCR(fileUrl, fileType);

      // Extract information
      const dates = this.extractDates(text);
      const entities = this.extractEntities(text);
      const tables = this.detectTables(text);
      const classification = this.classifyDocument(text);
      const highlights = this.generateHighlights(text, entities);

      // Save insights to database
      const { error } = await supabase.from('ai_document_insights').insert({
        document_id: documentId,
        analysis_type: 'ocr',
        status: 'completed',
        extracted_text: text,
        ocr_confidence: confidence,
        language_detected: 'en',
        document_category: classification.category,
        classification_confidence: classification.confidence,
        entities: entities,
        dates: dates,
        tables: tables,
        highlights: highlights,
        processing_completed_at: new Date().toISOString(),
        model_used: 'tesseract.js',
      });

      if (error) {
        console.error('Error saving insights:', error);
      }

      // Update search cache
      await supabase.rpc('update_document_search_cache', { p_document_id: documentId });

      return {
        extractedText: text,
        confidence,
        language: 'en',
        entities,
        dates,
        tables,
        highlights,
      };
    } catch (error) {
      console.error('Document analysis error:', error);
      
      // Save error to database
      await supabase.from('ai_document_insights').insert({
        document_id: documentId,
        analysis_type: 'ocr',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Queue document for analysis
   */
  static async queueForAnalysis(documentId: string, analysisTypes: string[] = ['ocr', 'classification']): Promise<string> {
    const { data, error } = await supabase.rpc('queue_document_for_analysis', {
      p_document_id: documentId,
      p_analysis_types: analysisTypes,
      p_priority: 5,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Search documents by content
   */
  static async searchDocuments(query: string, limit: number = 10) {
    const { data, error } = await supabase.rpc('search_documents_by_content', {
      p_search_query: query,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }
}
