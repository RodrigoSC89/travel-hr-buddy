-- ============================================
-- PATCH 101.0 - Analytics Core Tables
-- Criar tabelas necessárias para analytics completo
-- ============================================

-- 1. Analytics Events (coleta de eventos)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  properties JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country_code TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org ON public.analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id);

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
ON public.analytics_events FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can view org events"
ON public.analytics_events FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR user_id = auth.uid()
);

-- 2. Analytics Metrics (métricas agregadas)
CREATE TABLE IF NOT EXISTS public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  dimensions JSONB DEFAULT '{}',
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  aggregation_type TEXT DEFAULT 'sum',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_org ON public.analytics_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON public.analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON public.analytics_metrics(period_start, period_end);

-- RLS
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org metrics"
ON public.analytics_metrics FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "System can insert metrics"
ON public.analytics_metrics FOR INSERT
WITH CHECK (true);

-- 3. Analytics Dashboards (dashboards customizáveis)
CREATE TABLE IF NOT EXISTS public.analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user ON public.analytics_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org ON public.analytics_dashboards(organization_id);

-- RLS
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their dashboards"
ON public.analytics_dashboards FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view public dashboards in org"
ON public.analytics_dashboards FOR SELECT
USING (
  is_public = TRUE
  AND organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- 4. Analytics Widgets (widgets de dashboards)
CREATE TABLE IF NOT EXISTS public.analytics_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES public.analytics_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  data_source TEXT,
  query_config JSONB,
  position JSONB DEFAULT '{"x": 0, "y": 0, "w": 4, "h": 3}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_widgets_dashboard ON public.analytics_widgets(dashboard_id);

-- RLS
ALTER TABLE public.analytics_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage widgets of their dashboards"
ON public.analytics_widgets FOR ALL
USING (
  dashboard_id IN (
    SELECT id FROM public.analytics_dashboards
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view widgets of accessible dashboards"
ON public.analytics_widgets FOR SELECT
USING (
  dashboard_id IN (
    SELECT id FROM public.analytics_dashboards
    WHERE user_id = auth.uid()
    OR (is_public = TRUE AND organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    ))
  )
);

-- 5. Analytics Insights (insights de IA)
CREATE TABLE IF NOT EXISTS public.analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  data_reference JSONB,
  is_actionable BOOLEAN DEFAULT TRUE,
  action_taken BOOLEAN DEFAULT FALSE,
  action_taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_insights_org ON public.analytics_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_type ON public.analytics_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_priority ON public.analytics_insights(priority);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_created ON public.analytics_insights(created_at DESC);

-- RLS
ALTER TABLE public.analytics_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org insights"
ON public.analytics_insights FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "System can manage insights"
ON public.analytics_insights FOR ALL
USING (true);

-- 6. Analytics Reports (relatórios exportados)
CREATE TABLE IF NOT EXISTS public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  parameters JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user ON public.analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_org ON public.analytics_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_status ON public.analytics_reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_created ON public.analytics_reports(created_at DESC);

-- RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their reports"
ON public.analytics_reports FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Org admins can view all org reports"
ON public.analytics_reports FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- 7. Triggers
CREATE TRIGGER update_analytics_metrics_updated_at
BEFORE UPDATE ON public.analytics_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

CREATE TRIGGER update_analytics_dashboards_updated_at
BEFORE UPDATE ON public.analytics_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

CREATE TRIGGER update_analytics_widgets_updated_at
BEFORE UPDATE ON public.analytics_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();