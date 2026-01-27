-- ============================================================================
-- PATCH 868: Create Missing Tables and RPCs for @ts-nocheck Elimination
-- Creates underwater_missions, mission_events, and required RPC functions
-- ============================================================================

-- ============================================================================
-- 1. underwater_missions - Required by underwaterMissionService.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.underwater_missions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    mission_name TEXT NOT NULL,
    mission_type TEXT NOT NULL DEFAULT 'exploration',
    status TEXT NOT NULL DEFAULT 'planned',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    target_location JSONB DEFAULT '{}',
    depth_target NUMERIC,
    max_depth NUMERIC,
    battery_level NUMERIC DEFAULT 100,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.underwater_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "underwater_missions_user_access" ON public.underwater_missions
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_underwater_missions_user_id ON public.underwater_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_status ON public.underwater_missions(status);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_created_at ON public.underwater_missions(created_at DESC);

-- ============================================================================
-- 2. mission_events - Required by underwaterMissionService.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mission_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.underwater_missions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    message TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mission_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mission_events_access" ON public.mission_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.underwater_missions m 
            WHERE m.id = mission_events.mission_id AND m.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_mission_events_mission_id ON public.mission_events(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_events_timestamp ON public.mission_events(timestamp DESC);

-- ============================================================================
-- 3. RPC: start_tracking_session - Required by satellite-tracker.tsx
-- ============================================================================
CREATE OR REPLACE FUNCTION public.start_tracking_session(
    p_satellite_id UUID,
    p_session_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_session_id UUID;
    v_satellite RECORD;
BEGIN
    -- Get satellite info
    SELECT * INTO v_satellite FROM public.satellites WHERE id = p_satellite_id;
    
    IF v_satellite IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Satellite not found');
    END IF;
    
    -- Create a tracking log entry
    INSERT INTO public.satellite_alerts (
        satellite_id,
        alert_type,
        severity,
        message,
        is_resolved
    ) VALUES (
        p_satellite_id,
        'tracking_started',
        'info',
        'Tracking session started: ' || COALESCE(p_session_name, 'unnamed'),
        true
    ) RETURNING id INTO v_session_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'session_id', v_session_id,
        'satellite_name', v_satellite.name,
        'started_at', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 4. RPC: get_ai_learning_insights - Required by learning-dashboard.tsx
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ai_learning_insights(
    p_days_back INTEGER DEFAULT 30,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    module_name TEXT,
    insight_type TEXT,
    insight_data JSONB,
    confidence_score NUMERIC,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ab.id,
        ab.module_name,
        ab.behavior_type AS insight_type,
        jsonb_build_object(
            'accuracy', ab.accuracy_score,
            'precision', ab.precision_score,
            'recall', ab.recall_score,
            'f1_score', ab.f1_score,
            'decisions_count', ab.decisions_count,
            'correct_decisions', ab.correct_decisions,
            'anomalies_detected', ab.anomalies_detected
        ) AS insight_data,
        ab.confidence_avg AS confidence_score,
        ab.created_at
    FROM public.ai_behavior_snapshots ab
    WHERE ab.snapshot_date >= CURRENT_DATE - p_days_back
    ORDER BY ab.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 5. RPC: get_ai_accuracy_metrics - Required by learning-dashboard.tsx
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ai_accuracy_metrics(
    p_module_name TEXT DEFAULT NULL,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    module TEXT,
    total_decisions BIGINT,
    correct_decisions BIGINT,
    accuracy_rate NUMERIC,
    avg_confidence NUMERIC,
    trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ab.module_name AS module,
        COALESCE(SUM(ab.decisions_count), 0)::BIGINT AS total_decisions,
        COALESCE(SUM(ab.correct_decisions), 0)::BIGINT AS correct_decisions,
        CASE 
            WHEN SUM(ab.decisions_count) > 0 
            THEN ROUND(SUM(ab.correct_decisions)::NUMERIC / SUM(ab.decisions_count) * 100, 2)
            ELSE 0
        END AS accuracy_rate,
        ROUND(AVG(ab.confidence_avg), 2) AS avg_confidence,
        CASE 
            WHEN AVG(ab.accuracy_score) >= 0.9 THEN 'excellent'
            WHEN AVG(ab.accuracy_score) >= 0.75 THEN 'good'
            WHEN AVG(ab.accuracy_score) >= 0.5 THEN 'fair'
            ELSE 'needs_improvement'
        END AS trend
    FROM public.ai_behavior_snapshots ab
    WHERE ab.snapshot_date >= CURRENT_DATE - p_days_back
      AND (p_module_name IS NULL OR ab.module_name = p_module_name)
    GROUP BY ab.module_name
    ORDER BY accuracy_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 6. RPC: get_ai_behavior_analysis - Required by learning-dashboard.tsx
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ai_behavior_analysis(
    p_module_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    module TEXT,
    behavior_type TEXT,
    snapshot_date DATE,
    metrics JSONB,
    learning_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ab.module_name AS module,
        ab.behavior_type,
        ab.snapshot_date,
        jsonb_build_object(
            'accuracy_score', ab.accuracy_score,
            'precision_score', ab.precision_score,
            'recall_score', ab.recall_score,
            'f1_score', ab.f1_score,
            'anomalies_detected', ab.anomalies_detected
        ) AS metrics,
        ab.learning_rate
    FROM public.ai_behavior_snapshots ab
    WHERE (p_module_name IS NULL OR ab.module_name = p_module_name)
    ORDER BY ab.snapshot_date DESC, ab.module_name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 7. Trigger for underwater_missions updated_at
-- ============================================================================
CREATE OR REPLACE TRIGGER update_underwater_missions_updated_at
BEFORE UPDATE ON public.underwater_missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();