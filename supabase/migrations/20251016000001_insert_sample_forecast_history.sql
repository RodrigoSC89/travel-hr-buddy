-- Insert sample forecast history records for testing and demonstration
INSERT INTO forecast_history (forecast_summary, source, created_by, created_at) VALUES
  (
    'Análise preditiva indica aumento de 15% nas manutenções preventivas do sistema de propulsão nos próximos 30 dias. Recomenda-se planejamento antecipado de recursos.',
    'AI Model - GPT-4',
    'João Silva',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'Tendência de redução nas falhas de sistema hidráulico após implementação das melhorias sugeridas. Expectativa de 20% menos ocorrências no próximo trimestre.',
    'AI Model - GPT-4',
    'Maria Santos',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Previsão de pico de demanda para manutenção de geradores na última semana do mês. Considerar alocação de equipe adicional.',
    'Manual Analysis',
    'Pedro Costa',
    NOW() - INTERVAL '3 days'
  ),
  (
    'Sistema de climatização apresenta padrão de falhas correlacionadas com temperatura externa. Modelo prevê necessidade de manutenção preventiva quinzenal durante verão.',
    'AI Model - GPT-4',
    'Ana Oliveira',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Análise histórica sugere otimização na alocação de recursos para manutenção. Implementação de scheduling inteligente pode reduzir tempo médio de resolução em 25%.',
    'Data Analytics',
    'João Silva',
    NOW() - INTERVAL '1 week'
  );
