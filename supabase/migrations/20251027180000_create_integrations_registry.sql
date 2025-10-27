-- Create integrations_registry table
CREATE TABLE IF NOT EXISTS integrations_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'oauth2', 'webhook', 'api_key'
  provider TEXT NOT NULL, -- 'google', 'zapier', 'make', etc.
  config JSONB DEFAULT '{}'::jsonb,
  oauth_client_id TEXT,
  oauth_client_secret TEXT,
  oauth_redirect_uri TEXT,
  oauth_access_token TEXT,
  oauth_refresh_token TEXT,
  oauth_token_expires_at TIMESTAMPTZ,
  webhook_url TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create integration_logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations_registry(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'oauth_callback', 'webhook_received', 'api_call', 'error'
  status TEXT NOT NULL, -- 'success', 'error', 'pending'
  request_data JSONB DEFAULT '{}'::jsonb,
  response_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations_registry(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations_registry(type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at DESC);

-- Add RLS policies
ALTER TABLE integrations_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Policy for integrations_registry
CREATE POLICY "Users can view their own integrations"
  ON integrations_registry FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own integrations"
  ON integrations_registry FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own integrations"
  ON integrations_registry FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own integrations"
  ON integrations_registry FOR DELETE
  USING (auth.uid() = created_by);

-- Policy for integration_logs
CREATE POLICY "Users can view logs for their integrations"
  ON integration_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integrations_registry
      WHERE integrations_registry.id = integration_logs.integration_id
      AND integrations_registry.created_by = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_registry_updated_at
  BEFORE UPDATE ON integrations_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();
