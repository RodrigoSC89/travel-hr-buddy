-- Add fields for auditorias lista UI
-- This migration adds the required fields for the auditorias list component

-- Add new columns to auditorias_imca table
ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação')),
  ADD COLUMN IF NOT EXISTS comentarios TEXT,
  ADD COLUMN IF NOT EXISTS data DATE;

-- Create indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome do navio/embarcação auditada';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma ou regulamento aplicado na auditoria';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico que foi auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, ou Observação';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações sobre a auditoria';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
