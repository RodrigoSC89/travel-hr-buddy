-- Sample data for testing MMI OS generation feature
-- Insert sample forecasts into mmi_forecasts table

-- Sample 1: High priority forecast for hydraulic system
INSERT INTO public.mmi_forecasts (
  vessel_name,
  system_name,
  forecast_text,
  priority,
  suggested_date
) VALUES (
  'FPSO Alpha',
  'Sistema hidráulico do guindaste',
  E'Recomenda-se manutenção preventiva do sistema hidráulico.\n\n1. Próxima intervenção: Troca de óleo hidráulico e inspeção de mangueiras\n2. Justificativa: Sistema operando com 850 horas, próximo ao intervalo de 1000h\n3. Impacto: Risco de vazamento e perda de pressão se não executado\n4. Prioridade: Alta\n5. Frequência: A cada 1000 horas de operação',
  'alta',
  CURRENT_DATE + INTERVAL '15 days'
);

-- Sample 2: Normal priority forecast for electrical system
INSERT INTO public.mmi_forecasts (
  vessel_name,
  system_name,
  forecast_text,
  priority,
  suggested_date
) VALUES (
  'FPSO Beta',
  'Gerador principal STBD',
  E'Previsão de manutenção para gerador principal.\n\n1. Próxima intervenção: Inspeção geral e troca de filtros\n2. Justificativa: Gerador com 600 horas de operação\n3. Impacto: Eficiência reduzida e possível falha se não mantido\n4. Prioridade: Normal\n5. Frequência: A cada 750 horas',
  'normal',
  CURRENT_DATE + INTERVAL '30 days'
);

-- Sample 3: Critical priority forecast for safety system
INSERT INTO public.mmi_forecasts (
  vessel_name,
  system_name,
  forecast_text,
  priority,
  suggested_date
) VALUES (
  'FPSO Alpha',
  'Sistema de detecção de gás',
  E'ATENÇÃO: Manutenção crítica necessária.\n\n1. Próxima intervenção: Calibração de sensores e teste funcional completo\n2. Justificativa: Sistema de segurança vencendo prazo de calibração obrigatória\n3. Impacto: CRÍTICO - Sistema pode falhar em detectar vazamentos de gás\n4. Prioridade: Crítica\n5. Frequência: Calibração trimestral obrigatória',
  'critica',
  CURRENT_DATE + INTERVAL '5 days'
);

-- Sample 4: Low priority forecast for auxiliary system
INSERT INTO public.mmi_forecasts (
  vessel_name,
  system_name,
  forecast_text,
  priority,
  suggested_date
) VALUES (
  'FPSO Gamma',
  'Sistema de ar condicionado - Sala de controle',
  E'Manutenção de rotina programada.\n\n1. Próxima intervenção: Limpeza de filtros e verificação de pressão\n2. Justificativa: Manutenção preventiva de conforto\n3. Impacto: Redução de eficiência, sem impacto operacional crítico\n4. Prioridade: Baixa\n5. Frequência: Mensal',
  'baixa',
  CURRENT_DATE + INTERVAL '45 days'
);

-- Sample 5: High priority forecast with specific component reference
-- Note: This assumes a component exists. Adjust component_id as needed
INSERT INTO public.mmi_forecasts (
  vessel_name,
  system_name,
  forecast_text,
  priority,
  suggested_date
) VALUES (
  'FPSO Beta',
  'Bomba de transferência de óleo',
  E'Análise preditiva indica necessidade de intervenção.\n\n1. Próxima intervenção: Substituição de selo mecânico e inspeção de impelidor\n2. Justificativa: Vibração acima do normal detectada em análise\n3. Impacto: Alto risco de vazamento e parada não programada\n4. Prioridade: Alta\n5. Frequência: Conforme condição monitorada',
  'alta',
  CURRENT_DATE + INTERVAL '7 days'
);

-- Verify the inserted data
-- SELECT * FROM mmi_forecasts ORDER BY created_at DESC LIMIT 5;
