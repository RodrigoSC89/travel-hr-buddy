-- PATCH 873: Schema alignment for @ts-nocheck removal
-- Add missing tables and columns

-- 1. Template Versions table
CREATE TABLE IF NOT EXISTS public.template_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  variables JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  change_notes TEXT,
  is_active BOOLEAN DEFAULT false
);

-- 2. Workflow Nodes table
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID,
  node_type TEXT NOT NULL,
  node_name TEXT,
  position_x NUMERIC,
  position_y NUMERIC,
  config JSONB,
  connections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Satcom Messages table
CREATE TABLE IF NOT EXISTS public.satcom_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  message_type TEXT NOT NULL,
  content TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  satellite_provider TEXT,
  transmission_time TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Incident Snapshots table
CREATE TABLE IF NOT EXISTS public.incident_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  snapshot_data JSONB NOT NULL,
  weather_conditions JSONB,
  vessel_position JSONB,
  crew_status JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Joint Missions table
CREATE TABLE IF NOT EXISTS public.joint_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id),
  partner_organization TEXT,
  coordination_status TEXT DEFAULT 'pending',
  shared_resources JSONB,
  communication_channel TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Profiler Sessions table
CREATE TABLE IF NOT EXISTS public.profiler_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  page_url TEXT,
  device_type TEXT,
  browser TEXT,
  metrics JSONB,
  flame_graph_data JSONB,
  memory_samples JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Quality Metrics table
CREATE TABLE IF NOT EXISTS public.quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_type TEXT,
  category TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  status TEXT DEFAULT 'normal',
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Restore Reports table
CREATE TABLE IF NOT EXISTS public.restore_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID,
  version_id UUID,
  restored_by UUID,
  restore_reason TEXT,
  previous_content TEXT,
  new_content TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Logistics Operations table
CREATE TABLE IF NOT EXISTS public.logistics_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  origin_port TEXT,
  destination_port TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  cargo_details JSONB,
  estimated_departure TIMESTAMP WITH TIME ZONE,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_departure TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  cost_estimate NUMERIC,
  actual_cost NUMERIC,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Calendar Events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID,
  attendees JSONB,
  recurrence_rule TEXT,
  reminder_minutes INTEGER,
  color TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Add missing columns to performance_alerts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_alerts' AND column_name = 'system_name') THEN
    ALTER TABLE public.performance_alerts ADD COLUMN system_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_alerts' AND column_name = 'is_resolved') THEN
    ALTER TABLE public.performance_alerts ADD COLUMN is_resolved BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_alerts' AND column_name = 'resolved_at') THEN
    ALTER TABLE public.performance_alerts ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_alerts' AND column_name = 'resolved_by') THEN
    ALTER TABLE public.performance_alerts ADD COLUMN resolved_by UUID;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satcom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiler_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restore_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users can read)
CREATE POLICY "Authenticated read template_versions" ON public.template_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read workflow_nodes" ON public.workflow_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read satcom_messages" ON public.satcom_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read incident_snapshots" ON public.incident_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read joint_missions" ON public.joint_missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read profiler_sessions" ON public.profiler_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read quality_metrics" ON public.quality_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read restore_reports" ON public.restore_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read logistics_operations" ON public.logistics_operations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read calendar_events" ON public.calendar_events FOR SELECT TO authenticated USING (true);

-- Write policies
CREATE POLICY "Authenticated write template_versions" ON public.template_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write workflow_nodes" ON public.workflow_nodes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write satcom_messages" ON public.satcom_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write incident_snapshots" ON public.incident_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write joint_missions" ON public.joint_missions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write profiler_sessions" ON public.profiler_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write quality_metrics" ON public.quality_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write restore_reports" ON public.restore_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write logistics_operations" ON public.logistics_operations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write calendar_events" ON public.calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);