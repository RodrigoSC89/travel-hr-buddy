-- ===========================
-- IMCA AUDITS - Dynamic Positioning Technical Audits
-- Table for storing IMCA-compliant DP audits
-- ===========================

-- Create imca_audits table
CREATE TABLE IF NOT EXISTS public.imca_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('navio', 'terra')),
  location TEXT,
  dp_class TEXT NOT NULL CHECK (dp_class IN ('DP1', 'DP2', 'DP3')),
  audit_objective TEXT,
  audit_date DATE,
  audit_data JSONB NOT NULL, -- Complete audit report structure
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector, -- For full-text search in Portuguese
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.imca_audits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read all audits
CREATE POLICY "Allow read access to authenticated users"
  ON public.imca_audits 
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own audits
CREATE POLICY "Allow insert for authenticated users"
  ON public.imca_audits
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND generated_by = auth.uid());

-- Users can update their own audits
CREATE POLICY "Allow update for audit creators"
  ON public.imca_audits
  FOR UPDATE
  USING (generated_by = auth.uid())
  WITH CHECK (generated_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imca_audits_vessel_name ON public.imca_audits(vessel_name);
CREATE INDEX IF NOT EXISTS idx_imca_audits_dp_class ON public.imca_audits(dp_class);
CREATE INDEX IF NOT EXISTS idx_imca_audits_status ON public.imca_audits(status);
CREATE INDEX IF NOT EXISTS idx_imca_audits_generated_at ON public.imca_audits(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_imca_audits_audit_date ON public.imca_audits(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_imca_audits_generated_by ON public.imca_audits(generated_by);
CREATE INDEX IF NOT EXISTS idx_imca_audits_search ON public.imca_audits USING GIN(search_vector);

-- Create JSONB indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_imca_audits_audit_data ON public.imca_audits USING GIN(audit_data);

-- Function to update search_vector
CREATE OR REPLACE FUNCTION update_imca_audit_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.vessel_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.location, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.audit_objective, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.audit_data->>'context', '')), 'D') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.audit_data->>'summary', '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search_vector on insert/update
CREATE TRIGGER trigger_update_imca_audit_search_vector
  BEFORE INSERT OR UPDATE ON public.imca_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_imca_audit_search_vector();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_imca_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_imca_audit_updated_at
  BEFORE UPDATE ON public.imca_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_imca_audit_updated_at();

-- Create view for audit statistics
CREATE OR REPLACE VIEW public.imca_audit_statistics AS
SELECT
  COUNT(*) as total_audits,
  COUNT(CASE WHEN dp_class = 'DP1' THEN 1 END) as dp1_audits,
  COUNT(CASE WHEN dp_class = 'DP2' THEN 1 END) as dp2_audits,
  COUNT(CASE WHEN dp_class = 'DP3' THEN 1 END) as dp3_audits,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_audits,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_audits,
  COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_audits,
  AVG(jsonb_array_length(audit_data->'nonConformities'))::numeric(10,2) as avg_non_conformities,
  COUNT(CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(audit_data->'nonConformities') nc 
      WHERE nc->>'riskLevel' = 'Alto'
    ) THEN 1 
  END) as critical_issues
FROM public.imca_audits;

-- Grant read access to the statistics view
GRANT SELECT ON public.imca_audit_statistics TO authenticated;

-- Add table comment
COMMENT ON TABLE public.imca_audits IS 'Tabela para armazenamento de auditorias técnicas IMCA para sistemas de posicionamento dinâmico (DP)';

-- Add column comments
COMMENT ON COLUMN public.imca_audits.id IS 'Identificador único da auditoria';
COMMENT ON COLUMN public.imca_audits.vessel_name IS 'Nome da embarcação ou identificação da operação';
COMMENT ON COLUMN public.imca_audits.operation_type IS 'Tipo de operação: navio ou terra';
COMMENT ON COLUMN public.imca_audits.location IS 'Localização da operação';
COMMENT ON COLUMN public.imca_audits.dp_class IS 'Classificação DP da embarcação (DP1, DP2, DP3)';
COMMENT ON COLUMN public.imca_audits.audit_objective IS 'Objetivo da auditoria';
COMMENT ON COLUMN public.imca_audits.audit_date IS 'Data da auditoria';
COMMENT ON COLUMN public.imca_audits.audit_data IS 'Dados completos da auditoria em formato JSON';
COMMENT ON COLUMN public.imca_audits.status IS 'Status da auditoria: draft, completed, reviewed';
COMMENT ON COLUMN public.imca_audits.generated_by IS 'Usuário que gerou a auditoria';
COMMENT ON COLUMN public.imca_audits.generated_at IS 'Data/hora de geração da auditoria';
COMMENT ON COLUMN public.imca_audits.reviewed_by IS 'Usuário que revisou a auditoria';
COMMENT ON COLUMN public.imca_audits.reviewed_at IS 'Data/hora de revisão da auditoria';
COMMENT ON COLUMN public.imca_audits.search_vector IS 'Vetor de busca full-text em português';
