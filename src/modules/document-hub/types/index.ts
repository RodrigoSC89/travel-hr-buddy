/**
 * PATCH 91.0 - Document Hub Types
 * Unified document management types
 */

export interface DocumentMetadata {
  doc_id: string;
  owner_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  storage_url: string;
  created_at: string;
  updated_at?: string;
  ai_summary?: string;
  ai_topics?: string[];
  validity_status?: 'valid' | 'expired' | 'expiring_soon' | 'invalid';
  validation_details?: Record<string, any>;
}

export interface AIAnalysisResult {
  summary: string;
  topics: string[];
  validity_status?: 'valid' | 'expired' | 'expiring_soon' | 'invalid';
  key_info?: {
    cnpj?: string;
    expiry_date?: string;
    document_type?: string;
    important_terms?: string[];
  };
  confidence: number;
}

export interface UploadResult {
  success: boolean;
  metadata?: DocumentMetadata;
  error?: string;
}

export interface DocumentFilter {
  search?: string;
  owner_id?: string;
  file_type?: string;
  validity_status?: string;
}
