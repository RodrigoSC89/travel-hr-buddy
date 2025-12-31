-- =====================================================
-- PEO-DP PETROBRAS 2021 - SCHEMA COMPLETO
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. PROGRAMA PEO-DP
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

-- 2. REQUISITOS PEO-DP (54+)
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

-- 3. AUDITORIAS PEO-DP
CREATE TABLE IF NOT EXISTS public.peo_dp_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  program_id UUID REFERENCES public.peo_dp_program(id),
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  auditor_name TEXT,
  company_name TEXT,
  audit_status TEXT DEFAULT 'in_progress',
  section_31_conformity NUMERIC(5,2),
  section_32_conformity NUMERIC(5,2),
  section_33_conformity NUMERIC(5,2),
  section_34_conformity NUMERIC(5,2),
  section_35_conformity NUMERIC(5,2),
  section_36_conformity NUMERIC(5,2),
  section_37_conformity NUMERIC(5,2),
  overall_conformity NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. RESPOSTAS
CREATE TABLE IF NOT EXISTS public.peo_dp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.peo_dp_requirements(id),
  status TEXT NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'partial', 'not_applicable')),
  auditor_notes TEXT,
  evidence_files TEXT[],
  ai_analysis TEXT,
  response_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(audit_id, requirement_id)
);

-- 5. INDICADORES (IPCLV, Drift, Drive, Excursion)
CREATE TABLE IF NOT EXISTS public.peo_dp_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peo_dp_audits(id),
  vessel_id UUID REFERENCES public.vessels(id),
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('IPCLV', 'DRIFT_OFF', 'DRIVE_OFF', 'LARGE_EXCURSION')),
  target_value NUMERIC(5,2),
  actual_value NUMERIC(5,2),
  month INTEGER,
  year INTEGER,
  status TEXT CHECK (status IN ('met', 'not_met', 'warning')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. EVENTOS DP
CREATE TABLE IF NOT EXISTS public.peo_dp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peo_dp_audits(id),
  vessel_id UUID REFERENCES public.vessels(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('DRIFT_OFF', 'DRIVE_OFF', 'LARGE_EXCURSION', 'BLACKOUT')),
  event_date TIMESTAMP WITH TIME ZONE,
  event_description TEXT,
  cause_analysis TEXT,
  corrective_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.peo_dp_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_dp_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_dp_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_dp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_dp_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_dp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read program" ON public.peo_dp_program FOR SELECT USING (true);
CREATE POLICY "Public read requirements" ON public.peo_dp_requirements FOR SELECT USING (true);
CREATE POLICY "Auth manage audits" ON public.peo_dp_audits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage responses" ON public.peo_dp_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage indicators" ON public.peo_dp_indicators FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage events" ON public.peo_dp_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INSERIR PROGRAMA 2021
INSERT INTO public.peo_dp_program (year, version, publication_date, total_sections, total_requirements)
VALUES (2021, '03-11-2021', '2021-11-03', 7, 54)
ON CONFLICT (year, version) DO NOTHING;
