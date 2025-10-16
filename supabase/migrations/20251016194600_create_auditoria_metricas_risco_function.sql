-- ===========================
-- AUDITORIA METRICAS RISCO - RPC Function
-- Função para agregar métricas de risco das auditorias
-- ===========================

-- Função RPC: auditoria_metricas_risco
-- Retorna métricas agregadas de falhas críticas por auditoria, embarcação e mês
CREATE OR REPLACE FUNCTION auditoria_metricas_risco()
RETURNS TABLE (
  auditoria_id uuid,
  embarcacao text,
  mes text,
  falhas_criticas bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS auditoria_id,
    a.embarcacao,
    to_char(a.created_at, 'YYYY-MM') AS mes,
    COUNT(al.id) AS falhas_criticas
  FROM public.auditorias_imca a
  LEFT JOIN public.auditoria_alertas al ON al.auditoria_id = a.id
  GROUP BY a.id, a.embarcacao, to_char(a.created_at, 'YYYY-MM')
  ORDER BY mes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auditoria_metricas_risco() TO authenticated;

-- Add function comment
COMMENT ON FUNCTION auditoria_metricas_risco() IS 'Função RPC que agrega métricas de falhas críticas por auditoria, embarcação e mês. Atualiza automaticamente o painel /admin/metrics e está pronta para exportação e agendamento de relatórios.';
