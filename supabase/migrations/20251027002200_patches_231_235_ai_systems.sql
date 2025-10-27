-- PATCHES 231-235: AI Meta Strategy, Priority Balancing, Collective Memory, Self Evolution, and Performance Monitoring
-- Migration for creating all necessary tables and supporting infrastructure

-- ============================================================================
-- PATCH 231: Meta Strategy Engine - Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS meta_strategy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id TEXT NOT NULL,
  strategy_name TEXT NOT NULL,
  decision_data JSONB NOT NULL DEFAULT '{}',
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  justification TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Meta Strategy Log
CREATE INDEX IF NOT EXISTS idx_meta_strategy_log_strategy_id ON meta_strategy_log(strategy_id);
CREATE INDEX IF NOT EXISTS idx_meta_strategy_log_timestamp ON meta_strategy_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meta_strategy_log_confidence ON meta_strategy_log(confidence DESC);

-- Enable RLS for Meta Strategy Log
ALTER TABLE meta_strategy_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Meta Strategy Log
CREATE POLICY "Authenticated users can view meta strategy logs"
  ON meta_strategy_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert meta strategy logs"
  ON meta_strategy_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- PATCH 232: Auto Priority Balancer - Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS priority_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  task_id TEXT,
  old_priority INTEGER NOT NULL CHECK (old_priority >= 0 AND old_priority <= 100),
  new_priority INTEGER NOT NULL CHECK (new_priority >= 0 AND new_priority <= 100),
  reason TEXT NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Priority Shifts
CREATE INDEX IF NOT EXISTS idx_priority_shifts_module_id ON priority_shifts(module_id);
CREATE INDEX IF NOT EXISTS idx_priority_shifts_task_id ON priority_shifts(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_priority_shifts_timestamp ON priority_shifts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_priority_shifts_created_at ON priority_shifts(created_at DESC);

-- Enable RLS for Priority Shifts
ALTER TABLE priority_shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Priority Shifts
CREATE POLICY "Authenticated users can view priority shifts"
  ON priority_shifts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert priority shifts"
  ON priority_shifts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- PATCH 233: Collective Memory Hub - Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS collective_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  hash TEXT NOT NULL,
  source_instance_id TEXT NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1) DEFAULT 1.0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category, key, version)
);

-- Indexes for Collective Knowledge
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_category ON collective_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_key ON collective_knowledge(key);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_category_key ON collective_knowledge(category, key);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_source ON collective_knowledge(source_instance_id);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_version ON collective_knowledge(version DESC);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_hash ON collective_knowledge(hash);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_tags ON collective_knowledge USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_confidence ON collective_knowledge(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_created_at ON collective_knowledge(created_at DESC);

-- Enable RLS for Collective Knowledge
ALTER TABLE collective_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Collective Knowledge
CREATE POLICY "Authenticated users can view collective knowledge"
  ON collective_knowledge FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert collective knowledge"
  ON collective_knowledge FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update collective knowledge"
  ON collective_knowledge FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- PATCH 234: Self Evolution Model - Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS behavior_mutation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  mutation_type TEXT NOT NULL CHECK (mutation_type IN ('optimization', 'logic_change', 'algorithm_swap', 'parameter_tuning')),
  reason TEXT NOT NULL,
  old_performance JSONB NOT NULL,
  new_performance JSONB NOT NULL,
  improvement NUMERIC(5, 2),
  test_results JSONB NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Behavior Mutation Log
CREATE INDEX IF NOT EXISTS idx_behavior_mutation_log_function_id ON behavior_mutation_log(function_id);
CREATE INDEX IF NOT EXISTS idx_behavior_mutation_log_mutation_type ON behavior_mutation_log(mutation_type);
CREATE INDEX IF NOT EXISTS idx_behavior_mutation_log_approved ON behavior_mutation_log(approved);
CREATE INDEX IF NOT EXISTS idx_behavior_mutation_log_timestamp ON behavior_mutation_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_mutation_log_improvement ON behavior_mutation_log(improvement DESC);

-- Enable RLS for Behavior Mutation Log
ALTER TABLE behavior_mutation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Behavior Mutation Log
CREATE POLICY "Authenticated users can view behavior mutations"
  ON behavior_mutation_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert behavior mutations"
  ON behavior_mutation_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update behavior mutations"
  ON behavior_mutation_log FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- ============================================================================
-- PATCH 235: Multi-Agent Performance Scanner - Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  agent_name TEXT,
  agent_type TEXT CHECK (agent_type IN ('copilot', 'assistant', 'autonomous', 'worker')),
  performance_data JSONB,
  resource_usage JSONB,
  availability_data JSONB,
  specialization TEXT[],
  version TEXT,
  metric_type TEXT,
  metric_value NUMERIC,
  rank INTEGER,
  overall_score NUMERIC(3, 2),
  category_scores JSONB,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  context JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Agent Performance Metrics
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_agent_id ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_agent_type ON agent_performance_metrics(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_timestamp ON agent_performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_rank ON agent_performance_metrics(rank);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_overall_score ON agent_performance_metrics(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_metric_type ON agent_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_trend ON agent_performance_metrics(trend);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_specialization ON agent_performance_metrics USING GIN(specialization);

-- Enable RLS for Agent Performance Metrics
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Agent Performance Metrics
CREATE POLICY "Authenticated users can view agent metrics"
  ON agent_performance_metrics FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert agent metrics"
  ON agent_performance_metrics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage agent metrics"
  ON agent_performance_metrics FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- ============================================================================
-- Update Triggers
-- ============================================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to collective_knowledge table
DROP TRIGGER IF EXISTS update_collective_knowledge_updated_at ON collective_knowledge;
CREATE TRIGGER update_collective_knowledge_updated_at 
  BEFORE UPDATE ON collective_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Context Sync State Table (mentioned in problem statement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS context_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id TEXT NOT NULL,
  context_hash TEXT NOT NULL,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed')),
  last_sync TIMESTAMPTZ,
  configuration JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Context Sync State
CREATE INDEX IF NOT EXISTS idx_context_sync_state_instance_id ON context_sync_state(instance_id);
CREATE INDEX IF NOT EXISTS idx_context_sync_state_sync_status ON context_sync_state(sync_status);
CREATE INDEX IF NOT EXISTS idx_context_sync_state_last_sync ON context_sync_state(last_sync DESC);
CREATE INDEX IF NOT EXISTS idx_context_sync_state_context_hash ON context_sync_state(context_hash);

-- Enable RLS for Context Sync State
ALTER TABLE context_sync_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Context Sync State
CREATE POLICY "Authenticated users can view context sync state"
  ON context_sync_state FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage context sync state"
  ON context_sync_state FOR ALL
  WITH CHECK (auth.role() = 'authenticated');

-- Apply update trigger to context_sync_state
DROP TRIGGER IF EXISTS update_context_sync_state_updated_at ON context_sync_state;
CREATE TRIGGER update_context_sync_state_updated_at 
  BEFORE UPDATE ON context_sync_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE meta_strategy_log IS 'PATCH 231: Log of AI-generated strategic decisions with evaluations';
COMMENT ON TABLE priority_shifts IS 'PATCH 232: History of dynamic priority adjustments across modules';
COMMENT ON TABLE collective_knowledge IS 'PATCH 233: Shared knowledge base between AI instances with versioning';
COMMENT ON TABLE behavior_mutation_log IS 'PATCH 234: Record of AI behavior mutations and performance improvements';
COMMENT ON TABLE agent_performance_metrics IS 'PATCH 235: Continuous monitoring data for multi-agent performance';
COMMENT ON TABLE context_sync_state IS 'States of AI context synchronization and reconfiguration';

-- ============================================================================
-- Performance Optimization: Partitioning for large tables (optional)
-- ============================================================================

-- For very large deployments, consider partitioning by timestamp
-- Example for agent_performance_metrics (commented out by default):

-- ALTER TABLE agent_performance_metrics 
-- PARTITION BY RANGE (timestamp);

-- CREATE TABLE agent_performance_metrics_2025_10 
-- PARTITION OF agent_performance_metrics
-- FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- ============================================================================
-- Materialized Views for Analytics (optional)
-- ============================================================================

-- Create materialized view for agent rankings
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_rankings_current AS
SELECT DISTINCT ON (agent_id)
  agent_id,
  agent_name,
  rank,
  overall_score,
  category_scores,
  trend,
  timestamp
FROM agent_performance_metrics
WHERE rank IS NOT NULL
ORDER BY agent_id, timestamp DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_agent_rankings_current_rank ON agent_rankings_current(rank);
CREATE INDEX IF NOT EXISTS idx_agent_rankings_current_score ON agent_rankings_current(overall_score DESC);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_agent_rankings()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY agent_rankings_current;
END;
$$ LANGUAGE plpgsql;

COMMENT ON MATERIALIZED VIEW agent_rankings_current IS 'Current agent rankings with latest performance scores';
