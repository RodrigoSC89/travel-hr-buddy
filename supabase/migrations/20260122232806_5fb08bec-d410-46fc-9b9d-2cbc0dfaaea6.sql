-- =============================================
-- Cleanup and Fix RLS Policies (v3 - Minimal)
-- =============================================

-- 1. Fix system_logs: Remove the most permissive policy
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.system_logs;

-- 2. Add created_by to medical_supplies if missing
ALTER TABLE public.medical_supplies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 3. Add created_by to medical_records if missing
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 4. Create recruitment_candidates table
CREATE TABLE IF NOT EXISTS public.recruitment_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  rank_applied TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  vessel_types TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  match_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  cv_url TEXT,
  notes TEXT,
  ai_analysis JSONB DEFAULT '{}',
  job_opening_id UUID,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recruitment_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates by creator" ON public.recruitment_candidates
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- 5. Create job_openings table  
CREATE TABLE IF NOT EXISTS public.job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  vessel_type TEXT,
  rank_required TEXT NOT NULL,
  certifications_required TEXT[] DEFAULT '{}',
  experience_min INTEGER DEFAULT 0,
  description TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'open',
  applicants_count INTEGER DEFAULT 0,
  deadline DATE,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job openings by creator" ON public.job_openings
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_status ON public.recruitment_candidates(status);
CREATE INDEX IF NOT EXISTS idx_job_openings_status ON public.job_openings(status);