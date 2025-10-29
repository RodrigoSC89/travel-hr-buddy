-- PATCH 456: Navigation Copilot AI Logs
-- Table for storing navigation AI route calculations and alerts

CREATE TABLE IF NOT EXISTS navigation_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  origin JSONB NOT NULL, -- {lat, lng}
  destination JSONB NOT NULL, -- {lat, lng}
  route_id TEXT NOT NULL,
  route_type TEXT CHECK (route_type IN ('direct', 'alternative', 'optimized')),
  waypoints JSONB NOT NULL, -- Array of {lat, lng, timestamp, speed, heading}
  distance_nm DECIMAL(10, 2), -- Distance in nautical miles
  estimated_duration DECIMAL(8, 2), -- Duration in hours
  eta_with_ai TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  weather_alerts JSONB DEFAULT '[]', -- Array of weather alert objects
  recommended BOOLEAN DEFAULT FALSE,
  optimization_options JSONB, -- Options used for route optimization
  ai_metadata JSONB, -- Additional AI analysis data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_navigation_ai_logs_user_id ON navigation_ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_logs_created_at ON navigation_ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_logs_risk_score ON navigation_ai_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_logs_recommended ON navigation_ai_logs(recommended);

-- Row Level Security
ALTER TABLE navigation_ai_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own navigation logs"
  ON navigation_ai_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own navigation logs"
  ON navigation_ai_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own navigation logs"
  ON navigation_ai_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own navigation logs"
  ON navigation_ai_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_navigation_ai_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_navigation_ai_logs_updated_at
  BEFORE UPDATE ON navigation_ai_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_navigation_ai_logs_updated_at();

COMMENT ON TABLE navigation_ai_logs IS 'PATCH 456: Stores AI-powered navigation route calculations and alerts';
