-- PATCHES 221-225: Cognitive Clone, Adaptive UI, Edge AI, Deployment, and Mirror Instances
-- Migration for creating all necessary tables for the new features

-- ============================================================================
-- PATCH 221: Cognitive Clone Core - Tables
-- ============================================================================

-- Clone Registry Table
CREATE TABLE IF NOT EXISTS clone_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  modules TEXT[] NOT NULL DEFAULT '{}',
  ai_context JSONB NOT NULL DEFAULT '{}',
  llm_config JSONB NOT NULL DEFAULT '{}',
  context_limit INTEGER DEFAULT 1000,
  capabilities TEXT[] DEFAULT '{}',
  restrictions TEXT[] DEFAULT '{}',
  parent_instance_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deploying', 'error')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clone Snapshots Table
CREATE TABLE IF NOT EXISTS clone_snapshots (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  modules JSONB NOT NULL DEFAULT '[]',
  context JSONB NOT NULL DEFAULT '{}',
  llm_state JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clone Context Storage Table
CREATE TABLE IF NOT EXISTS clone_context_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clone_id TEXT NOT NULL REFERENCES clone_registry(id) ON DELETE CASCADE,
  context_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Clone Registry
CREATE INDEX IF NOT EXISTS idx_clone_registry_status ON clone_registry(status);
CREATE INDEX IF NOT EXISTS idx_clone_registry_parent ON clone_registry(parent_instance_id);
CREATE INDEX IF NOT EXISTS idx_clone_registry_created_at ON clone_registry(created_at DESC);

-- Indexes for Clone Snapshots
CREATE INDEX IF NOT EXISTS idx_clone_snapshots_timestamp ON clone_snapshots(timestamp DESC);

-- Indexes for Clone Context Storage
CREATE INDEX IF NOT EXISTS idx_clone_context_storage_clone_id ON clone_context_storage(clone_id);

-- Enable RLS for Clone tables
ALTER TABLE clone_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE clone_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE clone_context_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Clone Registry
CREATE POLICY "Authenticated users can view clone registry"
  ON clone_registry FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage clone registry"
  ON clone_registry FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- RLS Policies for Clone Snapshots
CREATE POLICY "Authenticated users can view snapshots"
  ON clone_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage snapshots"
  ON clone_snapshots FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- RLS Policies for Clone Context Storage
CREATE POLICY "Authenticated users can view context storage"
  ON clone_context_storage FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage context storage"
  ON clone_context_storage FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- ============================================================================
-- PATCH 223: Edge AI Operations Core - Table
-- ============================================================================

-- Edge AI Log Table
CREATE TABLE IF NOT EXISTS edge_ai_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL CHECK (task IN ('route_optimization', 'failure_detection', 'quick_response', 'anomaly_detection', 'predictive_maintenance')),
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  inference_time_ms INTEGER NOT NULL,
  model_used TEXT NOT NULL,
  from_cache BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Edge AI Log
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_task ON edge_ai_log(task);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_created_at ON edge_ai_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_model ON edge_ai_log(model_used);

-- Enable RLS for Edge AI Log
ALTER TABLE edge_ai_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Edge AI Log
CREATE POLICY "Authenticated users can view edge ai logs"
  ON edge_ai_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert edge ai logs"
  ON edge_ai_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- PATCH 225: Mirror Instance Controller - Tables
-- ============================================================================

-- Mirror Instances Table
CREATE TABLE IF NOT EXISTS mirror_instances (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'syncing', 'error', 'offline')),
  last_seen TIMESTAMPTZ DEFAULT now(),
  sync_status JSONB NOT NULL DEFAULT '{"percentage": 0, "lastSync": null, "inProgress": false}',
  capabilities TEXT[] DEFAULT '{}',
  location JSONB,
  metrics JSONB DEFAULT '{"latency": 0, "uptime": 0, "memoryUsage": 0, "storageUsage": 0}',
  version TEXT DEFAULT '1.0.0',
  parent_instance_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clone Sync Log Table
CREATE TABLE IF NOT EXISTS clone_sync_log (
  id TEXT PRIMARY KEY,
  source_instance_id TEXT NOT NULL,
  target_instance_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('pull', 'push', 'bidirectional')),
  data_categories TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  items_synced INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Mirror Instances
CREATE INDEX IF NOT EXISTS idx_mirror_instances_status ON mirror_instances(status);
CREATE INDEX IF NOT EXISTS idx_mirror_instances_last_seen ON mirror_instances(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_mirror_instances_parent ON mirror_instances(parent_instance_id);

-- Indexes for Clone Sync Log
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_source ON clone_sync_log(source_instance_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_target ON clone_sync_log(target_instance_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_status ON clone_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_created_at ON clone_sync_log(created_at DESC);

-- Enable RLS for Mirror Instance tables
ALTER TABLE mirror_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE clone_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Mirror Instances
CREATE POLICY "Authenticated users can view mirror instances"
  ON mirror_instances FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage mirror instances"
  ON mirror_instances FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- RLS Policies for Clone Sync Log
CREATE POLICY "Authenticated users can view sync logs"
  ON clone_sync_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert sync logs"
  ON clone_sync_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sync logs"
  ON clone_sync_log FOR ALL
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

-- Apply update triggers to relevant tables
CREATE TRIGGER update_clone_registry_updated_at 
  BEFORE UPDATE ON clone_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clone_context_storage_updated_at 
  BEFORE UPDATE ON clone_context_storage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mirror_instances_updated_at 
  BEFORE UPDATE ON mirror_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE clone_registry IS 'PATCH 221: Registry of cognitive clone instances';
COMMENT ON TABLE clone_snapshots IS 'PATCH 221: Snapshots of system configuration for cloning';
COMMENT ON TABLE clone_context_storage IS 'PATCH 221: Storage for clone AI context and memories';
COMMENT ON TABLE edge_ai_log IS 'PATCH 223: Log of edge AI inference operations';
COMMENT ON TABLE mirror_instances IS 'PATCH 225: Registry of mirror Nautilus instances';
COMMENT ON TABLE clone_sync_log IS 'PATCH 225: Audit log for instance synchronization operations';
