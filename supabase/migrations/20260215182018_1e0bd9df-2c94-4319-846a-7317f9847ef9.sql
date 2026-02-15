
-- Create scheduled_reports table for automated reports persistence
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'compliance',
  schedule TEXT NOT NULL DEFAULT 'weekly',
  recipients TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scheduled reports" ON public.scheduled_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create scheduled reports" ON public.scheduled_reports
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their reports" ON public.scheduled_reports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their reports" ON public.scheduled_reports
  FOR DELETE USING (auth.uid() = created_by);

CREATE INDEX idx_scheduled_reports_active ON public.scheduled_reports(is_active);

-- Add holder_name and category columns to certificates if not exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='certificates' AND column_name='holder_name') THEN
    ALTER TABLE public.certificates ADD COLUMN holder_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='certificates' AND column_name='category') THEN
    ALTER TABLE public.certificates ADD COLUMN category TEXT DEFAULT 'crew';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='certificates' AND column_name='vessel_id') THEN
    ALTER TABLE public.certificates ADD COLUMN vessel_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='certificates' AND column_name='vessel_name') THEN
    ALTER TABLE public.certificates ADD COLUMN vessel_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='certificates' AND column_name='notes') THEN
    ALTER TABLE public.certificates ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
