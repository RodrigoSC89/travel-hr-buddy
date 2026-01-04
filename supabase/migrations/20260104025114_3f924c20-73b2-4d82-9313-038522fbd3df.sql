-- Status Page Tables (separate migration)

-- 1. Status Page - Incidents
CREATE TABLE IF NOT EXISTS public.status_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved', 'scheduled')),
  severity TEXT NOT NULL CHECK (severity IN ('p0_critical', 'p1_high', 'p2_medium', 'p3_low', 'maintenance')),
  affected_components TEXT[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Status Page - Incident Updates (Timeline)
CREATE TABLE IF NOT EXISTS public.status_incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.status_incidents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved', 'scheduled')),
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Status Page - Components
CREATE TABLE IF NOT EXISTS public.status_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Status Page - Uptime Records
CREATE TABLE IF NOT EXISTS public.status_uptime_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.status_components(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
  total_downtime_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(component_id, date)
);

-- 5. Beta Email Logs
CREATE TABLE IF NOT EXISTS public.beta_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('invitation', 'welcome', 'weekly_checkin', 'completion')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  resend_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_uptime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_email_logs ENABLE ROW LEVEL SECURITY;

-- Public read for status
CREATE POLICY "Public can view incidents" ON public.status_incidents FOR SELECT USING (true);
CREATE POLICY "Public can view incident updates" ON public.status_incident_updates FOR SELECT USING (true);
CREATE POLICY "Public can view components" ON public.status_components FOR SELECT USING (true);
CREATE POLICY "Public can view uptime" ON public.status_uptime_records FOR SELECT USING (true);

-- Authenticated can manage
CREATE POLICY "Authenticated can manage incidents" ON public.status_incidents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage updates" ON public.status_incident_updates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage components" ON public.status_components FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage uptime" ON public.status_uptime_records FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage email logs" ON public.beta_email_logs FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default components
INSERT INTO public.status_components (name, description, display_order) VALUES
  ('Web Application', 'Main Nautilus One interface', 1),
  ('AI Command Center', 'AI-powered assistance', 2),
  ('Database', 'Data storage and retrieval', 3),
  ('Authentication', 'Login and user sessions', 4),
  ('API', 'External integrations', 5),
  ('Voice Assistant', 'Voice commands and TTS', 6),
  ('File Storage', 'Document uploads', 7),
  ('Email Notifications', 'System emails', 8)
ON CONFLICT DO NOTHING;

-- Triggers
CREATE TRIGGER update_status_incidents_updated_at
  BEFORE UPDATE ON public.status_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_status_components_updated_at
  BEFORE UPDATE ON public.status_components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();