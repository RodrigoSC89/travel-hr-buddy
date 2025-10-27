-- PATCH 271-275: Voice Assistant, Mission Control, Analytics Core, Satellite Tracker, Document Templates
-- Migration created: 2025-10-27

-- ============================================================================
-- PATCH 272: Mission Control Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mission_control_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_control_logs_mission_id ON public.mission_control_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_control_logs_created_at ON public.mission_control_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_control_logs_severity ON public.mission_control_logs(severity);

-- ============================================================================
-- PATCH 273: Analytics Core - Usage Metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL,
    dimensions JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    module TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_metric_name ON public.usage_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_timestamp ON public.usage_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_module ON public.usage_metrics(module);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.usage_metrics(user_id);

-- ============================================================================
-- PATCH 274: Satellite Tracker - Orbits
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.satellite_orbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_id TEXT NOT NULL,
    satellite_name TEXT NOT NULL,
    norad_id TEXT,
    altitude NUMERIC,
    latitude NUMERIC,
    longitude NUMERIC,
    velocity NUMERIC,
    orbital_period NUMERIC,
    inclination NUMERIC,
    eccentricity NUMERIC,
    tle_line1 TEXT,
    tle_line2 TEXT,
    metadata JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satellite_orbits_satellite_id ON public.satellite_orbits(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_orbits_norad_id ON public.satellite_orbits(norad_id);
CREATE INDEX IF NOT EXISTS idx_satellite_orbits_last_updated ON public.satellite_orbits(last_updated DESC);

-- ============================================================================
-- PATCH 275: Document Templates (Enhanced)
-- ============================================================================
-- Note: ai_document_templates table already exists, but we'll add additional columns if needed
ALTER TABLE public.ai_document_templates 
ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rich_text_content TEXT,
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS export_formats TEXT[] DEFAULT ARRAY['pdf', 'html'];

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Mission Control Logs RLS
ALTER TABLE public.mission_control_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mission control logs they have access to"
    ON public.mission_control_logs FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert mission control logs"
    ON public.mission_control_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Usage Metrics RLS
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage metrics"
    ON public.usage_metrics FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own usage metrics"
    ON public.usage_metrics FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Satellite Orbits RLS
ALTER TABLE public.satellite_orbits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view satellite orbits"
    ON public.satellite_orbits FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert satellite orbits"
    ON public.satellite_orbits FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update satellite orbits"
    ON public.satellite_orbits FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

-- Mission Control Logs trigger
CREATE OR REPLACE FUNCTION public.update_mission_control_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mission_control_logs_updated_at
    BEFORE UPDATE ON public.mission_control_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_mission_control_logs_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.mission_control_logs IS 'PATCH 272: Logs for mission control operations and events';
COMMENT ON TABLE public.usage_metrics IS 'PATCH 273: Usage metrics for analytics core';
COMMENT ON TABLE public.satellite_orbits IS 'PATCH 274: Satellite tracking and orbital data';
