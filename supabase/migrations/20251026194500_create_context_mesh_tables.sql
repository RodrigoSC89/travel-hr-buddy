-- PATCH 216-220: Collective Intelligence System Database Schema

-- PATCH 216: Context History Table
CREATE TABLE IF NOT EXISTS context_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('mission', 'risk', 'ai', 'prediction', 'telemetry')),
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_context_history_module ON context_history(module_name);
CREATE INDEX idx_context_history_type ON context_history(context_type);
CREATE INDEX idx_context_history_timestamp ON context_history(timestamp DESC);
CREATE INDEX idx_context_history_sync_status ON context_history(sync_status);

-- PATCH 217: Decision Log Table
CREATE TABLE IF NOT EXISTS decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  decision_level TEXT NOT NULL CHECK (decision_level IN ('local', 'escalated', 'delegated', 'collaborative')),
  decision_type TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  action TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed', 'timeout')),
  timeout_ms INTEGER DEFAULT 5000,
  executed BOOLEAN DEFAULT FALSE,
  success BOOLEAN,
  error_message TEXT,
  simulation_results JSONB,
  escalation_reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decision_log_module ON decision_log(module_name);
CREATE INDEX idx_decision_log_level ON decision_log(decision_level);
CREATE INDEX idx_decision_log_status ON decision_log(status);
CREATE INDEX idx_decision_log_priority ON decision_log(priority);
CREATE INDEX idx_decision_log_timestamp ON decision_log(timestamp DESC);

-- PATCH 218: System Consciousness Table
CREATE TABLE IF NOT EXISTS system_consciousness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_type TEXT NOT NULL CHECK (observation_type IN ('loop_detection', 'conflict', 'failure_pattern', 'anomaly', 'health_check')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  modules_affected TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  description TEXT NOT NULL,
  detection_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggested_action TEXT,
  auto_correction_attempted BOOLEAN DEFAULT FALSE,
  auto_correction_result JSONB,
  escalated BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consciousness_type ON system_consciousness(observation_type);
CREATE INDEX idx_consciousness_severity ON system_consciousness(severity);
CREATE INDEX idx_consciousness_resolved ON system_consciousness(resolved);
CREATE INDEX idx_consciousness_timestamp ON system_consciousness(timestamp DESC);
CREATE INDEX idx_consciousness_modules ON system_consciousness USING GIN(modules_affected);

-- PATCH 219: Feedback Events Table
CREATE TABLE IF NOT EXISTS feedback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('human', 'ai', 'operational', 'system')),
  source_module TEXT NOT NULL,
  feedback_category TEXT NOT NULL CHECK (feedback_category IN ('accuracy', 'performance', 'suggestion', 'correction', 'rating', 'telemetry')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_metrics JSONB,
  impact_score NUMERIC(3, 2) CHECK (impact_score >= 0 AND impact_score <= 1),
  processed BOOLEAN DEFAULT FALSE,
  learning_applied BOOLEAN DEFAULT FALSE,
  learning_results JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_type ON feedback_events(feedback_type);
CREATE INDEX idx_feedback_module ON feedback_events(source_module);
CREATE INDEX idx_feedback_category ON feedback_events(feedback_category);
CREATE INDEX idx_feedback_processed ON feedback_events(processed);
CREATE INDEX idx_feedback_timestamp ON feedback_events(timestamp DESC);

-- Create RLS policies
ALTER TABLE context_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_consciousness ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all records
CREATE POLICY "Allow authenticated read on context_history" ON context_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on decision_log" ON decision_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on system_consciousness" ON system_consciousness FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on feedback_events" ON feedback_events FOR SELECT TO authenticated USING (true);

-- Allow service_role to insert/update records
CREATE POLICY "Allow service_role insert on context_history" ON context_history FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert on decision_log" ON decision_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert on system_consciousness" ON system_consciousness FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert on feedback_events" ON feedback_events FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service_role update on context_history" ON context_history FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service_role update on decision_log" ON decision_log FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service_role update on system_consciousness" ON system_consciousness FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service_role update on feedback_events" ON feedback_events FOR UPDATE TO service_role USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_context_history_updated_at BEFORE UPDATE ON context_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_log_updated_at BEFORE UPDATE ON decision_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_consciousness_updated_at BEFORE UPDATE ON system_consciousness
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_events_updated_at BEFORE UPDATE ON feedback_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
