-- Add technical audit fields to auditorias_imca table
-- These fields support technical audits with IMCA standards

-- Add new columns for technical audit data
ALTER TABLE public.auditorias_imca 
ADD COLUMN IF NOT EXISTS navio TEXT,
ADD COLUMN IF NOT EXISTS norma TEXT,
ADD COLUMN IF NOT EXISTS item_auditado TEXT,
ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação')),
ADD COLUMN IF NOT EXISTS comentarios TEXT,
ADD COLUMN IF NOT EXISTS data DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add comments for new columns
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma IMCA aplicada (ex: IMCA M-187, IMCA M-220, etc)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico da auditoria técnica';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, ou Observação';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações da auditoria';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria técnica';
