-- ===========================
-- Add audit fields to auditorias_imca table
-- Fields needed for ListaAuditoriasIMCA component
-- ===========================

-- Add new columns for audit visualization
ALTER TABLE public.auditorias_imca
ADD COLUMN IF NOT EXISTS navio TEXT,
ADD COLUMN IF NOT EXISTS data DATE,
ADD COLUMN IF NOT EXISTS norma TEXT,
ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação')),
ADD COLUMN IF NOT EXISTS item_auditado TEXT,
ADD COLUMN IF NOT EXISTS comentarios TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);

-- Add column comments
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma utilizada na auditoria (ex: IMCA, ISO)';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, ou Observação';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item ou área específica auditada';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários adicionais sobre a auditoria';
