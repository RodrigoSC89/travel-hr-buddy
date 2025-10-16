-- ===========================
-- Add fields to auditorias_imca table for ListaAuditoriasIMCA component
-- ===========================

-- Add new columns to auditorias_imca table
ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação', 'N/A')),
  ADD COLUMN IF NOT EXISTS comentarios TEXT,
  ADD COLUMN IF NOT EXISTS data DATE;

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add comments for new columns
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma/standard aplicada na auditoria';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico que foi auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, Observação, N/A';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários adicionais sobre a auditoria';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
