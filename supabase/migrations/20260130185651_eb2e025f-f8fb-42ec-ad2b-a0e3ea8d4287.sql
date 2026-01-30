-- =============================================
-- FINANCE & PROCUREMENT AI SYSTEM - COMPLETE SCHEMA
-- =============================================

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT DEFAULT 'NET30',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  performance_score DECIMAL(5,2),
  on_time_delivery DECIMAL(5,2),
  quality_score DECIMAL(5,2),
  total_orders INTEGER DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  ai_reliability_score DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  po_number TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  vessel_id UUID REFERENCES vessels(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(15,2),
  tax DECIMAL(15,2),
  total DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  requested_by UUID,
  approved_by UUID,
  ordered_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  ai_supplier_recommendation JSONB,
  ai_negotiation_strategy JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  year INTEGER NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  category TEXT NOT NULL,
  allocated_amount DECIMAL(15,2) NOT NULL,
  spent_amount DECIMAL(15,2) DEFAULT 0,
  committed_amount DECIMAL(15,2) DEFAULT 0,
  forecast_amount DECIMAL(15,2),
  ai_prediction JSONB,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cost Predictions (ML)
CREATE TABLE IF NOT EXISTS cost_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vessel_id UUID REFERENCES vessels(id),
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prediction_for_month DATE NOT NULL,
  predicted_costs JSONB NOT NULL,
  confidence DECIMAL(5,4),
  actual_costs JSONB,
  accuracy_score DECIMAL(5,4),
  model_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Savings Opportunities
CREATE TABLE IF NOT EXISTS savings_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  current_cost DECIMAL(15,2),
  potential_savings DECIMAL(15,2),
  savings_percentage DECIMAL(5,2),
  implementation_effort TEXT,
  implementation_timeline TEXT,
  recommended_actions JSONB,
  status TEXT DEFAULT 'identified',
  implemented_at TIMESTAMPTZ,
  actual_savings DECIMAL(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices Processing
CREATE TABLE IF NOT EXISTS invoices_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  invoice_number TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  po_id UUID REFERENCES purchase_orders(id),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'received',
  file_url TEXT,
  ocr_data JSONB,
  ai_extracted_data JSONB,
  ai_validation JSONB,
  ai_decision TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Currency Exchange Rates
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL,
  rate DECIMAL(15,8) NOT NULL,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Forecasts
CREATE TABLE IF NOT EXISTS financial_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  forecast_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue_forecast DECIMAL(15,2),
  expense_forecast DECIMAL(15,2),
  profit_forecast DECIMAL(15,2),
  confidence_level DECIMAL(5,2),
  assumptions JSONB,
  model_parameters JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_org ON vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_po_org_status ON purchase_orders(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_budgets_org_year ON budgets(organization_id, year);
CREATE INDEX IF NOT EXISTS idx_cost_predictions_date ON cost_predictions(prediction_for_month);
CREATE INDEX IF NOT EXISTS idx_savings_status ON savings_opportunities(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices_processing(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_currency_rates_date ON currency_rates(rate_date, base_currency, target_currency);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Users can manage their org vendors" ON vendors FOR ALL USING (true);

CREATE POLICY "Users can view their org POs" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Users can manage their org POs" ON purchase_orders FOR ALL USING (true);

CREATE POLICY "Users can view their org budgets" ON budgets FOR SELECT USING (true);
CREATE POLICY "Users can manage their org budgets" ON budgets FOR ALL USING (true);

CREATE POLICY "Users can view cost predictions" ON cost_predictions FOR SELECT USING (true);
CREATE POLICY "Users can manage cost predictions" ON cost_predictions FOR ALL USING (true);

CREATE POLICY "Users can view savings opportunities" ON savings_opportunities FOR SELECT USING (true);
CREATE POLICY "Users can manage savings opportunities" ON savings_opportunities FOR ALL USING (true);

CREATE POLICY "Users can view invoices" ON invoices_processing FOR SELECT USING (true);
CREATE POLICY "Users can manage invoices" ON invoices_processing FOR ALL USING (true);

CREATE POLICY "Anyone can view currency rates" ON currency_rates FOR SELECT USING (true);
CREATE POLICY "Users can manage currency rates" ON currency_rates FOR ALL USING (true);

CREATE POLICY "Users can view forecasts" ON financial_forecasts FOR SELECT USING (true);
CREATE POLICY "Users can manage forecasts" ON financial_forecasts FOR ALL USING (true);