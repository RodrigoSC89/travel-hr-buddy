-- PATCH 605: ESG & EEXI Compliance Tracker
-- Migration for creating ESG metrics and emissions log tables

-- Create esg_metrics table
CREATE TABLE IF NOT EXISTS public.esg_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('carbon_intensity', 'energy_efficiency', 'waste_management', 'water_usage', 'biodiversity', 'social_compliance', 'governance_score')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  measurement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reporting_period TEXT, -- e.g., "Q1 2025", "2024-11"
  target_value NUMERIC,
  baseline_value NUMERIC,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'at_risk', 'non_compliant', 'pending')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Create emissions_log table
CREATE TABLE IF NOT EXISTS public.emissions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  emission_type TEXT NOT NULL CHECK (emission_type IN ('co2', 'sox', 'nox', 'pm', 'ch4', 'total_ghg')),
  amount NUMERIC NOT NULL, -- in tonnes
  unit TEXT DEFAULT 'tonnes',
  measurement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  voyage_id UUID,
  distance_traveled NUMERIC, -- in nautical miles
  fuel_consumed NUMERIC, -- in tonnes
  fuel_type TEXT, -- e.g., 'HFO', 'MDO', 'LNG'
  eexi_value NUMERIC, -- Energy Efficiency Existing Ship Index
  cii_rating TEXT CHECK (cii_rating IN ('A', 'B', 'C', 'D', 'E')), -- Carbon Intensity Indicator
  calculation_method TEXT,
  verified BOOLEAN DEFAULT false,
  verifier_id UUID REFERENCES auth.users(id),
  verification_date TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_esg_metrics_vessel_id ON public.esg_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_type ON public.esg_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_date ON public.esg_metrics(measurement_date);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_period ON public.esg_metrics(reporting_period);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_status ON public.esg_metrics(compliance_status);

CREATE INDEX IF NOT EXISTS idx_emissions_log_vessel_id ON public.emissions_log(vessel_id);
CREATE INDEX IF NOT EXISTS idx_emissions_log_type ON public.emissions_log(emission_type);
CREATE INDEX IF NOT EXISTS idx_emissions_log_date ON public.emissions_log(measurement_date);
CREATE INDEX IF NOT EXISTS idx_emissions_log_voyage ON public.emissions_log(voyage_id);
CREATE INDEX IF NOT EXISTS idx_emissions_log_eexi ON public.emissions_log(eexi_value);
CREATE INDEX IF NOT EXISTS idx_emissions_log_cii ON public.emissions_log(cii_rating);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_esg_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER esg_metrics_updated_at
  BEFORE UPDATE ON public.esg_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_esg_metrics_updated_at();

CREATE OR REPLACE FUNCTION update_emissions_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER emissions_log_updated_at
  BEFORE UPDATE ON public.emissions_log
  FOR EACH ROW
  EXECUTE FUNCTION update_emissions_log_updated_at();

-- Enable RLS
ALTER TABLE public.esg_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emissions_log ENABLE ROW LEVEL SECURITY;

-- Create policies for esg_metrics
CREATE POLICY "Users can view all ESG metrics"
  ON public.esg_metrics
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ESG metrics"
  ON public.esg_metrics
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update ESG metrics they created"
  ON public.esg_metrics
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete ESG metrics"
  ON public.esg_metrics
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for emissions_log
CREATE POLICY "Users can view all emissions logs"
  ON public.emissions_log
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create emissions logs"
  ON public.emissions_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Verifiers can update emissions logs"
  ON public.emissions_log
  FOR UPDATE
  USING (
    auth.uid() = verifier_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete emissions logs"
  ON public.emissions_log
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.esg_metrics TO authenticated;
GRANT DELETE ON public.esg_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.emissions_log TO authenticated;
GRANT DELETE ON public.emissions_log TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.esg_metrics IS 'PATCH 605: Environmental, Social, and Governance metrics tracking';
COMMENT ON TABLE public.emissions_log IS 'PATCH 605: Detailed emissions logging for EEXI/CII compliance';
COMMENT ON COLUMN public.emissions_log.eexi_value IS 'Energy Efficiency Existing Ship Index (EEXI) value';
COMMENT ON COLUMN public.emissions_log.cii_rating IS 'Carbon Intensity Indicator (CII) rating: A (best) to E (worst)';
