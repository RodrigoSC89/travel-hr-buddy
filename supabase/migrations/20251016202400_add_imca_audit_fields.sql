-- ===========================
-- Add IMCA Audit Specific Fields
-- Migration to add required fields for detailed IMCA audit tracking
-- ===========================

-- Add new columns to auditorias_imca table
ALTER TABLE public.auditorias_imca
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Parcialmente Conforme', 'Não Aplicável')),
  ADD COLUMN IF NOT EXISTS comentarios TEXT,
  ADD COLUMN IF NOT EXISTS data DATE;

-- Create indexes for the new fields for better query performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add comments to document the new fields
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio/embarcação auditada';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma/padrão aplicado na auditoria (ex: IMCA M189, IMCA SEL025)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item ou aspecto específico auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, Parcialmente Conforme, Não Aplicável';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações sobre a auditoria';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data de realização da auditoria';
