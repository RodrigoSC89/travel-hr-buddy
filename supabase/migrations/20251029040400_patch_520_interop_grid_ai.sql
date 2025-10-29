-- PATCH 520: Interop Grid AI
-- AI interoperability network for decision synchronization and knowledge sharing

-- AI instances registry
CREATE TABLE IF NOT EXISTS ai_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT NOT NULL UNIQUE,
  instance_type TEXT NOT NULL CHECK (instance_type IN ('navigation', 'sensor', 'mission', 'decision', 'forecast', 'analysis')),
  version TEXT NOT NULL,
  capabilities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'idle', 'busy', 'offline', 'error')),
  endpoint_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI decision events (Pub/Sub)
CREATE TABLE IF NOT EXISTS ai_decision_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  source_ai_instance UUID NOT NULL REFERENCES ai_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('decision', 'recommendation', 'alert', 'insight', 'prediction')),
  decision_category TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  context JSONB NOT NULL,
  decision_data JSONB NOT NULL,
  reasoning TEXT,
  tags TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- AI event subscriptions
CREATE TABLE IF NOT EXISTS ai_event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_ai_instance UUID NOT NULL REFERENCES ai_instances(id) ON DELETE CASCADE,
  event_type TEXT,
  decision_category TEXT,
  filter_criteria JSONB DEFAULT '{}'::jsonb,
  priority_threshold TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI event consumption log
CREATE TABLE IF NOT EXISTS ai_event_consumption_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES ai_decision_events(id) ON DELETE CASCADE,
  consumer_ai_instance UUID NOT NULL REFERENCES ai_instances(id) ON DELETE CASCADE,
  consumed_at TIMESTAMPTZ DEFAULT now(),
  action_taken TEXT,
  impact_score NUMERIC CHECK (impact_score >= 0 AND impact_score <= 1),
  feedback JSONB DEFAULT '{}'::jsonb
);

-- AI knowledge graph
CREATE TABLE IF NOT EXISTS ai_knowledge_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL UNIQUE,
  node_type TEXT NOT NULL,
  source_ai_instance UUID REFERENCES ai_instances(id),
  content JSONB NOT NULL,
  relationships JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'disputed', 'deprecated')),
  validation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interop Grid analytics
CREATE TABLE IF NOT EXISTS interop_grid_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('event_count', 'latency', 'accuracy', 'collaboration_score', 'sync_health')),
  ai_instance_id UUID REFERENCES ai_instances(id),
  metric_value NUMERIC NOT NULL,
  metric_data JSONB DEFAULT '{}'::jsonb,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- AI decision audit trail
CREATE TABLE IF NOT EXISTS ai_decision_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_event_id UUID REFERENCES ai_decision_events(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('created', 'consumed', 'validated', 'disputed', 'expired')),
  ai_instance_id UUID REFERENCES ai_instances(id),
  details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_instances_status ON ai_instances(status);
CREATE INDEX IF NOT EXISTS idx_ai_instances_instance_type ON ai_instances(instance_type);
CREATE INDEX IF NOT EXISTS idx_ai_decision_events_source_ai ON ai_decision_events(source_ai_instance);
CREATE INDEX IF NOT EXISTS idx_ai_decision_events_event_type ON ai_decision_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_decision_events_timestamp ON ai_decision_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_decision_events_priority ON ai_decision_events(priority);
CREATE INDEX IF NOT EXISTS idx_ai_event_subscriptions_subscriber ON ai_event_subscriptions(subscriber_ai_instance);
CREATE INDEX IF NOT EXISTS idx_ai_event_consumption_log_event_id ON ai_event_consumption_log(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_event_consumption_log_consumer ON ai_event_consumption_log(consumer_ai_instance);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_graph_node_type ON ai_knowledge_graph(node_type);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_graph_source ON ai_knowledge_graph(source_ai_instance);
CREATE INDEX IF NOT EXISTS idx_interop_grid_analytics_metric_type ON interop_grid_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_interop_grid_analytics_ai_instance ON interop_grid_analytics(ai_instance_id);
CREATE INDEX IF NOT EXISTS idx_ai_decision_audit_trail_decision_event ON ai_decision_audit_trail(decision_event_id);
CREATE INDEX IF NOT EXISTS idx_ai_decision_audit_trail_timestamp ON ai_decision_audit_trail(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE ai_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decision_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_event_consumption_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE interop_grid_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decision_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to ai_instances" ON ai_instances FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage ai_instances" ON ai_instances FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to ai_decision_events" ON ai_decision_events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage ai_decision_events" ON ai_decision_events FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to ai_event_subscriptions" ON ai_event_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage ai_event_subscriptions" ON ai_event_subscriptions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to ai_event_consumption_log" ON ai_event_consumption_log FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert ai_event_consumption_log" ON ai_event_consumption_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to ai_knowledge_graph" ON ai_knowledge_graph FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage ai_knowledge_graph" ON ai_knowledge_graph FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to interop_grid_analytics" ON interop_grid_analytics FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert interop_grid_analytics" ON interop_grid_analytics FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to ai_decision_audit_trail" ON ai_decision_audit_trail FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert ai_decision_audit_trail" ON ai_decision_audit_trail FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER ai_instances_updated_at
  BEFORE UPDATE ON ai_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();

CREATE TRIGGER ai_event_subscriptions_updated_at
  BEFORE UPDATE ON ai_event_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();

CREATE TRIGGER ai_knowledge_graph_updated_at
  BEFORE UPDATE ON ai_knowledge_graph
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();

-- Insert sample AI instances
INSERT INTO ai_instances (instance_name, instance_type, version, capabilities) VALUES
  ('navigation-ai-01', 'navigation', '1.0.0', '["route_planning", "risk_assessment", "weather_analysis"]'::jsonb),
  ('sensor-ai-01', 'sensor', '1.0.0', '["anomaly_detection", "predictive_maintenance", "data_normalization"]'::jsonb),
  ('mission-ai-01', 'mission', '1.0.0', '["coordination", "resource_allocation", "tactical_planning"]'::jsonb),
  ('forecast-ai-01', 'forecast', '1.0.0', '["weather_prediction", "trend_analysis", "risk_forecasting"]'::jsonb)
ON CONFLICT (instance_name) DO NOTHING;
