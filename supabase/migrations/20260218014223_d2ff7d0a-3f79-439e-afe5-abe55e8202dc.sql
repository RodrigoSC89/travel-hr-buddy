
-- Sprint 23-24: EU ETS & CII Enhancement

-- 1. EU ETS Voyage Emissions (new table)
CREATE TABLE IF NOT EXISTS public.eu_ets_voyage_emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  voyage_id UUID,
  reporting_year INTEGER NOT NULL,
  departure_port TEXT,
  arrival_port TEXT,
  departure_date DATE,
  arrival_date DATE,
  voyage_type TEXT,
  eu_applicability_pct NUMERIC(5,2) DEFAULT 100,
  fuel_type TEXT,
  fuel_consumed_mt NUMERIC(10,3),
  emission_factor NUMERIC(8,4),
  co2_emissions_mt NUMERIC(10,3),
  ch4_emissions_mt NUMERIC(10,5),
  n2o_emissions_mt NUMERIC(10,5),
  co2_equivalent_mt NUMERIC(10,3),
  allowances_required NUMERIC(10,2),
  phase_in_pct NUMERIC(5,2) DEFAULT 40,
  allowance_price_eur NUMERIC(10,2),
  total_cost_eur NUMERIC(12,2),
  ghg_intensity NUMERIC(10,4),
  fueleu_target NUMERIC(10,4),
  fueleu_compliance_balance NUMERIC(12,2),
  fueleu_penalty_eur NUMERIC(12,2),
  status TEXT DEFAULT 'draft',
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.eu_ets_voyage_emissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View ETS emissions" ON public.eu_ets_voyage_emissions FOR SELECT USING (true);
CREATE POLICY "Insert ETS emissions" ON public.eu_ets_voyage_emissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update ETS emissions" ON public.eu_ets_voyage_emissions FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_ets_vessel_year ON public.eu_ets_voyage_emissions(vessel_id, reporting_year);

-- 2. Expand cii_ratings with advanced fields
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS dwt NUMERIC(10,1);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS gt NUMERIC(10,1);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS vessel_type_cii TEXT;
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS total_fuel_mt NUMERIC(10,3);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS transport_work NUMERIC(14,1);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS reduction_factor_pct NUMERIC(5,2);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS cii_ratio NUMERIC(8,4);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS rating_boundary_lower NUMERIC(8,4);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS rating_boundary_upper NUMERIC(8,4);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS corrective_action_plan TEXT;
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS corrective_measures JSONB DEFAULT '[]';
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS projected_cii_next_year NUMERIC(10,6);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS projected_rating TEXT;
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS eexi_attained NUMERIC(10,4);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS eexi_required NUMERIC(10,4);
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS eexi_compliant BOOLEAN;
ALTER TABLE public.cii_ratings ADD COLUMN IF NOT EXISTS epla_installed BOOLEAN DEFAULT false;
