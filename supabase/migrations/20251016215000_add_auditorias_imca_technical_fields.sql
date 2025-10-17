-- ===========================
-- Add Technical Audit Fields to auditorias_imca
-- Migration for IMCA technical audit tracking
-- ===========================

-- Add technical audit fields to auditorias_imca table
ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Não Aplicável')),
  ADD COLUMN IF NOT EXISTS comentarios TEXT,
  ADD COLUMN IF NOT EXISTS data DATE;

-- Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add column comments
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome da embarcação auditada';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma/padrão aplicado (ex: IMCA M103)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme/Não Conforme/Não Aplicável';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações da auditoria';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da realização da auditoria';
