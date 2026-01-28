/**
 * Smart OCR Engine - Computer Vision
 * Extração inteligente de dados de documentos marítimos
 */

export interface DocumentInput {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface OCRResult {
  documentId: string;
  extractedText: string;
  confidence: number;
  processingTime: number; // ms
  pages: PageResult[];
  classification: DocumentClassification;
  entities: ExtractedDocumentEntity[];
  structuredData: Record<string, any>;
  validationResults: ValidationResult[];
  suggestions: OCRSuggestion[];
}

export interface PageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  blocks: TextBlock[];
  tables: DetectedTable[];
}

export interface TextBlock {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  blockType: 'paragraph' | 'header' | 'list' | 'table_cell' | 'signature' | 'stamp';
}

export interface DetectedTable {
  rows: number;
  columns: number;
  cells: string[][];
  headerRow: string[];
  purpose: string;
}

export interface DocumentClassification {
  type: DocumentType;
  subtype: string;
  confidence: number;
  validityPeriod?: { start?: Date; end?: Date };
  issuingAuthority?: string;
}

export type DocumentType = 
  | 'certificate'
  | 'license'
  | 'permit'
  | 'contract'
  | 'invoice'
  | 'crew_document'
  | 'vessel_document'
  | 'inspection_report'
  | 'training_record'
  | 'medical_certificate'
  | 'other';

export interface ExtractedDocumentEntity {
  text: string;
  type: 'name' | 'date' | 'number' | 'organization' | 'location' | 'amount' | 'certificate_code' | 'vessel_name' | 'imo_number';
  confidence: number;
  normalized?: string; // Normalized value (e.g., date in ISO format)
  location: { page: number; block: number };
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface OCRSuggestion {
  type: 'correction' | 'completion' | 'validation';
  field: string;
  suggestion: string;
  confidence: number;
}

// Document patterns for classification
const DOCUMENT_PATTERNS: Record<DocumentType, string[]> = {
  certificate: ['certificado', 'certificate', 'diploma', 'competência', 'competency'],
  license: ['licença', 'license', 'habilitação', 'autorização'],
  permit: ['permissão', 'permit', 'autorização', 'authorization'],
  contract: ['contrato', 'contract', 'acordo', 'agreement', 'termo'],
  invoice: ['fatura', 'invoice', 'nota fiscal', 'cobrança'],
  crew_document: ['tripulante', 'seafarer', 'marítimo', 'cdc', 'seaman'],
  vessel_document: ['embarcação', 'vessel', 'navio', 'ship', 'registro'],
  inspection_report: ['inspeção', 'inspection', 'vistoria', 'survey', 'auditoria'],
  training_record: ['treinamento', 'training', 'curso', 'course', 'capacitação'],
  medical_certificate: ['médico', 'medical', 'saúde', 'health', 'aptidão'],
  other: []
};

// Common maritime certificate types
const CERTIFICATE_PATTERNS = {
  STCW: ['stcw', 'standards of training'],
  COC: ['coc', 'certificate of competency', 'certificado de competência'],
  GMDSS: ['gmdss', 'global maritime distress'],
  OOW: ['oow', 'officer of the watch', 'oficial de quarto'],
  SSO: ['sso', 'ship security officer'],
  ISM: ['ism', 'international safety management'],
  ISPS: ['isps', 'international ship and port'],
};

class SmartOCREngine {
  /**
   * Process document with OCR and extract structured data
   */
  async processDocument(input: DocumentInput): Promise<OCRResult> {
    const startTime = Date.now();
    
    // Simulate OCR processing (in production, use Tesseract.js or cloud OCR)
    const rawText = await this.performOCR(input);
    const pages = this.parsePages(rawText);
    
    // Classify document
    const classification = this.classifyDocument(rawText);
    
    // Extract entities
    const entities = this.extractEntities(rawText, pages);
    
    // Build structured data based on document type
    const structuredData = this.buildStructuredData(classification.type, entities, rawText);
    
    // Validate extracted data
    const validationResults = this.validateData(classification.type, structuredData);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(structuredData, validationResults);
    
    const processingTime = Date.now() - startTime;

    return {
      documentId: input.id,
      extractedText: rawText,
      confidence: this.calculateOverallConfidence(pages),
      processingTime,
      pages,
      classification,
      entities,
      structuredData,
      validationResults,
      suggestions
    };
  }

  /**
   * Batch process multiple documents
   */
  async processDocuments(inputs: DocumentInput[]): Promise<OCRResult[]> {
    return Promise.all(inputs.map(input => this.processDocument(input)));
  }

  /**
   * Extract specific certificate data
   */
  extractCertificateData(ocrResult: OCRResult): {
    certificateType: string;
    certificateNumber: string | null;
    holderName: string | null;
    issueDate: Date | null;
    expiryDate: Date | null;
    issuingAuthority: string | null;
    status: 'valid' | 'expired' | 'expiring_soon' | 'unknown';
  } {
    const data = ocrResult.structuredData;
    
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    let status: 'valid' | 'expired' | 'expiring_soon' | 'unknown' = 'unknown';
    
    if (expiryDate) {
      const now = new Date();
      const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry < 0) status = 'expired';
      else if (daysToExpiry < 90) status = 'expiring_soon';
      else status = 'valid';
    }

    return {
      certificateType: data.certificateType || ocrResult.classification.subtype || 'Unknown',
      certificateNumber: data.certificateNumber || null,
      holderName: data.holderName || null,
      issueDate: data.issueDate ? new Date(data.issueDate) : null,
      expiryDate,
      issuingAuthority: data.issuingAuthority || ocrResult.classification.issuingAuthority || null,
      status
    };
  }

  private async performOCR(input: DocumentInput): Promise<string> {
    // In production, this would use Tesseract.js or a cloud OCR service
    // For now, return simulated text based on document type
    return this.simulateOCROutput(input.fileName);
  }

  private simulateOCROutput(fileName: string): string {
    // Simulated OCR output for demo purposes
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('stcw') || lowerName.includes('certificate')) {
      return `
        CERTIFICATE OF COMPETENCY
        STCW CONVENTION
        
        Certificate No: BR-STCW-2024-78542
        
        This is to certify that
        JOÃO CARLOS DA SILVA
        
        Has been found duly qualified to serve as
        OFFICER IN CHARGE OF A NAVIGATIONAL WATCH
        
        On ships of 500 gross tonnage or more
        
        Date of Issue: 15/03/2024
        Date of Expiry: 15/03/2029
        
        Issued by: ANTAQ - Agência Nacional de Transportes Aquaviários
        
        [Official Stamp]
        [Signature]
      `;
    }
    
    return `Document content for ${fileName}`;
  }

  private parsePages(rawText: string): PageResult[] {
    // Simple single-page parsing
    const blocks: TextBlock[] = rawText.split('\n\n')
      .filter(text => text.trim())
      .map((text, index) => ({
        text: text.trim(),
        boundingBox: { x: 0, y: index * 50, width: 500, height: 40 },
        confidence: 0.85 + Math.random() * 0.1,
        blockType: this.detectBlockType(text) as TextBlock['blockType']
      }));

    return [{
      pageNumber: 1,
      text: rawText,
      confidence: 0.88,
      blocks,
      tables: []
    }];
  }

  private detectBlockType(text: string): string {
    const upper = text.toUpperCase();
    if (upper === text && text.length < 50) return 'header';
    if (text.includes('[Signature]') || text.includes('[Stamp]')) return 'signature';
    return 'paragraph';
  }

  private classifyDocument(text: string): DocumentClassification {
    const lowerText = text.toLowerCase();
    let bestType: DocumentType = 'other';
    let bestScore = 0;

    for (const [type, patterns] of Object.entries(DOCUMENT_PATTERNS)) {
      const score = patterns.filter(p => lowerText.includes(p)).length;
      if (score > bestScore) {
        bestScore = score;
        bestType = type as DocumentType;
      }
    }

    // Detect certificate subtype
    let subtype = 'General';
    for (const [certType, patterns] of Object.entries(CERTIFICATE_PATTERNS)) {
      if (patterns.some(p => lowerText.includes(p))) {
        subtype = certType;
        break;
      }
    }

    // Extract dates
    const dates = this.extractDates(text);
    const issueDate = dates.find(d => text.toLowerCase().includes('issue') && 
      text.includes(d.original));
    const expiryDate = dates.find(d => text.toLowerCase().includes('expiry') && 
      text.includes(d.original));

    // Extract issuing authority
    const authorityMatch = text.match(/(?:issued by|emitido por)[:\s]*([^\n]+)/i);
    
    return {
      type: bestType,
      subtype,
      confidence: Math.min(0.95, 0.6 + bestScore * 0.1),
      validityPeriod: {
        start: issueDate?.date,
        end: expiryDate?.date
      },
      issuingAuthority: authorityMatch?.[1]?.trim()
    };
  }

  private extractEntities(text: string, pages: PageResult[]): ExtractedDocumentEntity[] {
    const entities: ExtractedDocumentEntity[] = [];
    
    // Extract dates
    const dates = this.extractDates(text);
    dates.forEach(d => {
      entities.push({
        text: d.original,
        type: 'date',
        confidence: 0.9,
        normalized: d.date.toISOString(),
        location: { page: 1, block: 0 }
      });
    });

    // Extract certificate numbers
    const certNumMatch = text.match(/(?:certificate\s*no|certificado\s*n[°º]?)[:\s]*([A-Z0-9\-]+)/i);
    if (certNumMatch) {
      entities.push({
        text: certNumMatch[1],
        type: 'certificate_code',
        confidence: 0.92,
        location: { page: 1, block: 0 }
      });
    }

    // Extract names (simplified - look for "certify that NAME")
    const nameMatch = text.match(/(?:certify that|certificar que)\s*\n?\s*([A-ZÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ][A-Za-zÀ-ÿ\s]+)/i);
    if (nameMatch) {
      entities.push({
        text: nameMatch[1].trim(),
        type: 'name',
        confidence: 0.88,
        location: { page: 1, block: 0 }
      });
    }

    // Extract organization names
    const orgMatch = text.match(/(?:issued by|emitido por)[:\s]*([^\n]+)/i);
    if (orgMatch) {
      entities.push({
        text: orgMatch[1].trim(),
        type: 'organization',
        confidence: 0.85,
        location: { page: 1, block: 0 }
      });
    }

    return entities;
  }

  private extractDates(text: string): Array<{ original: string; date: Date }> {
    const results: Array<{ original: string; date: Date }> = [];
    
    // Pattern: DD/MM/YYYY
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4})/g;
    let match;
    
    while ((match = datePattern.exec(text)) !== null) {
      const parts = match[1].split('/');
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (!isNaN(date.getTime())) {
        results.push({ original: match[1], date });
      }
    }

    return results;
  }

  private buildStructuredData(
    docType: DocumentType,
    entities: ExtractedDocumentEntity[],
    rawText: string
  ): Record<string, any> {
    const data: Record<string, any> = {};

    // Build based on entities
    entities.forEach(entity => {
      switch (entity.type) {
        case 'name':
          data.holderName = entity.text;
          break;
        case 'certificate_code':
          data.certificateNumber = entity.text;
          break;
        case 'organization':
          data.issuingAuthority = entity.text;
          break;
        case 'date':
          if (!data.issueDate && rawText.toLowerCase().indexOf('issue') < rawText.indexOf(entity.text)) {
            data.issueDate = entity.normalized;
          } else if (!data.expiryDate) {
            data.expiryDate = entity.normalized;
          }
          break;
      }
    });

    // Try to extract certificate type
    for (const [certType, patterns] of Object.entries(CERTIFICATE_PATTERNS)) {
      if (patterns.some(p => rawText.toLowerCase().includes(p))) {
        data.certificateType = certType;
        break;
      }
    }

    return data;
  }

  private validateData(docType: DocumentType, data: Record<string, any>): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Required fields by document type
    const requiredFields: Record<string, string[]> = {
      certificate: ['holderName', 'certificateNumber', 'expiryDate'],
      license: ['holderName', 'issueDate'],
      crew_document: ['holderName'],
    };

    const required = requiredFields[docType] || [];
    
    for (const field of required) {
      if (!data[field]) {
        results.push({
          field,
          isValid: false,
          message: `Campo obrigatório não encontrado: ${field}`,
          severity: 'warning'
        });
      } else {
        results.push({
          field,
          isValid: true,
          message: `Campo extraído com sucesso`,
          severity: 'info'
        });
      }
    }

    // Validate expiry date if present
    if (data.expiryDate) {
      const expiry = new Date(data.expiryDate);
      if (expiry < new Date()) {
        results.push({
          field: 'expiryDate',
          isValid: false,
          message: 'Documento expirado',
          severity: 'error'
        });
      }
    }

    return results;
  }

  private generateSuggestions(
    data: Record<string, any>,
    validations: ValidationResult[]
  ): OCRSuggestion[] {
    const suggestions: OCRSuggestion[] = [];

    // Suggest corrections for failed validations
    validations.filter(v => !v.isValid).forEach(v => {
      suggestions.push({
        type: 'completion',
        field: v.field,
        suggestion: `Revise o documento para extrair ${v.field}`,
        confidence: 0.7
      });
    });

    // Suggest validation for extracted data
    if (data.certificateNumber) {
      suggestions.push({
        type: 'validation',
        field: 'certificateNumber',
        suggestion: 'Verificar número do certificado com a autoridade emissora',
        confidence: 0.8
      });
    }

    return suggestions;
  }

  private calculateOverallConfidence(pages: PageResult[]): number {
    if (pages.length === 0) return 0;
    return pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length;
  }
}

export const smartOCREngine = new SmartOCREngine();
