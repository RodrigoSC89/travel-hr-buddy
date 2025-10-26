-- PATCH 221-225: Cognitive Clone, Edge AI, and Mirror Instance Tables
-- Migration: Create tables for clone registry, edge AI logs, and instance sync logs

-- Clone Registry Table (PATCH 221)
CREATE TABLE IF NOT EXISTS public.clone_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clone_id TEXT UNIQUE NOT NULL,
  parent_id TEXT,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'syncing', 'error', 'offline')),
  snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status JSONB NOT NULL DEFAULT '{
    "lastSync": null,
    "syncPercentage": 0,
    "errors": []
  }'::jsonb
);

-- Indexes for clone_registry
CREATE INDEX IF NOT EXISTS idx_clone_registry_clone_id ON public.clone_registry(clone_id);
CREATE INDEX IF NOT EXISTS idx_clone_registry_parent_id ON public.clone_registry(parent_id);
CREATE INDEX IF NOT EXISTS idx_clone_registry_status ON public.clone_registry(status);
CREATE INDEX IF NOT EXISTS idx_clone_registry_created_by ON public.clone_registry(created_by);
CREATE INDEX IF NOT EXISTS idx_clone_registry_created_at ON public.clone_registry(created_at DESC);

-- Edge AI Log Table (PATCH 223)
CREATE TABLE IF NOT EXISTS public.edge_ai_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  model_id TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('routing', 'failure-detection', 'quick-response', 'classification', 'prediction', 'analysis')),
  latency NUMERIC NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  input_size INTEGER NOT NULL,
  output_size INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes for edge_ai_log
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_log_id ON public.edge_ai_log(log_id);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_model_id ON public.edge_ai_log(model_id);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_task_type ON public.edge_ai_log(task_type);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_timestamp ON public.edge_ai_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_success ON public.edge_ai_log(success);
CREATE INDEX IF NOT EXISTS idx_edge_ai_log_user_id ON public.edge_ai_log(user_id);

-- Clone Sync Log Table (PATCH 225)
CREATE TABLE IF NOT EXISTS public.clone_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source_instance_id TEXT NOT NULL,
  target_instance_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('push', 'pull', 'sync')),
  data_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  success BOOLEAN NOT NULL DEFAULT true,
  duration NUMERIC NOT NULL,
  bytes_transferred BIGINT NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes for clone_sync_log
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_log_id ON public.clone_sync_log(log_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_source_instance ON public.clone_sync_log(source_instance_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_target_instance ON public.clone_sync_log(target_instance_id);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_timestamp ON public.clone_sync_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_operation ON public.clone_sync_log(operation);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_success ON public.clone_sync_log(success);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_user_id ON public.clone_sync_log(user_id);

-- Row Level Security Policies

-- Clone Registry RLS
ALTER TABLE public.clone_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clones"
  ON public.clone_registry
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create clones"
  ON public.clone_registry
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clones"
  ON public.clone_registry
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own clones"
  ON public.clone_registry
  FOR DELETE
  USING (auth.uid() = created_by);

-- Edge AI Log RLS
ALTER TABLE public.edge_ai_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own edge AI logs"
  ON public.edge_ai_log
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create edge AI logs"
  ON public.edge_ai_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Clone Sync Log RLS
ALTER TABLE public.clone_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs"
  ON public.clone_sync_log
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sync logs"
  ON public.clone_sync_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to clone_registry
DROP TRIGGER IF EXISTS update_clone_registry_updated_at ON public.clone_registry;
CREATE TRIGGER update_clone_registry_updated_at
  BEFORE UPDATE ON public.clone_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.clone_registry IS 'PATCH 221: Stores cognitive clone configurations and sync status';
COMMENT ON TABLE public.edge_ai_log IS 'PATCH 223: Logs edge AI inference operations and performance metrics';
COMMENT ON TABLE public.clone_sync_log IS 'PATCH 225: Tracks synchronization operations between mirror instances';

COMMENT ON COLUMN public.clone_registry.snapshot IS 'Complete snapshot of clone configuration including modules, context, and LLM settings';
COMMENT ON COLUMN public.clone_registry.sync_status IS 'Current synchronization status with lastSync timestamp, percentage, and errors';
COMMENT ON COLUMN public.edge_ai_log.latency IS 'Inference execution time in milliseconds';
COMMENT ON COLUMN public.clone_sync_log.data_types IS 'Array of data types synchronized (configuration, logs, ai-models, telemetry, user-data, cache)';
COMMENT ON COLUMN public.clone_sync_log.bytes_transferred IS 'Total number of bytes transferred during sync operation';
