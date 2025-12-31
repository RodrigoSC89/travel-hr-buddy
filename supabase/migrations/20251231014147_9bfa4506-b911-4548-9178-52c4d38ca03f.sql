-- PEO-DP PROGRAMA 2021
CREATE TABLE IF NOT EXISTS public.peo_dp_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  version TEXT,
  publication_date TIMESTAMP WITH TIME ZONE,
  total_sections INTEGER DEFAULT 7,
  total_requirements INTEGER DEFAULT 54,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(year, version)
);

ALTER TABLE public.peo_dp_program ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read peo dp program" ON public.peo_dp_program FOR SELECT USING (true);
CREATE POLICY "Auth insert peo dp program" ON public.peo_dp_program FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update peo dp program" ON public.peo_dp_program FOR UPDATE TO authenticated USING (true);

-- Inserir programa 2021
INSERT INTO public.peo_dp_program (year, version, publication_date, total_sections, total_requirements)
VALUES (2021, '03-11-2021', '2021-11-03', 7, 54)
ON CONFLICT (year, version) DO NOTHING;