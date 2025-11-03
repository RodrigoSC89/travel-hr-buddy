-- PATCH 629: Feature Flags e Toggle Dinâmico
-- Create feature_flags table for dynamic feature control

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  tenant_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant ON feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_user ON feature_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read feature flags
CREATE POLICY "Users can read feature flags"
  ON feature_flags FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy for admins to manage feature flags
CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- Insert default feature flags for system features
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('ai_navigation', false, 'AI-powered navigation suggestions'),
  ('chatops', false, 'ChatOps integrated command system'),
  ('telemetry', true, 'Active telemetry and feedback collection'),
  ('proactive_monitoring', true, 'Proactive event-based monitoring'),
  ('ai_explanations', false, 'AI module explanations'),
  ('predictive_analytics', false, 'Predictive incident analysis'),
  ('real_time_updates', true, 'Real-time update notifications'),
  ('offline_mode', false, 'Offline cache and sync'),
  ('weather_integration', false, 'External weather API integration'),
  ('beta_modules', false, 'Access to experimental beta modules')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE feature_flags IS 'PATCH 629: Dynamic feature flag system for tenant/user level control';
