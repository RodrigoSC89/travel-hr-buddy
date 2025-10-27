/**
 * Finance Hub Type Definitions
 * PATCH 242: Financial Management System
 */

export type CategoryType = 'operational' | 'administrative' | 'travel' | 'maintenance' | 'crew' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'other';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type InvoiceType = 'receivable' | 'payable';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
export type BudgetType = 'annual' | 'quarterly' | 'monthly' | 'project' | 'department';
export type BudgetStatus = 'draft' | 'active' | 'exceeded' | 'completed' | 'cancelled';

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  category_type?: CategoryType;
  budget_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  transaction_type: TransactionType;
  category_id?: string;
  amount: number;
  currency: string;
  description: string;
  transaction_date: string;
  vessel_id?: string;
  department?: string;
  reference_number?: string;
  payment_method?: PaymentMethod;
  status: TransactionStatus;
  approved_by?: string;
  approved_at?: string;
  attachments?: any[];
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ExpenseCategory;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type?: InvoiceType;
  vendor_name: string;
  vendor_email?: string;
  vendor_address?: string;
  vessel_id?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  payment_terms?: string;
  notes?: string;
  line_items?: InvoiceLineItem[];
  pdf_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  payments?: Payment[];
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  budget_type?: BudgetType;
  category_id?: string;
  vessel_id?: string;
  department?: string;
  total_amount: number;
  spent_amount: number;
  remaining_amount: number;
  start_date: string;
  end_date: string;
  currency: string;
  status: BudgetStatus;
  alert_threshold: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ExpenseCategory;
}

export interface Payment {
  id: string;
  invoice_id?: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method?: PaymentMethod;
  reference_number?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  invoice?: Invoice;
  transaction?: FinancialTransaction;
}

// Form types for creating/updating
export interface CreateTransactionInput {
  transaction_type: TransactionType;
  category_id?: string;
  amount: number;
  currency?: string;
  description: string;
  transaction_date: string;
  vessel_id?: string;
  department?: string;
  payment_method?: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceInput {
  invoice_number: string;
  invoice_type?: InvoiceType;
  vendor_name: string;
  vendor_email?: string;
  vendor_address?: string;
  vessel_id?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  payment_terms?: string;
  notes?: string;
  line_items?: InvoiceLineItem[];
}

export interface CreateBudgetInput {
  name: string;
  description?: string;
  budget_type?: BudgetType;
  category_id?: string;
  vessel_id?: string;
  department?: string;
  total_amount: number;
  start_date: string;
  end_date: string;
  currency?: string;
  alert_threshold?: number;
}

export interface CreatePaymentInput {
  invoice_id?: string;
  transaction_id?: string;
  amount: number;
  currency?: string;
  payment_date: string;
  payment_method?: PaymentMethod;
  reference_number?: string;
  notes?: string;
}

// Report types
export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  pending_invoices: number;
  overdue_invoices: number;
  budget_utilization: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface BudgetReport {
  budget: Budget;
  transactions: FinancialTransaction[];
  utilization_percentage: number;
  is_over_threshold: boolean;
  is_exceeded: boolean;
}

export interface InvoiceReport {
  total_receivables: number;
  total_payables: number;
  overdue_count: number;
  paid_count: number;
  pending_count: number;
  by_status: Record<InvoiceStatus, number>;
}
