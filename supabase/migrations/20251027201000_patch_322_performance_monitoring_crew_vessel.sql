-- PATCH 322: Performance Monitoring Engine - Crew and Vessel Performance
-- Extends existing performance_metrics with crew and vessel specific tracking

-- 1. Create crew_performance table
CREATE TABLE IF NOT EXISTS public.crew_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Crew identification
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_period_start DATE NOT NULL,
  evaluation_period_end DATE NOT NULL,
  
  -- Performance metrics
  tasks_completed INTEGER DEFAULT 0,
  tasks_on_time INTEGER DEFAULT 0,
  tasks_delayed INTEGER DEFAULT 0,
  average_completion_time_hours NUMERIC,
  
  -- Quality metrics
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 100),
  incidents_reported INTEGER DEFAULT 0,
  incidents_caused INTEGER DEFAULT 0,
  safety_violations INTEGER DEFAULT 0,
  
  -- Efficiency metrics
  efficiency_rating NUMERIC CHECK (efficiency_rating >= 0 AND efficiency_rating <= 100),
  productivity_score NUMERIC CHECK (productivity_score >= 0 AND productivity_score <= 100),
  
  -- Skills and training
  certifications_completed INTEGER DEFAULT 0,
  training_hours NUMERIC DEFAULT 0,
  skill_assessments JSONB DEFAULT '[]', -- [{skill: '', level: 0-5, assessed_date: ''}]
  
  -- Behavioral metrics
  attendance_rate NUMERIC CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
  punctuality_score NUMERIC CHECK (punctuality_score >= 0 AND punctuality_score <= 100),
  collaboration_rating NUMERIC CHECK (collaboration_rating >= 0 AND collaboration_rating <= 100),
  
  -- Overall rating
  overall_performance_rating NUMERIC CHECK (overall_performance_rating >= 0 AND overall_performance_rating <= 100),
  performance_trend TEXT CHECK (performance_trend IN ('improving', 'stable', 'declining')),
  
  -- Comments and notes
  strengths TEXT[],
  areas_for_improvement TEXT[],
  supervisor_notes TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create vessel_performance table
CREATE TABLE IF NOT EXISTS public.vessel_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vessel identification
  vessel_id UUID, -- Reference to vessel/equipment
  vessel_name TEXT NOT NULL,
  evaluation_period_start DATE NOT NULL,
  evaluation_period_end DATE NOT NULL,
  
  -- Operational metrics
  total_operating_hours NUMERIC DEFAULT 0,
  distance_traveled_nm NUMERIC DEFAULT 0, -- Nautical miles
  average_speed_knots NUMERIC,
  max_speed_achieved_knots NUMERIC,
  
  -- Fuel efficiency
  fuel_consumption_total NUMERIC DEFAULT 0, -- Liters or tons
  fuel_consumption_per_nm NUMERIC, -- Fuel per nautical mile
  fuel_efficiency_rating NUMERIC CHECK (fuel_efficiency_rating >= 0 AND fuel_efficiency_rating <= 100),
  
  -- Engine performance
  engine_utilization_percentage NUMERIC CHECK (engine_utilization_percentage >= 0 AND engine_utilization_percentage <= 100),
  engine_efficiency_rating NUMERIC CHECK (engine_efficiency_rating >= 0 AND engine_efficiency_rating <= 100),
  engine_temperature_avg NUMERIC,
  engine_temperature_max NUMERIC,
  
  -- Maintenance metrics
  maintenance_tasks_completed INTEGER DEFAULT 0,
  unscheduled_maintenance_events INTEGER DEFAULT 0,
  downtime_hours NUMERIC DEFAULT 0,
  maintenance_compliance_rate NUMERIC CHECK (maintenance_compliance_rate >= 0 AND maintenance_compliance_rate <= 100),
  
  -- Safety metrics
  incidents_count INTEGER DEFAULT 0,
  safety_inspections_passed INTEGER DEFAULT 0,
  safety_inspections_failed INTEGER DEFAULT 0,
  safety_score NUMERIC CHECK (safety_score >= 0 AND safety_score <= 100),
  
  -- Delay and schedule metrics
  scheduled_trips INTEGER DEFAULT 0,
  trips_on_time INTEGER DEFAULT 0,
  trips_delayed INTEGER DEFAULT 0,
  average_delay_hours NUMERIC,
  schedule_adherence_rate NUMERIC CHECK (schedule_adherence_rate >= 0 AND schedule_adherence_rate <= 100),
  
  -- Environmental metrics
  emissions_co2_tons NUMERIC,
  environmental_compliance_score NUMERIC CHECK (environmental_compliance_score >= 0 AND environmental_compliance_score <= 100),
  
  -- Overall performance
  overall_performance_rating NUMERIC CHECK (overall_performance_rating >= 0 AND overall_performance_rating <= 100),
  performance_trend TEXT CHECK (performance_trend IN ('improving', 'stable', 'declining')),
  
  -- Comparison with fleet
  fleet_average_comparison NUMERIC, -- -100 to +100, where 0 is average
  rank_in_fleet INTEGER,
  
  -- Anomalies and alerts
  anomalies_detected INTEGER DEFAULT 0,
  critical_alerts INTEGER DEFAULT 0,
  warning_alerts INTEGER DEFAULT 0,
  
  -- Comments
  notable_events TEXT[],
  operator_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create performance_kpi_definitions table (configurable KPIs)
CREATE TABLE IF NOT EXISTS public.performance_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  kpi_name TEXT NOT NULL UNIQUE,
  kpi_category TEXT NOT NULL CHECK (kpi_category IN ('crew', 'vessel', 'operational', 'safety', 'efficiency')),
  description TEXT,
  
  -- Calculation
  calculation_formula TEXT, -- Human-readable formula
  unit TEXT, -- 'hours', 'percentage', 'count', 'knots', etc.
  
  -- Thresholds
  target_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  threshold_direction TEXT CHECK (threshold_direction IN ('above', 'below')), -- Alert when value goes above/below threshold
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  chart_type TEXT DEFAULT 'line' CHECK (chart_type IN ('line', 'bar', 'gauge', 'number')),
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  update_frequency TEXT DEFAULT 'daily' CHECK (update_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create performance_outliers table (for anomaly detection)
CREATE TABLE IF NOT EXISTS public.performance_outliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  entity_type TEXT NOT NULL CHECK (entity_type IN ('crew', 'vessel', 'system')),
  entity_id UUID NOT NULL,
  entity_name TEXT,
  
  -- Outlier details
  metric_name TEXT NOT NULL,
  expected_value NUMERIC,
  actual_value NUMERIC,
  deviation_percentage NUMERIC,
  
  -- Classification
  outlier_type TEXT NOT NULL CHECK (outlier_type IN ('positive', 'negative', 'neutral')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  
  -- Detection
  detection_method TEXT DEFAULT 'statistical', -- 'statistical', 'ml', 'rule-based'
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Status
  is_investigated BOOLEAN DEFAULT false,
  investigation_notes TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  
  -- Alert
  alert_generated BOOLEAN DEFAULT false,
  alert_id UUID,
  
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_crew_performance_member ON public.crew_performance(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_performance_period ON public.crew_performance(evaluation_period_start, evaluation_period_end);
CREATE INDEX IF NOT EXISTS idx_crew_performance_rating ON public.crew_performance(overall_performance_rating);
CREATE INDEX IF NOT EXISTS idx_crew_performance_trend ON public.crew_performance(performance_trend);

CREATE INDEX IF NOT EXISTS idx_vessel_performance_vessel ON public.vessel_performance(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_name ON public.vessel_performance(vessel_name);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_period ON public.vessel_performance(evaluation_period_start, evaluation_period_end);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_rating ON public.vessel_performance(overall_performance_rating);

CREATE INDEX IF NOT EXISTS idx_performance_kpi_category ON public.performance_kpi_definitions(kpi_category);
CREATE INDEX IF NOT EXISTS idx_performance_kpi_active ON public.performance_kpi_definitions(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_performance_outliers_entity ON public.performance_outliers(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_performance_outliers_severity ON public.performance_outliers(severity);
CREATE INDEX IF NOT EXISTS idx_performance_outliers_unresolved ON public.performance_outliers(is_resolved) WHERE is_resolved = false;

-- Enable RLS
ALTER TABLE public.crew_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_outliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view crew performance"
  ON public.crew_performance FOR SELECT
  TO authenticated
  USING (crew_member_id = auth.uid() OR true);

CREATE POLICY "Supervisors can manage crew performance"
  ON public.crew_performance FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view vessel performance"
  ON public.vessel_performance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage vessel performance"
  ON public.vessel_performance FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view KPI definitions"
  ON public.performance_kpi_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage KPI definitions"
  ON public.performance_kpi_definitions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view outliers"
  ON public.performance_outliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert outliers"
  ON public.performance_outliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to detect performance outliers using statistical methods
CREATE OR REPLACE FUNCTION detect_performance_outliers()
RETURNS VOID AS $$
DECLARE
  crew_record RECORD;
  vessel_record RECORD;
  avg_rating NUMERIC;
  std_dev NUMERIC;
BEGIN
  -- Detect crew performance outliers
  SELECT AVG(overall_performance_rating), STDDEV(overall_performance_rating)
  INTO avg_rating, std_dev
  FROM public.crew_performance
  WHERE evaluation_period_end >= CURRENT_DATE - INTERVAL '90 days';
  
  IF std_dev > 0 THEN
    FOR crew_record IN 
      SELECT * FROM public.crew_performance
      WHERE evaluation_period_end >= CURRENT_DATE - INTERVAL '90 days'
        AND ABS(overall_performance_rating - avg_rating) > (2 * std_dev)
    LOOP
      INSERT INTO public.performance_outliers (
        entity_type,
        entity_id,
        metric_name,
        expected_value,
        actual_value,
        deviation_percentage,
        outlier_type,
        severity,
        detection_method,
        confidence_score
      ) VALUES (
        'crew',
        crew_record.crew_member_id,
        'overall_performance_rating',
        avg_rating,
        crew_record.overall_performance_rating,
        ((crew_record.overall_performance_rating - avg_rating) / avg_rating * 100),
        CASE WHEN crew_record.overall_performance_rating > avg_rating THEN 'positive' ELSE 'negative' END,
        CASE WHEN ABS(crew_record.overall_performance_rating - avg_rating) > (3 * std_dev) THEN 'critical' ELSE 'major' END,
        'statistical',
        0.85
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  -- Detect vessel performance outliers
  SELECT AVG(overall_performance_rating), STDDEV(overall_performance_rating)
  INTO avg_rating, std_dev
  FROM public.vessel_performance
  WHERE evaluation_period_end >= CURRENT_DATE - INTERVAL '90 days';
  
  IF std_dev > 0 THEN
    FOR vessel_record IN 
      SELECT * FROM public.vessel_performance
      WHERE evaluation_period_end >= CURRENT_DATE - INTERVAL '90 days'
        AND ABS(overall_performance_rating - avg_rating) > (2 * std_dev)
    LOOP
      INSERT INTO public.performance_outliers (
        entity_type,
        entity_id,
        entity_name,
        metric_name,
        expected_value,
        actual_value,
        deviation_percentage,
        outlier_type,
        severity,
        detection_method,
        confidence_score
      ) VALUES (
        'vessel',
        vessel_record.vessel_id,
        vessel_record.vessel_name,
        'overall_performance_rating',
        avg_rating,
        vessel_record.overall_performance_rating,
        ((vessel_record.overall_performance_rating - avg_rating) / avg_rating * 100),
        CASE WHEN vessel_record.overall_performance_rating > avg_rating THEN 'positive' ELSE 'negative' END,
        CASE WHEN ABS(vessel_record.overall_performance_rating - avg_rating) > (3 * std_dev) THEN 'critical' ELSE 'major' END,
        'statistical',
        0.85
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default KPI definitions
INSERT INTO public.performance_kpi_definitions (kpi_name, kpi_category, description, unit, target_value, threshold_direction, display_order)
VALUES 
  ('average_speed', 'vessel', 'Average vessel speed', 'knots', 15.0, 'below', 1),
  ('fuel_efficiency', 'vessel', 'Fuel consumption efficiency', 'percentage', 85.0, 'below', 2),
  ('maintenance_compliance', 'vessel', 'Maintenance schedule compliance', 'percentage', 95.0, 'below', 3),
  ('schedule_adherence', 'vessel', 'On-time performance rate', 'percentage', 90.0, 'below', 4),
  ('crew_productivity', 'crew', 'Overall crew productivity score', 'percentage', 80.0, 'below', 5),
  ('task_completion_rate', 'crew', 'Tasks completed on time', 'percentage', 90.0, 'below', 6),
  ('safety_compliance', 'safety', 'Safety compliance score', 'percentage', 100.0, 'below', 7),
  ('incident_rate', 'safety', 'Number of incidents per period', 'count', 0, 'above', 8)
ON CONFLICT (kpi_name) DO NOTHING;

-- Update timestamps triggers
CREATE TRIGGER set_crew_performance_updated_at BEFORE UPDATE ON public.crew_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_vessel_performance_updated_at BEFORE UPDATE ON public.vessel_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_performance_kpi_definitions_updated_at BEFORE UPDATE ON public.performance_kpi_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
