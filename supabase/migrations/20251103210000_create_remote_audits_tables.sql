-- PATCH 606: Remote Audits with LLM and Digital Evidence
-- Migration for creating remote audit tables and storage bucket

-- Create remote_audits table
CREATE TABLE IF NOT EXISTS public.remote_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  vessel_id UUID,
  module_name TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'review', 'completed', 'rejected')),
  score NUMERIC,
  max_score NUMERIC DEFAULT 100,
  compliance_percentage NUMERIC,
  auditor_id UUID REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  review_date TIMESTAMPTZ,
  findings TEXT[],
  recommendations TEXT[],
  ai_analysis JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Create remote_audit_checklist table
CREATE TABLE IF NOT EXISTS public.remote_audit_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.remote_audits(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  item_number INTEGER,
  question TEXT NOT NULL,
  response TEXT CHECK (response IN ('yes', 'no', 'n/a', 'partial')),
  evidence_required BOOLEAN DEFAULT false,
  evidence_uploaded BOOLEAN DEFAULT false,
  notes TEXT,
  ai_validation JSONB,
  score_value NUMERIC,
  max_score_value NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Create remote_audit_evidence table
CREATE TABLE IF NOT EXISTS public.remote_audit_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.remote_audits(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES public.remote_audit_checklist(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  ocr_text TEXT,
  ocr_processed BOOLEAN DEFAULT false,
  ai_analysis JSONB,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'requires_review')),
  metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_remote_audits_vessel ON public.remote_audits(vessel_id);
CREATE INDEX IF NOT EXISTS idx_remote_audits_type ON public.remote_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_remote_audits_status ON public.remote_audits(status);
CREATE INDEX IF NOT EXISTS idx_remote_audits_auditor ON public.remote_audits(auditor_id);
CREATE INDEX IF NOT EXISTS idx_remote_audits_date ON public.remote_audits(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_checklist_audit ON public.remote_audit_checklist(audit_id);
CREATE INDEX IF NOT EXISTS idx_checklist_section ON public.remote_audit_checklist(section);

CREATE INDEX IF NOT EXISTS idx_evidence_audit ON public.remote_audit_evidence(audit_id);
CREATE INDEX IF NOT EXISTS idx_evidence_checklist ON public.remote_audit_evidence(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON public.remote_audit_evidence(verification_status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_remote_audits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remote_audits_updated_at
  BEFORE UPDATE ON public.remote_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_remote_audits_updated_at();

CREATE TRIGGER remote_audit_checklist_updated_at
  BEFORE UPDATE ON public.remote_audit_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_remote_audits_updated_at();

-- Enable RLS
ALTER TABLE public.remote_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_audit_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_audit_evidence ENABLE ROW LEVEL SECURITY;

-- Create policies for remote_audits
CREATE POLICY "Users can view all remote audits"
  ON public.remote_audits
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create remote audits"
  ON public.remote_audits
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auditors can update their audits"
  ON public.remote_audits
  FOR UPDATE
  USING (
    auth.uid() = auditor_id OR
    auth.uid() = reviewer_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete remote audits"
  ON public.remote_audits
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for remote_audit_checklist
CREATE POLICY "Users can view all checklist items"
  ON public.remote_audit_checklist
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create checklist items"
  ON public.remote_audit_checklist
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auditors can update checklist items"
  ON public.remote_audit_checklist
  FOR UPDATE
  USING (
    audit_id IN (
      SELECT id FROM public.remote_audits 
      WHERE auditor_id = auth.uid() OR reviewer_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for remote_audit_evidence
CREATE POLICY "Users can view all evidence"
  ON public.remote_audit_evidence
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload evidence"
  ON public.remote_audit_evidence
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Uploaders can update their evidence"
  ON public.remote_audit_evidence
  FOR UPDATE
  USING (
    auth.uid() = uploaded_by OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.remote_audits TO authenticated;
GRANT DELETE ON public.remote_audits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.remote_audit_checklist TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.remote_audit_evidence TO authenticated;

-- Create storage bucket for audit evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-evidence', 'audit-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload audit evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audit-evidence');

CREATE POLICY "Users can view audit evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'audit-evidence');

CREATE POLICY "Users can update their evidence"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'audit-evidence' AND auth.uid()::text = owner);

CREATE POLICY "Admins can delete audit evidence"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'audit-evidence' AND (auth.jwt() ->> 'role' = 'admin' OR auth.uid()::text = owner));

-- Add comments for documentation
COMMENT ON TABLE public.remote_audits IS 'PATCH 606: Remote audit management with AI-powered validation';
COMMENT ON TABLE public.remote_audit_checklist IS 'PATCH 606: Checklist items for remote audits';
COMMENT ON TABLE public.remote_audit_evidence IS 'PATCH 606: Digital evidence storage with OCR and AI analysis';
