-- PATCH 265: Mission Logs - Detailed Visualization System
-- Creates tables and views for mission log visualization and export

-- 1. Mission Logs Table (if not exists)
CREATE TABLE IF NOT EXISTS public.mission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    
    -- Log details
    log_type TEXT NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'critical', 'success', 'debug')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT,
    
    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Source
    source_module TEXT,
    source_function TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Context
    vessel_id UUID,
    location_lat DECIMAL(10, 8),
    location_lon DECIMAL(11, 8),
    
    -- Timestamps
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Additional metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- For correlation
    correlation_id UUID,
    parent_log_id UUID REFERENCES public.mission_logs(id) ON DELETE SET NULL
);

-- 2. Mission Log Filters (Saved filters for users)
CREATE TABLE IF NOT EXISTS public.mission_log_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    -- Filter criteria
    filter_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Sharing
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Log Export Jobs (Track export requests)
CREATE TABLE IF NOT EXISTS public.log_export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Export details
    export_format TEXT NOT NULL CHECK (export_format IN ('csv', 'json', 'pdf')),
    filter_criteria JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Results
    file_url TEXT,
    file_size_bytes INTEGER,
    record_count INTEGER,
    
    -- Error handling
    error_message TEXT,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_log_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mission_logs
CREATE POLICY "Users can view mission_logs"
    ON public.mission_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create mission_logs"
    ON public.mission_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for mission_log_filters
CREATE POLICY "Users can view their own filters"
    ON public.mission_log_filters FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own filters"
    ON public.mission_log_filters FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for log_export_jobs
CREATE POLICY "Users can view their own export jobs"
    ON public.log_export_jobs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create export jobs"
    ON public.log_export_jobs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_mission_logs_mission_id ON public.mission_logs(mission_id);
CREATE INDEX idx_mission_logs_type ON public.mission_logs(log_type);
CREATE INDEX idx_mission_logs_severity ON public.mission_logs(severity);
CREATE INDEX idx_mission_logs_category ON public.mission_logs(category);
CREATE INDEX idx_mission_logs_timestamp ON public.mission_logs(event_timestamp DESC);
CREATE INDEX idx_mission_logs_user_id ON public.mission_logs(user_id);
CREATE INDEX idx_mission_logs_vessel_id ON public.mission_logs(vessel_id);
CREATE INDEX idx_mission_logs_source_module ON public.mission_logs(source_module);
CREATE INDEX idx_mission_logs_correlation ON public.mission_logs(correlation_id);
CREATE INDEX idx_mission_logs_tags ON public.mission_logs USING GIN(tags);

CREATE INDEX idx_log_filters_user_id ON public.mission_log_filters(user_id);
CREATE INDEX idx_log_filters_public ON public.mission_log_filters(is_public) WHERE is_public = true;

CREATE INDEX idx_export_jobs_user_id ON public.log_export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON public.log_export_jobs(status);
CREATE INDEX idx_export_jobs_expires ON public.log_export_jobs(expires_at);

-- Create update trigger for filters
CREATE TRIGGER update_mission_log_filters_updated_at
    BEFORE UPDATE ON public.mission_log_filters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for log statistics
CREATE OR REPLACE VIEW public.mission_log_stats AS
SELECT
    DATE(event_timestamp) as log_date,
    log_type,
    severity,
    category,
    COUNT(*) as log_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT mission_id) as unique_missions
FROM public.mission_logs
WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(event_timestamp), log_type, severity, category;

-- Function to clean up old export jobs
CREATE OR REPLACE FUNCTION public.cleanup_expired_exports()
RETURNS void AS $$
BEGIN
    DELETE FROM public.log_export_jobs
    WHERE expires_at < NOW()
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get log timeline
CREATE OR REPLACE FUNCTION public.get_mission_log_timeline(
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_mission_id UUID DEFAULT NULL,
    p_severity TEXT DEFAULT NULL,
    p_log_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    hour_bucket TIMESTAMP WITH TIME ZONE,
    log_count BIGINT,
    severity_distribution JSONB,
    type_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('hour', event_timestamp) as hour_bucket,
        COUNT(*) as log_count,
        JSONB_OBJECT_AGG(severity, severity_count) as severity_distribution,
        JSONB_OBJECT_AGG(log_type, type_count) as type_distribution
    FROM (
        SELECT
            event_timestamp,
            severity,
            log_type,
            COUNT(*) OVER (PARTITION BY DATE_TRUNC('hour', event_timestamp), severity) as severity_count,
            COUNT(*) OVER (PARTITION BY DATE_TRUNC('hour', event_timestamp), log_type) as type_count
        FROM public.mission_logs
        WHERE event_timestamp BETWEEN p_start_date AND p_end_date
        AND (p_mission_id IS NULL OR mission_id = p_mission_id)
        AND (p_severity IS NULL OR severity = p_severity)
        AND (p_log_type IS NULL OR log_type = p_log_type)
    ) grouped
    GROUP BY DATE_TRUNC('hour', event_timestamp)
    ORDER BY hour_bucket DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
