-- ===========================
-- Insert Sample SGSO Action Plans Data
-- For testing and demonstration purposes
-- ===========================

-- Update existing dp_incidents with SGSO classification
UPDATE public.dp_incidents
SET 
  sgso_category = 'Equipamento',
  sgso_risk_level = 'Crítico'
WHERE title = 'Loss of Position Due to Gyro Drift';

UPDATE public.dp_incidents
SET 
  sgso_category = 'Sistema',
  sgso_risk_level = 'Alto'
WHERE title = 'Thruster Control Software Failure During ROV Ops';

UPDATE public.dp_incidents
SET 
  sgso_category = 'Energia',
  sgso_risk_level = 'Médio'
WHERE title = 'Power Management System Malfunction';

-- Insert sample action plans (will work if vessel_id exists, otherwise will be skipped)
-- Note: In production, these would be created through the application
INSERT INTO public.sgso_action_plans (
  incident_id,
  corrective_action,
  preventive_action,
  recommendation,
  status,
  approved_by,
  approved_at
)
SELECT 
  id,
  'Substituição imediata do giroscópio defeituoso. Calibração completa do sistema de posicionamento.',
  'Implementar rotina de verificação diária dos sensores. Estabelecer protocolo de manutenção preventiva trimestral.',
  'Considerar redundância de sensores para operações críticas. Treinamento adicional da equipe em detecção de drift.',
  'resolvido',
  'João Silva - Gerente de Operações',
  NOW() - INTERVAL '5 days'
FROM public.dp_incidents
WHERE title = 'Loss of Position Due to Gyro Drift'
LIMIT 1;

INSERT INTO public.sgso_action_plans (
  incident_id,
  corrective_action,
  preventive_action,
  recommendation,
  status,
  approved_by,
  approved_at
)
SELECT 
  id,
  'Atualização do firmware do sistema de controle de propulsores. Implementação de sistema de backup.',
  'Estabelecer protocolo de testes antes de operações críticas. Redundância no sistema de controle.',
  'Avaliar upgrade para sistema mais recente com melhor estabilidade.',
  'em_andamento',
  'Maria Santos - Diretora Técnica',
  NOW() - INTERVAL '2 days'
FROM public.dp_incidents
WHERE title = 'Thruster Control Software Failure During ROV Ops'
LIMIT 1;

INSERT INTO public.sgso_action_plans (
  incident_id,
  corrective_action,
  preventive_action,
  recommendation,
  status
)
SELECT 
  id,
  'Revisão completa da configuração do PMS. Teste de carga em condições simuladas.',
  'Documentação atualizada com configurações corretas. Treinamento da equipe técnica.',
  'Implementar sistema de monitoramento em tempo real para detectar erros de configuração.',
  'aberto'
FROM public.dp_incidents
WHERE title = 'Power Management System Malfunction'
LIMIT 1;
