-- Insert sample forecast history data for testing
INSERT INTO public.forecast_history (forecast_summary, source, created_by) VALUES
  (
    'Com base na análise dos últimos 6 meses, prevemos um aumento de 15% nos jobs relacionados ao sistema hidráulico. Recomendamos aumentar o estoque de peças de reposição.',
    'AI Model - GPT-4',
    'Sistema Automático',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Tendência de redução de 8% nos jobs do sistema de propulsão, indicando melhoria na manutenção preventiva. Continue com o cronograma atual.',
    'AI Model - GPT-4',
    'João Silva',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Sistema de climatização apresenta padrão sazonal. Espera-se aumento de 25% nos próximos 3 meses devido ao verão.',
    'Machine Learning Model',
    'Maria Santos',
    NOW() - INTERVAL '1 week'
  ),
  (
    'Análise preditiva indica necessidade de manutenção preventiva no gerador principal nas próximas 2 semanas.',
    'AI Model - GPT-4',
    'Sistema Automático',
    NOW() - INTERVAL '10 days'
  ),
  (
    'Padrão de falhas detectado no sistema elétrico. Recomenda-se inspeção completa do circuito principal.',
    'Neural Network',
    'Pedro Costa',
    NOW() - INTERVAL '2 weeks'
  );
