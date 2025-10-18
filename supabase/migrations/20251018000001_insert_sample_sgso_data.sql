-- Sample data for testing SGSO History Panel
-- This file provides example data that can be used to test the SGSO History Panel feature

-- First, let's create a sample vessel if it doesn't exist
INSERT INTO vessels (id, name, imo_number, vessel_type, flag_state, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Navio Atlântico', 'IMO-9876543', 'PSV', 'Brazil', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create sample DP incidents
INSERT INTO dp_incidents (
  id, 
  title, 
  date, 
  vessel, 
  location, 
  root_cause, 
  class_dp, 
  source, 
  description,
  sgso_category,
  sgso_risk_level,
  tags
)
VALUES 
  (
    'imca-2025-014',
    'Thruster Failure During Operations',
    '2025-10-09',
    'Navio Atlântico',
    'Bacia de Campos',
    'Bearing failure in main thruster',
    'DP2',
    'IMCA',
    'Falha no thruster principal durante operação de posicionamento dinâmico. A embarcação manteve posição com thrusters redundantes até manutenção.',
    'Equipamento',
    'Alto',
    ARRAY['thruster', 'equipment', 'maintenance']
  ),
  (
    'imca-2025-015',
    'Position Reference System Loss',
    '2025-10-07',
    'Navio Atlântico',
    'Bacia de Santos',
    'GPS signal interference',
    'DP2',
    'IMCA',
    'Perda temporária de sistema de referência GPS devido a interferência. Sistema secundário manteve posição.',
    'Sistema',
    'Médio',
    ARRAY['gps', 'reference', 'signal']
  ),
  (
    'imca-2025-016',
    'Power Management System Alert',
    '2025-09-25',
    'Navio Atlântico',
    'Bacia de Campos',
    'Generator synchronization issue',
    'DP3',
    'IMCA',
    'Alerta no sistema de gerenciamento de energia. Gerador secundário não sincronizou corretamente.',
    'Energia',
    'Crítico',
    ARRAY['power', 'generator', 'pms']
  )
ON CONFLICT (id) DO NOTHING;

-- Create sample action plans
INSERT INTO sgso_action_plans (
  id,
  vessel_id,
  incident_id,
  corrective_action,
  preventive_action,
  recommendation,
  status,
  approved_by,
  approved_at,
  created_at
)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'imca-2025-014',
    'Realizar manutenção completa no thruster principal, incluindo substituição de rolamentos e vedações. Teste funcional completo após manutenção.',
    'Implementar checklist de inspeção preventiva mensal nos thrusters. Monitoramento de vibração com sensores IoT.',
    'Aumentar frequência de inspeções de 6 para 3 meses. Treinar equipe em análise preditiva de falhas.',
    'em_andamento',
    'João Silva - Gerente QSMS',
    '2025-10-15T10:00:00Z',
    '2025-10-10T08:00:00Z'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'imca-2025-015',
    'Verificar e reconfigurar sistema GPS. Atualizar firmware das antenas. Testar redundância de sistemas de referência.',
    'Implementar monitoramento contínuo de qualidade de sinal GPS. Calibração trimestral de todos os sistemas de referência.',
    'Adicionar sistema de referência adicional (laser ou acústico) para maior redundância em operações críticas.',
    'resolvido',
    'Maria Santos - Coordenadora Técnica',
    '2025-10-12T14:00:00Z',
    '2025-10-08T08:00:00Z'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'imca-2025-016',
    'Revisão completa do sistema PMS. Sincronização e teste de todos os geradores. Atualização de software do controlador.',
    'Manutenção preventiva mensal em geradores. Teste de sincronização semanal. Limpeza de filtros e verificação de óleo.',
    'Implementar sistema de monitoramento remoto de performance dos geradores. Treinamento avançado da equipe em troubleshooting de PMS.',
    'aberto',
    NULL,
    NULL,
    '2025-09-26T09:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Update timestamps
UPDATE sgso_action_plans 
SET updated_at = now() 
WHERE id IN (
  '660e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440003'
);

-- Verify the data
SELECT 
  ap.id,
  ap.status,
  ap.approved_by,
  di.title,
  di.sgso_category,
  di.sgso_risk_level
FROM sgso_action_plans ap
JOIN dp_incidents di ON ap.incident_id = di.id
WHERE ap.vessel_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY ap.created_at DESC;

-- Expected output:
-- 3 action plans for Navio Atlântico
-- 1 aberto (Power Management)
-- 1 em_andamento (Thruster Failure)  
-- 1 resolvido (GPS Reference Loss)
