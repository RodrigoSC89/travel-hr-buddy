-- ===========================
-- AUDITORIA METRICAS RISCO
-- Sistema de métricas de risco para auditorias IMCA
-- ===========================

-- Add embarcacao field to auditorias_imca table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auditorias_imca' 
    AND column_name = 'embarcacao'
  ) THEN
    ALTER TABLE public.auditorias_imca 
    ADD COLUMN embarcacao TEXT;
    
    CREATE INDEX IF NOT EXISTS idx_auditorias_imca_embarcacao 
    ON public.auditorias_imca(embarcacao);
  END IF;
END $$;

-- Create auditoria_alertas table for tracking critical failures
CREATE TABLE IF NOT EXISTS public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('critico', 'alto', 'medio', 'baixo')),
  descricao TEXT NOT NULL,
  severidade INTEGER CHECK (severidade BETWEEN 1 AND 5),
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'resolvido', 'fechado')),
  responsavel_id UUID REFERENCES auth.users(id),
  data_identificacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  acao_corretiva TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditoria_alertas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auditoria_alertas
-- Users can view alerts from their audits
CREATE POLICY "Users can view alerts from their audits"
  ON public.auditoria_alertas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_alertas.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Users can insert alerts for their audits
CREATE POLICY "Users can insert alerts for their audits"
  ON public.auditoria_alertas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_alertas.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Users can update alerts from their audits
CREATE POLICY "Users can update alerts from their audits"
  ON public.auditoria_alertas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_alertas.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Admins can view all alerts
CREATE POLICY "Admins can view all alerts"
  ON public.auditoria_alertas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert any alerts
CREATE POLICY "Admins can insert any alerts"
  ON public.auditoria_alertas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update any alerts
CREATE POLICY "Admins can update any alerts"
  ON public.auditoria_alertas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_auditoria_id 
  ON public.auditoria_alertas(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_tipo 
  ON public.auditoria_alertas(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_status 
  ON public.auditoria_alertas(status);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_created_at 
  ON public.auditoria_alertas(created_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_auditoria_alertas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auditoria_alertas_updated_at
  BEFORE UPDATE ON public.auditoria_alertas
  FOR EACH ROW
  EXECUTE FUNCTION update_auditoria_alertas_updated_at();

-- ===========================
-- RPC FUNCTION: auditoria_metricas_risco
-- Aggregates audit metrics with critical failure counts by vessel and month
-- ===========================
CREATE OR REPLACE FUNCTION public.auditoria_metricas_risco()
RETURNS TABLE (
  auditoria_id UUID,
  embarcacao TEXT,
  mes TEXT,
  falhas_criticas BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS auditoria_id,
    a.embarcacao,
    to_char(a.created_at, 'YYYY-MM') AS mes,
    count(al.id) AS falhas_criticas
  FROM public.auditorias_imca a
  LEFT JOIN public.auditoria_alertas al 
    ON al.auditoria_id = a.id 
    AND al.tipo_alerta = 'critico'
  GROUP BY a.id, a.embarcacao, to_char(a.created_at, 'YYYY-MM')
  ORDER BY mes DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.auditoria_metricas_risco() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auditoria_metricas_risco() TO service_role;

-- Add table and column comments
COMMENT ON TABLE public.auditoria_alertas IS 'Tabela para armazenamento de alertas críticos de auditorias IMCA';
COMMENT ON COLUMN public.auditoria_alertas.id IS 'Identificador único do alerta';
COMMENT ON COLUMN public.auditoria_alertas.auditoria_id IS 'ID da auditoria associada';
COMMENT ON COLUMN public.auditoria_alertas.tipo_alerta IS 'Tipo do alerta: critico, alto, medio, baixo';
COMMENT ON COLUMN public.auditoria_alertas.descricao IS 'Descrição detalhada do alerta';
COMMENT ON COLUMN public.auditoria_alertas.severidade IS 'Nível de severidade (1-5)';
COMMENT ON COLUMN public.auditoria_alertas.status IS 'Status do alerta: aberto, em_analise, resolvido, fechado';

COMMENT ON FUNCTION public.auditoria_metricas_risco() IS 'Retorna métricas agregadas de auditorias com contagem de falhas críticas por embarcação e mês';
