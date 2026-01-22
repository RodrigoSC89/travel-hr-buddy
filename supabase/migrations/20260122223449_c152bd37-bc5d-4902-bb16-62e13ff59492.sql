-- Simplified migration - tables with basic RLS (user-based)

-- 1. Checklist Completions
CREATE TABLE IF NOT EXISTS public.checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL,
  completed_by UUID REFERENCES auth.users(id),
  vessel_id UUID REFERENCES public.vessels(id),
  completion_data JSONB DEFAULT '{}',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'completed',
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completions" ON public.checklist_completions
  FOR ALL USING (completed_by = auth.uid());

-- 2. System Logs (insert only for all, select for authenticated)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  message TEXT NOT NULL,
  module TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view logs" ON public.system_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can insert logs" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- 3. Medical Records
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type TEXT NOT NULL DEFAULT 'consultation',
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medications JSONB DEFAULT '[]',
  vital_signs JSONB DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical records access" ON public.medical_records
  FOR ALL TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_crew ON public.medical_records(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_checklist_completions_user ON public.checklist_completions(completed_by);