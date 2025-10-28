-- PATCH 346: Integrations Hub v2 - Webhooks and OAuth
-- Objective: Complete integration hub with plugin support, OAuth, and webhooks

-- Webhook Integrations Table
CREATE TABLE IF NOT EXISTS webhook_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL, -- 'google', 'microsoft', 'zapier', 'custom'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'pending'
  webhook_url TEXT NOT NULL,
  secret_key TEXT,
  auth_type TEXT NOT NULL DEFAULT 'oauth', -- 'oauth', 'api_key', 'none'
  oauth_config JSONB, -- OAuth configuration
  headers JSONB, -- Custom headers
  events JSONB, -- Array of event types to listen for
  metadata JSONB, -- Additional configuration
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  organization_id UUID
);

-- Webhook Events Table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES webhook_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'user.created', 'mission.updated', etc.
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'retrying'
  http_status INTEGER,
  response_body JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  metadata JSONB
);

-- OAuth Connections Table
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'microsoft', 'zapier'
  provider_user_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  status TEXT NOT NULL DEFAULT 'connected', -- 'connected', 'disconnected', 'expired', 'error'
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Integration Plugins Table
CREATE TABLE IF NOT EXISTS integration_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL, -- 'google', 'microsoft', 'zapier', 'slack', etc.
  category TEXT, -- 'communication', 'storage', 'automation', 'analytics'
  icon_url TEXT,
  config_schema JSONB, -- JSON schema for plugin configuration
  is_enabled BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false, -- System plugins cannot be deleted
  capabilities JSONB, -- Array of capabilities: ['webhooks', 'oauth', 'api']
  version TEXT DEFAULT '1.0.0',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration Logs Table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES webhook_integrations(id) ON DELETE SET NULL,
  plugin_id UUID REFERENCES integration_plugins(id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_status ON webhook_integrations(status);
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_provider ON webhook_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_created_by ON webhook_integrations(created_by);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration_id ON webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_triggered_at ON webhook_events(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON oauth_connections(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_status ON oauth_connections(status);
CREATE INDEX IF NOT EXISTS idx_integration_plugins_provider ON integration_plugins(provider);
CREATE INDEX IF NOT EXISTS idx_integration_plugins_is_enabled ON integration_plugins(is_enabled);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_level ON integration_logs(level);

-- Enable RLS
ALTER TABLE webhook_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own integrations"
  ON webhook_integrations FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own integrations"
  ON webhook_integrations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own integrations"
  ON webhook_integrations FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own integrations"
  ON webhook_integrations FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view events from their integrations"
  ON webhook_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhook_integrations
      WHERE webhook_integrations.id = webhook_events.integration_id
      AND webhook_integrations.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own OAuth connections"
  ON oauth_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own OAuth connections"
  ON oauth_connections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view enabled plugins"
  ON integration_plugins FOR SELECT
  USING (true);

CREATE POLICY "Users can view integration logs"
  ON integration_logs FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM webhook_integrations
      WHERE webhook_integrations.id = integration_logs.integration_id
      AND webhook_integrations.created_by = auth.uid()
    )
  );

-- Insert default plugins
INSERT INTO integration_plugins (name, display_name, description, provider, category, is_enabled, is_system, capabilities) VALUES
  ('google-workspace', 'Google Workspace', 'Integration with Google Drive, Calendar, and Gmail', 'google', 'productivity', true, true, '["oauth", "webhooks", "api"]'::jsonb),
  ('microsoft-365', 'Microsoft 365', 'Integration with Microsoft Teams, OneDrive, and Outlook', 'microsoft', 'productivity', true, true, '["oauth", "webhooks", "api"]'::jsonb),
  ('zapier', 'Zapier', 'Automation and workflow integration', 'zapier', 'automation', true, true, '["webhooks", "api"]'::jsonb),
  ('slack', 'Slack', 'Team communication and notifications', 'slack', 'communication', false, true, '["webhooks", "oauth", "api"]'::jsonb),
  ('custom-webhook', 'Custom Webhook', 'Custom webhook integration', 'custom', 'automation', true, true, '["webhooks"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_webhook_integrations_updated_at
  BEFORE UPDATE ON webhook_integrations
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_oauth_connections_updated_at
  BEFORE UPDATE ON oauth_connections
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_integration_plugins_updated_at
  BEFORE UPDATE ON integration_plugins
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

-- Function to dispatch webhook events
CREATE OR REPLACE FUNCTION dispatch_webhook_event(
  p_integration_id UUID,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO webhook_events (integration_id, event_type, payload, status)
  VALUES (p_integration_id, p_event_type, p_payload, 'pending')
  RETURNING id INTO v_event_id;
  
  -- Update last_triggered_at on integration
  UPDATE webhook_integrations
  SET last_triggered_at = NOW()
  WHERE id = p_integration_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE webhook_integrations IS 'PATCH 346: Stores webhook integration configurations';
COMMENT ON TABLE webhook_events IS 'PATCH 346: Logs all webhook event dispatches and their results';
COMMENT ON TABLE oauth_connections IS 'PATCH 346: Stores OAuth connection tokens for external services';
COMMENT ON TABLE integration_plugins IS 'PATCH 346: Registry of available integration plugins';
COMMENT ON TABLE integration_logs IS 'PATCH 346: Integration activity logs for monitoring';
