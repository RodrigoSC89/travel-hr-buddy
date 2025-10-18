-- ===========================
-- SGSO AUDIT ITEMS - Detailed audit items for each requirement
-- ===========================

-- Create sgso_audit_items table as per requirements
CREATE TABLE IF NOT EXISTS public.sgso_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  requirement_number INTEGER NOT NULL CHECK (requirement_number BETWEEN 1 AND 17),
  requirement_title TEXT NOT NULL,
  description TEXT,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'non-compliant', 'partial')),
  evidence TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sgso_audit_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can access audit items for audits in their organization
CREATE POLICY "Users can view audit items for their organization's audits"
  ON public.sgso_audit_items FOR SELECT
  USING (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert audit items for their organization's audits"
  ON public.sgso_audit_items FOR INSERT
  WITH CHECK (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update audit items for their organization's audits"
  ON public.sgso_audit_items FOR UPDATE
  USING (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete audit items for their organization's audits"
  ON public.sgso_audit_items FOR DELETE
  USING (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Indexes for performance
CREATE INDEX idx_sgso_audit_items_audit_id ON public.sgso_audit_items(audit_id);
CREATE INDEX idx_sgso_audit_items_requirement ON public.sgso_audit_items(requirement_number);
CREATE INDEX idx_sgso_audit_items_compliance ON public.sgso_audit_items(compliance_status);

-- Trigger for updated_at
CREATE TRIGGER update_sgso_audit_items_updated_at 
  BEFORE UPDATE ON public.sgso_audit_items
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add vessel_id and auditor_id to sgso_audits if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sgso_audits' AND column_name = 'vessel_id'
  ) THEN
    ALTER TABLE public.sgso_audits ADD COLUMN vessel_id UUID REFERENCES public.vessels(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sgso_audits' AND column_name = 'auditor_id'
  ) THEN
    ALTER TABLE public.sgso_audits ADD COLUMN auditor_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sgso_audits' AND column_name = 'audit_date'
  ) THEN
    -- Note: audit_date column already exists in the sgso_audits table
    -- This is just a safety check
    NULL;
  END IF;
END $$;
