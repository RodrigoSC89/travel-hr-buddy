-- ============================================================================
-- RPC Functions for Autonomy System
-- ============================================================================

-- Add missing columns to autonomous_tasks
ALTER TABLE public.autonomous_tasks ADD COLUMN IF NOT EXISTS decision_logic jsonb DEFAULT '{}';
ALTER TABLE public.autonomous_tasks ADD COLUMN IF NOT EXISTS autonomy_level integer DEFAULT 1;
ALTER TABLE public.autonomous_tasks ADD COLUMN IF NOT EXISTS decision_confidence numeric(5,4);
ALTER TABLE public.autonomous_tasks ADD COLUMN IF NOT EXISTS approved_by uuid;
ALTER TABLE public.autonomous_tasks ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.autonomous_tasks ADD COLUMN IF NOT EXISTS execution_logs jsonb;

-- Create autonomous task function
CREATE OR REPLACE FUNCTION public.create_autonomous_task(
  p_task_type text,
  p_task_name text,
  p_description text DEFAULT '',
  p_decision_logic jsonb DEFAULT '{}',
  p_autonomy_level integer DEFAULT 1,
  p_mission_id uuid DEFAULT NULL,
  p_equipment_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id uuid;
BEGIN
  INSERT INTO autonomous_tasks (
    task_type,
    task_name,
    description,
    decision_logic,
    autonomy_level,
    mission_id,
    equipment_id,
    status,
    created_by
  ) VALUES (
    p_task_type,
    p_task_name,
    p_description,
    p_decision_logic,
    p_autonomy_level,
    p_mission_id,
    p_equipment_id,
    'pending',
    auth.uid()
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Approve/reject autonomous task function
CREATE OR REPLACE FUNCTION public.approve_autonomous_task(
  p_task_id uuid,
  p_approved boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE autonomous_tasks
  SET 
    status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = p_task_id;
  
  RETURN FOUND;
END;
$$;

-- ============================================================================
-- RPC Functions for Satellite System (using uuid satellite_id)
-- ============================================================================

-- Update satellite position function
CREATE OR REPLACE FUNCTION public.update_satellite_position(
  p_satellite_id text,
  p_latitude double precision,
  p_longitude double precision,
  p_altitude_km double precision,
  p_velocity_kmh double precision DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_id uuid;
  v_sat_id uuid;
  v_satellite_name text;
BEGIN
  -- Try to find satellite by norad_id
  SELECT id, name INTO v_sat_id, v_satellite_name
  FROM satellites
  WHERE norad_id = p_satellite_id;
  
  -- Update position in satellite_positions using norad_id
  INSERT INTO satellite_positions (
    norad_id,
    name,
    latitude,
    longitude,
    altitude,
    velocity,
    status,
    last_updated
  ) VALUES (
    p_satellite_id,
    COALESCE(v_satellite_name, 'Unknown'),
    p_latitude,
    p_longitude,
    p_altitude_km,
    p_velocity_kmh,
    'active',
    now()
  )
  ON CONFLICT (norad_id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    altitude = EXCLUDED.altitude,
    velocity = EXCLUDED.velocity,
    last_updated = now()
  RETURNING id INTO v_position_id;
  
  RETURN v_position_id;
END;
$$;

-- Check satellite coverage function
CREATE OR REPLACE FUNCTION public.check_satellite_coverage(
  p_satellite_id text,
  p_critical_area jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_latest_position RECORD;
BEGIN
  -- Get latest position
  SELECT * INTO v_latest_position
  FROM satellite_positions
  WHERE norad_id = p_satellite_id
  ORDER BY last_updated DESC
  LIMIT 1;
  
  IF v_latest_position IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Calculate satellite passes function
CREATE OR REPLACE FUNCTION public.calculate_satellite_passes(
  p_satellite_id text,
  p_location_lat double precision,
  p_location_lon double precision,
  p_hours_ahead integer DEFAULT 24
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sat_uuid uuid;
BEGIN
  -- Find satellite uuid from norad_id
  SELECT id INTO v_sat_uuid FROM satellites WHERE norad_id = p_satellite_id;
  
  IF v_sat_uuid IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', sp.id,
    'satellite_id', p_satellite_id,
    'location_latitude', sp.observer_lat,
    'location_longitude', sp.observer_lon,
    'rise_time', sp.rise_time,
    'set_time', sp.set_time,
    'max_elevation_degrees', sp.max_elevation,
    'duration_minutes', sp.duration_seconds::double precision / 60.0,
    'visibility', CASE WHEN sp.is_visible THEN 'visible' ELSE 'shadow' END,
    'pass_quality', 'good'
  )
  FROM satellite_passes sp
  WHERE sp.satellite_id = v_sat_uuid
    AND sp.rise_time >= now()
    AND sp.rise_time <= now() + (p_hours_ahead || ' hours')::interval
  ORDER BY sp.rise_time;
END;
$$;

-- ============================================================================
-- Missing Tables
-- ============================================================================

-- Autonomy configs table
CREATE TABLE IF NOT EXISTS public.autonomy_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  is_enabled boolean DEFAULT true,
  autonomy_level integer DEFAULT 1,
  allowed_task_types text[] DEFAULT ARRAY['maintenance', 'logistics'],
  require_approval_threshold integer DEFAULT 2,
  auto_approve_low_risk boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Autonomy decision logs table
CREATE TABLE IF NOT EXISTS public.autonomy_decision_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
  decision_type text NOT NULL,
  decision_data jsonb DEFAULT '{}',
  reasoning text,
  confidence_score numeric(5,4),
  timestamp timestamptz DEFAULT now()
);

-- Autonomy metrics table
CREATE TABLE IF NOT EXISTS public.autonomy_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  total_tasks integer DEFAULT 0,
  approved_tasks integer DEFAULT 0,
  rejected_tasks integer DEFAULT 0,
  avg_completion_time_minutes numeric(10,2),
  avg_confidence_score numeric(5,4),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Satellite coverage maps table (if not exists)
CREATE TABLE IF NOT EXISTS public.satellite_coverage_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id uuid REFERENCES satellites(id) ON DELETE CASCADE,
  coverage_geojson jsonb NOT NULL DEFAULT '{}',
  elevation_angle_degrees double precision,
  coverage_radius_km double precision,
  visibility_duration_minutes double precision,
  next_pass_at timestamptz,
  quality_score double precision,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to satellite_positions for upsert
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'satellite_positions_norad_id_key') THEN
    ALTER TABLE satellite_positions ADD CONSTRAINT satellite_positions_norad_id_key UNIQUE (norad_id);
  END IF;
EXCEPTION WHEN others THEN
  NULL; -- Ignore if constraint already exists or other issues
END $$;

-- ============================================================================
-- Enable RLS on new tables
-- ============================================================================

ALTER TABLE public.autonomy_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomy_decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_coverage_maps ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

DO $$ 
BEGIN
  -- Autonomy configs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_select_autonomy_configs') THEN
    CREATE POLICY "auth_select_autonomy_configs" ON public.autonomy_configs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_autonomy_configs') THEN
    CREATE POLICY "auth_all_autonomy_configs" ON public.autonomy_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  -- Autonomy decision logs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_select_autonomy_decision_logs') THEN
    CREATE POLICY "auth_select_autonomy_decision_logs" ON public.autonomy_decision_logs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_insert_autonomy_decision_logs') THEN
    CREATE POLICY "auth_insert_autonomy_decision_logs" ON public.autonomy_decision_logs FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  -- Autonomy metrics policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_select_autonomy_metrics') THEN
    CREATE POLICY "auth_select_autonomy_metrics" ON public.autonomy_metrics FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_autonomy_metrics') THEN
    CREATE POLICY "auth_all_autonomy_metrics" ON public.autonomy_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  -- Satellite coverage maps policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_select_satellite_coverage_maps') THEN
    CREATE POLICY "auth_select_satellite_coverage_maps" ON public.satellite_coverage_maps FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_satellite_coverage_maps') THEN
    CREATE POLICY "auth_all_satellite_coverage_maps" ON public.satellite_coverage_maps FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_autonomy_decision_logs_task_id ON autonomy_decision_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_autonomy_configs_entity_type ON autonomy_configs(entity_type);
CREATE INDEX IF NOT EXISTS idx_satellite_coverage_maps_satellite_id ON satellite_coverage_maps(satellite_id);