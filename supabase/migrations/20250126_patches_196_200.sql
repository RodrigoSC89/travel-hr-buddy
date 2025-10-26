-- PATCHES 196-200: AI Learning & Multitenancy Implementation
-- Migration to create required tables for learning core, SaaS engine, 
-- knowledge sync, and mission AI core

-- ============================================================================
-- PATCH 196.0: Learning Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('interaction', 'system_event', 'module_error', 'decision', 'user_action')),
  module_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID,
  event_data JSONB NOT NULL DEFAULT '{}',
  context JSONB NOT NULL DEFAULT '{}',
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'partial')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for learning_events
CREATE INDEX IF NOT EXISTS idx_learning_events_module ON learning_events(module_name);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_user ON learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_tenant ON learning_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_created ON learning_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_timestamp ON learning_events(timestamp DESC);

-- ============================================================================
-- PATCH 197.0: Multitenancy Tables
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subdomain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenant users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Tenant modules table
CREATE TABLE IF NOT EXISTS tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, module_name)
);

-- Indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Indexes for tenant_users
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);

-- Indexes for tenant_modules
CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_module ON tenant_modules(module_name);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_enabled ON tenant_modules(enabled);

-- ============================================================================
-- PATCH 199.0: Knowledge Sync Tables
-- ============================================================================

-- Local knowledge table (daily snapshots)
CREATE TABLE IF NOT EXISTS local_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date TIMESTAMPTZ NOT NULL,
  module_name TEXT NOT NULL,
  usage_data JSONB NOT NULL DEFAULT '{}',
  model_state JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global knowledge table (aggregated data)
CREATE TABLE IF NOT EXISTS global_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date TIMESTAMPTZ NOT NULL,
  module_name TEXT NOT NULL,
  aggregated_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for local_knowledge
CREATE INDEX IF NOT EXISTS idx_local_knowledge_module ON local_knowledge(module_name);
CREATE INDEX IF NOT EXISTS idx_local_knowledge_snapshot ON local_knowledge(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_local_knowledge_created ON local_knowledge(created_at DESC);

-- Indexes for global_knowledge
CREATE INDEX IF NOT EXISTS idx_global_knowledge_module ON global_knowledge(module_name);
CREATE INDEX IF NOT EXISTS idx_global_knowledge_sync ON global_knowledge(sync_date DESC);
CREATE INDEX IF NOT EXISTS idx_global_knowledge_confidence ON global_knowledge(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_global_knowledge_created ON global_knowledge(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_knowledge ENABLE ROW LEVEL SECURITY;

-- Learning events policies
CREATE POLICY "Users can insert their own learning events"
  ON learning_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

CREATE POLICY "Users can view learning events from their tenant"
  ON learning_events FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id IS NULL
  );

-- Tenants policies
CREATE POLICY "Users can view their tenants"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can update their tenant"
  ON tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Tenant users policies
CREATE POLICY "Users can view members of their tenant"
  ON tenant_users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage users"
  ON tenant_users FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Tenant modules policies
CREATE POLICY "Users can view modules from their tenant"
  ON tenant_modules FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage modules"
  ON tenant_modules FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Local knowledge policies
CREATE POLICY "Users can insert local knowledge"
  ON local_knowledge FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view local knowledge"
  ON local_knowledge FOR SELECT
  USING (true);

-- Global knowledge policies
CREATE POLICY "Users can view global knowledge"
  ON global_knowledge FOR SELECT
  USING (true);

CREATE POLICY "System can update global knowledge"
  ON global_knowledge FOR ALL
  USING (true);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at
  BEFORE UPDATE ON tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_modules_updated_at
  BEFORE UPDATE ON tenant_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_knowledge_updated_at
  BEFORE UPDATE ON global_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data (Optional - for development)
-- ============================================================================

-- Create a default tenant
INSERT INTO tenants (id, name, slug, subdomain, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Organization',
  'default',
  'default',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE learning_events IS 'PATCH 196.0: Stores learning events for AI training';
COMMENT ON TABLE tenants IS 'PATCH 197.0: Multi-tenant organizations';
COMMENT ON TABLE tenant_users IS 'PATCH 197.0: User-tenant relationships';
COMMENT ON TABLE tenant_modules IS 'PATCH 197.0: Tenant-specific module configurations';
COMMENT ON TABLE local_knowledge IS 'PATCH 199.0: Local AI knowledge snapshots';
COMMENT ON TABLE global_knowledge IS 'PATCH 199.0: Aggregated global AI knowledge';

-- ============================================================================
-- Grants (if using service role)
-- ============================================================================

GRANT ALL ON learning_events TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON tenant_users TO authenticated;
GRANT ALL ON tenant_modules TO authenticated;
GRANT ALL ON local_knowledge TO authenticated;
GRANT ALL ON global_knowledge TO authenticated;

-- Note: Tables use UUID primary keys with gen_random_uuid(), so no sequences to grant
