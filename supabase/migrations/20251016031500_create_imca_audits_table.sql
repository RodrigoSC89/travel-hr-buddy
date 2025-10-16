-- ===========================
-- IMCA AUDITS - Technical Audit Reports for DP Vessels
-- Table for storing IMCA technical audits
-- ===========================

-- Create imca_audits table
CREATE TABLE IF NOT EXISTS public.imca_audits (
  id TEXT PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('Navio', 'Terra')),
  location TEXT NOT NULL,
  dp_class TEXT NOT NULL CHECK (dp_class IN ('DP1', 'DP2', 'DP3')),
  audit_date DATE NOT NULL,
  auditor TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Em Andamento', 'Concluído', 'Revisão')),
  
  -- Context and operational data (JSON)
  operational_context JSONB,
  
  -- Audit results (JSON)
  modules JSONB NOT NULL,
  overall_compliance INTEGER NOT NULL CHECK (overall_compliance >= 0 AND overall_compliance <= 100),
  critical_issues INTEGER NOT NULL DEFAULT 0,
  total_non_conformities INTEGER NOT NULL DEFAULT 0,
  
  -- Action plan (JSON)
  action_plan JSONB NOT NULL,
  
  -- Metadata
  generated_by TEXT CHECK (generated_by IN ('AI', 'Manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Full text search
  search_vector tsvector
);

-- Enable Row Level Security
ALTER TABLE public.imca_audits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to authenticated users"
  ON public.imca_audits 
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users"
  ON public.imca_audits
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for audit creators"
  ON public.imca_audits
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Allow delete for audit creators"
  ON public.imca_audits
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imca_audits_vessel_name ON public.imca_audits(vessel_name);
CREATE INDEX IF NOT EXISTS idx_imca_audits_audit_date ON public.imca_audits(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_imca_audits_dp_class ON public.imca_audits(dp_class);
CREATE INDEX IF NOT EXISTS idx_imca_audits_status ON public.imca_audits(status);
CREATE INDEX IF NOT EXISTS idx_imca_audits_created_at ON public.imca_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_imca_audits_created_by ON public.imca_audits(created_by);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_imca_audits_search_vector ON public.imca_audits USING GIN(search_vector);

-- Trigger to update search_vector
CREATE OR REPLACE FUNCTION public.update_imca_audits_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.vessel_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.location, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.objective, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_imca_audits_search_vector
  BEFORE INSERT OR UPDATE ON public.imca_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_imca_audits_search_vector();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_imca_audits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_imca_audits_updated_at
  BEFORE UPDATE ON public.imca_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_imca_audits_updated_at();

-- Add table comment
COMMENT ON TABLE public.imca_audits IS 'Tabela para armazenamento de auditorias técnicas IMCA para embarcações com Dynamic Positioning (DP)';

-- Add column comments
COMMENT ON COLUMN public.imca_audits.id IS 'Identificador único da auditoria';
COMMENT ON COLUMN public.imca_audits.vessel_name IS 'Nome da embarcação ou operação auditada';
COMMENT ON COLUMN public.imca_audits.operation_type IS 'Tipo de operação: Navio ou Terra';
COMMENT ON COLUMN public.imca_audits.location IS 'Localização geográfica da operação';
COMMENT ON COLUMN public.imca_audits.dp_class IS 'Classificação DP da embarcação (DP1, DP2, DP3)';
COMMENT ON COLUMN public.imca_audits.audit_date IS 'Data da auditoria';
COMMENT ON COLUMN public.imca_audits.auditor IS 'Nome do auditor ou sistema';
COMMENT ON COLUMN public.imca_audits.objective IS 'Objetivo da auditoria';
COMMENT ON COLUMN public.imca_audits.status IS 'Status da auditoria';
COMMENT ON COLUMN public.imca_audits.operational_context IS 'Contexto operacional (JSON): condições meteorológicas, descrição da operação, etc.';
COMMENT ON COLUMN public.imca_audits.modules IS 'Módulos auditados com resultados (JSON)';
COMMENT ON COLUMN public.imca_audits.overall_compliance IS 'Percentual de conformidade geral (0-100)';
COMMENT ON COLUMN public.imca_audits.critical_issues IS 'Número de questões críticas identificadas';
COMMENT ON COLUMN public.imca_audits.total_non_conformities IS 'Total de não-conformidades encontradas';
COMMENT ON COLUMN public.imca_audits.action_plan IS 'Plano de ação priorizado (JSON)';
COMMENT ON COLUMN public.imca_audits.generated_by IS 'Origem da auditoria: AI ou Manual';
COMMENT ON COLUMN public.imca_audits.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.imca_audits.updated_at IS 'Data/hora da última atualização';
COMMENT ON COLUMN public.imca_audits.created_by IS 'Usuário que criou a auditoria';
COMMENT ON COLUMN public.imca_audits.search_vector IS 'Vetor de busca para full-text search';

-- Create view for audit statistics
CREATE OR REPLACE VIEW public.imca_audit_stats AS
SELECT
  COUNT(*) as total_audits,
  COUNT(*) FILTER (WHERE status = 'Concluído') as completed_audits,
  COUNT(*) FILTER (WHERE status = 'Pendente') as pending_audits,
  COUNT(*) FILTER (WHERE critical_issues > 0) as audits_with_critical_issues,
  SUM(critical_issues) as total_critical_issues,
  SUM(total_non_conformities) as total_non_conformities,
  AVG(overall_compliance)::NUMERIC(5,2) as avg_compliance,
  dp_class,
  DATE_TRUNC('month', audit_date) as month
FROM public.imca_audits
GROUP BY dp_class, DATE_TRUNC('month', audit_date);

COMMENT ON VIEW public.imca_audit_stats IS 'Estatísticas agregadas de auditorias IMCA';
