-- PATCH 659: Create all missing tables for v3.2.0
-- Batch 1: Core infrastructure tables

CREATE TABLE IF NOT EXISTS public.mirror_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT NOT NULL,
  region TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'syncing', 'error')),
  last_sync TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clone_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_instance_id UUID REFERENCES public.mirror_instances(id) ON DELETE CASCADE,
  target_instance_id UUID REFERENCES public.mirror_instances(id) ON DELETE CASCADE,
  sync_type TEXT,
  status TEXT DEFAULT 'pending',
  rows_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sonar_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  sonar_type TEXT,
  frequency_khz NUMERIC,
  depth_m NUMERIC,
  signal_strength NUMERIC,
  raw_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.satellite_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_name TEXT NOT NULL,
  tle_line1 TEXT,
  tle_line2 TEXT,
  position_lat NUMERIC,
  position_lon NUMERIC,
  altitude_km NUMERIC,
  velocity_kms NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'assigned',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mission_id, vessel_id)
);

CREATE TABLE IF NOT EXISTS public.vessel_ai_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  context_id TEXT NOT NULL UNIQUE,
  local_data JSONB DEFAULT '{}',
  global_data JSONB DEFAULT '{}',
  last_sync TIMESTAMPTZ DEFAULT now(),
  model_version TEXT DEFAULT '1.0.0',
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_inspection_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID,
  inspection_type TEXT,
  feedback_text TEXT,
  is_non_conformity BOOLEAN DEFAULT false,
  confidence_score NUMERIC,
  inspector_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inspector_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  specializations TEXT[],
  inspection_count INTEGER DEFAULT 0,
  accuracy_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mirror_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sonar_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_ai_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_inspection_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspector_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "auth_all_mirror_instances" ON public.mirror_instances FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_clone_sync_log" ON public.clone_sync_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_sonar_inputs" ON public.sonar_inputs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_satellite_tracking" ON public.satellite_tracking FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_mission_vessels" ON public.mission_vessels FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_vessel_ai_contexts" ON public.vessel_ai_contexts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_ai_inspection_feedback" ON public.ai_inspection_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_inspector_profiles" ON public.inspector_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mirror_instances_status ON public.mirror_instances(status);
CREATE INDEX IF NOT EXISTS idx_clone_sync_log_status ON public.clone_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_vessel ON public.sonar_inputs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_satellite_tracking_name ON public.satellite_tracking(satellite_name);
CREATE INDEX IF NOT EXISTS idx_mission_vessels_mission ON public.mission_vessels(mission_id);
CREATE INDEX IF NOT EXISTS idx_vessel_ai_contexts_vessel ON public.vessel_ai_contexts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ai_inspection_feedback_inspection ON public.ai_inspection_feedback(inspection_id);