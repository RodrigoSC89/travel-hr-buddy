-- Insert sample forecast history data for testing and demonstration
INSERT INTO public.forecast_history (forecast_summary, source, created_by, created_at) VALUES
(
  'Previsão para os próximos 2 meses:
- Maio: Aumento esperado de 20% nos jobs de manutenção
- Junho: Pico de 65 jobs previstos

Ações preventivas recomendadas:
1. Aumentar equipe de manutenção em 15%
2. Preparar estoque de peças críticas para sistemas hidráulicos
3. Implementar turnos extras em Junho para atender demanda',
  'jobs-trend',
  'AI System',
  '2025-10-15 10:30:00+00'
),
(
  'Análise de tendência mensal:
Com base nos últimos 6 meses, observa-se um crescimento médio de 8% ao mês.
Os sistemas mais demandados são: Gerador (30%), Hidráulico (25%), Propulsão (20%).

Recomendações:
- Focar treinamento da equipe em sistemas hidráulicos
- Manter estoque mínimo de 15 dias para peças de geradores',
  'manual-analysis',
  'João Silva',
  '2025-10-14 14:15:00+00'
),
(
  'Previsão semanal:
Próxima semana com demanda alta prevista (45 jobs).
Principais sistemas: Climatização (15 jobs), Elétrico (12 jobs).

Ação imediata:
- Verificar disponibilidade de filtros de ar
- Revisar circuitos elétricos preventivamente',
  'weekly-forecast',
  'AI System',
  '2025-10-13 09:00:00+00'
),
(
  'Relatório trimestral:
Tendência de crescimento sustentável. Volume de jobs aumentou 35% no trimestre.
Eficiência da IA em sugestões: 78% de aceitação.

Próximos passos:
- Expandir base de conhecimento da IA
- Implementar manutenção preditiva em mais sistemas',
  'quarterly-report',
  'Maria Santos',
  '2025-10-12 16:45:00+00'
),
(
  'Alerta de capacidade:
Previsão indica possível sobrecarga em Julho (estimativa de 80+ jobs).
Sistemas críticos: Gerador e Propulsão.

Medidas preventivas urgentes:
- Contratar temporários ou terceirizar parte dos serviços
- Acelerar processo de treinamento de novos técnicos
- Revisar processos para ganho de eficiência',
  'capacity-alert',
  'AI System',
  '2025-10-11 11:20:00+00'
);

-- Add comment
COMMENT ON TABLE public.forecast_history IS 'Sample data added for demonstration purposes';
