-- ============================================================================
-- Finance Hub Complete - Database Schema
-- PATCH 242: Financial Management System
-- ============================================================================

-- Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category_type TEXT CHECK (category_type IN ('operational', 'administrative', 'travel', 'maintenance', 'crew', 'other')),
    budget_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Transactions Table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    vessel_id UUID,
    department TEXT,
    reference_number TEXT UNIQUE,
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'check', 'other')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_type TEXT CHECK (invoice_type IN ('receivable', 'payable')),
    vendor_name TEXT NOT NULL,
    vendor_email TEXT,
    vendor_address TEXT,
    vessel_id UUID,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
    payment_terms TEXT,
    notes TEXT,
    line_items JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    budget_type TEXT CHECK (budget_type IN ('annual', 'quarterly', 'monthly', 'project', 'department')),
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    vessel_id UUID,
    department TEXT,
    total_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_amount DECIMAL(15, 2) GENERATED ALWAYS AS (total_amount - spent_amount) STORED,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'exceeded', 'completed', 'cancelled')),
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Tracking Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_date DATE NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'check', 'other')),
    reference_number TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON public.financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_vessel ON public.financial_transactions(vessel_id);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_vessel ON public.invoices(vessel_id);

CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON public.budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON public.budgets(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to read all finance data
CREATE POLICY "Authenticated users can read expense categories" ON public.expense_categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read transactions" ON public.financial_transactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read invoices" ON public.invoices
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read budgets" ON public.budgets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read payments" ON public.payments
    FOR SELECT TO authenticated USING (true);

-- Policies for authenticated users to insert/update (can be refined later with roles)
CREATE POLICY "Authenticated users can insert transactions" ON public.financial_transactions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions" ON public.financial_transactions
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert invoices" ON public.invoices
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices" ON public.invoices
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert budgets" ON public.budgets
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update budgets" ON public.budgets
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payments" ON public.payments
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON public.expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, category_type, budget_code) VALUES
    ('Fuel & Lubricants', 'Vessel fuel and lubricants', 'operational', 'OP-001'),
    ('Crew Wages', 'Crew salaries and wages', 'crew', 'CR-001'),
    ('Maintenance & Repairs', 'Vessel maintenance and repairs', 'maintenance', 'MT-001'),
    ('Port Fees', 'Port dues and harbor fees', 'operational', 'OP-002'),
    ('Insurance', 'Vessel and crew insurance', 'administrative', 'AD-001'),
    ('Office Supplies', 'Office and administrative supplies', 'administrative', 'AD-002'),
    ('Travel & Accommodation', 'Travel expenses and accommodation', 'travel', 'TR-001'),
    ('Training & Development', 'Crew training and certification', 'crew', 'CR-002'),
    ('Safety Equipment', 'Safety gear and equipment', 'operational', 'OP-003'),
    ('Communication', 'Satellite and communication services', 'operational', 'OP-004')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.expense_categories IS 'Categories for organizing expenses and budgets';
COMMENT ON TABLE public.financial_transactions IS 'All financial transactions including income and expenses';
COMMENT ON TABLE public.invoices IS 'Invoices for receivables and payables';
COMMENT ON TABLE public.budgets IS 'Budget allocations and tracking';
COMMENT ON TABLE public.payments IS 'Payment records linked to invoices';
