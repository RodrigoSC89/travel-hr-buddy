-- PATCH 410: Mission Control Database Schema
-- Tables for missions, logs, and AI insights

-- Missions Table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  mission_type VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('planned', 'in-progress', 'paused', 'completed', 'cancelled')),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  crew_required INTEGER,
  crew_assigned INTEGER,
  equipment_status VARCHAR(50),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mission Logs Table
CREATE TABLE IF NOT EXISTS mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  log_level VARCHAR(20) CHECK (log_level IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  source VARCHAR(100),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mission AI Insights Table
CREATE TABLE IF NOT EXISTS mission_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  insight_type VARCHAR(100) CHECK (insight_type IN ('optimization', 'risk', 'efficiency', 'prediction')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  impact VARCHAR(20) CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  recommendation TEXT,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_start_date ON missions(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_missions_assigned_to ON missions(assigned_to);

CREATE INDEX IF NOT EXISTS idx_mission_logs_mission_id ON mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_level ON mission_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_mission_logs_timestamp ON mission_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_mission_ai_insights_mission_id ON mission_ai_insights(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_ai_insights_type ON mission_ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_mission_ai_insights_impact ON mission_ai_insights(impact);
CREATE INDEX IF NOT EXISTS idx_mission_ai_insights_applied ON mission_ai_insights(applied);

-- Row Level Security
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions
CREATE POLICY "Users can view missions they created or are assigned to"
  ON missions FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can create missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their missions"
  ON missions FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- RLS Policies for mission_logs
CREATE POLICY "Users can view logs for their missions"
  ON mission_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_logs.mission_id
      AND (missions.created_by = auth.uid() OR missions.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can create logs for their missions"
  ON mission_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_logs.mission_id
      AND (missions.created_by = auth.uid() OR missions.assigned_to = auth.uid())
    )
  );

-- RLS Policies for mission_ai_insights
CREATE POLICY "Users can view insights for their missions"
  ON mission_ai_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_ai_insights.mission_id
      AND (missions.created_by = auth.uid() OR missions.assigned_to = auth.uid())
    )
  );

CREATE POLICY "System can insert AI insights"
  ON mission_ai_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update insights for their missions"
  ON mission_ai_insights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_ai_insights.mission_id
      AND (missions.created_by = auth.uid() OR missions.assigned_to = auth.uid())
    )
  );

-- Update triggers
CREATE OR REPLACE FUNCTION update_mission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_mission_updated_at();

CREATE TRIGGER update_mission_ai_insights_updated_at
  BEFORE UPDATE ON mission_ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_mission_updated_at();

-- Views for statistics
CREATE OR REPLACE VIEW mission_statistics AS
SELECT 
  COUNT(*) as total_missions,
  COUNT(*) FILTER (WHERE status = 'in-progress') as active_missions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_missions,
  COUNT(*) FILTER (WHERE status = 'paused') as paused_missions,
  AVG(progress) FILTER (WHERE status = 'in-progress') as avg_progress,
  AVG(actual_duration) FILTER (WHERE status = 'completed') as avg_duration
FROM missions;

COMMENT ON TABLE missions IS 'Mission planning and tracking';
COMMENT ON TABLE mission_logs IS 'Activity logs for missions';
COMMENT ON TABLE mission_ai_insights IS 'AI-generated insights and recommendations for missions';
