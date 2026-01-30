/**
 * Knowledge Hub Enterprise - Types
 * Sistema revolucionário de gestão de conhecimento com IA
 * 
 * Inspirado em: TMmaster, UniSea, SoftExpert, Fluig
 * Mas 10x mais avançado com IA generativa e RAG
 */

export interface KnowledgeDocument {
  id: string;
  title: string;
  description?: string;
  documentType: DocumentType;
  category: DocumentCategory;
  subcategory?: string;
  
  // File info
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  
  // AI Processing
  aiStatus: AIProcessingStatus;
  extractedText?: string;
  summary?: string;
  keyEntities?: ExtractedEntity[];
  keywords?: string[];
  embedding?: number[];
  
  // Semantic structure
  chapters?: DocumentChapter[];
  tables?: ExtractedTable[];
  checklists?: ExtractedChecklist[];
  procedures?: ExtractedProcedure[];
  forms?: ExtractedForm[];
  
  // Compliance
  regulatoryReferences?: RegulatoryReference[];
  expiryDate?: string;
  reviewDate?: string;
  version: number;
  revisionHistory?: DocumentRevision[];
  
  // Access control
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  allowedRoles?: string[];
  allowedVessels?: string[];
  
  // Metadata
  tags: string[];
  language: string;
  pageCount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  vesselId?: string;
}

export type DocumentType = 
  | 'manual'
  | 'procedure'
  | 'checklist'
  | 'form'
  | 'certificate'
  | 'policy'
  | 'guideline'
  | 'report'
  | 'training'
  | 'safety_data_sheet'
  | 'technical_drawing'
  | 'contract'
  | 'regulation'
  | 'bulletin'
  | 'circular'
  | 'other';

export type DocumentCategory =
  | 'navigation'
  | 'safety'
  | 'cargo'
  | 'machinery'
  | 'crew'
  | 'environmental'
  | 'commercial'
  | 'legal'
  | 'quality'
  | 'training'
  | 'medical'
  | 'security'
  | 'emergency'
  | 'operations'
  | 'maintenance'
  | 'general';

export type AIProcessingStatus = 
  | 'pending'
  | 'extracting'
  | 'analyzing'
  | 'embedding'
  | 'completed'
  | 'failed';

export interface DocumentChapter {
  id: string;
  title: string;
  level: number;
  pageStart: number;
  pageEnd: number;
  content?: string;
  summary?: string;
  children?: DocumentChapter[];
}

export interface ExtractedEntity {
  type: 'person' | 'organization' | 'vessel' | 'port' | 'date' | 'regulation' | 'equipment' | 'chemical';
  value: string;
  confidence: number;
  context?: string;
  pageNumber?: number;
}

export interface ExtractedTable {
  id: string;
  title?: string;
  headers: string[];
  rows: string[][];
  pageNumber: number;
  aiInterpretation?: string;
}

export interface ExtractedChecklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  category?: string;
  frequency?: string;
  responsible?: string;
  pageNumber: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  hasOptions?: boolean;
  options?: string[];
  defaultValue?: string;
  helpText?: string;
  parentId?: string;
}

export interface ExtractedProcedure {
  id: string;
  title: string;
  purpose?: string;
  scope?: string;
  responsibilities?: ProcedureResponsibility[];
  steps: ProcedureStep[];
  references?: string[];
  attachments?: string[];
  emergencyActions?: string[];
  pageNumber: number;
}

export interface ProcedureResponsibility {
  role: string;
  responsibilities: string[];
}

export interface ProcedureStep {
  id: string;
  stepNumber: number;
  action: string;
  responsible?: string;
  notes?: string;
  cautions?: string[];
  references?: string[];
  subSteps?: ProcedureStep[];
}

export interface ExtractedForm {
  id: string;
  title: string;
  formCode?: string;
  version?: string;
  fields: FormField[];
  sections?: FormSection[];
  instructions?: string;
  pageNumber: number;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'signature' | 'textarea';
  required: boolean;
  options?: string[];
  validation?: string;
  defaultValue?: string;
  helpText?: string;
  sectionId?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
}

export interface RegulatoryReference {
  regulation: string;
  chapter?: string;
  section?: string;
  requirement: string;
  complianceStatus?: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
}

export interface DocumentRevision {
  version: number;
  date: string;
  author: string;
  changes: string;
  approved_by?: string;
  approved_date?: string;
}

// AI Assistant Types
export interface KnowledgeQuery {
  question: string;
  context?: string;
  documentIds?: string[];
  category?: DocumentCategory;
  vesselId?: string;
  language?: string;
}

export interface KnowledgeAnswer {
  answer: string;
  confidence: number;
  sources: KnowledgeSource[];
  relatedQuestions?: string[];
  actions?: SuggestedAction[];
}

export interface KnowledgeSource {
  documentId: string;
  documentTitle: string;
  excerpt: string;
  pageNumber?: number;
  chapterTitle?: string;
  relevanceScore: number;
}

export interface SuggestedAction {
  type: 'create_task' | 'schedule_training' | 'generate_checklist' | 'notify_crew' | 'open_document';
  title: string;
  description: string;
  payload: Record<string, unknown>;
}

// Smart Search
export interface SmartSearchResult {
  type: 'document' | 'chapter' | 'procedure' | 'checklist' | 'form' | 'answer';
  id: string;
  title: string;
  excerpt: string;
  score: number;
  document?: {
    id: string;
    title: string;
    type: DocumentType;
  };
  highlights?: string[];
  metadata?: Record<string, unknown>;
}

// Analytics
export interface KnowledgeAnalytics {
  totalDocuments: number;
  byType: Record<DocumentType, number>;
  byCategory: Record<DocumentCategory, number>;
  recentlyUpdated: number;
  expiringCertificates: number;
  pendingReview: number;
  aiProcessed: number;
  popularDocuments: PopularDocument[];
  searchTrends: SearchTrend[];
  complianceScore: number;
}

export interface PopularDocument {
  documentId: string;
  title: string;
  views: number;
  downloads: number;
  searches: number;
}

export interface SearchTrend {
  query: string;
  count: number;
  resultsFound: boolean;
  averageRelevance: number;
}
