-- PATCH 458: Route Planner AI - Planned Routes
-- Extended table for AI-optimized planned routes with weather and traffic integration

-- Planned Routes Table (extends existing routes table concept)
CREATE TABLE IF NOT EXISTS planned_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  origin JSONB NOT NULL, -- {lat, lng}
  destination JSONB NOT NULL, -- {lat, lng}
  waypoints JSONB NOT NULL DEFAULT '[]', -- Array of waypoint objects
  distance_nm DECIMAL(10, 2), -- Distance in nautical miles
  estimated_duration DECIMAL(8, 2), -- Duration in hours
  fuel_consumption_estimate DECIMAL(10, 2), -- Estimated fuel in liters/tons
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  route_type TEXT CHECK (route_type IN ('direct', 'optimized', 'alternative', 'eco_friendly')),
  optimization_factors JSONB, -- {weather, traffic, fuel_efficiency, etc}
  weather_data JSONB, -- Weather conditions along route
  traffic_data JSONB, -- Traffic conditions
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  weather_alerts JSONB DEFAULT '[]',
  recommended BOOLEAN DEFAULT FALSE,
  eta_prediction TIMESTAMP WITH TIME ZONE,
  route_geometry JSONB, -- GeoJSON LineString
  ai_analysis JSONB, -- Detailed AI analysis and recommendations
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route Optimization History
CREATE TABLE IF NOT EXISTS route_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES planned_routes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  optimization_type TEXT,
  original_distance_nm DECIMAL(10, 2),
  optimized_distance_nm DECIMAL(10, 2),
  savings_nm DECIMAL(10, 2),
  savings_percentage DECIMAL(5, 2),
  factors_considered JSONB,
  ai_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_planned_routes_user_id ON planned_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_routes_vessel_id ON planned_routes(vessel_id);
CREATE INDEX IF NOT EXISTS idx_planned_routes_status ON planned_routes(status);
CREATE INDEX IF NOT EXISTS idx_planned_routes_created_at ON planned_routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_planned_routes_recommended ON planned_routes(recommended);
CREATE INDEX IF NOT EXISTS idx_planned_routes_risk_score ON planned_routes(risk_score);

CREATE INDEX IF NOT EXISTS idx_route_optimization_history_route_id ON route_optimization_history(route_id);
CREATE INDEX IF NOT EXISTS idx_route_optimization_history_user_id ON route_optimization_history(user_id);
CREATE INDEX IF NOT EXISTS idx_route_optimization_history_created_at ON route_optimization_history(created_at DESC);

-- Row Level Security
ALTER TABLE planned_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for planned_routes
CREATE POLICY "Users can view their own planned routes"
  ON planned_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planned routes"
  ON planned_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned routes"
  ON planned_routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned routes"
  ON planned_routes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for route_optimization_history
CREATE POLICY "Users can view their own optimization history"
  ON route_optimization_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimization history"
  ON route_optimization_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_planned_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_planned_routes_updated_at
  BEFORE UPDATE ON planned_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_planned_routes_updated_at();

-- View for route statistics
CREATE OR REPLACE VIEW planned_routes_stats AS
SELECT 
  user_id,
  COUNT(*) as total_routes,
  COUNT(*) FILTER (WHERE status = 'planned') as planned_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  AVG(distance_nm) as avg_distance,
  SUM(distance_nm) as total_distance,
  AVG(risk_score) as avg_risk_score
FROM planned_routes
GROUP BY user_id;

COMMENT ON TABLE planned_routes IS 'PATCH 458: AI-optimized routes with weather, traffic, and fuel considerations';
COMMENT ON TABLE route_optimization_history IS 'PATCH 458: History of route optimizations and AI recommendations';
