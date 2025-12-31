-- PATCH 911: Create SGSO Evidence, Findings and Action Plans tables

-- Table for SGSO Evidence with OCR support
CREATE TABLE IF NOT EXISTS public.sgso_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.sgso_audits(id) ON DELETE SET NULL,
  practice_number TEXT NOT NULL,
  practice_name TEXT NOT NULL,
  evidence_type TEXT DEFAULT 'document',
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  ocr_text TEXT,
  ocr_confidence NUMERIC(5,2),
  compliance_status TEXT DEFAULT 'pending',
  justification TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for SGSO Findings (Non-Conformities)
CREATE TABLE IF NOT EXISTS public.sgso_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.sgso_audits(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  practice_number TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'observation')),
  title TEXT NOT NULL,
  description TEXT,
  root_cause TEXT,
  status TEXT DEFAULT 'open',
  responsible TEXT,
  deadline DATE,
  closed_at TIMESTAMPTZ,
  closed_by UUID,
  evidence_ids UUID[],
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for SGSO Action Plans (CAPA)
CREATE TABLE IF NOT EXISTS public.sgso_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES public.sgso_findings(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.sgso_audits(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  action_type TEXT DEFAULT 'corrective' CHECK (action_type IN ('corrective', 'preventive', 'improvement')),
  title TEXT NOT NULL,
  description TEXT,
  responsible TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  progress INTEGER DEFAULT 0,
  verification_method TEXT,
  verification_date DATE,
  verified_by UUID,
  evidence_ids UUID[],
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sgso_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_action_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sgso_evidence
CREATE POLICY "Users can view evidence from their org" ON public.sgso_evidence
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert evidence for their org" ON public.sgso_evidence
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update evidence from their org" ON public.sgso_evidence
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete evidence from their org" ON public.sgso_evidence
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS Policies for sgso_findings
CREATE POLICY "Users can view findings from their org" ON public.sgso_findings
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert findings for their org" ON public.sgso_findings
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update findings from their org" ON public.sgso_findings
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete findings from their org" ON public.sgso_findings
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS Policies for sgso_action_plans
CREATE POLICY "Users can view action plans from their org" ON public.sgso_action_plans
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert action plans for their org" ON public.sgso_action_plans
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update action plans from their org" ON public.sgso_action_plans
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete action plans from their org" ON public.sgso_action_plans
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sgso_evidence_org ON public.sgso_evidence(organization_id);
CREATE INDEX IF NOT EXISTS idx_sgso_evidence_practice ON public.sgso_evidence(practice_number);
CREATE INDEX IF NOT EXISTS idx_sgso_evidence_audit ON public.sgso_evidence(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_findings_org ON public.sgso_findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_sgso_findings_audit ON public.sgso_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_findings_status ON public.sgso_findings(status);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_org ON public.sgso_action_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_finding ON public.sgso_action_plans(finding_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_status ON public.sgso_action_plans(status);

-- Update triggers
CREATE TRIGGER update_sgso_evidence_updated_at
  BEFORE UPDATE ON public.sgso_evidence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_sgso_findings_updated_at
  BEFORE UPDATE ON public.sgso_findings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_sgso_action_plans_updated_at
  BEFORE UPDATE ON public.sgso_action_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create storage bucket for SGSO evidence files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sgso-evidence', 'sgso-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for sgso-evidence bucket
CREATE POLICY "Authenticated users can view SGSO evidence files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sgso-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload SGSO evidence files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sgso-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update SGSO evidence files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sgso-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete SGSO evidence files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sgso-evidence' AND auth.role() = 'authenticated');