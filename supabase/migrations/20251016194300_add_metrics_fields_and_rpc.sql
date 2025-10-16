-- ===========================
-- Add metrics fields to auditorias_imca and create RPC function
-- ===========================

-- Add nome_navio and risco_nivel fields to auditorias_imca if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auditorias_imca' 
    AND column_name = 'nome_navio'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN nome_navio TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auditorias_imca' 
    AND column_name = 'risco_nivel'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN risco_nivel TEXT CHECK (risco_nivel IN ('critico', 'alto', 'medio', 'baixo', 'negligivel'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auditorias_imca' 
    AND column_name = 'falhas_criticas'
  ) THEN
    ALTER TABLE public.auditorias_imca ADD COLUMN falhas_criticas INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index on nome_navio for better performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_nome_navio ON public.auditorias_imca(nome_navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_risco_nivel ON public.auditorias_imca(risco_nivel);

-- Create RPC function for metrics aggregation
CREATE OR REPLACE FUNCTION auditoria_metricas_risco()
RETURNS TABLE (
  risco_nivel TEXT,
  total_auditorias BIGINT,
  total_falhas_criticas BIGINT,
  embarcacoes TEXT[],
  media_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(a.risco_nivel, 'indefinido') as risco_nivel,
    COUNT(*)::BIGINT as total_auditorias,
    SUM(COALESCE(a.falhas_criticas, 0))::BIGINT as total_falhas_criticas,
    ARRAY_AGG(DISTINCT a.nome_navio) FILTER (WHERE a.nome_navio IS NOT NULL) as embarcacoes,
    ROUND(AVG(COALESCE(a.score, 0)), 2) as media_score
  FROM public.auditorias_imca a
  GROUP BY a.risco_nivel
  ORDER BY 
    CASE a.risco_nivel
      WHEN 'critico' THEN 1
      WHEN 'alto' THEN 2
      WHEN 'medio' THEN 3
      WHEN 'baixo' THEN 4
      WHEN 'negligivel' THEN 5
      ELSE 6
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auditoria_metricas_risco() TO authenticated;

-- Create function to get monthly evolution of critical failures
CREATE OR REPLACE FUNCTION auditoria_evolucao_mensal()
RETURNS TABLE (
  mes TEXT,
  ano INTEGER,
  total_auditorias BIGINT,
  total_falhas_criticas BIGINT,
  media_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(a.created_at, 'MM') as mes,
    EXTRACT(YEAR FROM a.created_at)::INTEGER as ano,
    COUNT(*)::BIGINT as total_auditorias,
    SUM(COALESCE(a.falhas_criticas, 0))::BIGINT as total_falhas_criticas,
    ROUND(AVG(COALESCE(a.score, 0)), 2) as media_score
  FROM public.auditorias_imca a
  WHERE a.created_at >= NOW() - INTERVAL '12 months'
  GROUP BY 
    TO_CHAR(a.created_at, 'MM'),
    EXTRACT(YEAR FROM a.created_at)
  ORDER BY ano, mes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auditoria_evolucao_mensal() TO authenticated;

-- Create function to get metrics by vessel
CREATE OR REPLACE FUNCTION auditoria_metricas_por_embarcacao()
RETURNS TABLE (
  nome_navio TEXT,
  total_auditorias BIGINT,
  total_falhas_criticas BIGINT,
  media_score NUMERIC,
  ultima_auditoria TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.nome_navio,
    COUNT(*)::BIGINT as total_auditorias,
    SUM(COALESCE(a.falhas_criticas, 0))::BIGINT as total_falhas_criticas,
    ROUND(AVG(COALESCE(a.score, 0)), 2) as media_score,
    MAX(a.created_at) as ultima_auditoria
  FROM public.auditorias_imca a
  WHERE a.nome_navio IS NOT NULL
  GROUP BY a.nome_navio
  ORDER BY total_falhas_criticas DESC, media_score ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auditoria_metricas_por_embarcacao() TO authenticated;

-- Add comments
COMMENT ON FUNCTION auditoria_metricas_risco() IS 'Retorna métricas agregadas de auditorias agrupadas por nível de risco';
COMMENT ON FUNCTION auditoria_evolucao_mensal() IS 'Retorna evolução mensal de auditorias e falhas críticas nos últimos 12 meses';
COMMENT ON FUNCTION auditoria_metricas_por_embarcacao() IS 'Retorna métricas agregadas por embarcação';
