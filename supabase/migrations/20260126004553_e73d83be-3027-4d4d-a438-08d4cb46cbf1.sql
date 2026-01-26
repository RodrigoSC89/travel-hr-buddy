-- Add missing columns to mmi_job_history
ALTER TABLE public.mmi_job_history 
  ADD COLUMN IF NOT EXISTS vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS technician_id UUID,
  ADD COLUMN IF NOT EXISTS technician_name TEXT,
  ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS labor_hours NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_mmi_job_history_vessel ON public.mmi_job_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mmi_job_history_org ON public.mmi_job_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_mmi_job_history_job ON public.mmi_job_history(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_job_history_created ON public.mmi_job_history(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_mmi_job_history_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_mmi_job_history_updated_at ON public.mmi_job_history;
CREATE TRIGGER update_mmi_job_history_updated_at
BEFORE UPDATE ON public.mmi_job_history
FOR EACH ROW EXECUTE FUNCTION public.update_mmi_job_history_updated_at();