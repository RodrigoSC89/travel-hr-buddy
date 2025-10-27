-- Migration: AI Performance Monitoring System
-- Description: Creates tables for tracking AI performance metrics, suggestions, and behavioral alerts

-- Table: ia_performance_log
-- Purpose: Track AI performance metrics including precision, recall, response time, and decision outcomes
CREATE TABLE IF NOT EXISTS public.ia_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  module_name TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  response_time_ms INTEGER,
  decision_accepted BOOLEAN,
  decision_overridden BOOLEAN,
  context JSONB,
  metadata JSONB
);

-- Table: ia_suggestions_log
-- Purpose: Track AI suggestions made to crew and their acceptance/rejection
CREATE TABLE IF NOT EXISTS public.ia_suggestions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  module_name TEXT NOT NULL,
  suggestion_type TEXT NOT NULL,
  suggestion_content TEXT,
  confidence_score DECIMAL(5,4),
  accepted_by_crew BOOLEAN,
  crew_user_id UUID REFERENCES auth.users(id),
  execution_time_ms INTEGER,
  context JSONB,
  metadata JSONB
);

-- Table: watchdog_behavior_alerts
-- Purpose: Track behavioral mutations and tactical deviations detected by System Watchdog
CREATE TABLE IF NOT EXISTS public.watchdog_behavior_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  module_name TEXT NOT NULL,
  behavior_mutation TEXT,
  tactical_deviation TEXT,
  strategy_fallback TEXT,
  autonomous_action BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  context JSONB,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ia_performance_module ON public.ia_performance_log(module_name);
CREATE INDEX IF NOT EXISTS idx_ia_performance_created ON public.ia_performance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ia_suggestions_module ON public.ia_suggestions_log(module_name);
CREATE INDEX IF NOT EXISTS idx_ia_suggestions_created ON public.ia_suggestions_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_severity ON public.watchdog_behavior_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_resolved ON public.watchdog_behavior_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_created ON public.watchdog_behavior_alerts(created_at DESC);

-- RLS Policies
ALTER TABLE public.ia_performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_suggestions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchdog_behavior_alerts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read performance logs
CREATE POLICY "Allow authenticated users to read ia_performance_log"
  ON public.ia_performance_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read suggestions log
CREATE POLICY "Allow authenticated users to read ia_suggestions_log"
  ON public.ia_suggestions_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read watchdog alerts
CREATE POLICY "Allow authenticated users to read watchdog_behavior_alerts"
  ON public.watchdog_behavior_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert logs
CREATE POLICY "Allow service role to insert ia_performance_log"
  ON public.ia_performance_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert ia_suggestions_log"
  ON public.ia_suggestions_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert watchdog_behavior_alerts"
  ON public.watchdog_behavior_alerts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update watchdog alerts (for resolution)
CREATE POLICY "Allow service role to update watchdog_behavior_alerts"
  ON public.watchdog_behavior_alerts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE public.ia_performance_log IS 'Tracks AI module performance metrics including precision, recall, and response times';
COMMENT ON TABLE public.ia_suggestions_log IS 'Tracks AI suggestions and their acceptance by crew members';
COMMENT ON TABLE public.watchdog_behavior_alerts IS 'Tracks behavioral mutations and tactical deviations detected by System Watchdog';
