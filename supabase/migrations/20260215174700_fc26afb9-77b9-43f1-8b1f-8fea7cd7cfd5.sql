
-- ISPS Security Tables
CREATE TABLE public.isps_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  score NUMERIC DEFAULT 0,
  findings INTEGER DEFAULT 0,
  last_assessment_date TIMESTAMPTZ,
  next_assessment_date TIMESTAMPTZ,
  assessor_name TEXT,
  notes TEXT,
  evidence_files JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.isps_security_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  security_level INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_until TIMESTAMPTZ,
  ordered_by TEXT,
  authority TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.isps_cyber_threats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'detected',
  source TEXT,
  description TEXT,
  mitigation_actions JSONB DEFAULT '[]',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cargo_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  cargo_operation_id UUID REFERENCES public.cargo_operations(id),
  claim_type TEXT NOT NULL,
  claim_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  claimant TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  evidence JSONB DEFAULT '[]',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.isps_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isps_security_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isps_cyber_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users manage isps_assessments" ON public.isps_assessments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage isps_security_levels" ON public.isps_security_levels FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage isps_cyber_threats" ON public.isps_cyber_threats FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage cargo_claims" ON public.cargo_claims FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_isps_assessments_vessel ON public.isps_assessments(vessel_id);
CREATE INDEX idx_isps_cyber_severity ON public.isps_cyber_threats(severity);
CREATE INDEX idx_cargo_claims_operation ON public.cargo_claims(cargo_operation_id);
