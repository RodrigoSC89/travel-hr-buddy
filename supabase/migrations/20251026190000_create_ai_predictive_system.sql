-- PATCH 206-210: AI Predictive & Tactical System Database Schema
-- Creates tables for predictive engine, tactical AI, adaptive metrics, and evolution tracking

-- Table: predictive_events (PATCH 206)
CREATE TABLE IF NOT EXISTS predictive_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  forecast_event TEXT NOT NULL CHECK (forecast_event IN ('normal', 'incident', 'downtime', 'overload')),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  factors TEXT[],
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictive_events_module ON predictive_events(module_name);
CREATE INDEX IF NOT EXISTS idx_predictive_events_predicted_at ON predictive_events(predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictive_events_risk_level ON predictive_events(risk_level);

-- Table: tactical_decisions (PATCH 207)
CREATE TABLE IF NOT EXISTS tactical_decisions (
  id TEXT PRIMARY KEY,
  module_name TEXT NOT NULL,
  action TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reason TEXT NOT NULL,
  context JSONB,
  executed BOOLEAN DEFAULT FALSE,
  success BOOLEAN,
  error TEXT,
  manual_override BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tactical_decisions_module ON tactical_decisions(module_name);
CREATE INDEX IF NOT EXISTS idx_tactical_decisions_created_at ON tactical_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tactical_decisions_priority ON tactical_decisions(priority);

-- Table: manual_overrides (PATCH 207)
CREATE TABLE IF NOT EXISTS manual_overrides (
  id TEXT PRIMARY KEY,
  module_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reason TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  disabled_by TEXT
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_manual_overrides_module ON manual_overrides(module_name);
CREATE INDEX IF NOT EXISTS idx_manual_overrides_enabled ON manual_overrides(enabled);

-- Table: adaptive_parameters (PATCH 208)
CREATE TABLE IF NOT EXISTS adaptive_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL UNIQUE,
  current_value DECIMAL NOT NULL,
  default_value DECIMAL NOT NULL,
  min_value DECIMAL NOT NULL,
  max_value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  adjustment_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: metric_history (PATCH 208)
CREATE TABLE IF NOT EXISTS metric_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  performance_score DECIMAL(3,2) CHECK (performance_score >= 0 AND performance_score <= 1),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_metric_history_parameter ON metric_history(parameter_name);
CREATE INDEX IF NOT EXISTS idx_metric_history_timestamp ON metric_history(timestamp DESC);

-- Table: parameter_adjustments (PATCH 208)
CREATE TABLE IF NOT EXISTS parameter_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL,
  old_value DECIMAL NOT NULL,
  new_value DECIMAL NOT NULL,
  adjusted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_parameter_adjustments_parameter ON parameter_adjustments(parameter_name);
CREATE INDEX IF NOT EXISTS idx_parameter_adjustments_adjusted_at ON parameter_adjustments(adjusted_at DESC);

-- Table: training_deltas (PATCH 209)
CREATE TABLE IF NOT EXISTS training_deltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deltas JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: performance_scores (PATCH 209)
CREATE TABLE IF NOT EXISTS performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_score DECIMAL(3,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 1),
  prediction_score DECIMAL(3,2) NOT NULL CHECK (prediction_score >= 0 AND prediction_score <= 1),
  adaptation_score DECIMAL(3,2) NOT NULL CHECK (adaptation_score >= 0 AND adaptation_score <= 1),
  tactical_score DECIMAL(3,2) NOT NULL CHECK (tactical_score >= 0 AND tactical_score <= 1),
  trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'degrading')),
  evolution_score DECIMAL(5,2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_performance_scores_timestamp ON performance_scores(timestamp DESC);

-- Table: evolution_insights (PATCH 209)
CREATE TABLE IF NOT EXISTS evolution_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  pattern TEXT NOT NULL,
  frequency INTEGER NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high')),
  recommendation TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_evolution_insights_category ON evolution_insights(category);
CREATE INDEX IF NOT EXISTS idx_evolution_insights_generated_at ON evolution_insights(generated_at DESC);

-- Table: fine_tune_requests (PATCH 209)
CREATE TABLE IF NOT EXISTS fine_tune_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evolution_score DECIMAL(5,2) NOT NULL,
  pattern_deviation DECIMAL(3,2) NOT NULL,
  training_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_fine_tune_requests_status ON fine_tune_requests(status);
CREATE INDEX IF NOT EXISTS idx_fine_tune_requests_requested_at ON fine_tune_requests(requested_at DESC);

-- Table: ai_model_config (PATCH 206)
CREATE TABLE IF NOT EXISTS ai_model_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,
  parameters JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE predictive_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameter_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_deltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_tune_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_config ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read predictive_events"
  ON predictive_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read tactical_decisions"
  ON tactical_decisions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read manual_overrides"
  ON manual_overrides FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read adaptive_parameters"
  ON adaptive_parameters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read metric_history"
  ON metric_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read parameter_adjustments"
  ON parameter_adjustments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read training_deltas"
  ON training_deltas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read performance_scores"
  ON performance_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read evolution_insights"
  ON evolution_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read fine_tune_requests"
  ON fine_tune_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read ai_model_config"
  ON ai_model_config FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for service role (full access)
CREATE POLICY "Allow service role full access to predictive_events"
  ON predictive_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to tactical_decisions"
  ON tactical_decisions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to manual_overrides"
  ON manual_overrides FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to adaptive_parameters"
  ON adaptive_parameters FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to metric_history"
  ON metric_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to parameter_adjustments"
  ON parameter_adjustments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to training_deltas"
  ON training_deltas FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to performance_scores"
  ON performance_scores FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to evolution_insights"
  ON evolution_insights FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to fine_tune_requests"
  ON fine_tune_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to ai_model_config"
  ON ai_model_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
