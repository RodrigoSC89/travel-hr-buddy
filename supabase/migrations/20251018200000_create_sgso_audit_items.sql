-- ===========================
-- SGSO AUDIT ITEMS TABLE
-- Sistema de auditoria por requisito SGSO
-- ===========================

-- Create sgso_audit_items table
CREATE TABLE IF NOT EXISTS public.sgso_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  requirement_number INTEGER NOT NULL CHECK (requirement_number BETWEEN 1 AND 17),
  requirement_title TEXT NOT NULL,
  description TEXT NOT NULL,
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'non_compliant', 'partial', 'pending')),
  evidence TEXT,
  ai_analysis JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(audit_id, requirement_number)
);

-- Enable Row Level Security
ALTER TABLE public.sgso_audit_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
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

CREATE POLICY "Users can insert audit items for their organization"
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
CREATE INDEX idx_sgso_audit_items_compliance_status ON public.sgso_audit_items(compliance_status);
CREATE INDEX idx_sgso_audit_items_requirement_number ON public.sgso_audit_items(requirement_number);

-- Create updated_at trigger
CREATE TRIGGER update_sgso_audit_items_updated_at 
  BEFORE UPDATE ON public.sgso_audit_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
