-- PATCHES 226-230: Interoperability & Multi-Agent System Database Schema

-- PATCH 226: Interop Log Table (Protocol Adapter)
CREATE TABLE IF NOT EXISTS interop_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT NOT NULL CHECK (protocol IN ('json-rpc', 'graphql', 'ais', 'gmdss', 'nato-stanag')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  source_system TEXT NOT NULL,
  target_system TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  parsed_data JSONB,
  validation_status TEXT NOT NULL CHECK (validation_status IN ('valid', 'invalid', 'pending', 'error')),
  validation_errors TEXT[],
  routed_to TEXT,
  trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100),
  response_data JSONB,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rejected')),
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interop_log_protocol ON interop_log(protocol);
CREATE INDEX idx_interop_log_direction ON interop_log(direction);
CREATE INDEX idx_interop_log_source ON interop_log(source_system);
CREATE INDEX idx_interop_log_status ON interop_log(status);
CREATE INDEX idx_interop_log_timestamp ON interop_log(timestamp DESC);
CREATE INDEX idx_interop_log_trust_score ON interop_log(trust_score);

-- PATCH 227: Agent Swarm Metrics Table
CREATE TABLE IF NOT EXISTS agent_swarm_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('llm', 'copilot', 'sensor', 'drone', 'analyzer', 'executor', 'coordinator')),
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('registered', 'active', 'idle', 'busy', 'offline', 'error', 'deregistered')),
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  task_id UUID,
  task_payload JSONB,
  task_status TEXT CHECK (task_status IN ('pending', 'assigned', 'processing', 'completed', 'failed', 'timeout')),
  result_data JSONB,
  processing_time_ms INTEGER,
  success_rate NUMERIC(5, 2) CHECK (success_rate >= 0 AND success_rate <= 100),
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_failed INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_swarm_agent_id ON agent_swarm_metrics(agent_id);
CREATE INDEX idx_agent_swarm_agent_type ON agent_swarm_metrics(agent_type);
CREATE INDEX idx_agent_swarm_status ON agent_swarm_metrics(status);
CREATE INDEX idx_agent_swarm_task_status ON agent_swarm_metrics(task_status);
CREATE INDEX idx_agent_swarm_timestamp ON agent_swarm_metrics(timestamp DESC);

-- PATCH 228: Joint Mission Log Table
CREATE TABLE IF NOT EXISTS joint_mission_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('surveillance', 'rescue', 'transport', 'maintenance', 'training', 'combat', 'humanitarian', 'intelligence')),
  mission_status TEXT NOT NULL DEFAULT 'planning' CHECK (mission_status IN ('planning', 'assigned', 'executing', 'paused', 'completed', 'failed', 'cancelled')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  external_entities JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_systems TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'partial', 'failed')),
  sync_errors TEXT[],
  last_sync_at TIMESTAMPTZ,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  estimated_duration_hours NUMERIC(8, 2),
  actual_duration_hours NUMERIC(8, 2),
  commander TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  mission_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_joint_mission_mission_id ON joint_mission_log(mission_id);
CREATE INDEX idx_joint_mission_status ON joint_mission_log(mission_status);
CREATE INDEX idx_joint_mission_priority ON joint_mission_log(priority);
CREATE INDEX idx_joint_mission_sync_status ON joint_mission_log(sync_status);
CREATE INDEX idx_joint_mission_timestamp ON joint_mission_log(timestamp DESC);
CREATE INDEX idx_joint_mission_start_time ON joint_mission_log(start_time);

-- PATCH 229: Trust Events Table
CREATE TABLE IF NOT EXISTS trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('validation', 'breach', 'alert', 'audit', 'whitelist_check', 'blacklist_check')),
  source_system TEXT NOT NULL,
  source_ip TEXT,
  source_protocol TEXT,
  trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'suspicious', 'blocked', 'pending')),
  validation_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  checks_performed JSONB NOT NULL DEFAULT '[]'::jsonb,
  failed_checks TEXT[],
  whitelisted BOOLEAN DEFAULT FALSE,
  blacklisted BOOLEAN DEFAULT FALSE,
  protocol_secure BOOLEAN,
  schema_valid BOOLEAN,
  payload_hash TEXT,
  alert_level TEXT NOT NULL CHECK (alert_level IN ('info', 'warning', 'high', 'critical', 'emergency')),
  alert_message TEXT NOT NULL,
  action_taken TEXT,
  operator_notified BOOLEAN DEFAULT FALSE,
  incident_created BOOLEAN DEFAULT FALSE,
  incident_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_events_type ON trust_events(event_type);
CREATE INDEX idx_trust_events_source ON trust_events(source_system);
CREATE INDEX idx_trust_events_trust_score ON trust_events(trust_score);
CREATE INDEX idx_trust_events_compliance ON trust_events(compliance_status);
CREATE INDEX idx_trust_events_alert_level ON trust_events(alert_level);
CREATE INDEX idx_trust_events_timestamp ON trust_events(timestamp DESC);
CREATE INDEX idx_trust_events_whitelisted ON trust_events(whitelisted);
CREATE INDEX idx_trust_events_blacklisted ON trust_events(blacklisted);

-- Create RLS policies
ALTER TABLE interop_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_swarm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_mission_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all records
CREATE POLICY "Allow authenticated read on interop_log" ON interop_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on agent_swarm_metrics" ON agent_swarm_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on joint_mission_log" ON joint_mission_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on trust_events" ON trust_events FOR SELECT TO authenticated USING (true);

-- Allow service_role to insert/update records
CREATE POLICY "Allow service_role insert on interop_log" ON interop_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert on agent_swarm_metrics" ON agent_swarm_metrics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert on joint_mission_log" ON joint_mission_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert on trust_events" ON trust_events FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service_role update on interop_log" ON interop_log FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service_role update on agent_swarm_metrics" ON agent_swarm_metrics FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service_role update on joint_mission_log" ON joint_mission_log FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service_role update on trust_events" ON trust_events FOR UPDATE TO service_role USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interop_log_updated_at BEFORE UPDATE ON interop_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_swarm_metrics_updated_at BEFORE UPDATE ON agent_swarm_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_joint_mission_log_updated_at BEFORE UPDATE ON joint_mission_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_events_updated_at BEFORE UPDATE ON trust_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
