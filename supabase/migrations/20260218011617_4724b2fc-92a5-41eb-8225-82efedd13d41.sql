
-- =============================================
-- Sprint 11-12: P&I Insurance Claims + Pool Distribution
-- =============================================

-- 1) P&I Club Claims Management
CREATE TABLE public.pi_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number VARCHAR(50),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  pi_club VARCHAR(200), -- Gard, Skuld, Britannia, etc.
  claim_type VARCHAR(50) NOT NULL CHECK (claim_type IN ('cargo_damage','personal_injury','pollution','collision','property_damage','crew_illness','stowaways','wreck_removal','fines','other')),
  incident_date DATE NOT NULL,
  incident_location VARCHAR(200),
  description TEXT,
  claimant_name VARCHAR(200),
  claimant_type VARCHAR(50) CHECK (claimant_type IN ('crew','third_party','cargo_owner','port_authority','government','other')),
  estimated_amount NUMERIC(14,2) DEFAULT 0,
  reserve_amount NUMERIC(14,2) DEFAULT 0,
  paid_amount NUMERIC(14,2) DEFAULT 0,
  deductible NUMERIC(14,2) DEFAULT 0,
  recovered_amount NUMERIC(14,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(30) DEFAULT 'notified' CHECK (status IN ('notified','under_investigation','reserve_set','negotiation','settled','closed','reopened','declined')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  handler_name VARCHAR(200),
  handler_email VARCHAR(200),
  correspondents JSONB DEFAULT '[]', -- local correspondents
  survey_reports JSONB DEFAULT '[]',
  legal_counsel VARCHAR(200),
  limitation_date DATE,
  settlement_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pi_claims_vessel ON public.pi_claims(vessel_id);
CREATE INDEX idx_pi_claims_org ON public.pi_claims(organization_id);
CREATE INDEX idx_pi_claims_status ON public.pi_claims(status);
CREATE INDEX idx_pi_claims_date ON public.pi_claims(incident_date DESC);

ALTER TABLE public.pi_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view pi claims" ON public.pi_claims FOR SELECT USING (true);
CREATE POLICY "Auth users can manage pi claims" ON public.pi_claims FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update pi claims" ON public.pi_claims FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete pi claims" ON public.pi_claims FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2) Pool Distribution & Revenue Sharing
CREATE TABLE public.pool_arrangements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_name VARCHAR(200) NOT NULL,
  pool_manager VARCHAR(200),
  pool_type VARCHAR(30) DEFAULT 'tanker' CHECK (pool_type IN ('tanker','bulk','container','gas','chemical','offshore')),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  entry_date DATE,
  exit_date DATE,
  pool_points NUMERIC(10,2) DEFAULT 100,
  adjustment_factor NUMERIC(6,4) DEFAULT 1.0000,
  base_tcein NUMERIC(12,2) DEFAULT 0, -- base TC equivalent income
  pool_distribution_pct NUMERIC(6,4) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  gross_revenue NUMERIC(14,2) DEFAULT 0,
  pool_expenses NUMERIC(14,2) DEFAULT 0,
  net_distribution NUMERIC(14,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','exited','pending')),
  vessel_class VARCHAR(50),
  dwt_range VARCHAR(50),
  ice_class VARCHAR(20),
  eco_rating VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pool_vessel ON public.pool_arrangements(vessel_id);
CREATE INDEX idx_pool_org ON public.pool_arrangements(organization_id);
CREATE INDEX idx_pool_status ON public.pool_arrangements(status);

ALTER TABLE public.pool_arrangements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view pool arrangements" ON public.pool_arrangements FOR SELECT USING (true);
CREATE POLICY "Auth users can manage pools" ON public.pool_arrangements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update pools" ON public.pool_arrangements FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete pools" ON public.pool_arrangements FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3) Pool Period Settlements
CREATE TABLE public.pool_settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.pool_arrangements(id) ON DELETE CASCADE,
  settlement_period VARCHAR(20), -- '2026-Q1', '2026-01'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trading_days INTEGER DEFAULT 0,
  off_hire_days NUMERIC(6,2) DEFAULT 0,
  earning_days NUMERIC(6,2) DEFAULT 0,
  gross_pool_revenue NUMERIC(14,2) DEFAULT 0,
  vessel_share NUMERIC(14,2) DEFAULT 0,
  pool_management_fee NUMERIC(14,2) DEFAULT 0,
  address_commission NUMERIC(14,2) DEFAULT 0,
  net_settlement NUMERIC(14,2) DEFAULT 0,
  tce_achieved NUMERIC(10,2) DEFAULT 0,
  pool_avg_tce NUMERIC(10,2) DEFAULT 0,
  variance_to_avg NUMERIC(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','calculated','approved','paid','disputed')),
  approved_by VARCHAR(200),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pool_settlements_pool ON public.pool_settlements(pool_id);

ALTER TABLE public.pool_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view pool settlements" ON public.pool_settlements FOR SELECT USING (true);
CREATE POLICY "Auth users can manage settlements" ON public.pool_settlements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update settlements" ON public.pool_settlements FOR UPDATE USING (auth.uid() IS NOT NULL);
