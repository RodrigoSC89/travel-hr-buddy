-- Insert sample forecast history data for testing and demonstration
INSERT INTO forecast_history (forecast_summary, source, created_by, created_at) VALUES
(
  'Previsão de Jobs para Dezembro 2025: Com base nos dados históricos, espera-se um aumento de 15% no número de jobs de manutenção. Os sistemas hidráulico e de propulsão devem demandar maior atenção.',
  'AI Model - GPT-4',
  'João Silva',
  NOW() - INTERVAL '5 days'
),
(
  'Análise de Tendências: O padrão de manutenção dos últimos 6 meses indica crescimento constante. Recomenda-se ajuste no quadro de pessoal técnico para o próximo trimestre.',
  'AI Model - GPT-4',
  'Maria Santos',
  NOW() - INTERVAL '3 days'
),
(
  'Previsão Manual: Baseado em inspeções recentes, prevê-se necessidade de intervenção no sistema de climatização nas próximas semanas.',
  'Manual Analysis',
  'Carlos Mendes',
  NOW() - INTERVAL '2 days'
),
(
  'Análise Preditiva: Dados indicam possível pico de demanda em janeiro. Sistema de gerador necessitará de manutenção preventiva antes do período crítico.',
  'Data Analytics',
  'Ana Paula',
  NOW() - INTERVAL '1 day'
),
(
  'Previsão Automatizada: Modelo de ML prevê 22 jobs para o próximo mês, com concentração nos sistemas elétricos e hidráulicos.',
  'AI Model - Claude',
  'Sistema Automatizado',
  NOW()
);
