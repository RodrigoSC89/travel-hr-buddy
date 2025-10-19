-- Sample data migration for testing MMI Orders feature
-- This migration adds sample forecast data that can be used to generate work orders

-- Insert sample forecasts with various priorities
INSERT INTO public.mmi_forecasts (vessel_name, system_name, hourmeter, last_maintenance, forecast_text, priority)
VALUES 
  (
    'FPSO Alpha',
    'Sistema Hidráulico Principal',
    15000,
    '["2024-01-15: Troca de óleo", "2024-06-20: Inspeção de válvulas"]'::jsonb,
    'Previsão de manutenção: Com base nas 15.000 horas de operação e histórico de manutenções, recomenda-se:

1. Inspeção completa do sistema hidráulico
2. Verificação de vazamentos nos selos
3. Análise de contaminação do óleo hidráulico
4. Teste de pressão do sistema

Previsão de execução: Próximos 30 dias',
    'high'
  ),
  (
    'FPSO Beta',
    'Sistema de Compressão de Gás',
    22000,
    '["2023-11-10: Manutenção preventiva", "2024-05-15: Substituição de filtros"]'::jsonb,
    'Alerta crítico: Sistema apresenta 22.000 horas sem manutenção major. Recomendações urgentes:

1. Substituição de anéis de vedação
2. Verificação de vibrações anormais
3. Análise termográfica dos compressores
4. Substituição de rolamentos

Execução: Imediata (próximos 7 dias)',
    'critical'
  ),
  (
    'FPSO Gamma',
    'Bomba de Água de Resfriamento',
    8000,
    '["2024-08-01: Limpeza de filtros"]'::jsonb,
    'Manutenção de rotina: Sistema operando dentro dos parâmetros normais.

Ações recomendadas:
1. Verificação visual de corrosão
2. Teste de fluxo
3. Limpeza de trocadores de calor

Prazo: 90 dias',
    'low'
  ),
  (
    'FPSO Delta',
    'Sistema de Controle Automático',
    12000,
    '["2024-03-10: Atualização de firmware", "2024-07-05: Calibração de sensores"]'::jsonb,
    'Manutenção preventiva: Verificação dos sistemas de controle e automação.

1. Backup de configurações
2. Teste de redundância
3. Verificação de cabos e conexões
4. Atualização de software

Prazo sugerido: 60 dias',
    'medium'
  );

-- Add comment
COMMENT ON TABLE public.mmi_forecasts IS 'Contains sample AI-generated maintenance forecasts for testing work order generation';
