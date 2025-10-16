-- Insert sample forecast history data for testing and demonstration
INSERT INTO forecast_history (forecast_summary, source, created_by, created_at) VALUES
(
  'Análise preditiva: Com base nas tendências dos últimos 6 meses, estima-se um aumento de 15% nos jobs de manutenção relacionados ao sistema de propulsão. Recomenda-se priorizar inspeções preventivas no componente de turbina.',
  'jobs-trend',
  'AI Assistant',
  '2025-10-15T10:30:00Z'
),
(
  'Previsão de falhas: Sistemas hidráulicos apresentam padrão de falha recorrente a cada 3 meses. Próxima janela de manutenção preventiva sugerida: início de novembro de 2025.',
  'failure-pattern',
  'AI Assistant',
  '2025-10-14T14:20:00Z'
),
(
  'Tendência de custos: Análise de 6 meses indica redução de 8% nos custos de manutenção após implementação de IA preditiva. Economia estimada: R$ 45.000 no próximo trimestre.',
  'cost-analysis',
  'System AI',
  '2025-10-13T09:15:00Z'
),
(
  'Otimização de recursos: Identificados 3 componentes com substituição antecipada. Implementar manutenção baseada em condição pode gerar economia de 12% em peças de reposição.',
  'resource-optimization',
  'AI Assistant',
  '2025-10-12T16:45:00Z'
),
(
  'Análise sazonal: Jobs relacionados ao sistema de climatização aumentam 25% durante meses de verão. Planejar equipe adicional para dezembro-fevereiro.',
  'seasonal-analysis',
  'System AI',
  '2025-10-11T11:00:00Z'
);
