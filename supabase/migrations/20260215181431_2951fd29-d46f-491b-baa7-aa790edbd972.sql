
-- 1. JOB POSTINGS
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vessel_type TEXT,
  rank_required TEXT NOT NULL,
  certifications_required TEXT[] DEFAULT '{}',
  experience_min INTEGER DEFAULT 0,
  salary_range_min NUMERIC(12,2),
  salary_range_max NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  location TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  status TEXT NOT NULL DEFAULT 'open',
  applicants_count INTEGER DEFAULT 0,
  posted_by UUID,
  organization_id UUID REFERENCES public.organizations(id),
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_postings' AND policyname = 'Auth view job_postings') THEN
    CREATE POLICY "Auth view job_postings" ON public.job_postings FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_postings' AND policyname = 'Auth insert job_postings') THEN
    CREATE POLICY "Auth insert job_postings" ON public.job_postings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_postings' AND policyname = 'Auth update job_postings') THEN
    CREATE POLICY "Auth update job_postings" ON public.job_postings FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_postings' AND policyname = 'Auth delete job_postings') THEN
    CREATE POLICY "Auth delete job_postings" ON public.job_postings FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_rank ON public.job_postings(rank_required);

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON public.job_postings;
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

-- 2. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  rank_applied TEXT,
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  match_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  cv_url TEXT,
  notes TEXT,
  crew_member_id UUID REFERENCES public.crew_members(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Auth view job_applications') THEN
    CREATE POLICY "Auth view job_applications" ON public.job_applications FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Auth insert job_applications') THEN
    CREATE POLICY "Auth insert job_applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Auth update job_applications') THEN
    CREATE POLICY "Auth update job_applications" ON public.job_applications FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Auth delete job_applications') THEN
    CREATE POLICY "Auth delete job_applications" ON public.job_applications FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_posting_id);

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
