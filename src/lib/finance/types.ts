/**
 * 💰 FINANCE & PROCUREMENT - Type Definitions
 * Complete type system for financial operations
 */

export interface Expense {
  id: string;
  organization_id?: string;
  vessel_id?: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd?: number;
  expense_date: string;
  vendor?: string;
  invoice_number?: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  paid_at?: string;
  ai_classification?: AIClassification;
  ai_extracted_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  organization_id?: string;
  po_number: string;
  vendor_id?: string;
  vessel_id?: string;
  items: POItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  requested_by?: string;
  approved_by?: string;
  ordered_at?: string;
  received_at?: string;
  ai_supplier_recommendation?: SupplierRecommendation;
  ai_negotiation_strategy?: NegotiationStrategy;
  created_at: string;
  updated_at: string;
}

export interface POItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  category?: string;
}

export interface Vendor {
  id: string;
  organization_id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  rating?: number;
  performance_score?: number;
  on_time_delivery?: number;
  quality_score?: number;
  total_orders: number;
  total_value: number;
  ai_reliability_score?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  organization_id?: string;
  year: number;
  vessel_id?: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  committed_amount: number;
  forecast_amount?: number;
  ai_prediction?: CostPrediction;
  ai_recommendations?: string[];
  created_at: string;
  updated_at: string;
}

export interface CostPrediction {
  fuel: number;
  maintenance: number;
  crew: number;
  port: number;
  insurance: number;
  other: number;
  total: number;
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  description: string;
}

export interface SavingsOpportunity {
  id: string;
  organization_id?: string;
  title: string;
  category: string;
  current_cost: number;
  potential_savings: number;
  savings_percentage: number;
  implementation_effort: 'low' | 'medium' | 'high';
  implementation_timeline: string;
  recommended_actions: string[];
  status: 'identified' | 'in_progress' | 'implemented' | 'dismissed';
  implemented_at?: string;
  actual_savings?: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  organization_id?: string;
  invoice_number: string;
  vendor_id?: string;
  po_id?: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  currency: string;
  status: 'received' | 'processing' | 'approved' | 'rejected' | 'paid';
  file_url?: string;
  ocr_data?: OCRData;
  ai_extracted_data?: ExtractedInvoiceData;
  ai_validation?: InvoiceValidation;
  ai_decision?: 'auto_approve' | 'reject' | 'escalate';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OCRData {
  raw_text: string;
  confidence: number;
  detected_fields: Record<string, string>;
}

export interface ExtractedInvoiceData {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  line_items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceValidation {
  is_valid: boolean;
  issues: ValidationIssue[];
  po_match: boolean;
  duplicate_check: boolean;
  math_correct: boolean;
}

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: 'warning' | 'error';
}

export interface AIClassification {
  category: string;
  subcategory: string;
  confidence: number;
  suggested_account: string;
}

export interface SupplierRecommendation {
  recommended_supplier_id: string;
  supplier_name: string;
  score: number;
  reasons: string[];
  alternatives: AlternativeSupplier[];
}

export interface AlternativeSupplier {
  supplier_id: string;
  supplier_name: string;
  score: number;
  trade_offs: string[];
}

export interface NegotiationStrategy {
  target_price: number;
  initial_offer: number;
  max_price: number;
  arguments: string[];
  concessions: string[];
  deal_breakers: string[];
}

export interface CurrencyAllocation {
  currency: string;
  amount: number;
  percentage: number;
  expected_rate: number;
}

export interface FinancialMetrics {
  total_expenses: number;
  total_budget: number;
  budget_variance: number;
  variance_percentage: number;
  pending_invoices: number;
  pending_amount: number;
  savings_identified: number;
  savings_implemented: number;
}

export interface CashFlowPrediction {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  confidence: number;
}
