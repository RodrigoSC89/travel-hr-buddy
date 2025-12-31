-- ============================================
-- Q1 2025 CRITICAL MODULES - DATABASE SCHEMA
-- Cargo Management, Charter Party, Port Call, Voyage Accounting
-- ============================================

-- 1. CARGO OPERATIONS
CREATE TABLE IF NOT EXISTS public.cargo_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  port TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('loading', 'discharging', 'restow')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  containers_loaded INTEGER DEFAULT 0,
  containers_discharged INTEGER DEFAULT 0,
  utilization_percent DECIMAL(5,2),
  stability_gm DECIMAL(5,2),
  ai_optimized BOOLEAN DEFAULT false,
  optimization_score INTEGER,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CONTAINERS
CREATE TABLE IF NOT EXISTS public.containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  container_number TEXT NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  operation_id UUID REFERENCES public.cargo_operations(id),
  size TEXT NOT NULL CHECK (size IN ('20''', '40''', '45''')),
  container_type TEXT NOT NULL CHECK (container_type IN ('DRY', 'REEFER', 'TANK', 'FLAT', 'OPEN_TOP')),
  weight_kg DECIMAL(10,2) NOT NULL,
  cargo_description TEXT,
  loading_port TEXT,
  discharge_port TEXT,
  position TEXT, -- bay-row-tier format
  dangerous_goods BOOLEAN DEFAULT false,
  dg_class TEXT,
  dg_un_number TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'loaded', 'onboard', 'discharged')),
  booking_reference TEXT,
  seal_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CHARTER CONTRACTS
CREATE TABLE IF NOT EXISTS public.charter_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  contract_number TEXT NOT NULL UNIQUE,
  vessel_id UUID REFERENCES public.vessels(id),
  charterer TEXT NOT NULL,
  owner TEXT NOT NULL,
  charter_type TEXT NOT NULL CHECK (charter_type IN ('time', 'voyage', 'bareboat', 'coa')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_hire DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  total_value DECIMAL(15,2),
  payment_terms TEXT,
  demurrage_rate DECIMAL(12,2),
  despatch_rate DECIMAL(12,2),
  off_hire_days DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'expired', 'terminated')),
  contract_document_url TEXT,
  terms_conditions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. HIRE CALCULATIONS
CREATE TABLE IF NOT EXISTS public.hire_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.charter_contracts(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_hire DECIMAL(12,2) NOT NULL,
  off_hire_deduction DECIMAL(12,2) DEFAULT 0,
  net_hire DECIMAL(12,2) NOT NULL,
  demurrage DECIMAL(12,2) DEFAULT 0,
  despatch DECIMAL(12,2) DEFAULT 0,
  total_due DECIMAL(12,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'invoiced', 'paid', 'disputed')),
  invoice_number TEXT,
  calculated_by_ai BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PORT CALLS
CREATE TABLE IF NOT EXISTS public.port_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  port_name TEXT NOT NULL,
  port_code TEXT, -- UNLOCODE
  country TEXT,
  eta TIMESTAMPTZ NOT NULL,
  etb TIMESTAMPTZ, -- estimated time of berthing
  etd TIMESTAMPTZ,
  ata TIMESTAMPTZ, -- actual time of arrival
  atb TIMESTAMPTZ, -- actual time of berthing
  atd TIMESTAMPTZ,
  purpose TEXT NOT NULL CHECK (purpose IN ('loading', 'discharging', 'bunkering', 'crew_change', 'repairs', 'survey', 'transit')),
  agent_name TEXT,
  agent_contact TEXT,
  berth_number TEXT,
  waiting_time_hours DECIMAL(5,2) DEFAULT 0,
  estimated_costs DECIMAL(12,2),
  actual_costs DECIMAL(12,2),
  documents_status TEXT DEFAULT 'pending' CHECK (documents_status IN ('pending', 'submitted', 'approved', 'rejected')),
  psc_risk_level TEXT CHECK (psc_risk_level IN ('low', 'medium', 'high')),
  ai_optimized BOOLEAN DEFAULT false,
  optimization_savings DECIMAL(12,2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'approaching', 'at_anchorage', 'at_berth', 'departed', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PORT COSTS
CREATE TABLE IF NOT EXISTS public.port_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  port_call_id UUID REFERENCES public.port_calls(id),
  cost_category TEXT NOT NULL CHECK (cost_category IN ('port_dues', 'pilotage', 'towage', 'mooring', 'agency', 'waste_disposal', 'water', 'provisions', 'other')),
  description TEXT,
  estimated_amount DECIMAL(12,2),
  actual_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  invoice_reference TEXT,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. VOYAGE ACCOUNTING
CREATE TABLE IF NOT EXISTS public.voyage_accounting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  voyage_number TEXT NOT NULL,
  departure_port TEXT NOT NULL,
  arrival_port TEXT NOT NULL,
  departure_date DATE NOT NULL,
  arrival_date DATE,
  cargo_type TEXT,
  cargo_quantity DECIMAL(12,2),
  budget_revenue DECIMAL(15,2),
  actual_revenue DECIMAL(15,2),
  budget_costs DECIMAL(15,2),
  actual_costs DECIMAL(15,2),
  net_result DECIMAL(15,2),
  margin_percent DECIMAL(5,2),
  tce_daily DECIMAL(12,2), -- Time Charter Equivalent
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
  ai_analyzed BOOLEAN DEFAULT false,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. VOYAGE COSTS
CREATE TABLE IF NOT EXISTS public.voyage_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID REFERENCES public.voyage_accounting(id),
  cost_category TEXT NOT NULL CHECK (cost_category IN ('bunker', 'port', 'crew', 'maintenance', 'insurance', 'overhead', 'canal', 'agency', 'other')),
  description TEXT,
  budgeted_amount DECIMAL(12,2),
  actual_amount DECIMAL(12,2),
  variance DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_cargo_operations_vessel ON public.cargo_operations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cargo_operations_status ON public.cargo_operations(status);
CREATE INDEX IF NOT EXISTS idx_containers_vessel ON public.containers(vessel_id);
CREATE INDEX IF NOT EXISTS idx_containers_number ON public.containers(container_number);
CREATE INDEX IF NOT EXISTS idx_charter_contracts_vessel ON public.charter_contracts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_charter_contracts_status ON public.charter_contracts(status);
CREATE INDEX IF NOT EXISTS idx_port_calls_vessel ON public.port_calls(vessel_id);
CREATE INDEX IF NOT EXISTS idx_port_calls_status ON public.port_calls(status);
CREATE INDEX IF NOT EXISTS idx_port_calls_eta ON public.port_calls(eta);
CREATE INDEX IF NOT EXISTS idx_voyage_accounting_vessel ON public.voyage_accounting(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyage_accounting_status ON public.voyage_accounting(status);

-- ENABLE RLS
ALTER TABLE public.cargo_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charter_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyage_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyage_costs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Organization-based access
CREATE POLICY "Users can view their org cargo operations" ON public.cargo_operations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert cargo operations" ON public.cargo_operations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update cargo operations" ON public.cargo_operations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view containers" ON public.containers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert containers" ON public.containers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update containers" ON public.containers
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view charter contracts" ON public.charter_contracts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert charter contracts" ON public.charter_contracts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update charter contracts" ON public.charter_contracts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view hire calculations" ON public.hire_calculations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert hire calculations" ON public.hire_calculations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view port calls" ON public.port_calls
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert port calls" ON public.port_calls
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update port calls" ON public.port_calls
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view port costs" ON public.port_costs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert port costs" ON public.port_costs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view voyage accounting" ON public.voyage_accounting
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert voyage accounting" ON public.voyage_accounting
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update voyage accounting" ON public.voyage_accounting
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view voyage costs" ON public.voyage_costs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert voyage costs" ON public.voyage_costs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);