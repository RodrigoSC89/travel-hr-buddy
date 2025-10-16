-- ===========================
-- Add IMCA Audit Specific Fields
-- Migration to add fields for IMCA technical audit form
-- ===========================

-- Add new columns to auditorias_imca table
ALTER TABLE public.auditorias_imca 
ADD COLUMN IF NOT EXISTS navio TEXT,
ADD COLUMN IF NOT EXISTS data DATE,
ADD COLUMN IF NOT EXISTS norma TEXT,
ADD COLUMN IF NOT EXISTS item_auditado TEXT,
ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação')),
ADD COLUMN IF NOT EXISTS comentarios TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);

-- Add column comments for documentation
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma IMCA aplicada (ex: IMCA M103)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico que foi auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme ou Observação';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e ações corretivas';
