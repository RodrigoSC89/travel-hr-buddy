-- ============================================================================
-- MIGRATION: Create Missing Dynamic Tables
-- Purpose: Add tables used by dynamic-tables.ts that don't exist in schema
-- ============================================================================

-- 1. WEATHER_LOGS - Cache for weather API responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weather_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  weather_data JSONB NOT NULL DEFAULT '{}',
  source VARCHAR(50) DEFAULT 'openweathermap',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weather_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read weather logs"
  ON public.weather_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert weather logs"
  ON public.weather_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weather_logs_location ON public.weather_logs(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_logs_created ON public.weather_logs(created_at DESC);

-- 2. ANALYTICS_ALERTS - Alert configuration for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_name VARCHAR(100) NOT NULL,
  condition VARCHAR(20) NOT NULL CHECK (condition IN ('gt', 'gte', 'lt', 'lte', 'eq', 'neq')),
  threshold NUMERIC NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  notification_channels JSONB DEFAULT '[]',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own org analytics alerts"
  ON public.analytics_alerts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage analytics alerts"
  ON public.analytics_alerts FOR ALL
  TO authenticated
  USING (public.is_manager_or_above())
  WITH CHECK (public.is_manager_or_above());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_org ON public.analytics_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_enabled ON public.analytics_alerts(is_enabled) WHERE is_enabled = true;

-- Trigger for updated_at
CREATE TRIGGER update_analytics_alerts_updated_at
  BEFORE UPDATE ON public.analytics_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflow_updated_at();

-- 3. ANALYTICS_ALERT_HISTORY - Log of triggered alerts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.analytics_alerts(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  value NUMERIC NOT NULL,
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.analytics_alert_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own org alert history"
  ON public.analytics_alert_history FOR SELECT
  TO authenticated
  USING (
    alert_id IN (
      SELECT id FROM public.analytics_alerts 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "System can insert alert history"
  ON public.analytics_alert_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_alert_history_alert ON public.analytics_alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alert_history_triggered ON public.analytics_alert_history(triggered_at DESC);

-- 4. ANALYTICS_SESSIONS - User session tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  pages_viewed INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all sessions"
  ON public.analytics_sessions FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can view own sessions"
  ON public.analytics_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow session creation"
  ON public.analytics_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow session updates"
  ON public.analytics_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_org ON public.analytics_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started ON public.analytics_sessions(started_at DESC);

-- 5. INCIDENT_WORKFLOW_LOGS - Audit trail for incident workflows
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.incident_workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incident_workflow_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own org incident logs"
  ON public.incident_workflow_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Authenticated can create incident logs"
  ON public.incident_workflow_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incident_workflow_logs_incident ON public.incident_workflow_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_workflow_logs_org ON public.incident_workflow_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_incident_workflow_logs_performed ON public.incident_workflow_logs(performed_at DESC);

-- 6. API_ROUTES - API route registry for gateway
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path VARCHAR(500) NOT NULL,
  route_name VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS')),
  description TEXT,
  schema_validation JSONB DEFAULT '{}',
  rate_limit_tier VARCHAR(50) DEFAULT 'standard',
  requires_auth BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'disabled')),
  version VARCHAR(20) DEFAULT 'v1',
  tags TEXT[] DEFAULT '{}',
  handler_function VARCHAR(255),
  cache_ttl INTEGER DEFAULT 0,
  timeout_ms INTEGER DEFAULT 30000,
  metadata JSONB DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(route_path, method, organization_id)
);

-- Enable RLS
ALTER TABLE public.api_routes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view active routes"
  ON public.api_routes FOR SELECT
  TO authenticated
  USING (
    status = 'active' OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins can manage routes"
  ON public.api_routes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_routes_path ON public.api_routes(route_path);
CREATE INDEX IF NOT EXISTS idx_api_routes_status ON public.api_routes(status);
CREATE INDEX IF NOT EXISTS idx_api_routes_org ON public.api_routes(organization_id);

-- Trigger for updated_at
CREATE TRIGGER update_api_routes_updated_at
  BEFORE UPDATE ON public.api_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflow_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.weather_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_alerts TO authenticated;
GRANT SELECT, INSERT ON public.analytics_alert_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.analytics_sessions TO authenticated;
GRANT SELECT, INSERT ON public.incident_workflow_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_routes TO authenticated;