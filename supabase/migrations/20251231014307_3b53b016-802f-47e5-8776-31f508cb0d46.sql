-- PEO-DP AUDITORIAS
CREATE TABLE IF NOT EXISTS public.peo_dp_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  program_id UUID REFERENCES public.peo_dp_program(id),
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  auditor_name TEXT,
  company_name TEXT,
  audit_status TEXT DEFAULT 'in_progress' CHECK (audit_status IN ('in_progress', 'completed', 'submitted')),
  section_31_conformity NUMERIC(5,2),
  section_32_conformity NUMERIC(5,2),
  section_33_conformity NUMERIC(5,2),
  section_34_conformity NUMERIC(5,2),
  section_35_conformity NUMERIC(5,2),
  section_36_conformity NUMERIC(5,2),
  section_37_conformity NUMERIC(5,2),
  overall_conformity NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.peo_dp_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage peo dp audits" ON public.peo_dp_audits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_peo_dp_audits_vessel ON public.peo_dp_audits(vessel_id);
CREATE INDEX idx_peo_dp_audits_org ON public.peo_dp_audits(organization_id);