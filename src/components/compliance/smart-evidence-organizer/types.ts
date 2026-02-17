export interface EvidencePack {
  id: string;
  framework: string;
  title: string;
  description?: string;
  year: number;
  source_file_name?: string;
  source_file_type?: string;
  vessel_id?: string;
  status: "processing" | "parsed" | "matching" | "completed" | "error";
  total_elements: number;
  total_items: number;
  matched_items: number;
  unmatched_items: number;
  partial_items: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface EvidenceElement {
  id: string;
  pack_id: string;
  element_number: number;
  element_code?: string;
  element_name: string;
  element_description?: string;
  total_items: number;
  matched_count: number;
  unmatched_count: number;
  partial_count: number;
  compliance_score: number;
  sort_order: number;
}

export interface EvidenceItem {
  id: string;
  element_id: string;
  pack_id: string;
  item_number: string;
  item_code?: string;
  item_text: string;
  requirement_description?: string;
  evidence_status: "found" | "partial" | "not_found" | "pending" | "manual";
  ai_response?: string;
  ai_suggestion?: string;
  ai_confidence?: number;
  is_critical: boolean;
  sort_order: number;
}

export interface EvidenceMatch {
  id: string;
  item_id: string;
  pack_id: string;
  document_id?: string;
  document_title?: string;
  document_type?: string;
  document_path?: string;
  match_source: "ai" | "manual" | "suggested";
  match_confidence?: number;
  match_reason?: string;
  is_accepted: boolean;
  created_at: string;
}

export type ViewMode = "tree" | "kanban" | "accordion";
