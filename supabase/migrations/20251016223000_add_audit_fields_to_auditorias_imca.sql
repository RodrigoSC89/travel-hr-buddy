-- Add fields needed for ListaAuditoriasIMCA component
-- These fields expand the auditorias_imca table to support detailed technical audits

ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS comentarios TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Parcialmente Conforme', 'Não Aplicável')),
  ADD COLUMN IF NOT EXISTS data DATE DEFAULT CURRENT_DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio/embarcação auditada';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma aplicada na auditoria (ex: IMCA M 103, IMCA M 179)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item ou sistema específico auditado';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações da auditoria';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, Parcialmente Conforme, Não Aplicável';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
