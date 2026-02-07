
-- =============================================
-- SEED: Maintenance Tasks (12 tarefas)
-- =============================================
INSERT INTO maintenance_tasks (vessel_id, title, description, task_type, priority, status, scheduled_date, due_date, estimated_hours, component_name, labor_cost, parts_cost, total_cost)
VALUES
  ('a29cc6a3-18a8-4747-af89-59a9166bb864', 'Inspeção Motor Principal', 'Inspeção de 500h do motor principal MAN B&W', 'preventive', 'high', 'pending', '2026-02-10', '2026-02-15', 24, 'Motor Principal', 4500.00, 2200.00, 6700.00),
  ('a29cc6a3-18a8-4747-af89-59a9166bb864', 'Troca de Óleo Hidráulico', 'Substituição do óleo hidráulico do sistema de leme', 'preventive', 'medium', 'in_progress', '2026-02-05', '2026-02-08', 8, 'Sistema Hidráulico', 800.00, 3500.00, 4300.00),
  ('495ab434-1a6d-43de-b18a-4eee388cee2c', 'Reparo Bomba de Lastro', 'Bomba de lastro #2 apresentando vazamento', 'corrective', 'critical', 'pending', '2026-02-07', '2026-02-09', 16, 'Bomba de Lastro #2', 2000.00, 5800.00, 7800.00),
  ('495ab434-1a6d-43de-b18a-4eee388cee2c', 'Calibração Radar ARPA', 'Calibração anual do radar ARPA conforme SOLAS', 'preventive', 'high', 'scheduled', '2026-02-20', '2026-02-22', 6, 'Radar ARPA', 1200.00, 500.00, 1700.00),
  ('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'Manutenção Guindaste #1', 'Manutenção programada do guindaste de carga #1', 'preventive', 'medium', 'pending', '2026-02-12', '2026-02-14', 12, 'Guindaste #1', 1800.00, 3200.00, 5000.00),
  ('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'Inspeção Casco Subaquática', 'Inspeção classe do casco com mergulhadores', 'inspection', 'high', 'scheduled', '2026-03-01', '2026-03-05', 32, 'Casco', 8000.00, 0.00, 8000.00),
  ('4009089e-ba7f-40bf-a5bb-dd547be25c0f', 'Troca Filtros HVAC', 'Substituição de filtros do sistema HVAC', 'preventive', 'low', 'completed', '2026-01-20', '2026-01-22', 4, 'Sistema HVAC', 400.00, 600.00, 1000.00),
  ('4009089e-ba7f-40bf-a5bb-dd547be25c0f', 'Teste Equipamentos Salvamento', 'Teste trimestral de botes, balsas e EPIRBs', 'inspection', 'critical', 'pending', '2026-02-15', '2026-02-15', 8, 'Equipamentos Salvamento', 600.00, 200.00, 800.00),
  ('70d081f7-177c-43ff-a918-fb089f98bba3', 'Overhaul Gerador #2', 'Overhaul completo do gerador auxiliar #2', 'corrective', 'high', 'in_progress', '2026-02-01', '2026-02-10', 48, 'Gerador Auxiliar #2', 12000.00, 18000.00, 30000.00),
  ('70d081f7-177c-43ff-a918-fb089f98bba3', 'Pintura Convés Principal', 'Repintura do convés principal e superestrutura', 'preventive', 'low', 'scheduled', '2026-03-15', '2026-03-25', 80, 'Convés Principal', 5000.00, 8000.00, 13000.00),
  ('e6aed606-b458-4e1a-aeeb-d5909ae75486', 'Inspeção Eixo Propulsor', 'Inspeção quinquenal do eixo propulsor', 'inspection', 'critical', 'pending', '2026-02-20', '2026-02-25', 40, 'Eixo Propulsor', 15000.00, 5000.00, 20000.00),
  ('550e8400-e29b-41d4-a716-446655440001', 'Manutenção Sistema DP', 'Manutenção preventiva do sistema de posicionamento dinâmico', 'preventive', 'critical', 'pending', '2026-02-08', '2026-02-10', 20, 'Sistema DP', 6000.00, 4000.00, 10000.00);

-- =============================================
-- SEED: Crew Members (8 novos)
-- =============================================
INSERT INTO crew_members (employee_id, full_name, position, rank, nationality, email, phone, status, experience_years, contract_start, contract_end, vessel_id)
VALUES
  ('EMP-005', 'Carlos Eduardo Santos', 'Comandante', 'Master', 'Brasileira', 'carlos.santos@nautilus.com', '+55 21 99999-0005', 'active', 22, '2025-06-01', '2026-06-01', 'a29cc6a3-18a8-4747-af89-59a9166bb864'),
  ('EMP-006', 'Ana Maria Oliveira', 'Imediata', 'Chief Officer', 'Brasileira', 'ana.oliveira@nautilus.com', '+55 21 99999-0006', 'active', 15, '2025-08-01', '2026-08-01', 'a29cc6a3-18a8-4747-af89-59a9166bb864'),
  ('EMP-007', 'Pedro Henrique Costa', 'Chefe de Máquinas', 'Chief Engineer', 'Brasileira', 'pedro.costa@nautilus.com', '+55 21 99999-0007', 'active', 18, '2025-07-01', '2026-07-01', '495ab434-1a6d-43de-b18a-4eee388cee2c'),
  ('EMP-008', 'Maria Fernanda Lima', '2º Oficial de Náutica', 'Second Officer', 'Brasileira', 'maria.lima@nautilus.com', '+55 21 99999-0008', 'active', 8, '2025-09-01', '2026-09-01', '495ab434-1a6d-43de-b18a-4eee388cee2c'),
  ('EMP-009', 'Roberto Almeida Silva', '1º Oficial de Máquinas', 'First Engineer', 'Brasileira', 'roberto.silva@nautilus.com', '+55 21 99999-0009', 'active', 12, '2025-10-01', '2026-10-01', 'f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46'),
  ('EMP-010', 'Juliana Torres Mendes', 'Oficial de Segurança', 'Safety Officer', 'Brasileira', 'juliana.mendes@nautilus.com', '+55 21 99999-0010', 'active', 10, '2025-11-01', '2026-11-01', 'f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46'),
  ('EMP-011', 'Fernando Martins Rocha', 'Eletricista', 'Electrician', 'Brasileira', 'fernando.rocha@nautilus.com', '+55 21 99999-0011', 'shore_leave', 7, '2025-05-01', '2026-05-01', '4009089e-ba7f-40bf-a5bb-dd547be25c0f'),
  ('EMP-012', 'Luciana Pereira Gomes', 'Médica de Bordo', 'Ship Doctor', 'Brasileira', 'luciana.gomes@nautilus.com', '+55 21 99999-0012', 'active', 14, '2025-12-01', '2026-12-01', '70d081f7-177c-43ff-a918-fb089f98bba3');

-- =============================================
-- SEED: Operational Checklists (8 checklists)
-- =============================================
INSERT INTO operational_checklists (title, type, vessel_id, created_by, status, compliance_score, source_type)
VALUES
  ('Checklist DP DPO - MV Ocean Pioneer', 'dp_dpo', 'a29cc6a3-18a8-4747-af89-59a9166bb864', '00000000-0000-0000-0000-000000000000', 'concluido', 98.5, 'manual'),
  ('Rotina Máquinas - MV Atlantic Star', 'rotina_maquinas', '495ab434-1a6d-43de-b18a-4eee388cee2c', '00000000-0000-0000-0000-000000000000', 'em_andamento', 85.0, 'manual'),
  ('Rotina Náutica - MV Pacific Explorer', 'rotina_nautica', 'f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', '00000000-0000-0000-0000-000000000000', 'rascunho', NULL, 'manual'),
  ('DP Máquinas - MV Atlântico', 'dp_maquinas', '4009089e-ba7f-40bf-a5bb-dd547be25c0f', '00000000-0000-0000-0000-000000000000', 'auditado', 95.0, 'manual'),
  ('Checklist Outro - MV Pacífico', 'outro', '70d081f7-177c-43ff-a918-fb089f98bba3', '00000000-0000-0000-0000-000000000000', 'em_andamento', 72.0, 'manual'),
  ('DP DPO - MV Índico', 'dp_dpo', 'e6aed606-b458-4e1a-aeeb-d5909ae75486', '00000000-0000-0000-0000-000000000000', 'rascunho', NULL, 'manual'),
  ('Rotina Máquinas - MV Nautilus', 'rotina_maquinas', '550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'concluido', 91.0, 'manual'),
  ('Rotina Náutica - MV Atlantic', 'rotina_nautica', '550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000', 'em_andamento', 88.5, 'manual');
