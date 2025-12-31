-- PEO-DP REQUISITOS
CREATE TABLE IF NOT EXISTS public.peo_dp_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.peo_dp_program(id),
  section TEXT NOT NULL,
  section_name TEXT NOT NULL,
  requirement_number TEXT NOT NULL,
  requirement_title TEXT NOT NULL,
  requirement_description TEXT,
  criticality_level TEXT CHECK (criticality_level IN ('critical', 'high', 'normal')),
  evidence_required TEXT[],
  frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(program_id, requirement_number)
);

ALTER TABLE public.peo_dp_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read peo dp requirements" ON public.peo_dp_requirements FOR SELECT USING (true);
CREATE POLICY "Auth insert peo dp requirements" ON public.peo_dp_requirements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update peo dp requirements" ON public.peo_dp_requirements FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_peo_dp_requirements_section ON public.peo_dp_requirements(section);
CREATE INDEX idx_peo_dp_requirements_program ON public.peo_dp_requirements(program_id);