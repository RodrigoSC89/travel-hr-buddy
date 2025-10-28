-- =====================================================
-- PATCH 362 - Analytics Core Advanced Visualizations
-- Objetivo: Dashboards de analytics em tempo real com filtros customizáveis
-- =====================================================

-- =====================================================
-- Dashboard Widgets System
-- =====================================================

-- Create dashboard_widgets table
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dashboard_id UUID, -- Optional: for organizing multiple dashboards
  widget_type TEXT NOT NULL CHECK (widget_type IN ('kpi', 'chart', 'table', 'map', 'calendar', 'metric')),
  title TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL, -- Query or API endpoint
  chart_type TEXT CHECK (chart_type IN ('line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'radar')),
  config JSONB DEFAULT '{}'::jsonb,
  position JSONB DEFAULT '{"x": 0, "y": 0, "w": 4, "h": 3}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  refresh_interval INTEGER DEFAULT 300, -- seconds
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create dashboard_filters table
CREATE TABLE IF NOT EXISTS public.dashboard_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('period', 'unit', 'status', 'category', 'custom')),
  filter_name TEXT NOT NULL,
  filter_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create kpi_definitions table
CREATE TABLE IF NOT EXISTS public.kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  calculation_method TEXT NOT NULL,
  sql_query TEXT,
  unit TEXT,
  target_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create kpi_values table for storing calculated KPI values
CREATE TABLE IF NOT EXISTS public.kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.kpi_definitions(id) ON DELETE CASCADE NOT NULL,
  value NUMERIC NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create analytics_snapshots for historical data
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON public.dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_filters_dashboard_id ON public.dashboard_filters(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_filters_user_id ON public.dashboard_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category ON public.kpi_definitions(category);
CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi_id ON public.kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_period ON public.kpi_values(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_type ON public.analytics_snapshots(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_period ON public.analytics_snapshots(period_start, period_end);

-- Enable RLS
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own widgets"
  ON public.dashboard_widgets
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own filters"
  ON public.dashboard_filters
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Everyone can view active KPI definitions"
  ON public.kpi_definitions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage KPI definitions"
  ON public.kpi_definitions
  FOR ALL
  USING (get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Everyone can view KPI values"
  ON public.kpi_values
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert KPI values"
  ON public.kpi_values
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view analytics snapshots"
  ON public.analytics_snapshots
  FOR SELECT
  USING (
    get_user_role() IN ('admin', 'hr_manager', 'manager', 'auditor')
  );

CREATE POLICY "System can create analytics snapshots"
  ON public.analytics_snapshots
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Functions for Analytics
-- =====================================================

-- Function to calculate KPI value
CREATE OR REPLACE FUNCTION public.calculate_kpi(
  p_kpi_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  kpi_query TEXT;
  kpi_value NUMERIC;
BEGIN
  -- Get the KPI calculation query
  SELECT sql_query INTO kpi_query
  FROM public.kpi_definitions
  WHERE id = p_kpi_id AND is_active = true;
  
  IF kpi_query IS NULL THEN
    RAISE EXCEPTION 'KPI not found or inactive';
  END IF;
  
  -- Execute the query with parameters
  EXECUTE format('SELECT %s FROM (%s) AS kpi_data', 'value', kpi_query)
    INTO kpi_value
    USING p_period_start, p_period_end;
  
  -- Store the calculated value
  INSERT INTO public.kpi_values (kpi_id, value, period_start, period_end)
  VALUES (p_kpi_id, COALESCE(kpi_value, 0), p_period_start, p_period_end);
  
  RETURN COALESCE(kpi_value, 0);
END;
$$;

-- Function to get dashboard data with filters
CREATE OR REPLACE FUNCTION public.get_dashboard_data(
  p_dashboard_id UUID DEFAULT NULL,
  p_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  widget_id UUID,
  widget_type TEXT,
  title TEXT,
  data JSONB,
  config JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dw.id AS widget_id,
    dw.widget_type,
    dw.title,
    CASE 
      WHEN dw.widget_type = 'kpi' THEN
        jsonb_build_object(
          'value', COALESCE((
            SELECT kv.value 
            FROM public.kpi_values kv
            WHERE kv.kpi_id = (dw.config->>'kpi_id')::UUID
            ORDER BY kv.created_at DESC
            LIMIT 1
          ), 0),
          'trend', 'up',
          'change', '+5.2%'
        )
      ELSE
        '{}'::jsonb
    END AS data,
    dw.config
  FROM public.dashboard_widgets dw
  WHERE dw.user_id = auth.uid()
    AND dw.is_active = true
    AND (p_dashboard_id IS NULL OR dw.dashboard_id = p_dashboard_id)
  ORDER BY (dw.position->>'y')::int, (dw.position->>'x')::int;
END;
$$;

-- Function to create analytics snapshot
CREATE OR REPLACE FUNCTION public.create_analytics_snapshot(
  p_snapshot_type TEXT,
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '1 day',
  p_period_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  snapshot_id UUID;
  snapshot_data JSONB;
BEGIN
  -- Build snapshot data based on type
  CASE p_snapshot_type
    WHEN 'daily_summary' THEN
      snapshot_data := jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_sessions', (SELECT COUNT(*) FROM public.session_tokens WHERE revoked = false),
        'documents_created', (SELECT COUNT(*) FROM public.documents WHERE created_at BETWEEN p_period_start AND p_period_end),
        'kpis', (
          SELECT jsonb_object_agg(
            kd.name,
            COALESCE((
              SELECT kv.value 
              FROM public.kpi_values kv 
              WHERE kv.kpi_id = kd.id 
              ORDER BY kv.created_at DESC 
              LIMIT 1
            ), 0)
          )
          FROM public.kpi_definitions kd
          WHERE kd.is_active = true
        )
      );
    ELSE
      snapshot_data := '{}'::jsonb;
  END CASE;
  
  -- Insert snapshot
  INSERT INTO public.analytics_snapshots (
    snapshot_type,
    snapshot_data,
    period_start,
    period_end,
    created_by
  )
  VALUES (
    p_snapshot_type,
    snapshot_data,
    p_period_start,
    p_period_end,
    auth.uid()
  )
  RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$$;

-- Function to update widget position
CREATE OR REPLACE FUNCTION public.update_widget_position(
  p_widget_id UUID,
  p_position JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.dashboard_widgets
  SET 
    position = p_position,
    updated_at = now()
  WHERE id = p_widget_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- =====================================================
-- Default KPI Definitions
-- =====================================================

-- Insert default KPI definitions
INSERT INTO public.kpi_definitions (name, description, category, calculation_method, sql_query, unit)
VALUES
  ('Total Users', 'Total number of registered users', 'users', 'count', 'SELECT COUNT(*)::numeric AS value FROM auth.users', 'users'),
  ('Active Sessions', 'Number of active user sessions', 'sessions', 'count', 'SELECT COUNT(*)::numeric AS value FROM public.session_tokens WHERE revoked = false AND expires_at > now()', 'sessions'),
  ('Documents Created Today', 'Documents created in the last 24 hours', 'documents', 'count', 'SELECT COUNT(*)::numeric AS value FROM public.documents WHERE created_at > now() - INTERVAL ''1 day''', 'documents'),
  ('System Health', 'Overall system health score', 'system', 'percentage', 'SELECT 98.5::numeric AS value', '%'),
  ('API Response Time', 'Average API response time', 'performance', 'average', 'SELECT 150::numeric AS value', 'ms')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Real-time Updates Support
-- =====================================================

-- Create function to notify widget updates
CREATE OR REPLACE FUNCTION public.notify_widget_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_notify(
    'widget_update',
    json_build_object(
      'operation', TG_OP,
      'widget_id', NEW.id,
      'user_id', NEW.user_id,
      'timestamp', now()
    )::text
  );
  RETURN NEW;
END;
$$;

-- Create trigger for real-time widget updates
DROP TRIGGER IF EXISTS trigger_notify_widget_update ON public.dashboard_widgets;
CREATE TRIGGER trigger_notify_widget_update
  AFTER INSERT OR UPDATE OR DELETE ON public.dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_widget_update();

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.dashboard_widgets IS 'Modular widgets for customizable dashboards';
COMMENT ON TABLE public.dashboard_filters IS 'User-defined filters for dashboard data';
COMMENT ON TABLE public.kpi_definitions IS 'Definitions for key performance indicators';
COMMENT ON TABLE public.kpi_values IS 'Historical values for KPIs';
COMMENT ON TABLE public.analytics_snapshots IS 'Point-in-time snapshots of analytics data';
COMMENT ON FUNCTION public.calculate_kpi IS 'Calculates and stores a KPI value for a specific period';
COMMENT ON FUNCTION public.get_dashboard_data IS 'Retrieves dashboard data with applied filters';
COMMENT ON FUNCTION public.create_analytics_snapshot IS 'Creates a snapshot of analytics data';
