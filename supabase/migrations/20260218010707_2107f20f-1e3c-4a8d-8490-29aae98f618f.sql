
-- ============================================
-- CHARTERING: Charter Parties (Spot/TC/COA) + EU ETS Tracking
-- ============================================

-- Charter Parties (extends existing time_charters with Spot/COA)
CREATE TABLE IF NOT EXISTS public.charter_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  charter_number VARCHAR(30) NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  
  -- Charter Type
  charter_type VARCHAR(20) NOT NULL, -- 'spot', 'time_charter', 'coa', 'bareboat'
  charter_form VARCHAR(50), -- 'GENCON', 'NYPE', 'SHELLTIME', 'BALTIME', 'ASBATANKVOY'
  
  -- Parties
  owner_name TEXT,
  charterer_name TEXT NOT NULL,
  broker_name TEXT,
  broker_commission NUMERIC, -- percentage
  address_commission NUMERIC, -- percentage
  
  -- Terms
  laycan_from DATE,
  laycan_to DATE,
  commencement_date DATE,
  redelivery_date DATE,
  min_duration_days INTEGER,
  max_duration_days INTEGER,
  
  -- Financial
  freight_rate NUMERIC, -- $/MT for spot, $/day for TC
  freight_currency VARCHAR(3) DEFAULT 'USD',
  freight_type VARCHAR(20), -- 'lumpsum', 'per_mt', 'per_day', 'worldscale'
  worldscale_rate NUMERIC, -- WS points if applicable
  hire_rate NUMERIC, -- $/day for TC
  ballast_bonus NUMERIC,
  
  -- Cargo (for Spot/COA)
  cargo_type TEXT,
  cargo_quantity_mt NUMERIC,
  cargo_quantity_tolerance NUMERIC, -- percentage MOLOO
  loading_port TEXT,
  discharge_port TEXT,
  
  -- COA specific
  coa_total_quantity_mt NUMERIC,
  coa_shipped_mt NUMERIC DEFAULT 0,
  coa_shipments_total INTEGER,
  coa_shipments_completed INTEGER DEFAULT 0,
  
  -- Laytime & Demurrage
  laytime_loading_hours NUMERIC,
  laytime_discharge_hours NUMERIC,
  demurrage_rate NUMERIC, -- $/day
  despatch_rate NUMERIC, -- $/day (usually half demurrage)
  laytime_terms VARCHAR(20), -- 'SHINC', 'SHEX', 'WWD'
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'negotiating',
  -- 'negotiating', 'on_subs', 'fixed', 'loading', 'sailing', 'discharging', 'completed', 'cancelled'
  
  -- Financials summary
  total_revenue NUMERIC,
  total_costs NUMERIC,
  net_profit NUMERIC,
  tce_achieved NUMERIC,
  
  -- Documents
  cp_document_id UUID,
  addendums JSONB DEFAULT '[]'::jsonb,
  
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EU ETS Maritime Tracking
CREATE TABLE IF NOT EXISTS public.eu_ets_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  reporting_year INTEGER NOT NULL,
  
  -- Voyage data
  voyage_id UUID,
  departure_port TEXT,
  arrival_port TEXT,
  voyage_type VARCHAR(20), -- 'intra_eu', 'incoming_eu', 'outgoing_eu', 'non_eu'
  
  -- Emissions
  total_co2_mt NUMERIC NOT NULL DEFAULT 0,
  co2_subject_to_ets NUMERIC NOT NULL DEFAULT 0, -- 100% intra-EU, 50% incoming/outgoing
  ets_percentage NUMERIC, -- 40% (2024), 70% (2025), 100% (2026+)
  
  -- Allowances
  allowances_required INTEGER DEFAULT 0,
  allowances_purchased INTEGER DEFAULT 0,
  allowance_price_eur NUMERIC, -- EUR/tonne at purchase
  total_cost_eur NUMERIC DEFAULT 0,
  
  -- FuelEU Maritime
  fuel_ghg_intensity NUMERIC, -- gCO2eq/MJ
  fueleu_target_intensity NUMERIC, -- gCO2eq/MJ (regulatory target)
  fueleu_compliance_balance NUMERIC, -- positive = surplus, negative = deficit
  fueleu_penalty_eur NUMERIC DEFAULT 0,
  
  -- Fuel details
  fuel_type VARCHAR(30), -- 'HFO', 'VLSFO', 'MGO', 'LNG', 'methanol', 'ammonia'
  fuel_consumed_mt NUMERIC,
  distance_nm NUMERIC,
  
  -- EEXI
  eexi_required NUMERIC,
  eexi_attained NUMERIC,
  eexi_compliant BOOLEAN,
  
  -- IMO DCS
  imo_dcs_reported BOOLEAN DEFAULT false,
  imo_dcs_submission_date DATE,
  
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'calculated', 'verified', 'submitted'
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_charter_parties_vessel ON public.charter_parties(vessel_id);
CREATE INDEX idx_charter_parties_type ON public.charter_parties(charter_type);
CREATE INDEX idx_charter_parties_status ON public.charter_parties(status);
CREATE INDEX idx_eu_ets_vessel ON public.eu_ets_tracking(vessel_id);
CREATE INDEX idx_eu_ets_year ON public.eu_ets_tracking(reporting_year);

-- RLS
ALTER TABLE public.charter_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eu_ets_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated manage charter_parties" ON public.charter_parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage eu_ets_tracking" ON public.eu_ets_tracking FOR ALL USING (true) WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_charter_parties_updated_at BEFORE UPDATE ON public.charter_parties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eu_ets_updated_at BEFORE UPDATE ON public.eu_ets_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
