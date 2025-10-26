-- Finance Hub Complete Schema
-- PATCH 192.0: Financial management with real data integration

-- ============================================
-- Financial Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'adjustment')),
  category_id uuid REFERENCES budget_categories(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  description text,
  transaction_date timestamptz DEFAULT now(),
  payment_method text CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'other')),
  vendor_supplier text,
  invoice_id uuid REFERENCES invoices(id),
  vessel_id uuid REFERENCES vessels(id),
  project_code text,
  cost_center text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  receipt_url text,
  notes text,
  tags jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Financial transactions indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_vessel ON financial_transactions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_invoice ON financial_transactions(invoice_id);

-- Financial transactions RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read financial transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert financial transactions"
  ON financial_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update financial transactions"
  ON financial_transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Budget Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_category_id uuid REFERENCES budget_categories(id),
  category_type text NOT NULL CHECK (category_type IN ('income', 'expense', 'both')),
  description text,
  budget_allocated numeric,
  budget_period text CHECK (budget_period IN ('monthly', 'quarterly', 'yearly', 'custom')),
  color text,
  icon text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Budget categories indexes
CREATE INDEX IF NOT EXISTS idx_budget_categories_type ON budget_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_budget_categories_parent ON budget_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_active ON budget_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_budget_categories_order ON budget_categories(display_order);

-- Budget categories RLS
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read budget categories"
  ON budget_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert budget categories"
  ON budget_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update budget categories"
  ON budget_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Invoices Table
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  invoice_type text NOT NULL CHECK (invoice_type IN ('sales', 'purchase', 'expense', 'credit_note', 'debit_note')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  issue_date timestamptz DEFAULT now(),
  due_date timestamptz,
  paid_date timestamptz,
  vendor_supplier text,
  vendor_email text,
  vendor_address text,
  customer_name text,
  customer_email text,
  customer_address text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_terms text,
  payment_method text,
  line_items jsonb DEFAULT '[]'::jsonb,
  notes text,
  terms_conditions text,
  vessel_id uuid REFERENCES vessels(id),
  project_code text,
  po_number text,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_vessel ON invoices(vessel_id);

-- Invoices RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Financial Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS financial_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type text NOT NULL CHECK (log_type IN ('transaction', 'invoice', 'budget', 'audit', 'system')),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject', 'export', 'import')),
  user_id uuid REFERENCES auth.users(id),
  changes jsonb,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Financial logs indexes
CREATE INDEX IF NOT EXISTS idx_financial_logs_type ON financial_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_financial_logs_entity ON financial_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_financial_logs_user ON financial_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_logs_created ON financial_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_logs_action ON financial_logs(action);

-- Financial logs RLS
ALTER TABLE financial_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read financial logs"
  ON financial_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert financial logs"
  ON financial_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- Update Triggers
-- ============================================

-- Trigger function for updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_financial_transactions_updated_at 
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at 
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Audit Logging Triggers
-- ============================================

-- Function to log financial transaction changes
CREATE OR REPLACE FUNCTION log_financial_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO financial_logs (log_type, entity_type, entity_id, action, user_id, new_values)
    VALUES ('transaction', 'financial_transaction', NEW.id, 'create', NEW.created_by, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO financial_logs (log_type, entity_type, entity_id, action, user_id, old_values, new_values)
    VALUES ('transaction', 'financial_transaction', NEW.id, 'update', NEW.created_by, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO financial_logs (log_type, entity_type, entity_id, action, user_id, old_values)
    VALUES ('transaction', 'financial_transaction', OLD.id, 'delete', OLD.created_by, to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to log invoice changes
CREATE OR REPLACE FUNCTION log_invoice_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO financial_logs (log_type, entity_type, entity_id, action, user_id, new_values)
    VALUES ('invoice', 'invoice', NEW.id, 'create', NEW.created_by, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO financial_logs (log_type, entity_type, entity_id, action, user_id, old_values, new_values)
    VALUES ('invoice', 'invoice', NEW.id, 'update', NEW.created_by, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO financial_logs (log_type, entity_type, entity_id, action, user_id, old_values)
    VALUES ('invoice', 'invoice', OLD.id, 'delete', OLD.created_by, to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER financial_transaction_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION log_financial_transaction_changes();

CREATE TRIGGER invoice_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION log_invoice_changes();

-- ============================================
-- Sample Budget Categories
-- ============================================
INSERT INTO budget_categories (name, category_type, description, budget_allocated, budget_period, color, icon)
VALUES
  ('Vessel Operations', 'expense', 'Operational expenses for vessels', 500000, 'monthly', '#3B82F6', 'Ship'),
  ('Fuel & Lubricants', 'expense', 'Fuel and lubricant costs', 200000, 'monthly', '#EF4444', 'Fuel'),
  ('Maintenance & Repairs', 'expense', 'Vessel maintenance and repair costs', 150000, 'monthly', '#F59E0B', 'Wrench'),
  ('Crew Salaries', 'expense', 'Crew member salaries and benefits', 300000, 'monthly', '#10B981', 'Users'),
  ('Port Fees', 'expense', 'Port and harbor fees', 50000, 'monthly', '#8B5CF6', 'Anchor'),
  ('Insurance', 'expense', 'Vessel and cargo insurance', 80000, 'monthly', '#EC4899', 'Shield'),
  ('Charter Revenue', 'income', 'Income from vessel charters', 1000000, 'monthly', '#22C55E', 'TrendingUp'),
  ('Cargo Transport', 'income', 'Income from cargo transport', 800000, 'monthly', '#0EA5E9', 'Package')
ON CONFLICT DO NOTHING;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE financial_transactions IS 'All financial transactions with categorization and tracking';
COMMENT ON TABLE budget_categories IS 'Budget categories for organizing financial data';
COMMENT ON TABLE invoices IS 'Invoice management for sales and purchases';
COMMENT ON TABLE financial_logs IS 'Audit logs for all financial operations';
