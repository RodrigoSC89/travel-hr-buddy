-- PATCH 358: Fuel Optimizer v2 - AI Optimization Complete
-- Enhanced AI-powered fuel optimization with route suggestions and anomaly detection

-- Note: Base tables exist from PATCH 282, this adds AI optimization features

-- ============================================
-- 1. AI Route Optimization Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.fuel_ai_route_optimization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Route details
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  distance_nm NUMERIC NOT NULL,
  
  -- Input parameters
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  cargo_weight_tons NUMERIC,
  departure_date TIMESTAMPTZ,
  weather_data JSONB, -- Weather forecast data
  current_data JSONB, -- Ocean current data
  
  -- AI Model results
  ai_model_version TEXT DEFAULT 'v1.0',
  optimization_algorithm TEXT, -- 'genetic', 'gradient_descent', 'neural_network'
  
  -- Optimized route
  optimized_waypoints JSONB NOT NULL DEFAULT '[]', -- [{lat, lon, eta}]
  recommended_speed_knots NUMERIC,
  recommended_engine_load_percentage NUMERIC,
  
  -- Predictions
  baseline_fuel_consumption_mt NUMERIC NOT NULL,
  optimized_fuel_consumption_mt NUMERIC NOT NULL,
  predicted_fuel_savings_mt NUMERIC NOT NULL,
  predicted_fuel_savings_percentage NUMERIC,
  cost_savings_usd NUMERIC,
  
  -- Environmental impact
  co2_reduction_tons NUMERIC,
  nox_reduction_kg NUMERIC,
  
  -- Weather optimization
  weather_routing_benefit_percentage NUMERIC,
  avoided_rough_seas BOOLEAN DEFAULT false,
  optimal_departure_window JSONB, -- {start, end, reason}
  
  -- Confidence and validation
  confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 100),
  uncertainty_range JSONB, -- {min_savings, max_savings}
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'invalidated')),
  actual_fuel_used_mt NUMERIC,
  actual_vs_predicted_variance NUMERIC,
  
  -- Recommendations
  alternative_routes JSONB DEFAULT '[]',
  optimization_notes TEXT,
  risk_factors JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_fuel_ai_route_vessel ON public.fuel_ai_route_optimization(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_ai_route_date ON public.fuel_ai_route_optimization(departure_date DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_ai_route_savings ON public.fuel_ai_route_optimization(predicted_fuel_savings_percentage DESC);

-- ============================================
-- 2. Fuel Consumption Anomaly Detection
-- ============================================
CREATE TABLE IF NOT EXISTS public.fuel_consumption_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  consumption_log_id UUID REFERENCES public.fuel_consumption_logs(id) ON DELETE CASCADE,
  
  -- Anomaly details
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('excessive_consumption', 'efficiency_drop', 'unusual_pattern', 'equipment_issue', 'data_quality')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Detection
  detected_at TIMESTAMPTZ DEFAULT now(),
  detection_method TEXT, -- 'statistical', 'ml_model', 'rule_based'
  confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 100),
  
  -- Anomaly metrics
  expected_consumption_mt NUMERIC,
  actual_consumption_mt NUMERIC,
  deviation_percentage NUMERIC,
  
  -- Context
  operating_conditions JSONB, -- {speed, load, weather, cargo}
  historical_baseline JSONB, -- {avg, std_dev, min, max}
  
  -- Root cause analysis
  suspected_causes TEXT[],
  contributing_factors JSONB,
  
  -- Status and resolution
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  investigated_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  corrective_actions TEXT[],
  resolved_at TIMESTAMPTZ,
  
  -- Follow-up
  requires_maintenance BOOLEAN DEFAULT false,
  maintenance_ticket_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fuel_anomalies_vessel ON public.fuel_consumption_anomalies(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_anomalies_status ON public.fuel_consumption_anomalies(status);
CREATE INDEX IF NOT EXISTS idx_fuel_anomalies_severity ON public.fuel_consumption_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_fuel_anomalies_detected ON public.fuel_consumption_anomalies(detected_at DESC);

-- ============================================
-- 3. Fuel Savings Dashboard
-- ============================================
CREATE TABLE IF NOT EXISTS public.fuel_savings_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  
  -- Fleet or vessel specific
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  fleet_id UUID,
  
  -- Baseline vs Optimized
  total_routes_analyzed INTEGER DEFAULT 0,
  routes_optimized INTEGER DEFAULT 0,
  optimization_adoption_rate NUMERIC,
  
  -- Fuel metrics
  baseline_consumption_mt NUMERIC,
  actual_consumption_mt NUMERIC,
  fuel_saved_mt NUMERIC,
  fuel_savings_percentage NUMERIC,
  
  -- Cost metrics
  fuel_cost_savings_usd NUMERIC,
  optimization_roi NUMERIC,
  
  -- Environmental metrics
  co2_reduced_tons NUMERIC,
  environmental_score NUMERIC,
  
  -- Efficiency metrics
  avg_efficiency_improvement_percentage NUMERIC,
  best_performing_route TEXT,
  max_single_route_savings_mt NUMERIC,
  
  -- AI Performance
  ai_prediction_accuracy NUMERIC,
  avg_confidence_score NUMERIC,
  successful_optimizations INTEGER DEFAULT 0,
  failed_optimizations INTEGER DEFAULT 0,
  
  -- Anomalies
  anomalies_detected INTEGER DEFAULT 0,
  anomalies_resolved INTEGER DEFAULT 0,
  
  -- Trends
  trend_vs_previous_period TEXT CHECK (trend_vs_previous_period IN ('improving', 'stable', 'declining')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(period_start, period_end, vessel_id)
);

CREATE INDEX IF NOT EXISTS idx_fuel_savings_period ON public.fuel_savings_dashboard(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_savings_vessel ON public.fuel_savings_dashboard(vessel_id);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.fuel_ai_route_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_consumption_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_savings_dashboard ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

CREATE POLICY "Users can view fuel optimization data"
  ON public.fuel_ai_route_optimization FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create optimization requests"
  ON public.fuel_ai_route_optimization FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their optimization requests"
  ON public.fuel_ai_route_optimization FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (true);

CREATE POLICY "Users can view fuel anomalies"
  ON public.fuel_consumption_anomalies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage fuel anomalies"
  ON public.fuel_consumption_anomalies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view savings dashboard"
  ON public.fuel_savings_dashboard FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage savings dashboard"
  ON public.fuel_savings_dashboard FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================

-- Function to detect fuel consumption anomalies
CREATE OR REPLACE FUNCTION detect_fuel_anomalies(p_vessel_id UUID, p_consumption_log_id UUID)
RETURNS VOID AS $$
DECLARE
  v_log RECORD;
  v_baseline RECORD;
  v_deviation NUMERIC;
BEGIN
  -- Get consumption log
  SELECT * INTO v_log
  FROM public.fuel_consumption_logs
  WHERE id = p_consumption_log_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate baseline from historical data
  SELECT
    AVG(quantity_consumed) as avg_consumption,
    STDDEV(quantity_consumed) as std_dev,
    MIN(quantity_consumed) as min_consumption,
    MAX(quantity_consumed) as max_consumption
  INTO v_baseline
  FROM public.fuel_consumption_logs
  WHERE vessel_id = p_vessel_id
    AND log_date >= NOW() - INTERVAL '90 days'
    AND log_date < v_log.log_date;
  
  -- Calculate deviation
  v_deviation := ABS(v_log.quantity_consumed - v_baseline.avg_consumption) / NULLIF(v_baseline.std_dev, 0);
  
  -- Detect anomaly if deviation > 2 standard deviations
  IF v_deviation > 2 THEN
    INSERT INTO public.fuel_consumption_anomalies (
      vessel_id,
      consumption_log_id,
      anomaly_type,
      severity,
      detection_method,
      confidence_score,
      expected_consumption_mt,
      actual_consumption_mt,
      deviation_percentage,
      historical_baseline
    ) VALUES (
      p_vessel_id,
      p_consumption_log_id,
      CASE 
        WHEN v_log.quantity_consumed > v_baseline.avg_consumption THEN 'excessive_consumption'
        ELSE 'efficiency_drop'
      END,
      CASE 
        WHEN v_deviation > 4 THEN 'critical'
        WHEN v_deviation > 3 THEN 'high'
        ELSE 'medium'
      END,
      'statistical',
      LEAST(v_deviation * 25, 100),
      v_baseline.avg_consumption,
      v_log.quantity_consumed,
      ((v_log.quantity_consumed - v_baseline.avg_consumption) / NULLIF(v_baseline.avg_consumption, 0)) * 100,
      jsonb_build_object(
        'avg', v_baseline.avg_consumption,
        'std_dev', v_baseline.std_dev,
        'min', v_baseline.min_consumption,
        'max', v_baseline.max_consumption
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-detect anomalies
CREATE OR REPLACE FUNCTION trigger_anomaly_detection()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM detect_fuel_anomalies(NEW.vessel_id, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fuel_log_anomaly_detection
  AFTER INSERT ON public.fuel_consumption_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_anomaly_detection();

-- Update timestamps triggers
CREATE TRIGGER set_fuel_ai_route_updated_at 
  BEFORE UPDATE ON public.fuel_ai_route_optimization
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_fuel_anomalies_updated_at 
  BEFORE UPDATE ON public.fuel_consumption_anomalies
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
