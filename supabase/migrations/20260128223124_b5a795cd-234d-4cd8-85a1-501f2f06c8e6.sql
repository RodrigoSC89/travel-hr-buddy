-- PATCH 903: Create missing tables for AI collective memory, crew health and analytics

-- 1. Collective Knowledge table for AI memory sharing
CREATE TABLE IF NOT EXISTS public.collective_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  source_instance_id TEXT,
  instance_id TEXT,
  confidence NUMERIC(5,2) DEFAULT 1.0,
  version INTEGER DEFAULT 1,
  is_validated BOOLEAN DEFAULT false,
  is_replicated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Crew Health Records
CREATE TABLE IF NOT EXISTS public.crew_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id),
  organization_id UUID REFERENCES public.organizations(id),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type TEXT NOT NULL DEFAULT 'checkup',
  health_status TEXT DEFAULT 'healthy',
  notes TEXT,
  vitals JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  next_checkup_date DATE,
  recorded_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Wellbeing Alerts
CREATE TABLE IF NOT EXISTS public.wellbeing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id),
  organization_id UUID REFERENCES public.organizations(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User Sessions Analytics
CREATE TABLE IF NOT EXISTS public.user_sessions_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  device_type TEXT DEFAULT 'desktop',
  os TEXT,
  browser TEXT,
  location TEXT,
  country_code TEXT,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Page Analytics
CREATE TABLE IF NOT EXISTS public.page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  exit_rate NUMERIC(5,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Performance Metrics Web (Core Web Vitals)
CREATE TABLE IF NOT EXISTS public.performance_metrics_web (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  page_load_ms NUMERIC(10,2),
  first_contentful_paint_ms NUMERIC(10,2),
  largest_contentful_paint_ms NUMERIC(10,2),
  cumulative_layout_shift NUMERIC(5,3),
  first_input_delay_ms NUMERIC(10,2),
  time_to_interactive_ms NUMERIC(10,2),
  device_type TEXT DEFAULT 'desktop',
  connection_type TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collective_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics_web ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collective_knowledge
CREATE POLICY "collective_knowledge_select" ON public.collective_knowledge
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "collective_knowledge_insert" ON public.collective_knowledge
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "collective_knowledge_update" ON public.collective_knowledge
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- RLS Policies for crew_health_records (medical staff only)
CREATE POLICY "crew_health_records_select" ON public.crew_health_records
  FOR SELECT TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "crew_health_records_insert" ON public.crew_health_records
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "crew_health_records_update" ON public.crew_health_records
  FOR UPDATE TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

-- RLS Policies for wellbeing_alerts
CREATE POLICY "wellbeing_alerts_select" ON public.wellbeing_alerts
  FOR SELECT TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "wellbeing_alerts_insert" ON public.wellbeing_alerts
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "wellbeing_alerts_update" ON public.wellbeing_alerts
  FOR UPDATE TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

-- RLS Policies for user_sessions_analytics
CREATE POLICY "user_sessions_analytics_select" ON public.user_sessions_analytics
  FOR SELECT TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "user_sessions_analytics_insert" ON public.user_sessions_analytics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for page_analytics
CREATE POLICY "page_analytics_select" ON public.page_analytics
  FOR SELECT TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "page_analytics_insert" ON public.page_analytics
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

-- RLS Policies for performance_metrics_web
CREATE POLICY "performance_metrics_web_select" ON public.performance_metrics_web
  FOR SELECT TO authenticated USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "performance_metrics_web_insert" ON public.performance_metrics_web
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_category ON public.collective_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_collective_knowledge_key ON public.collective_knowledge(key);
CREATE INDEX IF NOT EXISTS idx_crew_health_records_crew ON public.crew_health_records(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_health_records_date ON public.crew_health_records(record_date);
CREATE INDEX IF NOT EXISTS idx_wellbeing_alerts_status ON public.wellbeing_alerts(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device ON public.user_sessions_analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_page_analytics_path ON public.page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON public.performance_metrics_web(recorded_at);

-- Add updated_at trigger
CREATE TRIGGER update_collective_knowledge_updated_at
  BEFORE UPDATE ON public.collective_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

CREATE TRIGGER update_crew_health_records_updated_at
  BEFORE UPDATE ON public.crew_health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();