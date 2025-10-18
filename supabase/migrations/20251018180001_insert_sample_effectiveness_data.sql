-- Insert sample data for SGSO effectiveness monitoring testing
-- This migration adds sample incidents with effectiveness tracking fields

-- Note: This is sample data for testing/demo purposes
-- In production, this data should come from real incident reports

-- Insert sample incidents with SGSO categories and effectiveness tracking
INSERT INTO dp_incidents (
  title,
  description,
  vessel,
  incident_date,
  severity,
  sgso_category,
  action_plan_date,
  resolved_at,
  repeated,
  status
) VALUES
-- Erro humano incidents
(
  'Erro operacional em posicionamento DP',
  'Operador cometeu erro ao ajustar parâmetros do sistema DP durante operação',
  'Navio Alpha',
  NOW() - INTERVAL '30 days',
  'Média',
  'Erro humano',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '24 days',
  false,
  'Resolvido'
),
(
  'Falha na verificação de checklist',
  'Checklist pré-operacional não foi completamente verificado',
  'Navio Beta',
  NOW() - INTERVAL '25 days',
  'Baixa',
  'Erro humano',
  NOW() - INTERVAL '23 days',
  NOW() - INTERVAL '20 days',
  false,
  'Resolvido'
),
(
  'Erro na leitura de instrumentos',
  'Leitura incorreta de instrumentos causou desvio no posicionamento',
  'Navio Alpha',
  NOW() - INTERVAL '15 days',
  'Alta',
  'Erro humano',
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '10 days',
  true,
  'Resolvido'
),

-- Falha técnica incidents
(
  'Falha no sistema de propulsão',
  'Sistema de propulsão apresentou falha durante operação crítica',
  'Navio Beta',
  NOW() - INTERVAL '40 days',
  'Alta',
  'Falha técnica',
  NOW() - INTERVAL '38 days',
  NOW() - INTERVAL '35 days',
  false,
  'Resolvido'
),
(
  'Problema no sistema de referência',
  'Sistema de referência perdeu sinal temporariamente',
  'Navio Gamma',
  NOW() - INTERVAL '20 days',
  'Média',
  'Falha técnica',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '16 days',
  false,
  'Resolvido'
),

-- Comunicação incidents
(
  'Falha na comunicação entre turnos',
  'Informações importantes não foram repassadas entre turnos',
  'Navio Alpha',
  NOW() - INTERVAL '18 days',
  'Média',
  'Comunicação',
  NOW() - INTERVAL '17 days',
  NOW() - INTERVAL '16 days',
  false,
  'Resolvido'
),
(
  'Mal entendido nas instruções',
  'Instruções operacionais mal interpretadas pela equipe',
  'Navio Beta',
  NOW() - INTERVAL '12 days',
  'Baixa',
  'Comunicação',
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '10 days',
  false,
  'Resolvido'
),

-- Falha organizacional incidents
(
  'Falta de procedimento documentado',
  'Procedimento para situação específica não estava documentado',
  'Navio Gamma',
  NOW() - INTERVAL '35 days',
  'Alta',
  'Falha organizacional',
  NOW() - INTERVAL '32 days',
  NOW() - INTERVAL '25 days',
  false,
  'Resolvido'
),
(
  'Treinamento insuficiente',
  'Equipe não havia recebido treinamento adequado para nova operação',
  'Navio Alpha',
  NOW() - INTERVAL '22 days',
  'Média',
  'Falha organizacional',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '15 days',
  true,
  'Resolvido'
),

-- Additional incidents for better metrics
(
  'Erro no cálculo de posição',
  'Erro humano no cálculo manual de posição',
  'Navio Beta',
  NOW() - INTERVAL '8 days',
  'Baixa',
  'Erro humano',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '5 days',
  false,
  'Resolvido'
),
(
  'Manutenção inadequada',
  'Manutenção preventiva não foi realizada no prazo',
  'Navio Gamma',
  NOW() - INTERVAL '10 days',
  'Média',
  'Falha organizacional',
  NOW() - INTERVAL '8 days',
  NULL,
  false,
  'Em andamento'
)
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE dp_incidents IS 'DP Incidents table with SGSO effectiveness tracking - includes sample data for testing';
