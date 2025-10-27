-- PATCH 266-270: Mission Logs, Travel Management, Analytics, Satellite Events, Template Variables

-- PATCH 266: Mission Logs Table
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.vessels(id),
  mission_name TEXT NOT NULL,
  mission_date DATE NOT NULL,
  crew_members TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planned',
  description TEXT,
  location TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PATCH 267: Travel Management Tables
CREATE TABLE IF NOT EXISTS public.travel_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  trip_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  segments JSONB DEFAULT '[]',
  total_cost NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft',
  booking_reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.travel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.travel_itineraries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.travel_price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  route TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  current_price NUMERIC,
  alert_triggered BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PATCH 268: Analytics Tables (analytics_events already exists from context)
CREATE TABLE IF NOT EXISTS public.analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  dashboard_name TEXT NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  organization_id UUID,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  page_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_type TEXT,
  browser TEXT,
  os TEXT
);

-- PATCH 269: Satellite Events Table
CREATE TABLE IF NOT EXISTS public.satellite_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  norad_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  altitude NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PATCH 270: Template Variables Table
CREATE TABLE IF NOT EXISTS public.template_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  variable_type TEXT NOT NULL DEFAULT 'text',
  default_value TEXT,
  is_required BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_variables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Mission Logs
DROP POLICY IF EXISTS "Users can view mission logs" ON public.mission_logs;
CREATE POLICY "Users can view mission logs" ON public.mission_logs FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create mission logs" ON public.mission_logs;
CREATE POLICY "Users can create mission logs" ON public.mission_logs FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their mission logs" ON public.mission_logs;
CREATE POLICY "Users can update their mission logs" ON public.mission_logs FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their mission logs" ON public.mission_logs;
CREATE POLICY "Users can delete their mission logs" ON public.mission_logs FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for Travel Itineraries
DROP POLICY IF EXISTS "Users can view their itineraries" ON public.travel_itineraries;
CREATE POLICY "Users can view their itineraries" ON public.travel_itineraries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create itineraries" ON public.travel_itineraries;
CREATE POLICY "Users can create itineraries" ON public.travel_itineraries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their itineraries" ON public.travel_itineraries;
CREATE POLICY "Users can update their itineraries" ON public.travel_itineraries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their itineraries" ON public.travel_itineraries;
CREATE POLICY "Users can delete their itineraries" ON public.travel_itineraries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Travel Logs
DROP POLICY IF EXISTS "Users can view travel logs" ON public.travel_logs;
CREATE POLICY "Users can view travel logs" ON public.travel_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM travel_itineraries WHERE id = itinerary_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "System can insert travel logs" ON public.travel_logs;
CREATE POLICY "System can insert travel logs" ON public.travel_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for Price Alerts
DROP POLICY IF EXISTS "Users can manage their price alerts" ON public.travel_price_alerts;
CREATE POLICY "Users can manage their price alerts" ON public.travel_price_alerts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Analytics Dashboards
DROP POLICY IF EXISTS "Users can view their dashboards" ON public.analytics_dashboards;
CREATE POLICY "Users can view their dashboards" ON public.analytics_dashboards FOR SELECT USING (
  auth.uid() = user_id OR is_public = true
);

DROP POLICY IF EXISTS "Users can manage their dashboards" ON public.analytics_dashboards;
CREATE POLICY "Users can manage their dashboards" ON public.analytics_dashboards FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Analytics Events
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;
CREATE POLICY "System can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view analytics events" ON public.analytics_events;
CREATE POLICY "Users can view analytics events" ON public.analytics_events FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for Satellite Events
DROP POLICY IF EXISTS "Users can view satellite events" ON public.satellite_events;
CREATE POLICY "Users can view satellite events" ON public.satellite_events FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "System can insert satellite events" ON public.satellite_events;
CREATE POLICY "System can insert satellite events" ON public.satellite_events FOR INSERT WITH CHECK (true);

-- RLS Policies for Template Variables
DROP POLICY IF EXISTS "Users can view template variables" ON public.template_variables;
CREATE POLICY "Users can view template variables" ON public.template_variables FOR SELECT USING (
  EXISTS (SELECT 1 FROM document_templates WHERE id = template_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage template variables" ON public.template_variables;
CREATE POLICY "Users can manage template variables" ON public.template_variables FOR ALL USING (
  EXISTS (SELECT 1 FROM document_templates WHERE id = template_id AND user_id = auth.uid())
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_mission_logs_updated_at ON public.mission_logs;
CREATE TRIGGER update_mission_logs_updated_at BEFORE UPDATE ON public.mission_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_itineraries_updated_at ON public.travel_itineraries;
CREATE TRIGGER update_travel_itineraries_updated_at BEFORE UPDATE ON public.travel_itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at ON public.analytics_dashboards;
CREATE TRIGGER update_analytics_dashboards_updated_at BEFORE UPDATE ON public.analytics_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mission_logs_created_by ON public.mission_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_mission_logs_status ON public.mission_logs(status);
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_user_id ON public.travel_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_logs_itinerary_id ON public.travel_logs(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_satellite_events_norad_id ON public.satellite_events(norad_id);
CREATE INDEX IF NOT EXISTS idx_template_variables_template_id ON public.template_variables(template_id);