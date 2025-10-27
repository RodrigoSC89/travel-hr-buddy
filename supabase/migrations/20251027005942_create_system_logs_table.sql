-- Create system_logs table for centralized logging
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON public.system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert logs
CREATE POLICY "Service role can insert logs" ON public.system_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create policy to allow authenticated users to read logs
CREATE POLICY "Authenticated users can read logs" ON public.system_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Add comment
COMMENT ON TABLE public.system_logs IS 'Centralized system logging table for Winston and application logs';
