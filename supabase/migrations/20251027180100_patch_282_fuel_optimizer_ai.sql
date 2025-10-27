-- PATCH 282: Fuel Optimizer with AI Predictive
-- Tables: fuel_consumption_logs, fuel_routes, fuel_forecast

-- Create fuel_consumption_logs table
CREATE TABLE IF NOT EXISTS public.fuel_consumption_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  route_id UUID,
  log_date TIMESTAMPTZ DEFAULT now(),
  distance_nm NUMERIC NOT NULL CHECK (distance_nm >= 0),
  fuel_consumed NUMERIC NOT NULL CHECK (fuel_consumed >= 0),
  fuel_type TEXT CHECK (fuel_type IN ('diesel', 'heavy_fuel', 'lng', 'methanol', 'other')),
  average_speed NUMERIC CHECK (average_speed >= 0),
  engine_hours NUMERIC CHECK (engine_hours >= 0),
  cargo_weight NUMERIC CHECK (cargo_weight >= 0),
  weather_conditions TEXT,
  sea_state TEXT CHECK (sea_state IN ('calm', 'moderate', 'rough', 'very_rough')),
  wind_speed NUMERIC,
  current_speed NUMERIC,
  efficiency_rating NUMERIC CHECK (efficiency_rating >= 0 AND efficiency_rating <= 100),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create fuel_routes table
CREATE TABLE IF NOT EXISTS public.fuel_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  distance_nm NUMERIC NOT NULL CHECK (distance_nm >= 0),
  estimated_duration_hours NUMERIC CHECK (estimated_duration_hours >= 0),
  optimal_speed NUMERIC CHECK (optimal_speed >= 0),
  weather_factor NUMERIC DEFAULT 1.0 CHECK (weather_factor >= 0),
  traffic_factor NUMERIC DEFAULT 1.0 CHECK (traffic_factor >= 0),
  seasonal_factor NUMERIC DEFAULT 1.0 CHECK (seasonal_factor >= 0),
  route_waypoints JSONB DEFAULT '[]'::jsonb,
  historical_avg_consumption NUMERIC,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create fuel_forecast table
CREATE TABLE IF NOT EXISTS public.fuel_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  route_id UUID REFERENCES public.fuel_routes(id) ON DELETE CASCADE,
  forecast_date TIMESTAMPTZ DEFAULT now(),
  planned_departure TIMESTAMPTZ,
  planned_arrival TIMESTAMPTZ,
  distance_nm NUMERIC NOT NULL CHECK (distance_nm >= 0),
  cargo_weight NUMERIC CHECK (cargo_weight >= 0),
  planned_speed NUMERIC CHECK (planned_speed >= 0),
  weather_forecast TEXT,
  predicted_fuel_consumption NUMERIC NOT NULL CHECK (predicted_fuel_consumption >= 0),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  optimization_method TEXT CHECK (optimization_method IN ('manual', 'ai_basic', 'ai_advanced', 'ai_weather_optimized')),
  optimization_factors JSONB DEFAULT '{}'::jsonb,
  cost_estimate NUMERIC,
  co2_estimate NUMERIC,
  recommendations TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create fuel_optimization_comparisons table
CREATE TABLE IF NOT EXISTS public.fuel_optimization_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES public.fuel_forecast(id) ON DELETE CASCADE,
  actual_log_id UUID REFERENCES public.fuel_consumption_logs(id) ON DELETE SET NULL,
  planned_consumption NUMERIC NOT NULL,
  actual_consumption NUMERIC,
  variance_percentage NUMERIC,
  variance_amount NUMERIC,
  cost_savings NUMERIC,
  co2_savings NUMERIC,
  accuracy_score NUMERIC CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  analysis_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_logs_vessel ON public.fuel_consumption_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_logs_route ON public.fuel_consumption_logs(route_id);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_logs_date ON public.fuel_consumption_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_fuel_routes_active ON public.fuel_routes(is_active);
CREATE INDEX IF NOT EXISTS idx_fuel_forecast_vessel ON public.fuel_forecast(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_forecast_route ON public.fuel_forecast(route_id);
CREATE INDEX IF NOT EXISTS idx_fuel_forecast_date ON public.fuel_forecast(forecast_date);

-- Enable Row Level Security
ALTER TABLE public.fuel_consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_optimization_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view fuel logs"
  ON public.fuel_consumption_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create fuel logs"
  ON public.fuel_consumption_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view routes"
  ON public.fuel_routes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage routes"
  ON public.fuel_routes FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view forecasts"
  ON public.fuel_forecast FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create forecasts"
  ON public.fuel_forecast FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view comparisons"
  ON public.fuel_optimization_comparisons FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comparisons"
  ON public.fuel_optimization_comparisons FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function to calculate fuel efficiency
CREATE OR REPLACE FUNCTION calculate_fuel_efficiency(
  p_distance_nm NUMERIC,
  p_fuel_consumed NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_fuel_consumed = 0 THEN
    RETURN 0;
  END IF;
  RETURN p_distance_nm / p_fuel_consumed;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize fuel plan (AI simulation)
CREATE OR REPLACE FUNCTION optimize_fuel_plan(
  p_route_id UUID,
  p_cargo_weight NUMERIC DEFAULT 0,
  p_weather_condition TEXT DEFAULT 'normal',
  p_optimization_level TEXT DEFAULT 'ai_basic'
)
RETURNS JSONB AS $$
DECLARE
  v_route RECORD;
  v_historical_avg NUMERIC;
  v_weather_factor NUMERIC := 1.0;
  v_cargo_factor NUMERIC := 1.0;
  v_optimized_consumption NUMERIC;
  v_optimized_speed NUMERIC;
  v_recommendations TEXT[];
BEGIN
  -- Get route information
  SELECT * INTO v_route FROM public.fuel_routes WHERE id = p_route_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Route not found');
  END IF;
  
  -- Calculate historical average
  SELECT AVG(fuel_consumed / distance_nm) INTO v_historical_avg
  FROM public.fuel_consumption_logs
  WHERE route_id = p_route_id;
  
  IF v_historical_avg IS NULL THEN
    v_historical_avg := 0.15; -- Default consumption rate
  END IF;
  
  -- Apply weather factor
  CASE p_weather_condition
    WHEN 'excellent' THEN v_weather_factor := 0.9;
    WHEN 'good' THEN v_weather_factor := 0.95;
    WHEN 'normal' THEN v_weather_factor := 1.0;
    WHEN 'poor' THEN v_weather_factor := 1.1;
    WHEN 'bad' THEN v_weather_factor := 1.2;
    ELSE v_weather_factor := 1.0;
  END CASE;
  
  -- Apply cargo weight factor (every 1000 tons adds 2% consumption)
  IF p_cargo_weight > 0 THEN
    v_cargo_factor := 1.0 + (p_cargo_weight / 1000.0 * 0.02);
  END IF;
  
  -- Calculate optimized consumption based on optimization level
  CASE p_optimization_level
    WHEN 'ai_basic' THEN
      v_optimized_consumption := v_route.distance_nm * v_historical_avg * v_weather_factor * v_cargo_factor;
      v_optimized_speed := v_route.optimal_speed;
      v_recommendations := ARRAY['Maintain optimal speed', 'Monitor weather conditions'];
      
    WHEN 'ai_advanced' THEN
      v_optimized_consumption := v_route.distance_nm * v_historical_avg * v_weather_factor * v_cargo_factor * 0.95;
      v_optimized_speed := v_route.optimal_speed * 0.98;
      v_recommendations := ARRAY[
        'Reduce speed by 2% for 5% fuel savings',
        'Optimal departure window: Next 6 hours',
        'Consider route optimization for current conditions'
      ];
      
    WHEN 'ai_weather_optimized' THEN
      v_optimized_consumption := v_route.distance_nm * v_historical_avg * v_weather_factor * v_cargo_factor * 0.92;
      v_optimized_speed := v_route.optimal_speed * 0.95;
      v_recommendations := ARRAY[
        'Weather-optimized route available',
        'Reduce speed by 5% for 8% fuel savings',
        'Adjust course by 3° to avoid headwinds',
        'Estimated arrival delay: 2 hours (net fuel savings: 12%)'
      ];
      
    ELSE
      v_optimized_consumption := v_route.distance_nm * v_historical_avg * v_weather_factor * v_cargo_factor;
      v_optimized_speed := v_route.optimal_speed;
      v_recommendations := ARRAY['Standard fuel consumption estimate'];
  END CASE;
  
  -- Return optimization results
  RETURN jsonb_build_object(
    'route_id', p_route_id,
    'route_name', v_route.route_name,
    'distance_nm', v_route.distance_nm,
    'optimized_consumption', ROUND(v_optimized_consumption, 2),
    'optimized_speed', ROUND(v_optimized_speed, 2),
    'estimated_duration_hours', ROUND(v_route.distance_nm / v_optimized_speed, 2),
    'weather_factor', v_weather_factor,
    'cargo_factor', ROUND(v_cargo_factor, 3),
    'historical_avg_consumption', ROUND(v_historical_avg * v_route.distance_nm, 2),
    'fuel_savings_percentage', ROUND(((v_historical_avg * v_route.distance_nm - v_optimized_consumption) / (v_historical_avg * v_route.distance_nm)) * 100, 2),
    'cost_estimate', ROUND(v_optimized_consumption * 600, 2), -- Assuming $600 per ton
    'co2_estimate', ROUND(v_optimized_consumption * 3.114, 2), -- 3.114 tons CO2 per ton fuel
    'optimization_method', p_optimization_level,
    'recommendations', v_recommendations,
    'confidence_score', 85
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create comparison after voyage completion
CREATE OR REPLACE FUNCTION create_fuel_comparison()
RETURNS TRIGGER AS $$
DECLARE
  v_forecast RECORD;
BEGIN
  -- Find matching forecast
  SELECT * INTO v_forecast
  FROM public.fuel_forecast
  WHERE vessel_id = NEW.vessel_id
    AND route_id = NEW.route_id
    AND forecast_date >= NEW.log_date - INTERVAL '7 days'
    AND forecast_date <= NEW.log_date
  ORDER BY forecast_date DESC
  LIMIT 1;
  
  IF FOUND THEN
    INSERT INTO public.fuel_optimization_comparisons (
      forecast_id,
      actual_log_id,
      planned_consumption,
      actual_consumption,
      variance_percentage,
      variance_amount,
      accuracy_score
    ) VALUES (
      v_forecast.id,
      NEW.id,
      v_forecast.predicted_fuel_consumption,
      NEW.fuel_consumed,
      ROUND(((NEW.fuel_consumed - v_forecast.predicted_fuel_consumption) / v_forecast.predicted_fuel_consumption) * 100, 2),
      ROUND(NEW.fuel_consumed - v_forecast.predicted_fuel_consumption, 2),
      ROUND(100 - ABS(((NEW.fuel_consumed - v_forecast.predicted_fuel_consumption) / v_forecast.predicted_fuel_consumption) * 100), 2)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create comparison automatically
DROP TRIGGER IF EXISTS trigger_create_fuel_comparison ON public.fuel_consumption_logs;
CREATE TRIGGER trigger_create_fuel_comparison
  AFTER INSERT
  ON public.fuel_consumption_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_fuel_comparison();

-- Update timestamps trigger
DROP TRIGGER IF EXISTS set_fuel_routes_updated_at ON public.fuel_routes;
CREATE TRIGGER set_fuel_routes_updated_at
  BEFORE UPDATE ON public.fuel_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
