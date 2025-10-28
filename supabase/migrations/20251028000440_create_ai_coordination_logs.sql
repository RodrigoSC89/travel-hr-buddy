-- PATCH 440: AI Coordination Layer - ai_coordination_logs table
-- Create table for storing AI coordination decisions and logs

CREATE TABLE IF NOT EXISTS public.ai_coordination_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Coordination metadata
  event_type TEXT NOT NULL CHECK (event_type IN ('decision', 'conflict', 'resolution', 'fallback', 'coordination', 'sync')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'error')),
  
  -- AI modules involved
  primary_module TEXT NOT NULL,
  involved_modules TEXT[], -- Array of module names
  
  -- Decision data
  decision_data JSONB NOT NULL, -- Stores the full decision context
  input_parameters JSONB, -- Input parameters that triggered the decision
  output_result JSONB, -- Result of the coordination
  
  -- Conflict resolution
  conflict_detected BOOLEAN DEFAULT false,
  conflict_type TEXT,
  resolution_strategy TEXT,
  fallback_used BOOLEAN DEFAULT false,
  
  -- Performance metrics
  processing_time_ms INTEGER, -- Time taken to process the coordination
  confidence_score DECIMAL(5,2), -- Confidence in the decision (0-100)
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'aborted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- User tracking (optional, for audit)
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Additional metadata
  metadata JSONB,
  error_message TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_event_type ON public.ai_coordination_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_primary_module ON public.ai_coordination_logs(primary_module);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_severity ON public.ai_coordination_logs(severity);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_created_at ON public.ai_coordination_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_status ON public.ai_coordination_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_conflict ON public.ai_coordination_logs(conflict_detected) WHERE conflict_detected = true;

-- Create GIN index for JSONB columns for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_decision_data ON public.ai_coordination_logs USING GIN(decision_data);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_logs_metadata ON public.ai_coordination_logs USING GIN(metadata);

-- Enable Row Level Security
ALTER TABLE public.ai_coordination_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to view all logs
CREATE POLICY "Authenticated users can view coordination logs"
  ON public.ai_coordination_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow system/service role to insert logs
CREATE POLICY "System can insert coordination logs"
  ON public.ai_coordination_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow system to update logs
CREATE POLICY "System can update coordination logs"
  ON public.ai_coordination_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.ai_coordination_logs TO authenticated;

-- Add comments
COMMENT ON TABLE public.ai_coordination_logs IS 'PATCH 440: Stores AI coordination decisions, conflicts, and resolutions between multiple AI modules';
COMMENT ON COLUMN public.ai_coordination_logs.event_type IS 'Type of coordination event: decision, conflict, resolution, fallback, coordination, sync';
COMMENT ON COLUMN public.ai_coordination_logs.primary_module IS 'Primary AI module initiating the coordination';
COMMENT ON COLUMN public.ai_coordination_logs.involved_modules IS 'Array of all AI modules involved in the coordination';
COMMENT ON COLUMN public.ai_coordination_logs.decision_data IS 'Full context and data for the coordination decision';
COMMENT ON COLUMN public.ai_coordination_logs.conflict_detected IS 'Whether a conflict was detected during coordination';
COMMENT ON COLUMN public.ai_coordination_logs.resolution_strategy IS 'Strategy used to resolve conflicts (priority, voting, fallback, etc)';
COMMENT ON COLUMN public.ai_coordination_logs.confidence_score IS 'Confidence score of the AI decision (0-100)';
