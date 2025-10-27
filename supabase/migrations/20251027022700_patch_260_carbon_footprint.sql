-- PATCH 260: Carbon Footprint Monitor - Sustentabilidade Operacional
-- Objetivo: Medir e reportar pegada de carbono das operações da frota e viagens

-- ============================================
-- Emission Records Table
-- ============================================
CREATE TABLE IF NOT EXISTS emission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number text UNIQUE NOT NULL,
  
  -- Source Information
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
  fuel_record_id uuid REFERENCES fuel_records(id) ON DELETE SET NULL,
  
  -- Emission Details
  record_date timestamptz DEFAULT now(),
  emission_source text NOT NULL CHECK (emission_source IN (
    'main_engine',
    'auxiliary_engine',
    'boiler',
    'generator',
    'shore_power',
    'other'
  )),
  
  -- Fuel Data
  fuel_type text NOT NULL CHECK (fuel_type IN ('mgo', 'mdo', 'hfo', 'lng', 'methanol', 'biofuel', 'other')),
  fuel_consumed_mt numeric NOT NULL CHECK (fuel_consumed_mt >= 0), -- Metric tons
  
  -- Emission Calculations
  co2_emitted_tons numeric NOT NULL CHECK (co2_emitted_tons >= 0),
  ch4_emitted_tons numeric CHECK (ch4_emitted_tons >= 0),
  n2o_emitted_tons numeric CHECK (n2o_emitted_tons >= 0),
  sox_emitted_tons numeric CHECK (sox_emitted_tons >= 0),
  nox_emitted_tons numeric CHECK (nox_emitted_tons >= 0),
  pm_emitted_tons numeric CHECK (pm_emitted_tons >= 0), -- Particulate matter
  
  -- CO2 Equivalent (includes all greenhouse gases)
  co2_equivalent_tons numeric GENERATED ALWAYS AS (
    co2_emitted_tons + 
    COALESCE(ch4_emitted_tons * 25, 0) + -- CH4 has 25x CO2 warming potential
    COALESCE(n2o_emitted_tons * 298, 0) -- N2O has 298x CO2 warming potential
  ) STORED,
  
  -- Operational Context
  distance_covered_nm numeric,
  operating_hours numeric,
  cargo_weight_tons numeric,
  vessel_speed_knots numeric,
  
  -- Efficiency Metrics
  emission_intensity numeric, -- CO2 per ton-mile
  fuel_efficiency numeric, -- Fuel per distance
  carbon_intensity numeric, -- CO2 per kWh or per ton-mile
  
  -- Calculation Method
  calculation_method text CHECK (calculation_method IN ('measured', 'estimated', 'imo_formula', 'epa_formula', 'custom')),
  emission_factors jsonb, -- Emission factors used in calculation
  
  -- Verification
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  verification_notes text,
  
  -- Compliance
  reporting_period text, -- e.g., 'Q1-2024', 'FY-2024'
  regulatory_framework text CHECK (regulatory_framework IN ('imo', 'eu_ets', 'epa', 'local', 'voluntary', 'other')),
  compliance_status text CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_review', 'exempt')),
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Emission records indexes
CREATE INDEX IF NOT EXISTS idx_emission_records_vessel ON emission_records(vessel_id);
CREATE INDEX IF NOT EXISTS idx_emission_records_route ON emission_records(route_id);
CREATE INDEX IF NOT EXISTS idx_emission_records_date ON emission_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_emission_records_source ON emission_records(emission_source);
CREATE INDEX IF NOT EXISTS idx_emission_records_period ON emission_records(reporting_period);

-- ============================================
-- Carbon Reports Table
-- ============================================
CREATE TABLE IF NOT EXISTS carbon_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number text UNIQUE NOT NULL,
  
  -- Report Metadata
  report_type text NOT NULL CHECK (report_type IN (
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'annual',
    'voyage',
    'custom'
  )),
  report_period_start timestamptz NOT NULL,
  report_period_end timestamptz NOT NULL,
  
  -- Scope
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  vessel_ids jsonb DEFAULT '[]'::jsonb, -- For fleet-wide reports
  route_ids jsonb DEFAULT '[]'::jsonb,
  
  -- Emission Summary
  total_co2_tons numeric DEFAULT 0 CHECK (total_co2_tons >= 0),
  total_co2_equivalent_tons numeric DEFAULT 0 CHECK (total_co2_equivalent_tons >= 0),
  total_fuel_consumed_mt numeric DEFAULT 0 CHECK (total_fuel_consumed_mt >= 0),
  total_distance_nm numeric DEFAULT 0,
  total_operating_hours numeric DEFAULT 0,
  
  -- Breakdown by Source
  emissions_by_source jsonb DEFAULT '{}'::jsonb,
  emissions_by_fuel_type jsonb DEFAULT '{}'::jsonb,
  emissions_by_vessel jsonb DEFAULT '{}'::jsonb,
  
  -- Targets and Goals
  emission_target_tons numeric,
  target_achievement_percentage numeric,
  variance_from_target numeric,
  target_status text CHECK (target_status IN ('on_track', 'at_risk', 'exceeded', 'achieved', 'not_set')),
  
  -- Trends
  comparison_to_previous_period jsonb,
  trend_direction text CHECK (trend_direction IN ('improving', 'stable', 'worsening')),
  year_over_year_change_percentage numeric,
  
  -- Offset & Credits
  carbon_offsets_purchased_tons numeric DEFAULT 0,
  carbon_credits_generated_tons numeric DEFAULT 0,
  net_emissions_tons numeric GENERATED ALWAYS AS (
    total_co2_equivalent_tons - COALESCE(carbon_offsets_purchased_tons, 0)
  ) STORED,
  
  -- Recommendations
  ai_insights text,
  reduction_recommendations jsonb DEFAULT '[]'::jsonb,
  estimated_reduction_potential_tons numeric,
  
  -- Compliance & Certification
  regulatory_compliance jsonb DEFAULT '{}'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  
  -- Report Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'archived')),
  generated_by text DEFAULT 'automated',
  
  -- Approval
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Distribution
  published_at timestamptz,
  recipients jsonb DEFAULT '[]'::jsonb,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Carbon reports indexes
CREATE INDEX IF NOT EXISTS idx_carbon_reports_vessel ON carbon_reports(vessel_id);
CREATE INDEX IF NOT EXISTS idx_carbon_reports_type ON carbon_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_carbon_reports_period ON carbon_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_carbon_reports_status ON carbon_reports(status);

-- ============================================
-- Emission Targets Table
-- ============================================
CREATE TABLE IF NOT EXISTS emission_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target Scope
  target_name text NOT NULL,
  description text,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  applies_to_fleet boolean DEFAULT false,
  
  -- Target Definition
  target_type text NOT NULL CHECK (target_type IN (
    'absolute_reduction',
    'intensity_reduction',
    'efficiency_improvement',
    'net_zero',
    'custom'
  )),
  baseline_year integer,
  baseline_emissions_tons numeric,
  target_emissions_tons numeric,
  reduction_percentage numeric,
  
  -- Timeline
  target_year integer NOT NULL,
  interim_targets jsonb DEFAULT '[]'::jsonb, -- Array of {year, target_tons}
  
  -- Progress Tracking
  current_emissions_tons numeric,
  progress_percentage numeric,
  on_track boolean,
  
  -- Strategies
  reduction_strategies jsonb DEFAULT '[]'::jsonb,
  investments_planned jsonb DEFAULT '[]'::jsonb,
  
  -- Compliance
  regulatory_requirement boolean DEFAULT false,
  regulatory_body text,
  penalty_for_non_compliance text,
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'missed', 'cancelled', 'under_review')),
  
  -- Review
  last_reviewed_at timestamptz,
  next_review_date timestamptz,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Emission targets indexes
CREATE INDEX IF NOT EXISTS idx_emission_targets_vessel ON emission_targets(vessel_id);
CREATE INDEX IF NOT EXISTS idx_emission_targets_year ON emission_targets(target_year);
CREATE INDEX IF NOT EXISTS idx_emission_targets_status ON emission_targets(status);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE emission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_targets ENABLE ROW LEVEL SECURITY;

-- Emission records policies
CREATE POLICY "Allow authenticated users to read emission records"
  ON emission_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert emission records"
  ON emission_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update emission records"
  ON emission_records FOR UPDATE TO authenticated USING (true);

-- Carbon reports policies
CREATE POLICY "Allow authenticated users to read carbon reports"
  ON carbon_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert carbon reports"
  ON carbon_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update carbon reports"
  ON carbon_reports FOR UPDATE TO authenticated USING (true);

-- Emission targets policies
CREATE POLICY "Allow authenticated users to read emission targets"
  ON emission_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert emission targets"
  ON emission_targets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update emission targets"
  ON emission_targets FOR UPDATE TO authenticated USING (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_emission_records_updated_at BEFORE UPDATE ON emission_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carbon_reports_updated_at BEFORE UPDATE ON carbon_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emission_targets_updated_at BEFORE UPDATE ON emission_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Emission Alert Trigger
-- ============================================

CREATE OR REPLACE FUNCTION check_emission_target()
RETURNS TRIGGER AS $$
DECLARE
  v_target_emissions numeric;
  v_current_total numeric;
  v_target_name text;
BEGIN
  -- Get active target for vessel
  SELECT target_emissions_tons, target_name
  INTO v_target_emissions, v_target_name
  FROM emission_targets
  WHERE vessel_id = NEW.vessel_id
    AND status = 'active'
    AND target_year = EXTRACT(YEAR FROM now())
  LIMIT 1;
  
  IF v_target_emissions IS NOT NULL THEN
    -- Calculate current total for the year
    SELECT COALESCE(SUM(co2_equivalent_tons), 0)
    INTO v_current_total
    FROM emission_records
    WHERE vessel_id = NEW.vessel_id
      AND EXTRACT(YEAR FROM record_date) = EXTRACT(YEAR FROM now());
    
    -- Create alert if target exceeded
    IF v_current_total > v_target_emissions THEN
      INSERT INTO access_logs (
        module_accessed,
        action,
        result,
        severity,
        details
      ) VALUES (
        'carbon-footprint',
        'emission_target_exceeded',
        'warning',
        'warning',
        jsonb_build_object(
          'vessel_id', NEW.vessel_id,
          'target_name', v_target_name,
          'target_emissions', v_target_emissions,
          'current_emissions', v_current_total,
          'variance', v_current_total - v_target_emissions,
          'variance_percentage', ((v_current_total - v_target_emissions) / v_target_emissions) * 100
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER emission_target_check AFTER INSERT ON emission_records
  FOR EACH ROW EXECUTE FUNCTION check_emission_target();

-- ============================================
-- Functions for Carbon Monitoring
-- ============================================

-- Function to calculate emissions from fuel consumption
CREATE OR REPLACE FUNCTION calculate_emissions_from_fuel(
  p_fuel_type text,
  p_fuel_amount_mt numeric
)
RETURNS TABLE (
  co2_tons numeric,
  sox_tons numeric,
  nox_tons numeric
) AS $$
DECLARE
  v_co2_factor numeric;
  v_sox_factor numeric;
  v_nox_factor numeric;
BEGIN
  -- IMO standard emission factors (approximate)
  CASE p_fuel_type
    WHEN 'hfo' THEN
      v_co2_factor := 3.114;  -- tons CO2 per ton fuel
      v_sox_factor := 0.054;
      v_nox_factor := 0.087;
    WHEN 'mgo' THEN
      v_co2_factor := 3.206;
      v_sox_factor := 0.001;
      v_nox_factor := 0.057;
    WHEN 'mdo' THEN
      v_co2_factor := 3.151;
      v_sox_factor := 0.015;
      v_nox_factor := 0.063;
    WHEN 'lng' THEN
      v_co2_factor := 2.750;
      v_sox_factor := 0.000;
      v_nox_factor := 0.005;
    ELSE
      v_co2_factor := 3.100; -- Default
      v_sox_factor := 0.020;
      v_nox_factor := 0.060;
  END CASE;
  
  RETURN QUERY SELECT 
    p_fuel_amount_mt * v_co2_factor,
    p_fuel_amount_mt * v_sox_factor,
    p_fuel_amount_mt * v_nox_factor;
END;
$$ LANGUAGE plpgsql;

-- Function to generate carbon report
CREATE OR REPLACE FUNCTION generate_carbon_report(
  p_vessel_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_report_type text DEFAULT 'custom'
)
RETURNS uuid AS $$
DECLARE
  v_report_id uuid;
  v_total_co2 numeric;
  v_total_co2eq numeric;
  v_total_fuel numeric;
  v_emissions_by_source jsonb;
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(co2_emitted_tons), 0),
    COALESCE(SUM(co2_equivalent_tons), 0),
    COALESCE(SUM(fuel_consumed_mt), 0)
  INTO v_total_co2, v_total_co2eq, v_total_fuel
  FROM emission_records
  WHERE vessel_id = p_vessel_id
    AND record_date BETWEEN p_start_date AND p_end_date;
  
  -- Get emissions by source
  SELECT jsonb_object_agg(emission_source, total_co2)
  INTO v_emissions_by_source
  FROM (
    SELECT 
      emission_source,
      SUM(co2_emitted_tons) as total_co2
    FROM emission_records
    WHERE vessel_id = p_vessel_id
      AND record_date BETWEEN p_start_date AND p_end_date
    GROUP BY emission_source
  ) sub;
  
  -- Create report
  INSERT INTO carbon_reports (
    report_number,
    report_type,
    report_period_start,
    report_period_end,
    vessel_id,
    total_co2_tons,
    total_co2_equivalent_tons,
    total_fuel_consumed_mt,
    emissions_by_source,
    status,
    generated_by
  ) VALUES (
    'CR-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8),
    p_report_type,
    p_start_date,
    p_end_date,
    p_vessel_id,
    v_total_co2,
    v_total_co2eq,
    v_total_fuel,
    v_emissions_by_source,
    'draft',
    'automated'
  )
  RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get emission summary
CREATE OR REPLACE FUNCTION get_emission_summary(
  p_vessel_id uuid DEFAULT NULL,
  p_days_back integer DEFAULT 30
)
RETURNS TABLE (
  total_co2_tons numeric,
  total_co2_equivalent_tons numeric,
  avg_daily_emissions numeric,
  trend_direction text,
  vs_target_percentage numeric
) AS $$
DECLARE
  v_total_co2 numeric;
  v_total_co2eq numeric;
  v_avg_daily numeric;
  v_recent_avg numeric;
  v_older_avg numeric;
  v_trend text;
  v_target numeric;
  v_vs_target numeric;
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(co2_emitted_tons), 0),
    COALESCE(SUM(co2_equivalent_tons), 0),
    COALESCE(AVG(co2_emitted_tons), 0)
  INTO v_total_co2, v_total_co2eq, v_avg_daily
  FROM emission_records
  WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
    AND record_date >= now() - (p_days_back || ' days')::interval;
  
  -- Calculate trend
  SELECT AVG(co2_emitted_tons) INTO v_recent_avg
  FROM emission_records
  WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
    AND record_date >= now() - interval '7 days';
  
  SELECT AVG(co2_emitted_tons) INTO v_older_avg
  FROM emission_records
  WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
    AND record_date >= now() - (p_days_back || ' days')::interval
    AND record_date < now() - interval '7 days';
  
  IF v_recent_avg > v_older_avg * 1.1 THEN
    v_trend := 'worsening';
  ELSIF v_recent_avg < v_older_avg * 0.9 THEN
    v_trend := 'improving';
  ELSE
    v_trend := 'stable';
  END IF;
  
  -- Check against target
  SELECT target_emissions_tons INTO v_target
  FROM emission_targets
  WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
    AND status = 'active'
    AND target_year = EXTRACT(YEAR FROM now())
  LIMIT 1;
  
  IF v_target IS NOT NULL AND v_target > 0 THEN
    v_vs_target := (v_total_co2eq / v_target) * 100;
  END IF;
  
  RETURN QUERY SELECT 
    v_total_co2,
    v_total_co2eq,
    v_avg_daily,
    v_trend,
    v_vs_target;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample emission targets
INSERT INTO emission_targets (
  target_name,
  description,
  applies_to_fleet,
  target_type,
  baseline_year,
  baseline_emissions_tons,
  target_emissions_tons,
  reduction_percentage,
  target_year,
  status
) VALUES (
  'IMO 2030 Target',
  'Reduce CO2 emissions by 40% compared to 2008 baseline',
  true,
  'absolute_reduction',
  2008,
  50000,
  30000,
  40,
  2030,
  'active'
),
(
  'Net Zero 2050',
  'Achieve net-zero emissions by 2050',
  true,
  'net_zero',
  2020,
  42000,
  0,
  100,
  2050,
  'active'
)
ON CONFLICT DO NOTHING;

-- Insert sample emission records
INSERT INTO emission_records (
  record_number,
  vessel_id,
  emission_source,
  fuel_type,
  fuel_consumed_mt,
  co2_emitted_tons,
  sox_emitted_tons,
  nox_emitted_tons,
  distance_covered_nm,
  calculation_method,
  reporting_period
)
SELECT 
  'ER-' || to_char(now(), 'YYYYMMDD') || '-001',
  v.id,
  'main_engine',
  'mgo',
  45.5,
  145.9, -- Using emission factor
  0.046,
  2.594,
  365,
  'imo_formula',
  'Q4-2025'
FROM vessels v
WHERE v.status = 'active'
LIMIT 1
ON CONFLICT (record_number) DO NOTHING;

-- ============================================
-- Views
-- ============================================

-- View for emission trends
CREATE OR REPLACE VIEW emission_trends AS
SELECT 
  vessel_id,
  DATE_TRUNC('month', record_date) as month,
  SUM(co2_emitted_tons) as monthly_co2,
  SUM(co2_equivalent_tons) as monthly_co2eq,
  SUM(fuel_consumed_mt) as monthly_fuel,
  AVG(carbon_intensity) as avg_carbon_intensity
FROM emission_records
WHERE record_date >= now() - interval '12 months'
GROUP BY vessel_id, DATE_TRUNC('month', record_date)
ORDER BY vessel_id, month DESC;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE emission_records IS 'Detailed emission records with multi-pollutant tracking and compliance status';
COMMENT ON TABLE carbon_reports IS 'Automated carbon footprint reports with targets, trends and recommendations';
COMMENT ON TABLE emission_targets IS 'Emission reduction targets with progress tracking and compliance monitoring';
