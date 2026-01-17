
-- Insert critical compliance items for dashboard testing
INSERT INTO compliance_items (item_type, title, description, regulation, due_date, status, priority, metadata)
VALUES 
  ('non_conformity', 'Equipamento de emergência vencido', 'Extintores e botes salva-vidas com validade expirada', 'SOLAS', '2025-01-10', 'open', 'critical', '{"module": "SGSO", "critical": true}'),
  ('non_conformity', 'Certificados STCW irregulares', 'Tripulação com certificações expiradas há mais de 30 dias', 'STCW', '2025-01-08', 'open', 'critical', '{"module": "MLC", "critical": true}'),
  ('non_conformity', 'Sistema DP com falha crítica', 'Sistema de posicionamento dinâmico apresentando erros intermitentes', 'IMO MSC', '2025-01-05', 'open', 'critical', '{"module": "DP", "critical": true}'),
  ('deficiency', 'Deficiência PSC não corrigida', 'Não-conformidade identificada em inspeção Port State Control pendente', 'PSC MOU', '2025-01-12', 'open', 'critical', '{"module": "PSC", "critical": true}'),
  ('non_conformity', 'Descarte irregular de óleo', 'Registro de óleo com inconsistências graves', 'MARPOL Annex I', '2025-01-15', 'open', 'critical', '{"module": "MARPOL", "critical": true}'),
  ('finding', 'Horas de descanso violadas', 'Múltiplas violações de horas de trabalho/descanso MLC', 'MLC 2006', '2025-01-18', 'in_progress', 'critical', '{"module": "MLC", "critical": true}'),
  ('non_conformity', 'Manutenção crítica atrasada', 'Jobs de manutenção classe A com mais de 60 dias de atraso', 'ISM Code', '2025-01-20', 'open', 'critical', '{"module": "MMI", "critical": true}');

-- Insert critical preovid audits for dashboard testing
INSERT INTO preovid_audits (vessel_name, vessel_imo, vessel_type, audit_date, inspector_name, inspector_company, port_location, status, overall_score, total_questions, answered_questions, compliant_count, non_compliant_count, observation_count, metadata)
VALUES 
  ('MV Atlantic Star', '9123456', 'Tanker', '2025-01-10', 'Carlos Silva', 'OCIMF Inspector', 'Santos, BR', 'completed', 45.0, 150, 150, 68, 12, 5, '{"critical_findings": 5, "findings": ["Falha no sistema de combate a incêndio", "Documentação de segurança incompleta", "Treinamento de emergência desatualizado", "Equipamentos de salvatagem vencidos", "Procedimentos ISM não seguidos"]}'),
  ('MV Pacific Dawn', '9234567', 'Bulk Carrier', '2025-01-08', 'Maria Santos', 'Lloyd Register', 'Rio de Janeiro, BR', 'completed', 52.0, 120, 120, 62, 8, 3, '{"critical_findings": 3, "findings": ["Certificados de tripulação expirados", "Registro de horas de trabalho irregular", "Contrato de trabalho marítimo inadequado"]}'),
  ('MV Southern Cross', '9345678', 'Container', '2025-01-05', 'João Oliveira', 'DNV GL', 'Paranaguá, BR', 'in_progress', 38.0, 100, 85, 32, 15, 7, '{"critical_findings": 7, "findings": ["Sistema DP com defeito", "Alarmes desativados", "Procedimentos de emergência desatualizados", "Manutenção preventiva atrasada"]}'),
  ('MV Northern Light', '9456789', 'AHTS', '2025-01-03', 'Ana Costa', 'Bureau Veritas', 'Macaé, BR', 'completed', 41.0, 80, 80, 35, 10, 4, '{"critical_findings": 4, "findings": ["Vazamento de óleo detectado", "ORB com registros inconsistentes", "Equipamento separador de água/óleo com defeito"]}');
