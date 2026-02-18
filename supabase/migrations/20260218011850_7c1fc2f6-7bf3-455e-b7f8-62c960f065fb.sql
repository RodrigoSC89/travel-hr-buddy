
-- =============================================
-- Sprint 13-14: Crew Competency Matrix + Port Cost Estimation
-- =============================================

-- Crew Competency Matrix
CREATE TABLE public.crew_competency_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID REFERENCES public.crew_members(id),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  competency_category TEXT NOT NULL, -- navigation, engineering, safety, cargo, communications, leadership
  competency_name TEXT NOT NULL,
  stcw_reference TEXT, -- e.g. "Table A-II/1", "Table A-III/1"
  current_level TEXT DEFAULT 'basic', -- basic, intermediate, advanced, expert
  required_level TEXT DEFAULT 'basic',
  assessment_date DATE,
  assessed_by UUID,
  assessment_method TEXT, -- practical, written, oral, simulator, onboard
  score NUMERIC(5,2),
  gap_analysis TEXT, -- auto-calculated gap description
  training_plan TEXT,
  next_assessment_date DATE,
  evidence_documents JSONB DEFAULT '[]',
  endorsements JSONB DEFAULT '[]', -- flag state endorsements
  sea_service_months INTEGER DEFAULT 0,
  simulator_hours NUMERIC(8,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crew_competency_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage competency matrix" ON public.crew_competency_matrix FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_competency_crew ON public.crew_competency_matrix(crew_member_id);
CREATE INDEX idx_competency_category ON public.crew_competency_matrix(competency_category);

-- Port Cost Estimation
CREATE TABLE public.port_cost_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  voyage_id UUID,
  port_name TEXT NOT NULL,
  port_code TEXT, -- UN/LOCODE
  country TEXT,
  region TEXT, -- Mediterranean, Baltic, SE Asia, etc.
  call_type TEXT DEFAULT 'loading', -- loading, discharging, bunkering, crew_change, drydock, transit
  estimated_arrival DATE,
  estimated_departure DATE,
  stay_duration_hours NUMERIC(8,2),
  -- Cost breakdown (USD)
  port_dues NUMERIC(12,2) DEFAULT 0,
  pilotage NUMERIC(12,2) DEFAULT 0,
  towage NUMERIC(12,2) DEFAULT 0,
  berth_hire NUMERIC(12,2) DEFAULT 0,
  mooring NUMERIC(12,2) DEFAULT 0,
  agency_fees NUMERIC(12,2) DEFAULT 0,
  canal_dues NUMERIC(12,2) DEFAULT 0,
  lighthouse_dues NUMERIC(12,2) DEFAULT 0,
  customs_fees NUMERIC(12,2) DEFAULT 0,
  immigration_fees NUMERIC(12,2) DEFAULT 0,
  health_clearance NUMERIC(12,2) DEFAULT 0,
  waste_disposal NUMERIC(12,2) DEFAULT 0,
  fresh_water NUMERIC(12,2) DEFAULT 0,
  provisions NUMERIC(12,2) DEFAULT 0,
  bunker_cost NUMERIC(12,2) DEFAULT 0,
  stevedoring NUMERIC(12,2) DEFAULT 0,
  cargo_handling NUMERIC(12,2) DEFAULT 0,
  other_costs NUMERIC(12,2) DEFAULT 0,
  total_estimated NUMERIC(14,2) DEFAULT 0,
  total_actual NUMERIC(14,2),
  variance_percent NUMERIC(5,2),
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,4) DEFAULT 1.0,
  -- DA (Disbursement Account) tracking
  da_status TEXT DEFAULT 'estimated', -- estimated, proforma, final, disputed
  da_number TEXT,
  agent_name TEXT,
  agent_reference TEXT,
  notes TEXT,
  historical_average NUMERIC(14,2),
  confidence_score NUMERIC(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.port_cost_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage port costs" ON public.port_cost_estimates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_port_cost_port ON public.port_cost_estimates(port_name);
CREATE INDEX idx_port_cost_vessel ON public.port_cost_estimates(vessel_id);

-- Triggers
CREATE TRIGGER update_crew_competency_matrix_updated_at BEFORE UPDATE ON public.crew_competency_matrix FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_port_cost_estimates_updated_at BEFORE UPDATE ON public.port_cost_estimates FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
