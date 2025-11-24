-- PATCH 2025-01-24: Create Missing AI & Workflow Tables
-- Fixes critical database schema gaps for AI navigation, workflows, and feature management

-- ============================================================
-- 1. workflow_ai_suggestions
-- Purpose: Store AI-generated suggestions for workflow optimization
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('optimization', 'automation', 'delegation', 'priority', 'resource')),
  suggestion_text TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'expired')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_workflow_id ON workflow_ai_suggestions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_status ON workflow_ai_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_created_at ON workflow_ai_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_priority ON workflow_ai_suggestions(priority);

-- RLS Policies
ALTER TABLE workflow_ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workflow suggestions"
  ON workflow_ai_suggestions FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'manager')
  ));

CREATE POLICY "Admins can manage all workflow suggestions"
  ON workflow_ai_suggestions FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- ============================================================
-- 2. smart_workflow_steps
-- Purpose: Define customizable workflow steps with AI optimization
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('manual', 'automated', 'approval', 'notification', 'conditional', 'ai_decision')),
  description TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  ai_optimized BOOLEAN DEFAULT false,
  estimated_duration_minutes INTEGER,
  dependencies JSONB DEFAULT '[]'::jsonb,
  assigned_role TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_workflow_id ON smart_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_order ON smart_workflow_steps(workflow_id, step_order);
CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_type ON smart_workflow_steps(step_type);

-- RLS Policies
ALTER TABLE smart_workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view workflow steps"
  ON smart_workflow_steps FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage workflow steps"
  ON smart_workflow_steps FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'manager')
  ));

-- ============================================================
-- 3. navigation_history
-- Purpose: Track user navigation patterns for AI-driven suggestions
-- ============================================================
CREATE TABLE IF NOT EXISTS navigation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  duration_seconds INTEGER,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  device_type TEXT,
  browser TEXT
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_navigation_history_user_id ON navigation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_navigation_history_timestamp ON navigation_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_history_route ON navigation_history(route);
CREATE INDEX IF NOT EXISTS idx_navigation_history_session_id ON navigation_history(session_id);

-- RLS Policies
ALTER TABLE navigation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own navigation history"
  ON navigation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own navigation history"
  ON navigation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all navigation history"
  ON navigation_history FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- ============================================================
-- 4. module_access_log
-- Purpose: Track module usage for analytics and access control
-- ============================================================
CREATE TABLE IF NOT EXISTS module_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  module_name TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  action TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_module_access_log_user_id ON module_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_log_module_name ON module_access_log(module_name);
CREATE INDEX IF NOT EXISTS idx_module_access_log_accessed_at ON module_access_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_access_log_success ON module_access_log(success);

-- RLS Policies
ALTER TABLE module_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
  ON module_access_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert access logs"
  ON module_access_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all access logs"
  ON module_access_log FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- ============================================================
-- 5. feature_flags
-- Purpose: Enable/disable features dynamically without deployment
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  category TEXT DEFAULT 'general',
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production', 'all')),
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users JSONB DEFAULT '[]'::jsonb,
  target_roles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view feature flags"
  ON feature_flags FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- ============================================================
-- 6. modules
-- Purpose: Registry of all system modules for dynamic navigation
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  route TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER,
  required_permissions JSONB DEFAULT '[]'::jsonb,
  required_roles JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  parent_module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_modules_module_name ON modules(module_name);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_active ON modules(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(order_index);
CREATE INDEX IF NOT EXISTS idx_modules_parent_module_id ON modules(parent_module_id);

-- RLS Policies
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active modules"
  ON modules FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage all modules"
  ON modules FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- ============================================================
-- Triggers for updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_smart_workflow_steps_updated_at
  BEFORE UPDATE ON smart_workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON TABLE workflow_ai_suggestions IS 'AI-generated suggestions for workflow optimization and automation';
COMMENT ON TABLE smart_workflow_steps IS 'Configurable workflow steps with AI optimization support';
COMMENT ON TABLE navigation_history IS 'User navigation tracking for AI-driven route suggestions';
COMMENT ON TABLE module_access_log IS 'Module access audit trail for security and analytics';
COMMENT ON TABLE feature_flags IS 'Dynamic feature toggles for controlled rollouts';
COMMENT ON TABLE modules IS 'System module registry for dynamic navigation and permissions';

-- ============================================================
-- Grant permissions to authenticated users
-- ============================================================
GRANT SELECT ON workflow_ai_suggestions TO authenticated;
GRANT SELECT ON smart_workflow_steps TO authenticated;
GRANT INSERT, SELECT ON navigation_history TO authenticated;
GRANT INSERT, SELECT ON module_access_log TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;
GRANT SELECT ON modules TO authenticated;
