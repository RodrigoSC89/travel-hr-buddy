-- PATCH 517: Navegação Copiloto AI
-- AI-assisted navigation with route planning, risk analysis, and weather integration

-- Planned routes table
CREATE TABLE IF NOT EXISTS planned_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  origin_lat NUMERIC NOT NULL,
  origin_lng NUMERIC NOT NULL,
  destination_lat NUMERIC NOT NULL,
  destination_lng NUMERIC NOT NULL,
  waypoints JSONB DEFAULT '[]'::jsonb,
  distance_km NUMERIC,
  estimated_duration_hours NUMERIC,
  fuel_efficiency_score NUMERIC,
  risk_score NUMERIC CHECK (risk_score >= 0 AND risk_score <= 100),
  weather_risk_level TEXT CHECK (weather_risk_level IN ('low', 'medium', 'high', 'critical')),
  optimization_params JSONB DEFAULT '{}'::jsonb,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Navigation AI logs
CREATE TABLE IF NOT EXISTS navigation_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES planned_routes(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL CHECK (log_type IN ('calculation', 'optimization', 'risk_assessment', 'weather_alert', 'recommendation')),
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  ai_model TEXT,
  processing_time_ms NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Weather alerts for navigation
CREATE TABLE IF NOT EXISTS navigation_weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES planned_routes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('storm', 'high_waves', 'fog', 'wind', 'temperature')),
  severity TEXT NOT NULL CHECK (severity IN ('advisory', 'warning', 'critical')),
  location_lat NUMERIC NOT NULL,
  location_lng NUMERIC NOT NULL,
  radius_km NUMERIC,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Route optimization history
CREATE TABLE IF NOT EXISTS route_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES planned_routes(id) ON DELETE CASCADE,
  optimization_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  result_data JSONB NOT NULL,
  improvement_percentage NUMERIC,
  ai_confidence_score NUMERIC CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_planned_routes_status ON planned_routes(status);
CREATE INDEX IF NOT EXISTS idx_planned_routes_created_by ON planned_routes(created_by);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_logs_route_id ON navigation_ai_logs(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_logs_timestamp ON navigation_ai_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_weather_alerts_route_id ON navigation_weather_alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_weather_alerts_active ON navigation_weather_alerts(active);

-- Enable Row Level Security
ALTER TABLE planned_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to planned_routes" ON planned_routes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage planned_routes" ON planned_routes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to navigation_ai_logs" ON navigation_ai_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert navigation_ai_logs" ON navigation_ai_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to navigation_weather_alerts" ON navigation_weather_alerts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage navigation_weather_alerts" ON navigation_weather_alerts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to route_optimization_history" ON route_optimization_history FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert route_optimization_history" ON route_optimization_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp (reusable across patches)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER planned_routes_updated_at
  BEFORE UPDATE ON planned_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
