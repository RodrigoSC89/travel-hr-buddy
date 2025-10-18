-- ===========================
-- SGSO AUDIT ITEMS
-- Table to track individual requirement compliance for each audit
-- ===========================

-- Add auditor_id to sgso_audits if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sgso_audits' 
    AND column_name = 'auditor_id'
  ) THEN
    ALTER TABLE public.sgso_audits 
    ADD COLUMN auditor_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create sgso_audit_items table
CREATE TABLE IF NOT EXISTS public.sgso_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  requirement_number INTEGER NOT NULL CHECK (requirement_number BETWEEN 1 AND 17),
  requirement_title TEXT,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'partial', 'non-compliant')),
  evidence TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sgso_audit_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for sgso_audit_items
-- Users can view audit items if they can view the related audit
CREATE POLICY "Users can view audit items from their organization"
  ON public.sgso_audit_items FOR SELECT
  USING (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert audit items for their organization audits"
  ON public.sgso_audit_items FOR INSERT
  WITH CHECK (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update audit items from their organization"
  ON public.sgso_audit_items FOR UPDATE
  USING (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete audit items from their organization"
  ON public.sgso_audit_items FOR DELETE
  USING (
    audit_id IN (
      SELECT id FROM public.sgso_audits 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_sgso_audit_items_audit_id ON public.sgso_audit_items(audit_id);
CREATE INDEX idx_sgso_audit_items_requirement_number ON public.sgso_audit_items(requirement_number);
CREATE INDEX idx_sgso_audit_items_compliance_status ON public.sgso_audit_items(compliance_status);

-- Add index for auditor_id in sgso_audits
CREATE INDEX IF NOT EXISTS idx_sgso_audits_auditor_id ON public.sgso_audits(auditor_id);

-- Add comment
COMMENT ON TABLE public.sgso_audit_items IS 'Individual requirement compliance tracking for SGSO audits (17 requirements per audit)';
COMMENT ON COLUMN public.sgso_audit_items.requirement_number IS 'Requirement number (1-17) from ANP Resolution 43/2007';
COMMENT ON COLUMN public.sgso_audit_items.compliance_status IS 'Compliance status: compliant, partial, or non-compliant';
