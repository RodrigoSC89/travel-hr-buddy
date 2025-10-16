-- ===========================
-- Add fields for IMCA Auditorias Technical List
-- Adding fields: nome_navio (navio), norma, item_auditado, resultado, comentarios
-- ===========================

-- Add new columns to auditorias_imca table if they don't exist
DO $$ 
BEGIN
  -- Add nome_navio (vessel name) if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'nome_navio'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN nome_navio TEXT;
  END IF;

  -- Add norma (standard) if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'norma'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN norma TEXT;
  END IF;

  -- Add item_auditado (audited item) if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'item_auditado'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN item_auditado TEXT;
  END IF;

  -- Add resultado (result: Conforme, Não Conforme, Observação) if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'resultado'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação'));
  END IF;

  -- Add comentarios (comments) if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'comentarios'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN comentarios TEXT;
  END IF;

  -- Add data field (audit date) as alias, using audit_date if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'data'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN data DATE;
  END IF;
END $$;

-- Create index on nome_navio for better filtering performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_nome_navio ON public.auditorias_imca(nome_navio);

-- Create index on norma for better filtering performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);

-- Create index on resultado for better filtering performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);

-- Create index on data for better sorting performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add column comments
COMMENT ON COLUMN public.auditorias_imca.nome_navio IS 'Nome do navio auditado';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma aplicada na auditoria (ex: IMCA, ISO)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item específico que foi auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, ou Observação';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações sobre a auditoria';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data da auditoria';
