-- PATCH 507: Automatic Backup System
-- Create tables and functions for automated backups

-- Create backup_snapshots table
CREATE TABLE IF NOT EXISTS public.backup_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Backup metadata
    backup_name TEXT NOT NULL,
    backup_type TEXT NOT NULL, -- 'weekly', 'manual', 'pre-migration'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    
    -- File information
    storage_path TEXT, -- Path in Supabase Storage
    file_size BIGINT, -- Size in bytes
    checksum TEXT, -- MD5 checksum for integrity
    
    -- Backup content metadata
    tables_included TEXT[], -- List of tables included
    records_count JSONB DEFAULT '{}'::jsonb, -- Count per table
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Retention
    expires_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_status ON public.backup_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_created ON public.backup_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_type ON public.backup_snapshots(backup_type);

-- Enable RLS
ALTER TABLE public.backup_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all backups"
    ON public.backup_snapshots
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert backups"
    ON public.backup_snapshots
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update backups"
    ON public.backup_snapshots
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to create backup metadata entry
CREATE OR REPLACE FUNCTION public.create_backup_snapshot(
    p_backup_name TEXT,
    p_backup_type TEXT,
    p_tables_included TEXT[],
    p_retention_days INTEGER DEFAULT 90
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_backup_id UUID;
BEGIN
    INSERT INTO public.backup_snapshots (
        backup_name,
        backup_type,
        status,
        tables_included,
        expires_at
    ) VALUES (
        p_backup_name,
        p_backup_type,
        'pending',
        p_tables_included,
        NOW() + INTERVAL '1 day' * p_retention_days
    )
    RETURNING id INTO v_backup_id;
    
    RETURN v_backup_id;
END;
$$;

-- Function to update backup status
CREATE OR REPLACE FUNCTION public.update_backup_status(
    p_backup_id UUID,
    p_status TEXT,
    p_storage_path TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_checksum TEXT DEFAULT NULL,
    p_records_count JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.backup_snapshots
    SET 
        status = p_status,
        storage_path = COALESCE(p_storage_path, storage_path),
        file_size = COALESCE(p_file_size, file_size),
        checksum = COALESCE(p_checksum, checksum),
        records_count = COALESCE(p_records_count, records_count),
        error_message = p_error_message,
        started_at = CASE WHEN p_status = 'in_progress' THEN NOW() ELSE started_at END,
        completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE completed_at END
    WHERE id = p_backup_id;
    
    RETURN FOUND;
END;
$$;

-- Function to cleanup expired backups
CREATE OR REPLACE FUNCTION public.cleanup_expired_backups()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE public.backup_snapshots
    SET deleted_at = NOW()
    WHERE 
        deleted_at IS NULL
        AND expires_at < NOW()
        AND status = 'completed';
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

-- Function to get backup statistics
CREATE OR REPLACE FUNCTION public.get_backup_stats()
RETURNS TABLE (
    total_backups BIGINT,
    completed_backups BIGINT,
    failed_backups BIGINT,
    total_size BIGINT,
    last_backup_date TIMESTAMPTZ,
    next_backup_due TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT AS total_backups,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT AS completed_backups,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT AS failed_backups,
        COALESCE(SUM(file_size), 0)::BIGINT AS total_size,
        MAX(completed_at) AS last_backup_date,
        -- Next backup is 7 days after last completed backup
        (MAX(completed_at) + INTERVAL '7 days') AS next_backup_due
    FROM public.backup_snapshots
    WHERE deleted_at IS NULL;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.backup_snapshots TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_backup_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_backup_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_backups TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_backup_stats TO authenticated;

COMMENT ON TABLE public.backup_snapshots IS 'PATCH 507: Automated backup snapshots with weekly schedule';
