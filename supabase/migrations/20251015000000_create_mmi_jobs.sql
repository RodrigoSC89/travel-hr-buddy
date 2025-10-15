-- Create mmi_jobs table for MMI job management
CREATE TABLE IF NOT EXISTS public.mmi_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'awaiting_parts', 'postponed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date TIMESTAMP WITH TIME ZONE,
    component_name TEXT,
    asset_name TEXT,
    vessel_name TEXT,
    suggestion_ia TEXT,
    can_postpone BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read jobs
CREATE POLICY "Users can view mmi_jobs"
    ON public.mmi_jobs
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create jobs
CREATE POLICY "Users can create mmi_jobs"
    ON public.mmi_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update jobs
CREATE POLICY "Users can update mmi_jobs"
    ON public.mmi_jobs
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete jobs
CREATE POLICY "Users can delete mmi_jobs"
    ON public.mmi_jobs
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_jobs_updated_at
    BEFORE UPDATE ON public.mmi_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_mmi_jobs_job_id ON public.mmi_jobs(job_id);
CREATE INDEX idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX idx_mmi_jobs_priority ON public.mmi_jobs(priority);
CREATE INDEX idx_mmi_jobs_due_date ON public.mmi_jobs(due_date);
CREATE INDEX idx_mmi_jobs_created_at ON public.mmi_jobs(created_at DESC);
