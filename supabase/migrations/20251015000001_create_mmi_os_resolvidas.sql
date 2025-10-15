-- File: supabase/migrations/20251015000001_create_mmi_os_resolvidas.sql
-- Tabela de histórico de OS resolvidas para aprendizado IA

-- Create mmi_os_resolvidas table for AI learning from resolved work orders
CREATE TABLE IF NOT EXISTS public.mmi_os_resolvidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE SET NULL,
  os_id TEXT NOT NULL,
  componente TEXT,
  descricao_tecnica TEXT,
  acao_realizada TEXT,
  resolvido_em TIMESTAMP WITH TIME ZONE,
  duracao_execucao INTERVAL,
  efetiva BOOLEAN,
  causa_confirmada TEXT,
  evidencia_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.mmi_os_resolvidas ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read resolved work orders
CREATE POLICY "Users can view mmi_os_resolvidas"
    ON public.mmi_os_resolvidas
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create resolved work order records
CREATE POLICY "Users can create mmi_os_resolvidas"
    ON public.mmi_os_resolvidas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update resolved work order records
CREATE POLICY "Users can update mmi_os_resolvidas"
    ON public.mmi_os_resolvidas
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete resolved work order records
CREATE POLICY "Users can delete mmi_os_resolvidas"
    ON public.mmi_os_resolvidas
    FOR DELETE
    TO authenticated
    USING (true);

-- Índice para busca eficiente por componente
CREATE INDEX IF NOT EXISTS idx_os_resolvidas_componente ON public.mmi_os_resolvidas (componente);

-- Additional indexes for better query performance
CREATE INDEX idx_os_resolvidas_job_id ON public.mmi_os_resolvidas(job_id);
CREATE INDEX idx_os_resolvidas_os_id ON public.mmi_os_resolvidas(os_id);
CREATE INDEX idx_os_resolvidas_efetiva ON public.mmi_os_resolvidas(efetiva);
CREATE INDEX idx_os_resolvidas_resolvido_em ON public.mmi_os_resolvidas(resolvido_em DESC);

-- View resumida para IA
CREATE OR REPLACE VIEW public.mmi_os_ia_feed AS
SELECT
  job_id,
  componente,
  descricao_tecnica,
  acao_realizada,
  causa_confirmada,
  efetiva,
  resolvido_em,
  duracao_execucao
FROM public.mmi_os_resolvidas
WHERE efetiva IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.mmi_os_ia_feed TO authenticated;
