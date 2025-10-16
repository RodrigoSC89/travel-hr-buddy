-- ===========================
-- Add IMCA Technical Audit Fields
-- Adding fields for ship name, standard, audited item, result, and comments
-- ===========================

-- Add new columns to auditorias_imca table
ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS data DATE,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Não Aplicável')),
  ADD COLUMN IF NOT EXISTS comentarios TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);

-- Add column comments
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma aplicada (ex: IMCA M 220, IMCA M 179)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico da auditoria';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme ou Não Aplicável';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações da auditoria';
