-- PATCH 62.0: Audit Center Storage and Logging Setup
-- Create storage bucket for audit evidence uploads

-- Create evidence_uploads bucket for audit documentation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence_uploads',
  'evidence_uploads',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for evidence_uploads bucket
CREATE POLICY "Authenticated users can upload audit evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence_uploads' AND
  (storage.foldername(name))[1] = 'audits'
);

CREATE POLICY "Users can view audit evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence_uploads');

CREATE POLICY "Users can delete their uploaded evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence_uploads' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Create audit_center_logs table for detailed audit activity tracking
CREATE TABLE IF NOT EXISTS public.audit_center_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('IMCA', 'ISM', 'ISPS')),
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  checklist_data JSONB,
  ai_response JSONB,
  compliance_score NUMERIC(5,2),
  evidence_files TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit_evidence table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.audit_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_center_logs_audit_id ON public.audit_center_logs(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_center_logs_user_id ON public.audit_center_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_center_logs_created_at ON public.audit_center_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_audit_id ON public.audit_evidence(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_uploaded_by ON public.audit_evidence(uploaded_by);

-- Enable RLS
ALTER TABLE public.audit_center_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_center_logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_center_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr_manager')
));

CREATE POLICY "Users can insert audit logs"
ON public.audit_center_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for audit_evidence
CREATE POLICY "Users can view audit evidence"
ON public.audit_evidence FOR SELECT
TO authenticated
USING (uploaded_by = auth.uid() OR auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr_manager')
));

CREATE POLICY "Users can insert audit evidence"
ON public.audit_evidence FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their audit evidence"
ON public.audit_evidence FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_center_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_audit_center_logs_timestamp
BEFORE UPDATE ON public.audit_center_logs
FOR EACH ROW
EXECUTE FUNCTION update_audit_center_logs_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.audit_center_logs IS 'PATCH 62.0: Audit Center activity logs for IMCA, ISM, and ISPS compliance audits';
COMMENT ON TABLE public.audit_evidence IS 'PATCH 62.0: Audit evidence file tracking and metadata';
COMMENT ON COLUMN public.audit_center_logs.checklist_data IS 'JSON structure of checklist items and their statuses (ok, warning, fail, not_checked)';
COMMENT ON COLUMN public.audit_center_logs.ai_response IS 'AI evaluation response including compliance score, critical issues, warnings, and recommendations';