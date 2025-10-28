-- PATCH 440: AI Coordination Logs Table
-- Decision tracking across multiple AI modules with conflict detection and resolution

-- Create ai_coordination_logs table
CREATE TABLE IF NOT EXISTS public.ai_coordination_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI Module identification
  source_module TEXT NOT NULL CHECK (source_module IN ('automation-engine', 'feedback-analyzer', 'forecast-AI', 'sonar-ai', 'risk-analyzer', 'mission-planner', 'other')),
  target_module TEXT CHECK (target_module IN ('automation-engine', 'feedback-analyzer', 'forecast-AI', 'sonar-ai', 'risk-analyzer', 'mission-planner', 'other')),
  
  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN ('decision', 'conflict', 'resolution', 'fallback', 'coordination', 'sync', 'handoff', 'escalation')),
  
  -- Decision tracking
  decision_id TEXT,
  decision_type TEXT,
  decision_data JSONB DEFAULT '{}'::jsonb,
  
  -- Conflict detection
  conflict_detected BOOLEAN DEFAULT FALSE,
  conflict_type TEXT,
  conflict_data JSONB DEFAULT '{}'::jsonb,
  
  -- Resolution strategy
  resolution_strategy TEXT CHECK (resolution_strategy IN ('priority', 'consensus', 'fallback', 'escalation', 'manual', 'automatic', 'none')),
  resolution_data JSONB DEFAULT '{}'::jsonb,
  resolution_timestamp TIMESTAMPTZ,
  
  -- Confidence and performance metrics
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  execution_time_ms INTEGER,
  success BOOLEAN,
  
  -- Context and metadata
  context JSONB DEFAULT '{}'::jsonb,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  
  -- Related entities
  related_mission_id UUID,
  related_incident_id UUID,
  related_task_id UUID,
  
  -- Error handling
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Audit trail
  triggered_by TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_user_id ON public.ai_coordination_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_source_module ON public.ai_coordination_logs(source_module);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_target_module ON public.ai_coordination_logs(target_module);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_event_type ON public.ai_coordination_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_decision_id ON public.ai_coordination_logs(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_conflict_detected ON public.ai_coordination_logs(conflict_detected);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_created_at ON public.ai_coordination_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_triggered_at ON public.ai_coordination_logs(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_success ON public.ai_coordination_logs(success);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_module_event ON public.ai_coordination_logs(source_module, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_conflict_resolution ON public.ai_coordination_logs(conflict_detected, resolution_strategy, created_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_decision_data ON public.ai_coordination_logs USING GIN(decision_data);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_conflict_data ON public.ai_coordination_logs USING GIN(conflict_data);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_context ON public.ai_coordination_logs USING GIN(context);

-- Enable Row Level Security
ALTER TABLE public.ai_coordination_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user isolation

-- Policy: Users can view their own coordination logs
CREATE POLICY "Users can view own ai coordination logs"
  ON public.ai_coordination_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own coordination logs
CREATE POLICY "Users can insert own ai coordination logs"
  ON public.ai_coordination_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own coordination logs
CREATE POLICY "Users can update own ai coordination logs"
  ON public.ai_coordination_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own coordination logs
CREATE POLICY "Users can delete own ai coordination logs"
  ON public.ai_coordination_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_coordination_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_ai_coordination_logs_updated_at
  BEFORE UPDATE ON public.ai_coordination_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_coordination_logs_updated_at();

-- Function to track conflict resolution time
CREATE OR REPLACE FUNCTION track_ai_coordination_resolution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resolution_strategy IS NOT NULL AND OLD.resolution_strategy IS NULL THEN
    NEW.resolution_timestamp = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track resolution timestamp
CREATE TRIGGER trigger_track_ai_coordination_resolution
  BEFORE UPDATE ON public.ai_coordination_logs
  FOR EACH ROW
  EXECUTE FUNCTION track_ai_coordination_resolution();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_coordination_logs TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create view for conflict analysis
CREATE OR REPLACE VIEW ai_coordination_conflicts AS
SELECT 
  id,
  source_module,
  target_module,
  event_type,
  conflict_type,
  resolution_strategy,
  confidence_score,
  success,
  EXTRACT(EPOCH FROM (resolution_timestamp - triggered_at)) AS resolution_time_seconds,
  created_at
FROM public.ai_coordination_logs
WHERE conflict_detected = TRUE
ORDER BY created_at DESC;

-- Grant access to view
GRANT SELECT ON ai_coordination_conflicts TO authenticated;

-- Create view for module performance metrics
CREATE OR REPLACE VIEW ai_coordination_module_stats AS
SELECT 
  source_module,
  event_type,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE success = TRUE) AS successful_events,
  COUNT(*) FILTER (WHERE conflict_detected = TRUE) AS conflicts,
  AVG(confidence_score) AS avg_confidence,
  AVG(execution_time_ms) AS avg_execution_time_ms,
  MAX(created_at) AS last_event_at
FROM public.ai_coordination_logs
GROUP BY source_module, event_type
ORDER BY source_module, event_type;

-- Grant access to view
GRANT SELECT ON ai_coordination_module_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.ai_coordination_logs IS 'PATCH 440: Tracks AI coordination events, decisions, conflicts, and resolutions across multiple AI modules';
COMMENT ON COLUMN public.ai_coordination_logs.source_module IS 'AI module that initiated the coordination event';
COMMENT ON COLUMN public.ai_coordination_logs.target_module IS 'AI module that is the target of coordination';
COMMENT ON COLUMN public.ai_coordination_logs.event_type IS 'Type of coordination event: decision, conflict, resolution, fallback, coordination, sync';
COMMENT ON COLUMN public.ai_coordination_logs.conflict_detected IS 'Whether a conflict was detected between AI modules';
COMMENT ON COLUMN public.ai_coordination_logs.resolution_strategy IS 'Strategy used to resolve conflicts';
COMMENT ON COLUMN public.ai_coordination_logs.confidence_score IS 'Confidence score of the AI decision (0-100)';
COMMENT ON COLUMN public.ai_coordination_logs.decision_data IS 'Complete decision data and parameters';
COMMENT ON COLUMN public.ai_coordination_logs.conflict_data IS 'Details about detected conflicts';
COMMENT ON COLUMN public.ai_coordination_logs.context IS 'Contextual information for the coordination event';
