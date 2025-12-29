-- PATCH 659.2: API Center tables + Observability + Security fixes

-- API Integrations Registry
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  api_category TEXT CHECK (api_category IN ('weather', 'maritime', 'security', 'communication', 'ai', 'logistics')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
  config JSONB DEFAULT '{}',
  last_checked TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  next_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- External API Logs
CREATE TABLE IF NOT EXISTS public.external_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  endpoint TEXT,
  method TEXT DEFAULT 'GET',
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  request_payload JSONB,
  response_summary JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- API Quota Tracking
CREATE TABLE IF NOT EXISTS public.api_quota_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  quota_limit INTEGER,
  quota_used INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, api_name)
);

-- Observability Logs
CREATE TABLE IF NOT EXISTS public.logs_observability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  user_id UUID,
  route TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Modules Registry (for dynamic sidebar)
CREATE TABLE IF NOT EXISTS public.modules_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  route TEXT NOT NULL,
  category TEXT,
  enabled_by_default BOOLEAN DEFAULT true,
  requires_role TEXT[],
  depends_on TEXT[],
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_quota_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_observability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "auth_api_integrations" ON public.api_integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_external_api_logs" ON public.external_api_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_api_quota_tracking" ON public.api_quota_tracking FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_logs_observability" ON public.logs_observability FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_modules_registry" ON public.modules_registry FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_feature_flags" ON public.feature_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_integrations_org ON public.api_integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_external_api_logs_api ON public.external_api_logs(api_name);
CREATE INDEX IF NOT EXISTS idx_external_api_logs_timestamp ON public.external_api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_observability_route ON public.logs_observability(route);
CREATE INDEX IF NOT EXISTS idx_logs_observability_timestamp ON public.logs_observability(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_modules_registry_slug ON public.modules_registry(slug);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(flag_name);