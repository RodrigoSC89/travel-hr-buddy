-- PATCH 221-225: Cognitive Cloning Infrastructure
-- Migration for clone_registry, edge_ai_log, and clone_sync_log tables

-- Table: clone_registry
-- Stores cognitive snapshots and mirror instances
CREATE TABLE IF NOT EXISTS clone_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  snapshot_data JSONB NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_clone_registry_user_id ON clone_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_clone_registry_created_at ON clone_registry(created_at DESC);

-- RLS policies for clone_registry
ALTER TABLE clone_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clones"
  ON clone_registry FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own clones"
  ON clone_registry FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own clones"
  ON clone_registry FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own clones"
  ON clone_registry FOR DELETE
  USING (auth.uid()::text = user_id);

-- Table: edge_ai_log
-- Logs AI inference performance and metrics
CREATE TABLE IF NOT EXISTS edge_ai_log (
  id SERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  task TEXT NOT NULL,
  backend TEXT NOT NULL,
  latency_ms REAL NOT NULL,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_model_id ON edge_ai_log(model_id);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_backend ON edge_ai_log(backend);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_created_at ON edge_ai_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_success ON edge_ai_log(success);

-- RLS policies for edge_ai_log
ALTER TABLE edge_ai_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI logs"
  ON edge_ai_log FOR SELECT
  USING (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can create AI logs"
  ON edge_ai_log FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

-- Table: clone_sync_log
-- Audit log for clone synchronization operations
CREATE TABLE IF NOT EXISTS clone_sync_log (
  id SERIAL PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  items_synced INTEGER DEFAULT 0,
  bytes_transferred BIGINT DEFAULT 0,
  duration_ms INTEGER,
  errors JSONB,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sync analytics
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_source_id ON clone_sync_log(source_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_target_id ON clone_sync_log(target_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_status ON clone_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_created_at ON clone_sync_log(created_at DESC);

-- RLS policies for clone_sync_log
ALTER TABLE clone_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs"
  ON clone_sync_log FOR SELECT
  USING (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sync logs"
  ON clone_sync_log FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clone_registry
DROP TRIGGER IF EXISTS update_clone_registry_updated_at ON clone_registry;
CREATE TRIGGER update_clone_registry_updated_at
  BEFORE UPDATE ON clone_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE clone_registry IS 'Stores cognitive snapshots and mirror instances for distributed Nautilus operations';
COMMENT ON TABLE edge_ai_log IS 'Performance tracking and audit log for local AI inference operations';
COMMENT ON TABLE clone_sync_log IS 'Audit trail for instance synchronization operations';

COMMENT ON COLUMN clone_registry.snapshot_data IS 'JSONB containing full snapshot or instance configuration';
COMMENT ON COLUMN edge_ai_log.backend IS 'AI backend used: webgpu, webgl, wasm, or cpu';
COMMENT ON COLUMN edge_ai_log.latency_ms IS 'Inference latency in milliseconds';
COMMENT ON COLUMN clone_sync_log.operation IS 'Sync operation type: push, pull, or bidirectional';
COMMENT ON COLUMN clone_sync_log.status IS 'Sync status: success, failed, or in_progress';
