-- ============================================
-- SQL URGENTE: Tabelas e colunas faltando
-- INSTRUÇÕES: Copie TUDO e cole no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- ============================================

-- 1. WEBHOOK_INTEGRATIONS
CREATE TABLE IF NOT EXISTS webhook_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    integration_name text NOT NULL,
    webhook_url text NOT NULL,
    secret_key text,
    is_active boolean DEFAULT true,
    events text[] DEFAULT ARRAY[]::text[],
    headers jsonb DEFAULT '{}'::jsonb,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_org ON webhook_integrations(organization_id);
ALTER TABLE webhook_integrations ENABLE ROW LEVEL SECURITY;

-- 2. MISSION_AGENTS
CREATE TABLE IF NOT EXISTS mission_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id uuid NOT NULL,
    agent_id uuid NOT NULL,
    agent_type text,
    role text,
    status text DEFAULT 'active',
    assigned_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    performance_score numeric(3,2),
    notes text,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_agents_mission ON mission_agents(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_agents_agent ON mission_agents(agent_id);
ALTER TABLE mission_agents ENABLE ROW LEVEL SECURITY;

-- 3. OAUTH_CONNECTIONS
CREATE TABLE IF NOT EXISTS oauth_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    provider text NOT NULL,
    provider_user_id text,
    access_token text,
    refresh_token text,
    token_expires_at timestamptz,
    scope text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_org ON oauth_connections(organization_id);
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;

-- 4. INTEGRATION_PLUGINS
CREATE TABLE IF NOT EXISTS integration_plugins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plugin_name text NOT NULL UNIQUE,
    plugin_type text NOT NULL,
    description text,
    version text,
    is_enabled boolean DEFAULT true,
    config_schema jsonb DEFAULT '{}'::jsonb,
    default_config jsonb DEFAULT '{}'::jsonb,
    capabilities text[] DEFAULT ARRAY[]::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE integration_plugins ENABLE ROW LEVEL SECURITY;

-- 5. AUDIT_LOGS - Adicionar colunas
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id uuid;

-- 6. WEBHOOK_EVENTS - Adicionar colunas
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS triggered_at timestamptz DEFAULT now();

-- 7. INTEGRATION_LOGS - Adicionar colunas
ALTER TABLE integration_logs ADD COLUMN IF NOT EXISTS level text DEFAULT 'info';
ALTER TABLE integration_logs ADD COLUMN IF NOT EXISTS message text;

-- 8. MISSIONS - Adicionar colunas
ALTER TABLE missions ADD COLUMN IF NOT EXISTS mission_id text;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS assigned_systems jsonb DEFAULT '[]'::jsonb;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]'::jsonb;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS progress_percentage numeric(5,2) DEFAULT 0;

-- 9. MISSION_LOGS - Adicionar colunas
ALTER TABLE mission_logs ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'info';
ALTER TABLE mission_logs ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE mission_logs ADD COLUMN IF NOT EXISTS timestamp timestamptz DEFAULT now();
