/**
 * RFX & RFQ Request Module - Type Definitions
 * PATCH 635
 * Gestão de requisições técnicas e comerciais
 */

export type RFXType = "RFQ" | "RFP" | "RFI" | "RFT"; // Quote, Proposal, Information, Tender
export type RFXStatus = "draft" | "published" | "in_bidding" | "under_review" | "awarded" | "cancelled" | "closed";
export type RFXPriority = "low" | "normal" | "high" | "urgent";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "revision_required";

export interface RFXRequest {
  id: string;
  rfx_number: string;
  rfx_type: RFXType;
  title: string;
  description: string;
  category: "spare_parts" | "services" | "equipment" | "supplies" | "maintenance" | "other";
  priority: RFXPriority;
  status: RFXStatus;
  vessel_id?: string;
  vessel_name?: string;
  department: string;
  requested_by: string;
  approved_by?: string;
  approval_status: ApprovalStatus;
  approval_date?: string;
  published_date?: string;
  submission_deadline?: string;
  expected_delivery_date?: string;
  budget_estimate?: number;
  currency: string;
  items: RFXItem[];
  specifications: RFXSpecification[];
  terms_and_conditions?: string;
  supplier_ids: string[];
  attachments: RFXAttachment[];
  created_at: string;
  updated_at: string;
}

export interface RFXItem {
  id: string;
  item_number: string;
  description: string;
  quantity: number;
  unit: string;
  part_number?: string;
  manufacturer?: string;
  specifications?: string;
  estimated_unit_price?: number;
  notes?: string;
}

export interface RFXSpecification {
  id: string;
  specification_type: "technical" | "quality" | "delivery" | "warranty" | "other";
  title: string;
  description: string;
  mandatory: boolean;
  order: number;
}

export interface RFXAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Quotation {
  id: string;
  rfx_id: string;
  supplier_id: string;
  supplier_name: string;
  quotation_number: string;
  submission_date: string;
  valid_until: string;
  total_amount: number;
  currency: string;
  delivery_time_days: number;
  payment_terms: string;
  warranty_period_months?: number;
  notes?: string;
  status: "submitted" | "under_review" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  supplier_code: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  categories: string[];
  rating: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
