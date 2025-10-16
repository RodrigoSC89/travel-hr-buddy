-- Add fields needed for ListaAuditoriasIMCA component
-- These fields complement the existing auditorias_imca table

ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação')),
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS comentarios TEXT;

-- Add comments for new columns
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma técnica aplicada (ex: IMCA)';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, Observação';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico da auditoria';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários adicionais da auditoria';

-- Add index for better query performance on resultado
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
