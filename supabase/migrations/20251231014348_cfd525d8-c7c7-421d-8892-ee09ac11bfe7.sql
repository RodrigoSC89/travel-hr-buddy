-- PEO-DP RESPOSTAS E EVIDENCIAS AI
CREATE TABLE IF NOT EXISTS public.peo_dp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.peo_dp_requirements(id),
  status TEXT NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'partial', 'not_applicable', 'pending')),
  auditor_notes TEXT,
  evidence_files TEXT[],
  ai_analysis TEXT,
  ai_corrective_plan TEXT,
  response_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(audit_id, requirement_id)
);

CREATE TABLE IF NOT EXISTS public.peo_dp_ai_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peo_dp_audits(id),
  requirement_id UUID REFERENCES public.peo_dp_requirements(id),
  section TEXT,
  requirement_number TEXT,
  non_conformity_description TEXT,
  ai_technical_analysis TEXT,
  ai_normative_reference TEXT,
  ai_risk_assessment TEXT,
  ai_corrective_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.peo_dp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_dp_ai_evidences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage peo dp responses" ON public.peo_dp_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage peo dp ai evidences" ON public.peo_dp_ai_evidences FOR ALL TO authenticated USING (true) WITH CHECK (true);