
-- ============================================================
-- GAP COVERAGE: Missing tables for ESG & Emissions compliance
-- ============================================================

-- 1. EU ETS Allowances tracking
CREATE TABLE IF NOT EXISTS public.eu_ets_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  year INTEGER NOT NULL,
  total_emissions_tco2 NUMERIC(12,2),
  allowances_required INTEGER,
  allowances_purchased INTEGER DEFAULT 0,
  allowances_surrendered INTEGER DEFAULT 0,
  allowance_price_eur NUMERIC(10,2),
  total_cost_eur NUMERIC(14,2),
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'partial', 'compliant', 'non_compliant')),
  surrender_deadline DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. FuelEU Maritime compliance
CREATE TABLE IF NOT EXISTS public.fuel_eu_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  reporting_year INTEGER NOT NULL,
  ghg_intensity_actual NUMERIC(8,4),
  ghg_intensity_target NUMERIC(8,4),
  ghg_intensity_reference NUMERIC(8,4) DEFAULT 91.16,
  compliance_balance NUMERIC(10,2),
  surplus_deficit_grams NUMERIC(14,2),
  penalty_amount_eur NUMERIC(14,2) DEFAULT 0,
  shore_power_compliance BOOLEAN DEFAULT false,
  shore_power_hours NUMERIC(8,2) DEFAULT 0,
  biofuel_percentage NUMERIC(5,2) DEFAULT 0,
  lng_percentage NUMERIC(5,2) DEFAULT 0,
  methanol_percentage NUMERIC(5,2) DEFAULT 0,
  hydrogen_percentage NUMERIC(5,2) DEFAULT 0,
  ammonia_percentage NUMERIC(5,2) DEFAULT 0,
  pooling_partner_id UUID,
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'non_compliant', 'pooled')),
  fueleu_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. EEXI Calculations
CREATE TABLE IF NOT EXISTS public.eexi_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  imo_number TEXT,
  ship_type TEXT,
  dwt NUMERIC(12,2),
  gt NUMERIC(12,2),
  reference_speed_knots NUMERIC(6,2),
  main_engine_power_kw NUMERIC(10,2),
  aux_engine_power_kw NUMERIC(10,2),
  sfc_main_g_kwh NUMERIC(8,4),
  sfc_aux_g_kwh NUMERIC(8,4),
  cf_main NUMERIC(6,4) DEFAULT 3.206,
  cf_aux NUMERIC(6,4) DEFAULT 3.206,
  eexi_attained NUMERIC(10,4),
  eexi_required NUMERIC(10,4),
  reduction_factor_pct NUMERIC(5,2),
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'non_compliant', 'exempt')),
  epla_applied BOOLEAN DEFAULT false,
  shaft_power_limitation_pct NUMERIC(5,2),
  eedi_equivalent NUMERIC(10,4),
  technical_file_url TEXT,
  verified_by TEXT,
  verification_date DATE,
  class_society TEXT,
  mepc_reference TEXT DEFAULT 'MEPC.333(76)',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.eu_ets_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_eu_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eexi_calculations ENABLE ROW LEVEL SECURITY;

-- Policies for eu_ets_allowances
CREATE POLICY "Users can view eu_ets_allowances" ON public.eu_ets_allowances FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert eu_ets_allowances" ON public.eu_ets_allowances FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update eu_ets_allowances" ON public.eu_ets_allowances FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete eu_ets_allowances" ON public.eu_ets_allowances FOR DELETE USING (auth.uid() = created_by);

-- Policies for fuel_eu_compliance
CREATE POLICY "Users can view fuel_eu_compliance" ON public.fuel_eu_compliance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert fuel_eu_compliance" ON public.fuel_eu_compliance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update fuel_eu_compliance" ON public.fuel_eu_compliance FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete fuel_eu_compliance" ON public.fuel_eu_compliance FOR DELETE USING (auth.uid() = created_by);

-- Policies for eexi_calculations
CREATE POLICY "Users can view eexi_calculations" ON public.eexi_calculations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert eexi_calculations" ON public.eexi_calculations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update eexi_calculations" ON public.eexi_calculations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete eexi_calculations" ON public.eexi_calculations FOR DELETE USING (auth.uid() = created_by);

-- Indexes
CREATE INDEX idx_eu_ets_allowances_vessel ON public.eu_ets_allowances(vessel_id);
CREATE INDEX idx_eu_ets_allowances_year ON public.eu_ets_allowances(year);
CREATE INDEX idx_eu_ets_allowances_org ON public.eu_ets_allowances(organization_id);
CREATE INDEX idx_fuel_eu_compliance_vessel ON public.fuel_eu_compliance(vessel_id);
CREATE INDEX idx_fuel_eu_compliance_year ON public.fuel_eu_compliance(reporting_year);
CREATE INDEX idx_fuel_eu_compliance_org ON public.fuel_eu_compliance(organization_id);
CREATE INDEX idx_eexi_calculations_vessel ON public.eexi_calculations(vessel_id);
CREATE INDEX idx_eexi_calculations_org ON public.eexi_calculations(organization_id);
CREATE INDEX idx_eexi_calculations_status ON public.eexi_calculations(compliance_status);

-- Triggers
CREATE TRIGGER update_eu_ets_allowances_updated_at BEFORE UPDATE ON public.eu_ets_allowances FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_fuel_eu_compliance_updated_at BEFORE UPDATE ON public.fuel_eu_compliance FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_eexi_calculations_updated_at BEFORE UPDATE ON public.eexi_calculations FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

-- Also add missing detention_duration_hours to psc_inspections if not exists
DO $$ BEGIN
  ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS detention_duration_hours NUMERIC(8,2);
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add laytime_calculation_id to invoices if missing
DO $$ BEGIN
  ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS laytime_calculation_id UUID REFERENCES public.laytime_calculations(id);
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add work_order_number to maintenance_tasks if missing
DO $$ BEGIN
  ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS work_order_number TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add eexi_technical_file to vessels if missing
DO $$ BEGIN
  ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS eexi_technical_file TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;
