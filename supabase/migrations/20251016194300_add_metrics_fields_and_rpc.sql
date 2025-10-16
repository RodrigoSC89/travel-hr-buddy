-- Add new fields to auditorias_imca table for metrics
ALTER TABLE auditorias_imca 
ADD COLUMN IF NOT EXISTS nome_navio TEXT,
ADD COLUMN IF NOT EXISTS risco_nivel TEXT,
ADD COLUMN IF NOT EXISTS falhas_criticas INTEGER DEFAULT 0;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_nome_navio ON auditorias_imca(nome_navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_risco_nivel ON auditorias_imca(risco_nivel);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_created_at ON auditorias_imca(created_at);

-- RPC Function: Get metrics grouped by risk level
CREATE OR REPLACE FUNCTION auditoria_metricas_risco()
RETURNS TABLE (
  risco_nivel TEXT,
  total_auditorias BIGINT,
  falhas_criticas BIGINT,
  score_medio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(a.risco_nivel, 'Não Classificado') as risco_nivel,
    COUNT(a.id) as total_auditorias,
    COALESCE(SUM(a.falhas_criticas), 0) as falhas_criticas,
    ROUND(AVG(a.score), 2) as score_medio
  FROM auditorias_imca a
  GROUP BY a.risco_nivel
  ORDER BY 
    CASE a.risco_nivel
      WHEN 'Crítico' THEN 1
      WHEN 'Alto' THEN 2
      WHEN 'Médio' THEN 3
      WHEN 'Baixo' THEN 4
      WHEN 'Negligenciável' THEN 5
      ELSE 6
    END;
END;
$$ LANGUAGE plpgsql;

-- RPC Function: Get monthly evolution data (12 months)
CREATE OR REPLACE FUNCTION auditoria_evolucao_mensal()
RETURNS TABLE (
  mes TEXT,
  total_auditorias BIGINT,
  falhas_criticas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('month', a.created_at), 'YYYY-MM') as mes,
    COUNT(a.id) as total_auditorias,
    COALESCE(SUM(a.falhas_criticas), 0) as falhas_criticas
  FROM auditorias_imca a
  WHERE a.created_at >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', a.created_at)
  ORDER BY DATE_TRUNC('month', a.created_at);
END;
$$ LANGUAGE plpgsql;

-- RPC Function: Get metrics by vessel
CREATE OR REPLACE FUNCTION auditoria_metricas_por_embarcacao(p_nome_navio TEXT DEFAULT NULL)
RETURNS TABLE (
  nome_navio TEXT,
  total_auditorias BIGINT,
  falhas_criticas BIGINT,
  score_medio NUMERIC,
  ultima_auditoria TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(a.nome_navio, 'Não Informado') as nome_navio,
    COUNT(a.id) as total_auditorias,
    COALESCE(SUM(a.falhas_criticas), 0) as falhas_criticas,
    ROUND(AVG(a.score), 2) as score_medio,
    MAX(a.created_at) as ultima_auditoria
  FROM auditorias_imca a
  WHERE p_nome_navio IS NULL OR a.nome_navio = p_nome_navio
  GROUP BY a.nome_navio
  ORDER BY MAX(a.created_at) DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION auditoria_metricas_risco() TO authenticated;
GRANT EXECUTE ON FUNCTION auditoria_evolucao_mensal() TO authenticated;
GRANT EXECUTE ON FUNCTION auditoria_metricas_por_embarcacao(TEXT) TO authenticated;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION auditoria_metricas_risco() TO service_role;
GRANT EXECUTE ON FUNCTION auditoria_evolucao_mensal() TO service_role;
GRANT EXECUTE ON FUNCTION auditoria_metricas_por_embarcacao(TEXT) TO service_role;
